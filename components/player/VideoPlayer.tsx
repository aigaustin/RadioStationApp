"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings,
  SkipForward, SkipBack, Subtitles, List, PictureInPicture2,
  Gauge, ChevronUp, X,
} from "lucide-react";
import { createOttPlayer } from "../../../videojs-ott-player/core/createPlayer";
import { registerBuiltInPlugins } from "../../../videojs-ott-player/plugins/register";
import ottConfigJson from "../../../videojs-ott-player/config/player.config.json";
import type { PlayerConfig } from "../../../videojs-ott-player/core/types";

export type SubtitleTrack = { id: string; label: string; language: string; url: string };
export type Chapter = { id: string; title: string; startSec: number; endSec?: number | null };
export type WatermarkConfig = { type: "text" | "image"; text?: string; imageUrl?: string; position: string; opacity: number };

interface VideoPlayerProps {
  src: string;
  subtitles?: SubtitleTrack[];
  chapters?: Chapter[];
  watermark?: WatermarkConfig | null;
  vastTagUrl?: string;
  assetId?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  autoPlay?: boolean;
  poster?: string;
  initialTime?: number;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const POSITIONS: Record<string, string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-16 left-4",
  "bottom-right": "bottom-16 right-4",
  "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}

function guessSourceType(url: string): string | undefined {
  const u = url.toLowerCase();
  if (u.includes(".mpd")) return "application/dash+xml";
  if (u.includes(".m3u8")) return "application/x-mpegURL";
  if (u.includes(".mp4")) return "video/mp4";
  return undefined;
}

function resolveSrc(url: string, apiBaseUrl: string): string {
  const raw = url.trim();
  if (!raw) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!/^https?:\/\//i.test(apiBaseUrl)) return raw;
  const b = apiBaseUrl.replace(/\/+$/, "");
  const p = raw.startsWith("/") ? raw : `/${raw}`;
  return `${b}${p}`;
}

export function VideoPlayer({
  src, subtitles = [], chapters = [], watermark, vastTagUrl, assetId,
  onEnded, onTimeUpdate, autoPlay = false, poster, initialTime = 0,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ottDisposeRef = useRef<(() => void) | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [activeSub, setActiveSub] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"speed" | "subtitles" | "quality">("speed");
  const [buffered, setBuffered] = useState(0);
  const [pip, setPip] = useState(false);

  // Load Video.js OTT player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    registerBuiltInPlugins();

    let cancelled = false;
    ottDisposeRef.current?.();
    ottDisposeRef.current = null;

    const baseUrlRaw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    const apiBaseUrl = (baseUrlRaw ? baseUrlRaw : window.location.origin).replace(/\/+$/, "");
    const tokenUrl = `${apiBaseUrl}/v1/auth/refresh`;
    const config: PlayerConfig = {
      ...(ottConfigJson as unknown as PlayerConfig),
      backend: { apiBaseUrl, auth: { tokenUrl } },
    };
    const resolvedSrc = resolveSrc(src, apiBaseUrl);

    void (async () => {
      try {
        const { dispose } = await createOttPlayer({
          videoEl: video,
          config,
          source: { src: resolvedSrc, type: guessSourceType(resolvedSrc) },
          assetId,
          poster,
          autoplay: autoPlay,
          initialTime,
          controls: false,
          fluid: false,
          responsive: true,
          playbackRates: SPEEDS,
          chapters: chapters.map((c) => ({ id: c.id, title: c.title, startSeconds: c.startSec })),
        });
        if (cancelled) {
          dispose();
          return;
        }
        ottDisposeRef.current = dispose;
      } catch {
        try {
          video.src = resolvedSrc;
          video.addEventListener(
            "loadedmetadata",
            () => {
              if (initialTime > 0) video.currentTime = initialTime;
              if (autoPlay) video.play().catch(() => {});
            },
            { once: true },
          );
        } catch {}
      }
    })();

    return () => {
      cancelled = true;
      ottDisposeRef.current?.();
      ottDisposeRef.current = null;
    };
  }, [src, autoPlay, initialTime, poster, assetId, chapters]);

