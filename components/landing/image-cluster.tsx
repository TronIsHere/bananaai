"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const images = [
  "/img/proshir-gemini.png",
  "/img/styles/background-change-after.png",
  "/img/styles/image-restoration-after.png",
  "/img/styles/product-images-after.png",
  "/img/styles/style-change.png",
  "/img/proshir.jpg",
];

// Duplicate images to ensure enough content for scrolling
const allImages = [...images, ...images, ...images];

export function ImageCluster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-2xl md:h-[500px]">
      {/* Background Gradient & Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/20 to-slate-950/80 z-10 pointer-events-none" />
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

      {/* Sliding Columns */}
      <div className="grid h-full grid-cols-2 gap-4 md:grid-cols-3">
        {/* Column 1 - Slow Scroll Up */}
        <div className="space-y-4 animate-scroll-up">
          {allImages.map((src, i) => (
            <div
              key={`col1-${i}`}
              className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-800/50 shadow-lg transition-opacity duration-700 hover:opacity-100 opacity-80"
            >
              <Image
                src={src}
                alt={`Generated image ${i}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>

        {/* Column 2 - Slow Scroll Down */}
        <div className="space-y-4 animate-scroll-down pt-20">
          {allImages.slice().reverse().map((src, i) => (
            <div
              key={`col2-${i}`}
              className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-800/50 shadow-lg transition-opacity duration-700 hover:opacity-100 opacity-90"
            >
              <Image
                src={src}
                alt={`Generated image ${i}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>

        {/* Column 3 - Hidden on mobile, Scroll Up */}
        <div className="hidden space-y-4 animate-scroll-up-slow md:block">
          {allImages.map((src, i) => (
            <div
              key={`col3-${i}`}
              className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-800/50 shadow-lg transition-opacity duration-700 hover:opacity-100 opacity-80"
            >
              <Image
                src={src}
                alt={`Generated image ${i}`}
                fill
                className="object-cover"
                sizes="33vw"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Overlay to fade edges */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 to-transparent z-10" />
    </div>
  );
}







