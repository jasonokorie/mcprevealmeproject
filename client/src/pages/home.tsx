import { BioDisplay } from "@/components/bio-display";
import { ChatInterface } from "@/components/chat-interface";
import { MemoryStore } from "@/components/memory-store";
import { ApiStatus } from "@/components/api-status";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearMessages, resetMemory } from "@/lib/api";

export default function Home() {
  const queryClient = useQueryClient();

  const clearChatMutation = useMutation({
    mutationFn: clearMessages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const resetBioMutation = useMutation({
    mutationFn: resetMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const handleClearChat = () => {
    clearChatMutation.mutate();
  };

  const handleResetBio = () => {
    resetBioMutation.mutate();
  };

  const handleExportMemory = async () => {
    try {
      const response = await fetch("/api/memory");
      const memory = await response.json();
      const dataStr = JSON.stringify(memory, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "memory_store.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export memory:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-robot text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Self-Updating Bio Chat
                </h1>
                <p className="text-sm text-slate-500">
                  Powered by Express & React
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-slate-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Section */}
          <div className="lg:col-span-2 space-y-6">
            <BioDisplay />
            <ChatInterface />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MemoryStore />
            <ApiStatus />

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                <i className="fas fa-bolt text-yellow-500 mr-2"></i>
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={handleClearChat}
                  disabled={clearChatMutation.isPending}
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-broom text-slate-500 text-sm"></i>
                    <span className="text-sm text-slate-700">Clear Chat</span>
                  </div>
                  <i className="fas fa-arrow-right text-slate-400 text-xs"></i>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={handleResetBio}
                  disabled={resetBioMutation.isPending}
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-undo text-slate-500 text-sm"></i>
                    <span className="text-sm text-slate-700">Reset Bio</span>
                  </div>
                  <i className="fas fa-arrow-right text-slate-400 text-xs"></i>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={handleExportMemory}
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-download text-slate-500 text-sm"></i>
                    <span className="text-sm text-slate-700">Export Memory</span>
                  </div>
                  <i className="fas fa-arrow-right text-slate-400 text-xs"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center space-x-4">
              <span>Self-Updating Bio Chat v1.0</span>
              <div className="flex items-center space-x-1">
                <i className="fas fa-code text-xs"></i>
                <span>Built with Express + React</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="hover:text-slate-700 transition-colors" title="View documentation">
                <i className="fas fa-book text-xs mr-1"></i>
                Docs
              </button>
              <button className="hover:text-slate-700 transition-colors" title="Report an issue">
                <i className="fas fa-bug text-xs mr-1"></i>
                Issues
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
