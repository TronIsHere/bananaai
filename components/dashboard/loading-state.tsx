"use client";

import { Loader2, Sparkles } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  numOutputs?: number;
}

export function LoadingState({ 
  message = "در حال پردازش تصویر...", 
  subMessage,
  numOutputs = 1 
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/5 to-pink-500/5 p-12">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-yellow-400" />
        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-pink-400 animate-pulse" />
      </div>
      <p className="mt-4 text-base font-semibold text-white">{message}</p>
      {subMessage && (
        <p className="mt-2 text-sm text-slate-400">{subMessage}</p>
      )}
      {numOutputs > 1 && (
        <p className="mt-2 text-sm text-slate-400">
          تولید {numOutputs} تصویر
        </p>
      )}
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-yellow-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

