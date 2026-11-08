"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { Spinner } from "@/components/ui/Spinner";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    if (!/^[a-z0-9_]{3,32}$/.test(cleanUsername)) {
      setError(
        "Username hanya boleh huruf kecil, angka, dan garis bawah, 3 sampai 32 karakter."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== repeat) {
      setError("Dua password yang kamu tulis belum sama.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat akun.");

      // Akun baru langsung punya sesi, jadi dibawa ke halaman unggah
      router.push("/upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-start justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-sm">
          <p className="chapter-label">Akun baru</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.01em] text-ink">
            Buat akun Soalin
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Akun dipakai untuk memisahkan progres kuis milikmu dari pengguna
            lain di browser yang sama. Isi dua kolom, langsung bisa dipakai.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            {error ? (
              <Notice tone="danger" title="Gagal mendaftar">
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
              placeholder="nama_kamu"
              hint="Huruf kecil, angka, atau garis bawah. 3 sampai 32 karakter."
            />

            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              placeholder="minimal 6 karakter"
              hint="Simpan sendiri. Pemulihan lewat admin, tidak ada email reset."
            />

            <Field
              id="repeat"
              label="Ulangi password"
              type="password"
              autoComplete="new-password"
              value={repeat}
              onChange={(event) => setRepeat(event.target.value)}
              disabled={loading}
              placeholder="tulis lagi password yang sama"
            />

            <Button type="submit" disabled={loading} block>
              {loading ? <Spinner label="Membuat akun" /> : "Daftar dan mulai"}
            </Button>
          </form>

          <p className="mt-6 border-t border-rule pt-4 text-sm text-ink-muted">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
            >
              Masuk di sini
            </Link>
            .
          </p>
        </div>
    </main>
  );
}
