"use client";

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function HlsPlayer({ src, className, onVideo }: { src: string; className?: string; onVideo?: (video: HTMLVideoElement) => void }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [supported] = useState(() => Hls.isSupported());

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!src) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      try { onVideo?.(video); } catch {}
      return;
    }

    if (!supported) return;

    const hls = new Hls({ lowLatencyMode: true });
    hls.loadSource(src);
    hls.attachMedia(video);
    try { onVideo?.(video); } catch {}
    return () => {
      hls.destroy();
    };
  }, [src, supported]);

  if (!src) return null;

  return (
    <video
      ref={ref}
      className={cn("w-full rounded-lg border border-border bg-black", className)}
      controls
      playsInline
      preload="none"
    />
  );
}