  // Subtitle tracks
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Remove old tracks
    Array.from(video.querySelectorAll("track")).forEach((t) => t.remove());
    subtitles.forEach((s) => {
      const el = document.createElement("track");
      el.src = s.url; el.kind = "subtitles"; el.label = s.label; el.srclang = s.language;
      el.default = s.language === activeSub;
      video.appendChild(el);
    });
    // Set active
    Array.from(video.textTracks).forEach((t) => {
      t.mode = t.language === activeSub ? "showing" : "hidden";
    });
  }, [subtitles, activeSub]);

  // Progress save every 10s
  useEffect(() => {
    if (!assetId) return;
    progressSaveRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || !video.currentTime) return;
      fetch("/v1/ux/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, positionMs: Math.round(video.currentTime * 1000), durationMs: Math.round(video.duration * 1000) }),
      }).catch(() => {});
    }, 10000);
    return () => { if (progressSaveRef.current) clearInterval(progressSaveRef.current); };
  }, [assetId]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v || (e.target as HTMLElement).tagName === "INPUT") return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); v.paused ? v.play() : v.pause(); break;
        case "ArrowLeft": e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); break;
        case "ArrowRight": e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 10); break;
        case "ArrowUp": e.preventDefault(); v.volume = Math.min(1, v.volume + 0.1); setVolume(v.volume); break;
        case "ArrowDown": e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); setVolume(v.volume); break;
        case "m": v.muted = !v.muted; setMuted(v.muted); break;
        case "f": toggleFullscreen(); break;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Controls auto-hide
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused) setShowControls(false);
    }, 3000);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const p = v.play();
      if (p && typeof (p as any).catch === "function") (p as Promise<void>).catch(() => {});
    } else {
      v.pause();
    }
  }

  async function togglePip() {
    const v = videoRef.current;
    if (!v) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture(); setPip(false);
    } else {
      await v.requestPictureInPicture(); setPip(true);
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * duration;
  }

  const activeChapter = chapters.findLast?.((c) => c.startSec <= currentTime) ?? chapters[0];

  const chapterPct = (ch: Chapter) => duration > 0 ? (ch.startSec / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full aspect-video rounded-xl overflow-hidden group select-none"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => { if ((e.target as HTMLElement).closest("button")) return; togglePlay(); }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="video-js w-full h-full object-contain"
        poster={poster}
        preload="metadata"
        playsInline
        onPlay={() => { setPlaying(true); resetControlsTimer(); }}
        onPause={() => { setPlaying(false); setShowControls(true); }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrentTime(v.currentTime);
          onTimeUpdate?.(v.currentTime, v.duration);
          if (v.buffered.length > 0) setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onEnded={onEnded}
        onVolumeChange={(e) => { setVolume(e.currentTarget.volume); setMuted(e.currentTarget.muted); }}
      />

      {/* Watermark */}
      {watermark && (
        <div
          className={`absolute pointer-events-none z-10 ${POSITIONS[watermark.position] ?? POSITIONS["bottom-right"]}`}
          style={{ opacity: watermark.opacity }}
        >
          {watermark.type === "text" && watermark.text ? (
            <span className="text-white text-sm font-medium drop-shadow">{watermark.text}</span>
          ) : watermark.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={watermark.imageUrl} alt="" className="h-8 w-auto object-contain" />
          ) : null}
        </div>
      )}

      {/* Big play/pause indicator */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-16 w-16 rounded-full bg-black/50 flex items-center justify-center">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute bottom-20 right-4 z-30 w-56 rounded-xl bg-black/90 border border-white/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 p-2 border-b border-white/10">
            {(["speed", "subtitles"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setSettingsTab(t)}
                className={`flex-1 py-1 rounded text-xs font-medium capitalize transition-colors ${settingsTab === t ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}
              >{t}</button>
            ))}
          </div>
          {settingsTab === "speed" && (
            <div className="p-2 space-y-0.5">
              {SPEEDS.map((s) => (
                <button key={s} type="button" onClick={() => { const v = videoRef.current; if (v) { v.playbackRate = s; setSpeed(s); } }}
                  className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${speed === s ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/8"}`}
                >
                  {s === 1 ? "Normal" : `${s}×`}
                </button>
              ))}
            </div>
          )}
          {settingsTab === "subtitles" && (
            <div className="p-2 space-y-0.5">
              <button type="button" onClick={() => setActiveSub("")}
                className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${!activeSub ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/8"}`}
              >Off</button>
              {subtitles.map((s) => (
                <button key={s.id} type="button" onClick={() => setActiveSub(s.language)}
                  className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${activeSub === s.language ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/8"}`}
                >{s.label}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-200 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}
      >
        {/* Chapter name */}
        {activeChapter && (
          <div className="px-4 pb-1" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-white/60 font-medium">{activeChapter.title}</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="px-4 pb-1" onClick={(e) => e.stopPropagation()}>
          <div className="relative h-1 group/bar cursor-pointer" onClick={seek}>
            {/* Buffered */}
            <div className="absolute inset-0 rounded-full bg-white/20">
              <div className="h-full bg-white/30 rounded-full" style={{ width: `${buffered}%` }} />
            </div>
            {/* Played */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-none" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }} />
            </div>
            {/* Chapter markers */}
            {chapters.map((ch) => (
              <div key={ch.id} className="absolute top-1/2 -translate-y-1/2 h-2.5 w-0.5 bg-amber-400/80 rounded-full" style={{ left: `${chapterPct(ch)}%` }} title={ch.title} />
            ))}
            {/* Thumb */}
            <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ left: duration > 0 ? `calc(${(currentTime / duration) * 100}% - 6px)` : "0" }} />
          </div>
        </div>

        {/* Button row */}
        <div className="flex items-center gap-1 px-3 pb-3" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={togglePlay} className="h-8 w-8 flex items-center justify-center text-white hover:text-white/80">
            {playing ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
          </button>
          <button type="button" onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }}
            className="h-8 w-8 flex items-center justify-center text-white/70 hover:text-white">
            <SkipBack className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration, v.currentTime + 10); }}
            className="h-8 w-8 flex items-center justify-center text-white/70 hover:text-white">
            <SkipForward className="h-4 w-4" />
          </button>

          {/* Volume */}
          <button type="button" onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(!muted); } }}
            className="h-8 w-8 flex items-center justify-center text-white/70 hover:text-white">
            {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
            className="w-16 h-1 accent-white cursor-pointer"
            onChange={(e) => { const v = videoRef.current; if (v) { v.volume = +e.target.value; v.muted = +e.target.value === 0; setVolume(+e.target.value); setMuted(+e.target.value === 0); } }} />

          {/* Time */}
          <span className="text-xs text-white/60 ml-1 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>

          <div className="flex-1" />

          {/* Speed badge */}
          {speed !== 1 && <span className="text-xs text-amber-400 font-mono">{speed}×</span>}

          {/* Settings */}
          <button type="button" onClick={(e) => { e.stopPropagation(); setShowSettings((v) => !v); }}
            className="h-8 w-8 flex items-center justify-center text-white/70 hover:text-white">
            <Settings className="h-4 w-4" />
          </button>

          {/* PiP */}
          <button type="button" onClick={togglePip} title="Picture-in-Picture"
            className="h-8 w-8 flex items-center justify-center text-white/70 hover:text-white">
            <PictureInPicture2 className="h-4 w-4" />
          </button>

          {/* Fullscreen */}
          <button type="button" onClick={toggleFullscreen}
            className="h-8 w-8 flex items-center justify-center text-white/70 hover:text-white">
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
