import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint - processes messages and updates bio
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = chatRequestSchema.parse(req.body);
      
      const result = await storage.processMessage(message);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get current memory state
  app.get("/api/memory", async (req, res) => {
    try {
      const memory = await storage.getMemory();
      res.json(memory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reset memory to initial state
  app.post("/api/memory/reset", async (req, res) => {
    try {
      const memory = await storage.resetMemory();
      res.json(memory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get chat messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Clear chat messages
  app.delete("/api/messages", async (req, res) => {
    try {
      await storage.clearMessages();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
