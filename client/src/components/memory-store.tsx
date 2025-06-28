import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchMemory } from "@/lib/api";

export function MemoryStore() {
  const [showRawJSON, setShowRawJSON] = useState(false);

  const { data: memory, isLoading, error } = useQuery({
    queryKey: ["/api/memory"],
    queryFn: fetchMemory,
    refetchInterval: 2000, // Poll for updates
  });

  const handleRefresh = () => {
    // Trigger refetch (handled automatically by react-query)
  };

  const toggleRawJSON = () => {
    setShowRawJSON(!showRawJSON);
  };

  const exportMemory = () => {
    if (memory) {
      const dataStr = JSON.stringify(memory, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "memory_store.json";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <i className="fas fa-database text-emerald-500 mr-2"></i>
              Memory Store
            </h3>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 text-center">
            <i className="fas fa-exclamation-triangle mb-2"></i>
            <p>Failed to load memory</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <i className="fas fa-database text-emerald-500 mr-2"></i>
            Memory Store
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-xs text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
              <span>Synced</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              title="Refresh memory"
            >
              <i className="fas fa-refresh text-xs"></i>
            </Button>
          </div>
        </div>

        {/* User Facts */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <i className="fas fa-user text-blue-500 text-xs mr-2"></i>
              Basic Info
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Name</span>
                <span className="text-sm font-medium text-slate-800">
                  {memory?.facts.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Location</span>
                <span className="text-sm font-medium text-slate-800">
                  {memory?.facts.location || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
              <i className="fas fa-heart text-red-500 text-xs mr-2"></i>
              Interests
            </h4>
            <div className="flex flex-wrap gap-2">
              {memory?.facts.interests.length ? (
                memory.facts.interests.map((interest, index) => (
                  <span
                    key={interest}
                    className={`px-3 py-1 text-xs rounded-full ${
                      interest === "testing"
                        ? "bg-emerald-100 text-emerald-800 animate-fade-in"
                        : index % 2 === 0
                        ? "bg-blue-100 text-blue-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No interests recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Raw JSON View */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={toggleRawJSON}
          >
            <span className="text-sm font-medium text-slate-700 flex items-center">
              <i className="fas fa-code text-slate-500 text-xs mr-2"></i>
              Raw JSON
            </span>
            <i className={`fas ${showRawJSON ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-400 text-xs transition-transform`}></i>
          </button>
          {showRawJSON && (
            <div className="mt-3">
              <pre className="text-xs text-green-400 bg-slate-900 p-3 rounded-lg overflow-x-auto font-mono">
                {JSON.stringify(memory, null, 2)}
              </pre>
              <div className="mt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportMemory}
                  className="text-xs"
                >
                  <i className="fas fa-download mr-1"></i>
                  Export
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
