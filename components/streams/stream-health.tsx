"use client";

import { useMemo, useState } from "react";
import { Activity, Users, Waves } from "lucide-react";
import { useStreamStatus } from "@/hooks/use-streams";
import { cn } from "@/lib/utils";

export function StreamHealth({ streamId, className }: { streamId: string; className?: string }) {
  const status = useStreamStatus(streamId);
  const [hover, setHover] = useState(false);

  const runtime = useMemo(() => {
    const health: any = status.data?.health ?? {};
    const rt = (health?.runtime ?? null) as null | {
      clients?: number;
      bitrateBps?: number;
      avgBps?: number;
      avgBps30s?: number;
      ewmaBps?: number;
      state?: string;
    };
    return rt;
  }, [status.data]);

  const enabled = useMemo(() => {
    const clients = Number(runtime?.clients ?? 0);
    const bps = Number(runtime?.bitrateBps ?? runtime?.avgBps ?? runtime?.ewmaBps ?? 0);
    return clients > 0 || bps > 0;
  }, [runtime]);

  const color = enabled ? "bg-success/60" : "bg-warning/60";

  return (
    <div
      className={cn("rounded-lg border border-border/60 bg-muted/15 p-2", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center gap-3 text-xs">
        <div className={cn("size-2 rounded-full", color)} />
        <div className="flex items-center gap-2">
          <Users className="size-3 opacity-80" />
          <span>{runtime?.clients ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <Waves className="size-3 opacity-80" />
          <span>{formatBps(runtime?.avgBps30s ?? runtime?.avgBps ?? runtime?.bitrateBps ?? 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="size-3 opacity-80" />
          <span>{formatBps(runtime?.ewmaBps ?? 0)}</span>
        </div>
        <div className="ml-auto text-muted-foreground">{runtime?.state ?? "idle"}</div>
      </div>

      {hover ? (
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
          <div>
            <div className="opacity-70">Instant</div>
            <div className="font-medium">{formatBps(runtime?.bitrateBps ?? 0)}</div>
          </div>
          <div>
            <div className="opacity-70">Avg 30s</div>
            <div className="font-medium">{formatBps(runtime?.avgBps30s ?? runtime?.avgBps ?? 0)}</div>
          </div>
          <div>
            <div className="opacity-70">EWMA</div>
            <div className="font-medium">{formatBps(runtime?.ewmaBps ?? 0)}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatBps(bps: number) {
  if (!bps) return "0 bps";
  if (bps >= 1_000_000) return `${Math.round((bps / 1_000_000) * 10) / 10} Mbps`;
  if (bps >= 1_000) return `${Math.round((bps / 1_000) * 10) / 10} Kbps`;
  return `${bps} bps`;
}

