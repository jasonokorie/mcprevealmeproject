import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z.string().min(1),
});

export const memoryStoreSchema = z.object({
  bio: z.string(),
  facts: z.object({
    name: z.string(),
    location: z.string(),
    interests: z.array(z.string()),
  }),
});

export const chatResponseSchema = z.object({
  reply: z.string(),
  bio: z.string(),
  memory: z.object({
    name: z.string(),
    location: z.string(),
    interests: z.array(z.string()),
  }),
});

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
  bioUpdated: z.boolean().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type MemoryStore = z.infer<typeof memoryStoreSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
