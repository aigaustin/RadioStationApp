"use client";

import { useEffect, useState } from "react";
import { VideoPlayer, SubtitleTrack, Chapter } from "@/components/player/VideoPlayer";
import { api } from "@/services/api/client";

interface VodPlayerProps {
  assetId: string;
  tenantId?: string;
  userId?: string;
  onEnded?: () => void;
}

export function VodPlayer({ assetId, tenantId, userId, onEnded }: VodPlayerProps) {
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [resumePos, setResumePos] = useState(0);
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assetId) return;
    api.post(`/v1/svp/playback/vod/${assetId}/token`, { playerMode: "vod" })
      .then((res) => {
        setPlaybackUrl(res.data.manifestUrl);
        setResumePos(res.data.resumePositionSeconds || 0);
        if (res.data.availableTracks) {
          setSubtitles(res.data.availableTracks.map((t: any) => ({
            id: t.id,
            language: t.languageCode,
            label: t.label || t.languageCode,
            url: t.trackUrl
          })));
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load VOD playback.");
      });
  }, [assetId]);

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    // Send telemetry / playback event every 10s
    if (Math.floor(currentTime) % 10 === 0 && Math.floor(currentTime) !== 0) {
      api.post(`/v1/svp/playback/events`, {
        assetId,
        eventType: "playback_progress",
        positionSeconds: currentTime,
        playerMode: "vod",
      }).catch(() => {});
    }
  };

  if (error) {
    return <div className="bg-black/90 aspect-video flex items-center justify-center text-red-500 rounded-xl">{error}</div>;
  }

  if (!playbackUrl) {
    return <div className="bg-black/90 aspect-video flex items-center justify-center text-white/50 animate-pulse rounded-xl">Loading VOD...</div>;
  }

  return (
    <VideoPlayer
      src={playbackUrl}
      assetId={assetId}
      subtitles={subtitles}
      initialTime={resumePos}
      autoPlay
      onTimeUpdate={handleTimeUpdate}
      onEnded={() => {
        api.post(`/v1/svp/playback/events`, {
          assetId,
          eventType: "playback_completed",
          playerMode: "vod",
        }).catch(() => {});
        onEnded?.();
      }}
    />
  );
}
