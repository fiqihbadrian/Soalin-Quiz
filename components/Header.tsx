"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderUserMenu } from "./HeaderUserMenu";

interface SessionUser {
  username: string;
  role: "user" | "admin";
}

export function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Ambil session dari server — non-blocking, gak bikin flash
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <header className="border-b border-[#30363d] bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#e6edf3] hover:text-white transition-colors"
        >
          <img
            src="/logo-removebg.png"
            alt="Soalin"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-semibold tracking-tight">Soalin</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            Beranda
          </Link>

          {/* Placeholder dengan tinggi sama supaya gak ada layout shift */}
          {!loaded ? (
            <span className="inline-block h-8 w-20 rounded-full bg-[#161b22] border border-[#30363d]" />
          ) : user ? (
            <HeaderUserMenu
              username={user.username}
              isAdmin={user.role === "admin"}
            />
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] transition-colors"
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
