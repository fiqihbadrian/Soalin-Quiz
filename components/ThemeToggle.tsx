"use client";

import { useTheme } from "next-themes";
import { useHydrated } from "@/lib/useHydrated";

/**
 * Tombol ganti tema. Mode awal mengikuti preferensi sistem, jadi tombol ini
 * hanya perlu muncul setelah tema terbaca di browser.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  if (!hydrated) {
    // Ruang yang sama dengan tombol asli, supaya header tidak bergeser
    return <span aria-hidden="true" className="h-11 w-11 rounded-[10px]" />;
  }

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Pakai tema terang" : "Pakai tema gelap";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-rule bg-surface text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
    >
      {isDark ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  );
}
