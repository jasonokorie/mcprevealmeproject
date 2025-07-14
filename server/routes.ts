import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { chatRequestSchema } from "../shared/schema.js";
import { OpenAI } from "openai";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Get memory endpoint
  app.get("/api/memory", async (req, res) => {
    try {
      const memory = await storage.getMemory();
      res.json(memory);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Reset memory endpoint
  app.post("/api/memory/reset", async (req, res) => {
    try {
      const memory = await storage.resetMemory();
      res.json(memory);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get messages endpoint
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Clear messages endpoint
  app.delete("/api/messages", async (req, res) => {
    try {
      await storage.clearMessages();
      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
  try {
    // Validate input
    const { message } = chatRequestSchema.parse(req.body);

    // Load existing memory from disk
    const memory = await storage.getMemory();

    // Save the new USER message to history
    await storage.addMessage({
      id: nanoid(),
      role: "user", 
      content: message,
      timestamp: Date.now(),
    });

    // Get the *updated* chat history (including that user message)
    const chatHistory = await storage.getRecentHistory();
    const historySection = chatHistory
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    // Build prompt
    const contextWindow = `
You are an assistant that updates the user's personal memory and bio.

Please follow these rules:
- Carefully read the user's existing memory, recent chat history, and their new message.
- Extract any new or changed personal facts.
- Do NOT repeat existing facts unchanged.
- Avoid hallucinating information.
- Respond ONLY in valid JSON.

### Existing Memory
${JSON.stringify(memory.facts, null, 2)}

### Current Bio
"${memory.bio}"

### Recent Chat History
${historySection}

### User's New Message
"${message}"

Your response MUST follow this JSON schema exactly:

{
  "updated_memory": { ... }
}
`;

    // Call OpenAI
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You maintain user memory and bio." },
        { role: "user", content: contextWindow }
      ]
    });

    const assistantMessage = completion.choices[0].message.content;

    let updatedMemory;
    try {
      if (assistantMessage === null) {
        throw new Error("OpenAI response was null");
      }
      const parsed = JSON.parse(assistantMessage);
      if (!parsed || typeof parsed !== "object" || !parsed.updated_memory) {
        throw new Error("OpenAI response missing 'updated_memory'");
      }
      updatedMemory = parsed.updated_memory;
    } catch (err) {
      console.error("Failed to parse OpenAI response:", assistantMessage);
      return res.status(400).json({ message: "Invalid response from assistant." });
    }

    // Merge memories
    memory.facts = storage.mergeMemories(memory.facts, updatedMemory);

    // Regenerate bio
    const name = memory.facts.name || "Unknown";
    const location = memory.facts.location || "Unknown";
    const interests = memory.facts.interests && memory.facts.interests.length > 0 
      ? memory.facts.interests.join(", ") 
      : "exploring new things";
    memory.bio = `I'm ${name} from ${location} who loves ${interests}.`;

    // Save updated memory
    await storage.saveMemory(memory);

    // Save the assistant reply to history
    await storage.addMessage({
      id: nanoid(),
      role: "assistant",
      content: assistantMessage,
      timestamp: Date.now(),
    });

    // Return response
    res.json({
      reply: `Thanks! Here's your updated bio: ${memory.bio}`,
      bio: memory.bio,
      memory: memory.facts
    });

  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

  return server;
}
