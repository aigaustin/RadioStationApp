"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CreditCard, LayoutDashboard, Library, ListMusic, Radio, Search, Video, Layers } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { useStations } from "@/hooks/use-stations";
import { useStreams } from "@/hooks/use-streams";
import { usePlaylists } from "@/hooks/use-playlists";
import { useAssets } from "@/hooks/use-media";

type Action = { id: string; label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const ACTIONS: Action[] = [
  { id: "nav:dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "nav:stations", label: "Stations", href: "/stations", icon: Radio },
  { id: "nav:streams", label: "Streams", href: "/streams", icon: Video },
  { id: "nav:media", label: "Media", href: "/media", icon: Library },
  { id: "nav:cms", label: "CMS", href: "/cms", icon: Layers },
  { id: "nav:catalog", label: "Catalog", href: "/catalog", icon: Library },
  { id: "nav:playlists", label: "Playlists", href: "/playlists", icon: ListMusic },
  { id: "nav:analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
  { id: "nav:billing", label: "Billing", href: "/billing", icon: CreditCard },
];

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);

  const [q, setQ] = useState("");
  const stations = useStations(q.trim() ? { q: q.trim() } : undefined);
  const streams = useStreams();
  const playlists = usePlaylists(null);
  const assets = useAssets(q.trim() ? { q: q.trim() } : undefined);

  const onOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setQ("");
  }, [setOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const meta = e.metaKey || e.ctrlKey;
      if (meta && key === "k") {
        e.preventDefault();
        onOpenChange(!open);
        return;
      }
      if (key === "escape" && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    const nav = ACTIONS.filter((a) => (query ? a.label.toLowerCase().includes(query) : true)).slice(0, query ? 6 : 7);
    const stationRows = (stations.data?.items ?? []).slice(0, 6).map((s) => ({
      id: `station:${s.id}`,
      kind: "station" as const,
      label: s.name,
      hint: "Station",
      onSelect: () => router.push(`/stations?stationId=${encodeURIComponent(s.id)}`),
    }));
    const streamRows = (streams.data?.items ?? [])
      .filter((s) => (query ? fuzzy(s.name.toLowerCase(), query) : false))
      .slice(0, 6)
      .map((s) => ({
        id: `stream:${s.id}`,
        kind: "stream" as const,
        label: s.name,
        hint: s.stationId ? "Stream · station scoped" : "Stream",
        onSelect: () =>
          router.push(
            s.stationId
              ? `/streams?stationId=${encodeURIComponent(s.stationId)}&streamId=${encodeURIComponent(s.id)}`
              : `/streams?streamId=${encodeURIComponent(s.id)}`,
          ),
      }));
    const playlistRows = (playlists.data?.items ?? [])
      .filter((p) => (query ? fuzzy(p.name.toLowerCase(), query) : false))
      .slice(0, 6)
      .map((p) => ({
        id: `playlist:${p.id}`,
        kind: "playlist" as const,
        label: p.name,
        hint: "Playlist",
        onSelect: () => router.push(`/playlists?stationId=${encodeURIComponent(p.stationId)}#${encodeURIComponent(p.id)}`),
      }));
    const assetRows = (assets.data?.items ?? [])
      .filter((a) => (query ? fuzzy(`${a.title} ${a.artist ?? ''}`.toLowerCase(), query) : false))
      .slice(0, 6)
      .map((a) => ({
        id: `asset:${a.id}`,
        kind: "asset" as const,
        label: a.title,
        hint: a.artist ?? "Asset",
        onSelect: () => router.push(`/media`),
      }));
    const actionRows = nav.map((a) => ({
      id: a.id,
      kind: "action" as const,
      label: a.label,
      hint: "Navigate",
      icon: a.icon,
      onSelect: () => router.push(a.href),
    }));
    return { actionRows, stationRows, streamRows, playlistRows, assetRows };
  }, [q, router, stations.data, streams.data, playlists.data, assets.data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/60 bg-bg-secondary/50 p-3">
          <Search className="size-4 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search or run a command…"
            className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 px-2"
          />
          <Badge variant="outline" className="hidden sm:inline-flex">
            Ctrl K
          </Badge>
        </div>

        <div className="max-h-[60vh] overflow-auto p-2">
          <Section title="Navigate">
            {items.actionRows.map((r) => (
              <Row
                key={r.id}
                label={r.label}
                hint={r.hint}
                icon={r.icon ? <r.icon className="size-4" /> : null}
                onSelect={() => {
                  setOpen(false);
                  r.onSelect();
                }}
              />
            ))}
          </Section>

          {q.trim() ? (
            <>
              <Section title="Stations">
                {(items.stationRows ?? []).map((r) => (
                  <Row
                    key={r.id}
                    label={r.label}
                    hint={r.hint}
                    onSelect={() => {
                      setOpen(false);
                      r.onSelect();
                    }}
                  />
                ))}
                {!items.stationRows.length ? <EmptyRow label="No stations matched." /> : null}
              </Section>

              <Section title="Streams">
                {(items.streamRows ?? []).map((r) => (
                  <Row
                    key={r.id}
                    label={r.label}
                    hint={r.hint}
                    onSelect={() => {
                      setOpen(false);
                      r.onSelect();
                    }}
                  />
                ))}
                {!items.streamRows.length ? <EmptyRow label="No streams matched." /> : null}
              </Section>

              <Section title="Playlists">
                {(items.playlistRows ?? []).map((r) => (
                  <Row
                    key={r.id}
                    label={r.label}
                    hint={r.hint}
                    onSelect={() => {
                      setOpen(false);
                      r.onSelect();
                    }}
                  />
                ))}
                {!items.playlistRows.length ? <EmptyRow label="No playlists matched." /> : null}
              </Section>

              <Section title="Media">
                {(items.assetRows ?? []).map((r) => (
                  <Row
                    key={r.id}
                    label={r.label}
                    hint={r.hint}
                    onSelect={() => {
                      setOpen(false);
                      r.onSelect();
                    }}
                  />
                ))}
                {!items.assetRows.length ? <EmptyRow label="No media matched." /> : null}
              </Section>
            </>
          ) : (
            <div className="px-2 py-4 text-xs text-muted-foreground">
              Type to search stations and streams, or hit enter on a navigation command.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <div className="px-2 pb-2 text-xs font-semibold text-muted-foreground">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({
  label,
  hint,
  icon,
  onSelect,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full rounded-xl border border-transparent px-3 py-2 text-left transition-colors",
        "hover:bg-accent/60 hover:border-border",
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="size-9 rounded-lg bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center text-primary">
            {icon}
          </div>
        ) : (
          <div className="size-9 rounded-lg bg-secondary/60 ring-1 ring-border/50" />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{label}</div>
          {hint ? <div className="truncate text-xs text-muted-foreground">{hint}</div> : null}
        </div>
      </div>
    </button>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <div className="px-3 py-2 text-sm text-muted-foreground">{label}</div>;
}

function fuzzy(text: string, query: string): boolean {
  if (!query) return true;
  if (text.includes(query)) return true;
  let i = 0;
  for (const ch of text) {
    if (ch === query[i]) i++;
    if (i >= query.length) return true;
  }
  return false;
}
