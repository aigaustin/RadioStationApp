"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, X } from "lucide-react";
import { listNotifications, markAllRead, markNotificationRead, type Notification } from "@/services/api/notifications";
import { useSocket } from "@/hooks/use-socket";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  async function load() {
    setLoading(true);
    try {
      const d = await listNotifications({ limit: 10 });
      setItems(d.items ?? []);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (n: Notification) => setItems((xs) => [n, ...xs].slice(0, 20));
    socket.on("notification.new", handler);
    return () => { socket.off("notification.new", handler); };
  }, [socket]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); if (!open) load(); }}
        className="relative h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-border bg-popover shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">Notifications</span>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button type="button" onClick={async () => { await markAllRead(); await load(); }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <CheckCheck className="h-3.5 w-3.5" /> All read
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="ml-2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && <div className="py-6 text-center text-xs text-muted-foreground">Loading…</div>}
            {!loading && items.length === 0 && <div className="py-8 text-center text-xs text-muted-foreground">No notifications</div>}
            {items.map((n) => (
              <div key={n.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-accent/40 transition-colors cursor-pointer ${!n.isRead ? "bg-primary/5" : ""}`}
                onClick={async () => { if (!n.isRead) { await markNotificationRead(n.id); await load(); } }}
              >
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.isRead ? "bg-muted-foreground/20" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{n.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-1">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-border">
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs text-primary hover:underline">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
