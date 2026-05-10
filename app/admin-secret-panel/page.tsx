"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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

  // Form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat user.");
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setNotice(`User "${data.user.username}" berhasil dibuat.`);
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
    if (!confirm(`Yakin hapus user "${username}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal hapus user.");
      setNotice(`User "${username}" dihapus.`);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#e6edf3]">
                Panel Admin
              </h1>
              <p className="mt-1 text-sm text-[#8b949e]">
                Kelola user Soalin
              </p>
            </div>
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          </div>

          {error ? (
            <Card error className="mb-6">
              <p className="text-sm text-red-400">{error}</p>
            </Card>
          ) : null}

          {notice ? (
            <Card className="mb-6 border-[#238636]">
              <p className="text-sm text-[#2ea043]">{notice}</p>
            </Card>
          ) : null}

          {/* Form buat user baru */}
          <Card className="mb-8">
            <h2 className="text-lg font-semibold text-[#e6edf3]">Buat User Baru</h2>
            <p className="text-sm text-[#8b949e] mt-1">
              Username hanya huruf kecil, angka, dan underscore (3-32 karakter).
              Password minimal 6 karakter.
            </p>

            <form onSubmit={onCreate} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#e6edf3] mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={creating}
                    className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] disabled:opacity-50"
                    placeholder="contoh_user"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#e6edf3] mb-1.5">
                    Password
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={creating}
                    className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] disabled:opacity-50"
                    placeholder="minimal 6 karakter"
                  />
                </div>
              </div>

              <Button type="submit" disabled={creating}>
                {creating ? <Spinner label="Membuat..." size="sm" /> : "Buat User"}
              </Button>
            </form>
          </Card>

          {/* List user */}
          <Card padded={false}>
            <div className="p-5 border-b border-[#30363d]">
              <h2 className="text-lg font-semibold text-[#e6edf3]">
                Daftar User ({users.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <Spinner label="Memuat user..." />
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#8b949e]">
                Belum ada user. Buat user pertama di atas.
              </div>
            ) : (
              <ul className="divide-y divide-[#30363d]">
                {users.map((u) => (
                  <li
                    key={u.id}
                    className="p-5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-[#e6edf3] font-medium truncate">
                        {u.username}
                      </p>
                      <p className="text-xs text-[#8b949e] mt-1">
                        {u.role} · dibuat{" "}
                        {new Date(u.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onDelete(u.id, u.username)}
                    >
                      Hapus
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
