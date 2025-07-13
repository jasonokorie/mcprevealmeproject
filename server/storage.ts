import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import type { MemoryStore, ChatResponse, ChatMessage } from "../shared/schema.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_FILE = path.join(__dirname, "memory_store.json");
const MESSAGES_FILE = path.join(__dirname, "messages_store.json");


export interface IStorage {
  processMessage(message: string): Promise<ChatResponse>;
  getMemory(): Promise<MemoryStore>;
  resetMemory(): Promise<MemoryStore>;
  getMessages(): Promise<ChatMessage[]>;
  addMessage(message: ChatMessage): Promise<void>;
  clearMessages(): Promise<void>;
  getRecentHistory(): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private messages: ChatMessage[] = [];

  constructor() {
    this.loadMessages().then((msgs) => {
      this.messages = msgs ?? [];
    });
  }

  async getMemory(): Promise<MemoryStore> {
    return await this.loadMemory();
  }

  /** Load memory (user profile) from disk, fallback to default */
  private async loadMemory(): Promise<MemoryStore> {
    try {
      const data = await fs.readFile(MEMORY_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading memory:", error);
      const defaultMemory: MemoryStore = {
        bio: "Hi! I'm Jason and I love photography.",
        facts: {
          name: "Jason",
          location: "Austin",
          interests: ["photography"]
        }
      };
      await this.saveMemory(defaultMemory);
      return defaultMemory;
    }
  }

  /** Save memory (user profile) to disk */
  private async saveMemory(memory: MemoryStore): Promise<void> {
    await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
  }

  /** Load chat messages from disk */
  private async loadMessages(): Promise<ChatMessage[]> {
    try {
      const data = await fs.readFile(MESSAGES_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  }

  /** Save chat messages to disk */
  private async saveMessages(): Promise<void> {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(this.messages, null, 2));
  }

  /** Add a new message to history, keep recent 10 */
  async addMessage(message: ChatMessage): Promise<void> {
    this.messages.push(message);
    if (this.messages.length > 10) {
      this.messages.shift();  // Keep last 10 messages only
    }
    await this.saveMessages();
  }

  /** Get all messages in memory */
  async getMessages(): Promise<ChatMessage[]> {
    if (!this.messages || this.messages.length === 0) {
      this.messages = await this.loadMessages();
    }
    return this.messages;
  }

  /** Get last N messages for context window (default 6) */
  async getRecentHistory(): Promise<ChatMessage[]> {
    if (!this.messages || this.messages.length === 0) {
      this.messages = await this.loadMessages();
    }
    return this.messages.slice(-6);
  }

  /** Clear all chat messages */
  async clearMessages(): Promise<void> {
    this.messages = [];
    await this.saveMessages();
  }

  /** Reset memory to default profile */
  async resetMemory(): Promise<MemoryStore> {
    const defaultMemory: MemoryStore = {
      bio: "Hi! I'm Jason and I love photography.",
      facts: {
        name: "Jason",
        location: "Austin",
        interests: ["photography"]
      }
    };
    await this.saveMemory(defaultMemory);
    this.messages = [];
    await this.saveMessages();
    return defaultMemory;
  }

  /** For now: keep the original stub logic (if "test" in message) */
  async processMessage(message: string): Promise<ChatResponse> {
    const memory = await this.loadMemory();
    let bioUpdated = false;

    // Add user message
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    await this.addMessage(userMessage);

    // Dummy rule: detect "test"
    if (message.toLowerCase().includes("test") && !memory.facts.interests.includes("testing")) {
      memory.facts.interests.push("testing");
      memory.bio = `I'm ${memory.facts.name} from ${memory.facts.location} who loves ${memory.facts.interests.join(", ")}.`;
      bioUpdated = true;
      await this.saveMemory(memory);
    }

    // Generate AI response
    let reply: string;
    if (bioUpdated) {
      reply = `Great! I've detected that you mentioned "test" in your message. I've updated your bio to include "testing" in your interests!`;
    } else {
      reply = `Got it! Current bio: ${memory.bio}`;
    }

    // Add AI message
    const aiMessage: ChatMessage = {
      id: nanoid(),
      role: "assistant",
      content: reply,
      timestamp: Date.now(),
      bioUpdated,
    };
    await this.addMessage(aiMessage);

    return {
      reply,
      bio: memory.bio,
      memory: memory.facts,
    };
  }
}

export const storage = new MemStorage();
