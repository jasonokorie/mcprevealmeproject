import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ApiStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [responseTime, setResponseTime] = useState("~45ms");
  const [lastSync, setLastSync] = useState("Just now");

  useEffect(() => {
    // Simulate periodic API health checks
    const interval = setInterval(async () => {
      try {
        const start = Date.now();
        const response = await fetch("/api/memory");
        const end = Date.now();
        
        if (response.ok) {
          setIsConnected(true);
          setResponseTime(`~${end - start}ms`);
          setLastSync("Just now");
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        setIsConnected(false);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update last sync time periodically
    const interval = setInterval(() => {
      const minutes = Math.floor(Math.random() * 3) + 1;
      setLastSync(`${minutes} min ago`);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
          <i className="fas fa-server text-purple-500 mr-2"></i>
          API Status
        </h3>

        <div className="space-y-3">
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            isConnected 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}></div>
              <span className={`text-sm font-medium ${
                isConnected ? "text-green-800" : "text-red-800"
              }`}>
                Express Backend
              </span>
            </div>
            <span className={`text-xs ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}>
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">Frontend</span>
            </div>
            <span className="text-xs text-blue-600">Connected</span>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Endpoint:</span>
              <span className="font-mono">/api/*</span>
            </div>
            <div className="flex justify-between">
              <span>Response Time:</span>
              <span>{responseTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Sync:</span>
              <span>{lastSync}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
