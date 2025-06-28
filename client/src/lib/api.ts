import { apiRequest } from "./queryClient";
import type { ChatRequest, ChatResponse, MemoryStore, ChatMessage } from "@shared/schema";

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await apiRequest("POST", "/api/chat", { message } as ChatRequest);
  return response.json();
}

export async function fetchMemory(): Promise<MemoryStore> {
  const response = await apiRequest("GET", "/api/memory");
  return response.json();
}

export async function resetMemory(): Promise<MemoryStore> {
  const response = await apiRequest("POST", "/api/memory/reset");
  return response.json();
}

export async function fetchMessages(): Promise<ChatMessage[]> {
  const response = await apiRequest("GET", "/api/messages");
  return response.json();
}

export async function clearMessages(): Promise<{ success: boolean }> {
  const response = await apiRequest("DELETE", "/api/messages");
  return response.json();
}
