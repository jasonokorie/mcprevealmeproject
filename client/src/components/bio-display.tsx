import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchMemory, resetMemory } from "@/lib/api";
import { useState, useEffect } from "react";

export function BioDisplay() {
  const [showUpdated, setShowUpdated] = useState(false);
  const queryClient = useQueryClient();

  const { data: memory, isLoading, error } = useQuery({
    queryKey: ["/api/memory"],
    queryFn: fetchMemory,
    refetchInterval: 2000, // Poll every 2 seconds for updates
  });

  const resetMutation = useMutation({
    mutationFn: resetMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  // Show updated indicator when bio changes
  useEffect(() => {
    if (memory?.bio) {
      setShowUpdated(true);
      const timer = setTimeout(() => setShowUpdated(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [memory?.bio]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/memory"] });
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <i className="fas fa-user-circle text-blue-500 mr-2"></i>
              Current Bio
            </h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
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
            <p>Failed to load bio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <i className="fas fa-user-circle text-blue-500 mr-2"></i>
            Current Bio
          </h2>
          <div className="flex items-center space-x-2">
            {showUpdated && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center animate-fade-in">
                <i className="fas fa-check-circle mr-1"></i>
                Updated
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              title="Refresh bio"
            >
              <i className="fas fa-refresh text-sm"></i>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={resetMutation.isPending}
              title="Reset bio"
            >
              <i className="fas fa-undo text-sm"></i>
            </Button>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <p className="text-slate-700 leading-relaxed">
            {memory?.bio || "No bio available"}
          </p>
        </div>
        <div className="mt-3 text-xs text-slate-500 flex items-center">
          <i className="fas fa-clock mr-1"></i>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
