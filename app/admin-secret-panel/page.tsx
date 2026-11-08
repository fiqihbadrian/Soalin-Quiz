"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { Spinner } from "@/components/ui/Spinner";

interface AdminUser {
  id: string;
  username: string;
  role: "user" | "admin";
  created_at: string;
}

export default function AdminPanelPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/users")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat daftar user.");
        if (cancelled) return;
        setUsers(data.users || []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const loadUsers = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const onCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!newUsername.trim() || !newPassword) {
      setError("Username dan password wajib diisi.");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat user.");

      setNotice(`User ${data.user.username} dibuat.`);
      setNewUsername("");
      setNewPassword("");
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id: string, username: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus user.");
      setNotice(`User ${username} dihapus.`);
      setPendingDelete(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <p className="chapter-label">Admin</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.01em] text-ink sm:text-3xl">
            Kelola akun
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Pengguna bisa mendaftar sendiri dari halaman daftar. Form di bawah
            disediakan untuk membuat akun tanpa pendaftaran, misalnya saat
            pendaftaran sedang ditutup.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {error ? <Notice tone="danger">{error}</Notice> : null}
            {notice ? <Notice tone="success">{notice}</Notice> : null}
          </div>

          <section className="mt-8 rounded-[14px] border border-rule bg-surface">
            <div className="border-b border-rule px-5 py-3">
              <h2 className="text-sm font-medium text-ink">Buat akun baru</h2>
            </div>

            <form onSubmit={onCreate} className="flex flex-col gap-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="new-username"
                  label="Username"
                  value={newUsername}
                  onChange={(event) => setNewUsername(event.target.value)}
                  disabled={creating}
                  placeholder="nama_user"
                  hint="Huruf kecil, angka, atau garis bawah. 3 sampai 32 karakter."
                  autoComplete="off"
                />
                <Field
                  id="new-password"
                  label="Password"
                  type="text"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={creating}
                  placeholder="minimal 6 karakter"
                  hint="Tampil apa adanya supaya bisa disalin dan dikirim ke pemilik akun."
                  autoComplete="off"
                />
              </div>

              <div>
                <Button type="submit" disabled={creating}>
                  {creating ? <Spinner label="Membuat akun" /> : "Buat akun"}
                </Button>
              </div>
            </form>
          </section>

          <section className="mt-8 rounded-[14px] border border-rule bg-surface">
            <div className="flex items-baseline justify-between gap-3 border-b border-rule px-5 py-3">
              <h2 className="text-sm font-medium text-ink">Daftar akun</h2>
              <span className="font-mono text-xs tabular text-ink-muted">
                {users.length}
              </span>
            </div>

            {loading ? (
              <div className="px-5 py-8">
                <Spinner label="Memuat akun" />
              </div>
            ) : users.length === 0 ? (
              <p className="px-5 py-8 text-sm text-ink-muted">
                Belum ada akun. Buat yang pertama di form atas.
              </p>
            ) : (
              <ul>
                {users.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 border-b border-rule px-5 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {item.username}
                        {item.role === "admin" ? (
                          <span className="ml-2 rounded-[4px] border border-rule px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                            admin
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Dibuat{" "}
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {pendingDelete === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-muted">Hapus akun ini?</span>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onDelete(item.id, item.username)}
                        >
                          Ya
                        </Button>
                        <Button
                          size="sm"
                          variant="quiet"
                          onClick={() => setPendingDelete(null)}
                        >
                          Batal
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPendingDelete(item.id)}
                      >
                        Hapus
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
