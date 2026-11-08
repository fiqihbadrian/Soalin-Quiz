"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { Spinner } from "@/components/ui/Spinner";

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/upload";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk.");
      }

      // Navigasi penuh supaya cookie sesi baru pasti terbaca oleh proxy
      // pada request berikutnya.
      const target =
        data.user?.role === "admin" ? "/admin-secret-panel" : nextPath;
      window.location.assign(target);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-start justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-sm">
        <p className="chapter-label">Akun</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.01em] text-ink">
          Masuk ke Soalin
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Kuis dan progresmu tersimpan di browser ini, jadi masuk dengan akun
          yang sama setiap kali latihan.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          {error ? (
            <Notice tone="danger" title="Gagal masuk">
              {error}
            </Notice>
          ) : null}

          <Field
            id="username"
            label="Username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={loading}
            placeholder="username"
          />

          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            placeholder="minimal 6 karakter"
          />

          <Button type="submit" disabled={loading} block>
            {loading ? <Spinner label="Memeriksa akun" /> : "Masuk"}
          </Button>
        </form>

        <p className="mt-6 border-t border-rule pt-4 text-sm text-ink-muted">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
          >
            Daftar akun baru
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
