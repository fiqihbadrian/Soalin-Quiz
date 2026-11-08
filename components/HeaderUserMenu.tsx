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

  // Tutup menu saat klik di luar atau tekan Escape
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // State kuis sengaja tidak dihapus: kalau user yang sama masuk lagi,
    // progresnya masih ada. ensureOwner di tiap halaman yang menjaga
    // kalau user berbeda yang login.
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 items-center gap-2 rounded-[10px] border border-rule bg-surface px-2.5 text-sm text-ink transition-colors hover:border-ink-muted"
      >
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] bg-accent-soft font-mono text-xs font-semibold text-accent"
        >
          {username.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[9rem] truncate sm:inline">
          {username}
        </span>
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 8.5 2.5 5h7L6 8.5Z" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-52 rounded-[10px] border border-rule bg-surface py-1 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)]"
        >
          <div className="border-b border-rule px-3 py-2.5">
            <p className="text-xs uppercase tracking-[0.08em] text-ink-muted">
              Masuk sebagai
            </p>
            <p className="truncate text-sm font-medium text-ink">{username}</p>
          </div>

          <Link
            role="menuitem"
            href="/upload"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center px-3 text-sm text-ink transition-colors hover:bg-surface-strong"
          >
            Upload dan buat kuis
          </Link>

          {isAdmin ? (
            <Link
              role="menuitem"
              href="/admin-secret-panel"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center px-3 text-sm text-ink transition-colors hover:bg-surface-strong"
            >
              Panel admin
            </Link>
          ) : null}

          <button
            role="menuitem"
            type="button"
            onClick={onLogout}
            className="flex min-h-11 w-full items-center px-3 text-left text-sm text-danger transition-colors hover:bg-surface-strong"
          >
            Keluar
          </button>
        </div>
      ) : null}
    </div>
  );
}
