import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  createUser,
  setSessionCookie,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isLocalAuthEnabled } from "@/lib/localUsers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;

export async function POST(req: NextRequest) {
  // Maksimal 5 akun baru per 10 menit dari satu alamat
  const limit = await rateLimit(`soalin:daftar:${clientIp(req)}`, 5, 600);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const { username, password } = body as {
    username?: unknown;
    password?: unknown;
  };

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Username dan password wajib diisi." },
      { status: 400 }
    );
  }

  const cleanUsername = username.trim().toLowerCase();

  if (!USERNAME_PATTERN.test(cleanUsername)) {
    return NextResponse.json(
      {
        error:
          "Username hanya boleh huruf kecil, angka, dan garis bawah, 3 sampai 32 karakter.",
      },
      { status: 400 }
    );
  }

  // Jangan biarkan akun biasa memakai nama yang sama dengan admin
  const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  if (adminUsername && cleanUsername === adminUsername) {
    return NextResponse.json(
      { error: "Username itu dipakai admin. Pilih yang lain." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter." },
      { status: 400 }
    );
  }

  if (password.length > 72) {
    // bcrypt hanya memakai 72 byte pertama, jadi tolak sejak awal
    return NextResponse.json(
      { error: "Password maksimal 72 karakter." },
      { status: 400 }
    );
  }

  if (!isLocalAuthEnabled() && !getSupabaseAdmin()) {
    return NextResponse.json(
      { error: "Pendaftaran belum aktif di server ini. Hubungi admin." },
      { status: 503 }
    );
  }

  const result = await createUser(cleanUsername, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Langsung masuk setelah akun dibuat, tidak perlu mengetik ulang
  const token = await createSessionToken({
    sub: result.user.id,
    username: result.user.username,
    role: "user",
  });
  await setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    user: { username: result.user.username, role: result.user.role },
  });
}
