"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";

export default function TestTaskStatusPage() {
  const [taskId, setTaskId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!taskId.trim()) {
      setError("Please enter a taskId");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/test/task-status?taskId=${encodeURIComponent(taskId.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to fetch task status");
      }

      setResult(data);
    } catch (err: any) {
      console.error("Test error:", err);
      setError(err.message || "Failed to test task status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (flag: number) => {
    switch (flag) {
      case 0:
        return "GENERATING";
      case 1:
        return "SUCCESS";
      case 2:
        return "CREATE_TASK_FAILED";
      case 3:
        return "GENERATE_FAILED";
      default:
        return "UNKNOWN";
    }
  };

  const getStatusColor = (flag: number) => {
    switch (flag) {
      case 0:
        return "text-yellow-400";
      case 1:
        return "text-green-400";
      case 2:
      case 3:
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl font-black text-white md:text-4xl mb-2">
            Test Task Status API
          </h1>
          <p className="text-slate-400">
            Enter a taskId to check its status and retrieve the generated image
          </p>
        </div>

        <div className="space-y-6">
          {/* Input Form */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="taskId"
                  className="text-sm font-semibold text-white/80 block mb-2"
                >
                  Task ID
                </label>
                <div className="flex gap-2">
                  <Input
                    id="taskId"
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    placeholder="Enter taskId (e.g., 46d27c082f2e81714668b55c41da0677)"
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        handleTest();
                      }
                    }}
                  />
                  <Button
                    onClick={handleTest}
                    disabled={loading || !taskId.trim()}
                    className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-slate-950 font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Status Card */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Task ID:</span>
                    <span className="text-white font-mono text-sm">{result.taskId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status Flag:</span>
                    <span className={`font-bold ${getStatusColor(result.successFlag)}`}>
                      {result.successFlag} - {getStatusLabel(result.successFlag)}
                    </span>
                  </div>
                  {result.createTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Create Time:</span>
                      <span className="text-white text-sm">{result.createTime}</span>
                    </div>
                  )}
                  {result.completeTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Complete Time:</span>
                      <span className="text-white text-sm">{result.completeTime}</span>
                    </div>
                  )}
                  {result.errorMessage && (
                    <div className="flex items-start justify-between">
                      <span className="text-slate-400">Error:</span>
                      <span className="text-red-400 text-sm text-right max-w-md">
                        {result.errorMessage}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Display */}
              {result.imageUrl && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <h2 className="text-xl font-bold text-white">Generated Image</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border border-white/10 bg-black/20">
                      <img
                        src={result.imageUrl}
                        alt="Generated image"
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%231e293b' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ef4444' font-size='16' font-family='Arial'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                      <ImageIcon className="h-4 w-4 text-slate-400" />
                      <a
                        href={result.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-yellow-400 hover:text-yellow-300 break-all"
                      >
                        {result.imageUrl}
                      </a>
                    </div>
                    <Button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = result.imageUrl;
                        link.download = `nanobanana-${result.taskId}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-slate-950 font-bold"
                    >
                      Download Image
                    </Button>
                  </div>
                </div>
              )}

              {/* Full Response (Collapsible) */}
              <details className="rounded-lg border border-white/10 bg-white/5 p-6">
                <summary className="cursor-pointer text-white font-semibold mb-4">
                  Full API Response (Debug)
                </summary>
                <pre className="text-xs text-slate-300 bg-black/20 p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(result.fullResponse, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

