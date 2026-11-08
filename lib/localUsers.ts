import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { DbUser } from "./auth";

/**
 * Penyimpanan akun untuk pemakaian lokal, dipakai hanya kalau
 * `SOALIN_LOCAL_AUTH=1` dan Supabase belum diisi.
 *
 * Tujuannya supaya alur daftar, masuk, dan panel admin bisa dicoba tanpa
 * menyiapkan database. Di produksi variabel ini tidak di-set, jadi semua
 * operasi akun tetap lewat Supabase.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

export function isLocalAuthEnabled(): boolean {
  return process.env.SOALIN_LOCAL_AUTH === "1";
}

async function readAll(): Promise<DbUser[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DbUser[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(users: DbUser[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function localFindUser(username: string): Promise<DbUser | null> {
  const users = await readAll();
  return users.find((u) => u.username === username.toLowerCase()) ?? null;
}

export async function localCreateUser(
  username: string,
  passwordHash: string
): Promise<DbUser> {
  const users = await readAll();
  const user: DbUser = {
    id: randomUUID(),
    username,
    password_hash: passwordHash,
    role: "user",
    created_at: new Date().toISOString(),
  };
  await writeAll([...users, user]);
  return user;
}

export async function localListUsers(): Promise<DbUser[]> {
  const users = await readAll();
  return users.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function localDeleteUser(id: string): Promise<boolean> {
  const users = await readAll();
  const rest = users.filter((u) => u.id !== id);
  if (rest.length === users.length) return false;
  await writeAll(rest);
  return true;
}
