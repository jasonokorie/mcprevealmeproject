import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import type { MemoryStore, ChatResponse, ChatMessage } from "../shared/schema.js";

// Node ESM path helpers
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
  saveMemory(memory: MemoryStore): Promise<void>;
  mergeMemories(existing: MemoryStore["facts"], updates: MemoryStore["facts"]): MemoryStore["facts"];
}

export class MemStorage implements IStorage {
  private messages: ChatMessage[] = [];

  constructor() {
    this.loadMessages().then((msgs) => {
      this.messages = msgs ?? [];
    });
  }

  //
  // === Memory Handling ===
  //
  async getMemory(): Promise<MemoryStore> {
    return await this.loadMemory();
  }

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

  async saveMemory(memory: MemoryStore): Promise<void> {
    await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
  }

  mergeMemories(existing: MemoryStore["facts"], updates: MemoryStore["facts"]): MemoryStore["facts"] {
    const merged = { ...existing };

    for (const key of Object.keys(updates) as (keyof MemoryStore["facts"])[]) {
      if (key === "interests") {
        const combined = new Set([...(existing.interests || []), ...updates.interests]);
        merged.interests = Array.from(combined);
      } else {
        merged[key] = updates[key];
      }
    }

    return merged;
  }

  //
  // === Chat History Handling ===
  //
  private async loadMessages(): Promise<ChatMessage[]> {
    try {
      const data = await fs.readFile(MESSAGES_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  }

  private async saveMessages(): Promise<void> {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(this.messages, null, 2));
  }

  async addMessage(message: ChatMessage): Promise<void> {
    this.messages.push(message);
    if (this.messages.length > 10) {
      this.messages.shift();  // Keep last 10 messages only
    }
    await this.saveMessages();
  }

  async getMessages(): Promise<ChatMessage[]> {
    if (!this.messages || this.messages.length === 0) {
      this.messages = await this.loadMessages();
    }
    return this.messages;
  }

  async getRecentHistory(): Promise<ChatMessage[]> {
    if (!this.messages || this.messages.length === 0) {
      this.messages = await this.loadMessages();
    }
    return this.messages.slice(-6);
  }

  async clearMessages(): Promise<void> {
    this.messages = [];
    await this.saveMessages();
  }

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

  //
  // === Dummy Process Method ===
  //
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

    // Dummy rule
    if (message.toLowerCase().includes("test") && !memory.facts.interests.includes("testing")) {
      memory.facts.interests.push("testing");
      memory.bio = `I'm ${memory.facts.name} from ${memory.facts.location} who loves ${memory.facts.interests.join(", ")}.`;
      bioUpdated = true;
      await this.saveMemory(memory);
    }

    // Generate AI-like response
    let reply: string;
    if (bioUpdated) {
      reply = `Great! I've updated your bio to include "testing" in your interests.`;
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
