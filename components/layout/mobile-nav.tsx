"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, Library, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home",      icon: LayoutDashboard },
  { href: "/streams",   label: "Streams",   icon: Video },
  { href: "/media",     label: "Media",     icon: Library },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="grid h-full grid-cols-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={cn(
              "flex flex-col items-center justify-center gap-0.5 transition-colors",
              active ? "text-primary" : "text-muted-foreground/60 hover:text-foreground",
            )}>
              <Icon className={cn("size-5 transition-transform", active && "scale-110")} />
              <span className={cn("text-[9px] font-semibold uppercase tracking-wide", active ? "text-primary" : "text-muted-foreground/50")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
