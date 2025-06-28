import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import type { MemoryStore, ChatResponse, ChatMessage } from "@shared/schema";

const MEMORY_FILE = path.join(import.meta.dirname, "memory_store.json");

export interface IStorage {
  processMessage(message: string): Promise<ChatResponse>;
  getMemory(): Promise<MemoryStore>;
  resetMemory(): Promise<MemoryStore>;
  getMessages(): Promise<ChatMessage[]>;
  addMessage(message: ChatMessage): Promise<void>;
  clearMessages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private messages: ChatMessage[] = [];

  private async loadMemory(): Promise<MemoryStore> {
    try {
      const data = await fs.readFile(MEMORY_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      // Return default memory if file doesn't exist
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

  private async saveMemory(memory: MemoryStore): Promise<void> {
    await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
  }

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

    // Stub logic: if message contains "test", add "testing" to interests
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

  async getMemory(): Promise<MemoryStore> {
    return await this.loadMemory();
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
    return defaultMemory;
  }

  async getMessages(): Promise<ChatMessage[]> {
    return this.messages;
  }

  async addMessage(message: ChatMessage): Promise<void> {
    this.messages.push(message);
  }

  async clearMessages(): Promise<void> {
    this.messages = [];
  }
}

export const storage = new MemStorage();
