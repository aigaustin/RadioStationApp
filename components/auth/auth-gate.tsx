"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api/client";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const tried = useRef(false);

  useEffect(() => {
    if (accessToken) return;
    if (tried.current) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? "/dashboard")}`);
      return;
    }
    tried.current = true;
    api
      .post("/v1/auth/refresh", {})
      .then((res) => {
        const token = (res?.data as { accessToken?: unknown } | null)?.accessToken;
        if (typeof token === "string" && token) setAccessToken(token);
        else router.replace(`/login?next=${encodeURIComponent(pathname ?? "/dashboard")}`);
      })
      .catch(() => {
        router.replace(`/login?next=${encodeURIComponent(pathname ?? "/dashboard")}`);
      })
  }, [accessToken, pathname, router, setAccessToken]);

  if (!accessToken) return null;
  return children;
}
