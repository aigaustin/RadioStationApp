"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight, Menu, Signal, Sun, Moon, LogOut,
  User, CreditCard, Building2, Search,
} from "lucide-react";
import { NotificationBell } from "@/components/common/NotificationBell";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { listMemberships } from "@/services/api/auth";
import { getPublicBranding } from "@/services/api/branding";
import { api } from "@/services/api/client";
import { useRealtimeSnapshot } from "@/hooks/use-analytics";
import Sidebar from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  dashboard: "Overview", stations: "Stations", streams: "Live Streams",
  media: "Media Library", catalog: "Catalog", playlists: "Playlists",
  ai: "AI Features", analytics: "Analytics", billing: "Billing & Plans",
  settings: "Settings", cms: "CMS Pages", pages: "Site Pages",
  embed: "Embed & Publish", admin: "Admin", overview: "Overview",
  tenants: "Tenants", users: "Users", roles: "Roles",
  packages: "Packages", subscribers: "Subscribers", nodes: "Infrastructure",
  coupons: "Coupons", audit: "Audit Logs", setup: "Setup",
  reseller: "Reseller", customers: "Customers", revenue: "Revenue",
  svp: "SVP", "player-alpha": "Player Alpha",
  email: "Email / SMTP", drm: "DRM Protection", geo: "Geo Restrictions",
  subtitles: "Subtitles", notifications: "Notifications",
  "content-manager": "Content Manager", watermark: "Watermark",
  cdn: "CDN Settings", oauth: "OAuth Login", ads: "Ad Config",
  onboarding: "Setup Wizard", reels: "Reels", search: "Search", content: "Content Layout",
};

export default function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setTenantId = useAuthStore((s) => s.setTenantId);
  const currentTenantId = useAuthStore((s) => s.tenantId);
  const setPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [nextTenantId, setNextTenantId] = useState("");
  const [memberships, setMemberships] = useState<Array<{ tenant: { id: string; slug: string; name: string; status: string } }>>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [brandName, setBrandName] = useState("Streamo");
  const realtime = useRealtimeSnapshot();
  const liveCount = (realtime.data?.streams ?? []).filter((s) => s.ingestOk).length;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    if (!tenantDialogOpen) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingMembers(true);
        const res = await listMemberships();
        if (!cancelled) setMemberships(res.items);
      } finally { if (!cancelled) setLoadingMembers(false); }
    })();
    return () => { cancelled = true; };
  }, [tenantDialogOpen]);

  useEffect(() => {
    let cancelled = false;
    getPublicBranding().then((res) => {
      if (!cancelled) setBrandName(String((res.branding as any)?.name ?? "Streamo"));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const crumbs = (pathname ?? "/")
    .split("?")[0].split("#")[0]
    .split("/").filter(Boolean)
    .filter((seg) => seg !== "(dashboard)")
    .slice(0, 3)
    .map((seg) => ({ seg, label: LABELS[seg] ?? (seg.length > 16 ? `${seg.slice(0, 12)}…` : seg) }));

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? "U").toUpperCase();

  return (
    <header className="sticky top-0 z-40 h-[56px] border-b border-border bg-background/80 backdrop-blur-xl shrink-0">
      <div className="h-full px-4 flex items-center gap-3">

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px]">
              <Sidebar className="flex w-full border-r-0 h-full" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1 min-w-0 flex-1 text-sm">
          {crumbs.length === 0 && <span className="text-muted-foreground text-sm">Dashboard</span>}
          {crumbs.map((c, idx) => (
            <div key={`${c.seg}-${idx}`} className="flex items-center gap-1 min-w-0">
              {idx > 0 && <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" />}
              <span className={cn(
                "truncate",
                idx === crumbs.length - 1
                  ? "text-foreground font-semibold text-sm"
                  : "text-muted-foreground text-sm hover:text-foreground transition-colors",
              )}>{c.label}</span>
            </div>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden lg:block">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "flex items-center gap-2 h-8 w-60 px-3 rounded-[var(--radius)]",
              "bg-muted/60 border border-border text-muted-foreground/60",
              "hover:border-border-strong hover:bg-muted/80 transition-all duration-150",
              "text-xs cursor-pointer",
            )}
          >
            <Search className="size-3.5 shrink-0" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-border/80 text-muted-foreground/50 border border-border">⌘K</kbd>
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Live badge */}
          {liveCount > 0 && (
            <Link href="/streams">
              <div className="status-live px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/15 transition-colors cursor-pointer">
                {liveCount} live
              </div>
            </Link>
          )}

          {/* Theme */}
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {/* Notifications */}
          <NotificationBell />

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-2 rounded-[var(--radius)] px-2 py-1.5 ml-1",
                "hover:bg-accent/60 transition-colors",
              )}>
                <div className={cn(
                  "size-7 rounded-full flex items-center justify-center text-xs font-bold select-none shrink-0",
                  "gradient-brand text-white shadow-[0_0_0_2px_rgba(99,102,241,0.3)]",
                )}>
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[13px] font-medium leading-tight max-w-[96px] truncate text-foreground">
                    {user?.name ?? "Account"}
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                <span className="font-semibold text-sm text-foreground">{user?.name ?? "Account"}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email ?? ""}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setTenantDialogOpen(true)}>
                <Building2 className="size-4 mr-2 text-muted-foreground" />
                Switch workspace
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing">
                  <CreditCard className="size-4 mr-2 text-muted-foreground" />
                  Billing & Plans
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onSelect={() => {
                  api.post("/v1/auth/logout", {}).catch(() => {});
                  clearSession();
                  router.replace("/login");
                }}>
                <LogOut className="size-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tenant dialog */}
      <Dialog open={tenantDialogOpen} onOpenChange={setTenantDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Switch workspace</DialogTitle></DialogHeader>
          <div className="space-y-4 px-6 pb-2">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your workspaces</div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {loadingMembers && <div className="text-sm text-muted-foreground py-3 text-center">Loading…</div>}
                {!loadingMembers && memberships.length === 0 && <div className="text-sm text-muted-foreground py-3 text-center">No workspaces found</div>}
                {memberships.map((m) => (
                  <button key={m.tenant.id} onClick={() => { setTenantId(m.tenant.id); setTenantDialogOpen(false); }}
                    className={cn(
                      "w-full text-left px-3.5 py-2.5 rounded-[var(--radius)] border transition-all",
                      m.tenant.id === currentTenantId
                        ? "border-primary/40 bg-primary/8 ring-1 ring-primary/20"
                        : "border-border hover:border-border-strong hover:bg-accent/50",
                    )}>
                    <div className="text-sm font-semibold text-foreground">{m.tenant.name}</div>
                    <div className="text-xs text-muted-foreground">{m.tenant.slug}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground font-medium">Enter workspace ID</div>
              <Input value={nextTenantId} onChange={(e) => setNextTenantId(e.target.value)} placeholder="UUID or slug" />
            </div>
          </div>
          <DialogFooter className="px-6 pb-5">
            <Button variant="outline" onClick={() => setTenantDialogOpen(false)} size="sm">Cancel</Button>
            <Button size="sm" onClick={() => { setTenantId(nextTenantId.trim() || null); setTenantDialogOpen(false); }}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
