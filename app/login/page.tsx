"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/upload";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        throw new Error(data.error || "Gagal login.");
      }

      // Pakai full page navigation supaya cookie baru dijamin kebaca
      // oleh middleware pada request berikutnya (hindari race condition)
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-[#e6edf3]">Masuk ke Soalin</h1>
            <p className="mt-2 text-sm text-[#8b949e]">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-[#7ba8cc] hover:underline"
              >
                Info registrasi
              </Link>
            </p>
          </div>

          <Card>
            {error ? (
              <div className="mb-4 p-3 rounded-full border border-red-500/60 bg-red-500/10">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm text-[#e6edf3] mb-1.5"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 rounded-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm focus:outline-none focus:border-[#7ba8cc] focus:ring-1 focus:ring-[#7ba8cc] disabled:opacity-50"
                  placeholder="usernamemu"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-[#e6edf3] mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 rounded-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm focus:outline-none focus:border-[#7ba8cc] focus:ring-1 focus:ring-[#7ba8cc] disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? <Spinner label="Memproses..." size="sm" /> : "Masuk"}
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner label="Memuat..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
