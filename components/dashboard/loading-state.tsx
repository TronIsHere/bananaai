"use client";

import { Loader2, Sparkles, Clock, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="space-y-6">
      {/* Skeleton Image Placeholder */}
      <div className="flex justify-center">
        <div className="relative rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden w-full max-w-md">
          <Skeleton className="w-full aspect-square bg-gradient-to-br from-yellow-400/10 via-pink-500/10 to-purple-500/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              <Sparkles className="absolute inset-0 m-auto h-4 w-4 text-pink-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Message and Info */}
      <div className="rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/5 to-pink-500/5 p-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
          <p className="text-base font-semibold text-white">{message}</p>
        </div>
        
        {subMessage && (
          <p className="text-sm text-slate-400 text-center mb-4">{subMessage}</p>
        )}
        
        {numOutputs > 1 && (
          <p className="text-sm text-slate-400 text-center mb-4">
            تولید {numOutputs} تصویر
          </p>
        )}

        {/* Info Messages */}
        <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-start gap-3 text-sm">
            <Clock className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-white/80 text-right">
              معمولاً تا <span className="font-semibold text-yellow-400">۸۰ ثانیه</span> طول می‌کشد
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <History className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />
            <p className="text-white/80 text-right">
              تصویر به صورت خودکار به <span className="font-semibold text-pink-400">تاریخچه</span> شما اضافه می‌شود
            </p>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-yellow-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

