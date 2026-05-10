"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  username: string;
  role: "user" | "admin";
}

interface UseCurrentUserResult {
  user: CurrentUser | null;
  loading: boolean;
}

/**
 * Hook untuk dapetin user yang lagi login (dari /api/auth/me).
 * Loading state awal `true` — komponen sebaiknya tunggu `!loading` sebelum render.
 */
export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setUser(data.user ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
