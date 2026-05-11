"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface HeaderUserMenuProps {
  username: string;
  isAdmin: boolean;
}

export function HeaderUserMenu({ username, isAdmin }: HeaderUserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // Sengaja TIDAK clear quiz state di localStorage supaya kalau user ini
    // login lagi nanti, state-nya masih ada. ensureOwner di tiap halaman
    // bakal handle kalau user berbeda yang login.
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] transition-colors"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#618eb3] text-white text-xs font-bold">
          {username.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{username}</span>
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 8L2 4h8l-4 4z" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-lg py-1 z-10">
          <div className="px-3 py-2 border-b border-[#30363d]">
            <p className="text-xs text-[#8b949e]">Masuk sebagai</p>
            <p className="text-sm text-[#e6edf3] font-medium truncate">
              {username}
            </p>
          </div>

          <Link
            href="/upload"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-[#e6edf3] hover:bg-[#21262d]"
          >
            Upload & Buat Kuis
          </Link>

          {isAdmin ? (
            <Link
              href="/admin-secret-panel"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-[#e6edf3] hover:bg-[#21262d]"
            >
              Panel Admin
            </Link>
          ) : null}

          <button
            type="button"
            onClick={onLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#21262d]"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
