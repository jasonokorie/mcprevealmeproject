import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint - process user message and return AI response
  app.post("/api/chat", async (req, res) => {
    try {
      // Validate input
      const { message } = chatRequestSchema.parse(req.body);

      // Process message through storage service
      const response = await storage.processMessage(message);

      // Return response
      res.json(response);
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get current memory/bio
  app.get("/api/memory", async (req, res) => {
    try {
      const memory = await storage.getMemory();
      res.json(memory);
    } catch (error: any) {
      console.error("Memory API error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Reset memory to default
  app.post("/api/memory/reset", async (req, res) => {
    try {
      const memory = await storage.resetMemory();
      res.json(memory);
    } catch (error: any) {
      console.error("Memory reset API error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get chat messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error: any) {
      console.error("Messages API error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Clear all messages
  app.delete("/api/messages", async (req, res) => {
    try {
      await storage.clearMessages();
      res.json({ success: true });
    } catch (error: any) {
      console.error("Clear messages API error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const server = createServer(app);
  return server;
}
