"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, CreditCard, Film, Globe, LayoutDashboard, Layers,
  ListMusic, Palette, Radio, Rocket, Settings, Shield, Sparkles,
  Users2, Video, PanelLeftClose, PanelLeftOpen,
  Megaphone, Smartphone, ServerCog, Bug, DollarSign, Tv2,
  PlayCircle, Cpu, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { getPublicFlags } from "@/services/api/branding";
import { useTenant } from "@/app/branding-provider";
import { getFeatureMatrix } from "@/services/api/white-label";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  flag?: string;
  tenantFeature?: string;
  badge?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const TENANT_NAV: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/media",          label: "Media Library",  icon: Film      },
      { href: "/cms-experience", label: "Content Studio", icon: Layers    },
      { href: "/media-pipeline", label: "Media Pipeline", icon: Cpu       },
      { href: "/playlists",      label: "Playlists",      icon: ListMusic, flag: "playlists" },
    ],
  },
  {
    label: "Streaming",
    items: [
      { href: "/stations", label: "Stations", icon: Tv2 },
      { href: "/streams", label: "Live Streams", icon: Radio },
      { href: "/svp/player-alpha", label: "SVP", icon: Video, tenantFeature: "svp" },
    ],
  },
  {
    label: "Audience",
    items: [
      { href: "/analytics-bi", label: "Analytics",   icon: BarChart3             },
      { href: "/ai",           label: "AI Features", icon: Sparkles, flag: "ai"  },
    ],
  },
  {
    label: "Live Ops",
    items: [
      { href: "/live-ops",           label: "Overview",        icon: Rocket    },
      { href: "/live-ops/users",     label: "Users",           icon: Users2    },
      { href: "/live-ops/content",   label: "Content",         icon: Film      },
      { href: "/live-ops/analytics", label: "Analytics",       icon: BarChart3 },
      { href: "/live-ops/ads",       label: "Ad Performance",  icon: Megaphone },
      { href: "/live-ops/downloads", label: "Downloads",       icon: Download  },
    ],
  },
  {
    label: "Revenue",
    items: [
      { href: "/monetization", label: "Revenue & Plans", icon: DollarSign },
      { href: "/growth",       label: "Growth",          icon: Megaphone  },
      { href: "/reseller/customers", label: "Reseller",  icon: Users2,     tenantFeature: "reseller" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/mobile-tv", label: "Mobile & TV", icon: Smartphone },
      { href: "/settings",  label: "Settings",    icon: Settings   },
    ],
  },
];

const ADMIN_NAV: NavSection[] = [
  {
    label: "Administration",
    items: [
      { href: "/admin/overview",    label: "Platform Overview", icon: Shield     },
      { href: "/admin/tenants",     label: "Tenants",           icon: Globe      },
      { href: "/admin/users",       label: "Users",             icon: Users2     },
      { href: "/admin/user-roles",  label: "Roles",             icon: Shield     },
      { href: "/admin/packages",    label: "Packages",          icon: Layers     },
      { href: "/admin/subscribers", label: "Subscribers",       icon: CreditCard },
      { href: "/admin/nodes",       label: "Infrastructure",    icon: ServerCog  },
      { href: "/admin/coupons",     label: "Coupons",           icon: DollarSign },
      { href: "/admin/audit",       label: "Audit Log",         icon: Bug        },
      { href: "/admin/settings",    label: "Admin Settings",    icon: Settings   },
    ],
  },
];

function NavItem({ href, label, icon: Icon, active, disabled, collapsed }: {
  href: string; label: string; icon: React.ElementType;
  active: boolean; disabled?: boolean; collapsed: boolean;
}) {
  if (disabled) {
    return (
      <div
        title={`${label} (Disabled)`}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium opacity-25 cursor-not-allowed",
          collapsed ? "justify-center px-0 w-10 mx-auto" : "",
        )}
      >
        <Icon className="size-[15px] shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
    );
  }

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        collapsed ? "justify-center px-0 w-10 mx-auto" : "",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-primary" />
      )}
      <Icon className={cn("size-[15px] shrink-0 transition-colors", active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground")} />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-[52px] z-50 whitespace-nowrap rounded-lg bg-popover border border-border px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0">
          {label}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const role = useAuthStore((s) => s.user?.platformRole ?? null);
  const tenant = useTenant();

  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [tenantFeatures, setTenantFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getPublicFlags().then(d => {
      const m: Record<string, boolean> = {};
      for (const f of d.items) m[f.key] = Boolean(f.enabled);
      setFlags(m);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    getFeatureMatrix().then((d) => {
      setTenantFeatures(d.features ?? {});
    }).catch(() => {});
  }, []);

  const isAdmin = role === "super_admin" || role === "admin";
  const allSections = isAdmin ? [...TENANT_NAV, ...ADMIN_NAV] : TENANT_NAV;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
  const isDisabled = (item: NavItem) =>
    (item.flag !== undefined && flags[item.flag] === false) ||
    (item.tenantFeature !== undefined && tenantFeatures[item.tenantFeature] === false);

  return (
    <aside className={cn(
      "sidebar-root hidden md:flex h-full flex-col transition-all duration-200 ease-in-out relative",
      collapsed ? "w-16" : "w-[220px]",
      className,
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 border-b border-sidebar-border shrink-0 px-4",
        collapsed && "px-0 justify-center",
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt="logo" className="h-7 w-auto rounded object-contain shrink-0" />
            ) : (
              <div className="size-7 rounded-lg gradient-brand flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <PlayCircle className="size-4 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-foreground truncate leading-tight">{tenant.name || "Streamo"}</p>
              <p className="text-[10px] text-muted-foreground/50 font-medium leading-tight">Studio</p>
            </div>
          </div>
        ) : (
          <div className="size-7 rounded-lg gradient-brand flex items-center justify-center shadow-lg shadow-primary/20">
            <PlayCircle className="size-4 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 scrollbar-none">
        {allSections.map((section, si) => (
          <div key={si}>
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40 px-3 mb-1.5">{section.label}</p>
            )}
            {collapsed && si > 0 && <div className="h-px bg-border/50 mb-3" />}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavItem
                  key={item.href}
                  {...item}
                  active={isActive(item.href)}
                  disabled={isDisabled(item)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <button
          onClick={toggle}
          className={cn(
            "flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-xs text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent/40 transition-colors",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
