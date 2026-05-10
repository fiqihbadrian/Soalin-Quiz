import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "./supabase";

const COOKIE_NAME = "soalin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export interface SessionPayload {
  sub: string; // user id
  username: string;
  role: "user" | "admin";
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET belum di-set atau terlalu pendek (minimal 32 karakter). Cek .env.local."
    );
  }
  return new TextEncoder().encode(secret);
}

// Buat token JWT, signed HMAC-SHA256
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(getSecret());
}

// Verify token, return payload kalau valid
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub === "string" &&
      typeof payload.username === "string" &&
      (payload.role === "user" || payload.role === "admin")
    ) {
      return {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Set session cookie (httpOnly, secure di prod)
export async function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

// Hapus session cookie
export async function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Ambil session dari cookie (server-side)
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

// ===== Password hashing =====

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ===== User lookup =====

export interface DbUser {
  id: string;
  username: string;
  password_hash: string;
  role: "user" | "admin";
  created_at: string;
}

// Cari user by username dari Supabase
export async function findUserByUsername(
  username: string
): Promise<DbUser | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return data as DbUser;
}

// Buat user baru — dipakai admin panel
export async function createUser(
  username: string,
  plainPassword: string
): Promise<{ ok: true; user: DbUser } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase belum dikonfigurasi." };
  }

  const cleanUsername = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,32}$/.test(cleanUsername)) {
    return {
      ok: false,
      error: "Username hanya boleh huruf kecil, angka, dan underscore (3-32 karakter).",
    };
  }
  if (plainPassword.length < 6) {
    return { ok: false, error: "Password minimal 6 karakter." };
  }

  // Cek duplikat
  const existing = await findUserByUsername(cleanUsername);
  if (existing) {
    return { ok: false, error: "Username sudah dipakai." };
  }

  const password_hash = await hashPassword(plainPassword);

  const { data, error } = await supabase
    .from("users")
    .insert({
      username: cleanUsername,
      password_hash,
      role: "user",
    })
    .select()
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message || "Gagal membuat user.",
    };
  }

  return { ok: true, user: data as DbUser };
}

// Ambil semua user (admin only)
export async function listUsers(): Promise<DbUser[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as DbUser[];
}

// Hapus user by id (admin only)
export async function deleteUser(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("users").delete().eq("id", id);
  return !error;
}
