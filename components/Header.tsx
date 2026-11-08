"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderUserMenu } from "./HeaderUserMenu";
import { ThemeToggle } from "./ThemeToggle";

interface SessionUser {
  username: string;
  role: "user" | "admin";
}

export function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: { user: SessionUser | null }) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2.5 text-ink transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo-removebg.png"
            alt=""
            width={32}
            height={32}
            className="rounded-[4px]"
            fetchPriority="high"
          />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">
            Soalin
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-[10px] px-2.5 text-sm text-ink-muted transition-colors hover:bg-surface-strong hover:text-ink"
          >
            Beranda
          </Link>

          {!loaded ? (
            <span
              aria-hidden="true"
              className="inline-block h-11 w-20 rounded-[10px] border border-rule bg-surface"
            />
          ) : user ? (
            <HeaderUserMenu
              username={user.username}
              isAdmin={user.role === "admin"}
            />
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-[10px] border border-rule bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
            >
              Masuk
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
