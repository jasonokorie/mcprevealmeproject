import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessage, fetchMessages, clearMessages } from "@/lib/api";
import type { ChatMessage } from "@shared/schema";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages"],
    queryFn: () => fetchMessages(),
    refetchInterval: 1000, // Poll for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/memory"] });
      setInput("");
    },
  });

  const clearMessagesMutation = useMutation({
    mutationFn: clearMessages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    clearMessagesMutation.mutate();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  if (isLoading && messages.length === 0) {
    return (
      <Card className="h-96">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-slate-600">Loading chat...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-96">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center">
          <i className="fas fa-comments text-indigo-500 mr-2"></i>
          Chat Assistant
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">{messages.length} messages</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            disabled={clearMessagesMutation.isPending}
            title="Clear chat"
          >
            <i className="fas fa-trash text-xs"></i>
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <i className="fas fa-comments text-4xl mb-2 opacity-50"></i>
              <p>Start a conversation...</p>
              <p className="text-xs mt-1">Try mentioning "test" to see the bio update!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 animate-slide-up ${
                message.role === "user" ? "justify-end" : ""
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-xs"></i>
                </div>
              )}
              
              <div className={`flex-1 ${message.role === "user" ? "flex justify-end" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-3 max-w-xs ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-sm"
                      : "bg-slate-100 text-slate-700 rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.bioUpdated && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-700 text-xs mb-1">
                        <i className="fas fa-sync-alt mr-1"></i>
                        Bio Updated
                      </div>
                      <p className="text-green-800 text-xs">Added "testing" to interests</p>
                    </div>
                  )}
                </div>
                <div className="mt-1 text-xs text-slate-500 flex items-center">
                  <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {message.bioUpdated && (
                    <div className="ml-2 flex items-center text-green-600">
                      <i className="fas fa-check-circle text-xs mr-1"></i>
                      <span>Bio synced</span>
                    </div>
                  )}
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-user text-white text-xs"></i>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="resize-none min-h-[44px] max-h-32 pr-12"
              disabled={sendMessageMutation.isPending}
            />
            <div className="absolute right-3 bottom-3 flex items-center space-x-1">
              <Button variant="ghost" size="sm" title="Add attachment">
                <i className="fas fa-paperclip text-xs"></i>
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 h-11"
            title="Send message"
          >
            {sendMessageMutation.isPending ? (
              <i className="fas fa-spinner fa-spin text-sm"></i>
            ) : (
              <i className="fas fa-paper-plane text-sm"></i>
            )}
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {sendMessageMutation.isPending && (
            <div className="flex items-center animate-pulse">
              <i className="fas fa-circle text-blue-500 text-xs mr-1"></i>
              AI is typing...
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
