"use client";

import { useEffect, useState } from "react";
import { Video, Clock, History, Sparkles, Play, Volume2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoLoadingStateProps {
  message?: string;
  elapsedSeconds?: number;
  duration?: "5" | "10";
  hasSound?: boolean;
}

export function VideoLoadingState({
  message = "در حال ساخت ویدیو",
  elapsedSeconds = 0,
  duration = "5",
  hasSound = false,
}: VideoLoadingStateProps) {
  const [dots, setDots] = useState("");
  const [pulsePhase, setPulsePhase] = useState(0);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation phase
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 4);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Estimate progress (videos typically take 2-7 minutes)
  const estimatedTotalTime = duration === "10" ? 420 : 300; // 7 min for 10s, 5 min for 5s (using average)
  const progress = Math.min((elapsedSeconds / estimatedTotalTime) * 100, 95);

  // Progress stages (adjusted for 2-7 minute range)
  const getStage = () => {
    if (elapsedSeconds < 15) return { text: "آماده‌سازی...", icon: "setup" };
    if (elapsedSeconds < 45) return { text: "آپلود تصویر...", icon: "upload" };
    if (elapsedSeconds < 90) return { text: "پردازش صحنه...", icon: "process" };
    if (elapsedSeconds < 180)
      return { text: "تولید فریم‌ها...", icon: "frames" };
    if (elapsedSeconds < 300) return { text: "رندر ویدیو...", icon: "render" };
    return { text: "نهایی‌سازی...", icon: "final" };
  };

  const stage = getStage();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Video Skeleton Placeholder */}
      <div className="relative rounded-xl sm:rounded-2xl border border-white/10 bg-zinc-900/80 overflow-hidden">
        {/* Video aspect ratio skeleton */}
        <div className="relative aspect-video bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/10 to-yellow-500/5 animate-pulse" />

          {/* Scanline effect */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
            }}
          />

          {/* Animated wave bars (video waveform effect) */}
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 sm:w-2 bg-gradient-to-t from-yellow-400/60 to-orange-500/60 rounded-full"
                style={{
                  height: `${20 + Math.sin((pulsePhase + i) * 0.8) * 30}%`,
                  transition: "height 0.8s ease-in-out",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Center play button with pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Pulse rings */}
              <div className="absolute inset-0 -m-4 sm:-m-6">
                <div
                  className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <div
                  className="absolute inset-0 rounded-full border border-yellow-400/20 animate-ping"
                  style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
                />
              </div>

              {/* Main play icon container */}
              <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 backdrop-blur-sm">
                <Play className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 fill-yellow-400/50 mr-[-2px]" />
              </div>
            </div>
          </div>

          {/* Video info overlay (bottom left) */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white/70">
              <Clock className="h-3 w-3" />
              <span>{duration}s</span>
            </div>
            {hasSound && (
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white/70">
                <Volume2 className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
            {/* Animated glow on progress edge */}
            <div
              className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm transition-all duration-1000"
              style={{ left: `${Math.max(0, progress - 4)}%` }}
            />
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-zinc-900/50">
          <div className="flex items-center justify-between gap-3">
            {/* Stage indicator */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Video className="h-5 w-5 text-yellow-400" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-orange-400 animate-pulse" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {message}
                  <span className="text-yellow-400 w-6 inline-block text-right">
                    {dots}
                  </span>
                </p>
                <p className="text-xs text-white/50">{stage.text}</p>
              </div>
            </div>

            {/* Time counter */}
            <div className="text-left shrink-0">
              <p className="text-lg sm:text-xl font-bold text-yellow-400 tabular-nums">
                {Math.floor(elapsedSeconds / 60)}:
                {String(elapsedSeconds % 60).padStart(2, "0")}
              </p>
              <p className="text-[10px] sm:text-xs text-white/40">زمان سپری شده</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Estimated time card */}
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-right flex-1">
              <p className="text-sm font-medium text-white">زمان تخمینی</p>
              <p className="text-xs text-white/50 mt-0.5">
                تولید ویدیو معمولاً{" "}
                <span className="text-yellow-400 font-medium">۲-۷ دقیقه</span>{" "}
                طول می‌کشد
              </p>
            </div>
          </div>
        </div>

        {/* Auto-save card */}
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <History className="h-4 w-4 text-orange-400" />
            </div>
            <div className="text-right flex-1">
              <p className="text-sm font-medium text-white">ذخیره خودکار</p>
              <p className="text-xs text-white/50 mt-0.5">
                ویدیو به صورت خودکار در{" "}
                <span className="text-orange-400 font-medium">تاریخچه</span> ذخیره
                می‌شود
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {["آماده‌سازی", "پردازش", "تولید", "رندر"].map((step, i) => {
          const stepProgress =
            i === 0
              ? elapsedSeconds >= 15
              : i === 1
                ? elapsedSeconds >= 45
                : i === 2
                  ? elapsedSeconds >= 90
                  : elapsedSeconds >= 180;
          const isActive =
            (i === 0 && elapsedSeconds < 45) ||
            (i === 1 && elapsedSeconds >= 45 && elapsedSeconds < 90) ||
            (i === 2 && elapsedSeconds >= 90 && elapsedSeconds < 180) ||
            (i === 3 && elapsedSeconds >= 180);

          return (
            <div key={step} className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`h-2 w-2 rounded-full transition-all duration-500 ${
                  stepProgress
                    ? "bg-yellow-400"
                    : isActive
                      ? "bg-yellow-400 animate-pulse scale-125"
                      : "bg-white/20"
                }`}
              />
              <span
                className={`text-[10px] sm:text-xs transition-colors ${
                  isActive
                    ? "text-yellow-400 font-medium"
                    : stepProgress
                      ? "text-white/70"
                      : "text-white/30"
                }`}
              >
                {step}
              </span>
              {i < 3 && (
                <div
                  className={`w-4 sm:w-6 h-px ${stepProgress ? "bg-yellow-400/50" : "bg-white/10"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

