"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HlsPlayer } from "@/components/streams/hls-player";
import type { Stream } from "@/services/api/streams";
import { useStartStream, useStopStream, useUpdateStream } from "@/hooks/use-streams";
import { usePermissions } from "@/hooks/use-permissions";
import { Input } from "@/components/ui/input";
import { StreamHealth } from "@/components/streams/stream-health";

function statusVariant(status: Stream["status"]) {
  if (status === "running") return "success";
  if (status === "ready") return "default";
  if (status === "stopped") return "warning";
  if (status === "error") return "destructive";
  return "outline";
}

export function StreamCard({ stream }: { stream: Stream }) {
  const start = useStartStream();
  const stop = useStopStream();
  const update = useUpdateStream();
  const perms = usePermissions();
  const canAdminStreams = perms.can("streams.manage");
  const canManageStreams = perms.can("streams.manage");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(stream.name);

  const hlsUrl = useMemo(() => {
    const outputs: unknown = stream.outputs;
    const fromOutputs =
      outputs && typeof outputs === "object"
        ? (outputs as { hls?: { playlistUrl?: unknown } }).hls?.playlistUrl
        : undefined;
    if (typeof fromOutputs === "string" && fromOutputs.length) return fromOutputs;
    return "";
  }, [stream.outputs]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!name.trim()) return;
                    await update.mutateAsync({ streamId: stream.id, patch: { name: name.trim() } });
                    setEditing(false);
                  }}
                  disabled={update.isPending || !canManageStreams}
                >
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <CardTitle className="truncate" onDoubleClick={() => { if (canManageStreams) setEditing(true); }} title="Double-click to edit name">
                {stream.name}
              </CardTitle>
            )}
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {stream.kind} · {stream.ingest.protocol}
            </div>
          </div>
          <Badge variant={statusVariant(stream.status)}>{stream.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <StreamHealth streamId={stream.id} />
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <div className="text-xs text-muted-foreground">Ingest</div>
          <div className="mt-1 font-medium break-all">{stream.ingest.url}</div>
          <div className="mt-1 text-xs text-muted-foreground">Stream key: {stream.ingest.streamKeyMasked}</div>
        </div>

        {hlsUrl ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Playback preview (HLS)</div>
            <HlsPlayer src={hlsUrl} />
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          onClick={() => start.mutate(stream.id)}
          disabled={!canAdminStreams || start.isPending || stop.isPending || stream.status === "running" || stream.status === "disabled"}
        >
          Start
        </Button>
        <Button
          variant="destructive"
          onClick={() => stop.mutate(stream.id)}
          disabled={!canAdminStreams || start.isPending || stop.isPending || stream.status !== "running"}
        >
          Stop
        </Button>
      </CardFooter>
    </Card>
  );
}
