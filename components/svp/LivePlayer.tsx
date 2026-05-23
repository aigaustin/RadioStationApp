"use client";

import { useEffect, useState } from "react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { api } from "@/services/api/client";

interface LivePlayerProps {
  roomId: string;
  tenantId?: string;
  userId?: string;
  onEnded?: () => void;
}

export function LivePlayer({ roomId, tenantId, userId, onEnded }: LivePlayerProps) {
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    api.post(`/v1/svp/playback/live/${roomId}/token`, { playerMode: "live" })
      .then((res) => {
        setPlaybackUrl(res.data.manifestUrl);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load Live stream.");
      });
  }, [roomId]);

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    // Send telemetry / playback event every 10s
    if (Math.floor(currentTime) % 10 === 0 && Math.floor(currentTime) !== 0) {
      api.post(`/v1/svp/playback/events`, {
        assetId: roomId, // Using roomId for live streams
        eventType: "playback_progress",
        positionSeconds: currentTime,
        playerMode: "live",
      }).catch(() => {});
    }
  };

  if (error) {
    return <div className="bg-black/90 aspect-video flex items-center justify-center text-red-500 rounded-xl">{error}</div>;
  }

  if (!playbackUrl) {
    return <div className="bg-black/90 aspect-video flex items-center justify-center text-white/50 animate-pulse rounded-xl">Tuning into Live Stream...</div>;
  }

  return (
    <VideoPlayer
      src={playbackUrl}
      assetId={roomId}
      autoPlay
      onTimeUpdate={handleTimeUpdate}
      onEnded={() => {
        api.post(`/v1/svp/playback/events`, {
          assetId: roomId,
          eventType: "live_stream_ended",
          playerMode: "live",
        }).catch(() => {});
        onEnded?.();
      }}
    />
  );
}
