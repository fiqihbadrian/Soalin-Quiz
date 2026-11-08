import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  findUserByUsername,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 10 percobaan masuk per 10 menit per alamat, cukup untuk salah ketik
    const limit = await rateLimit(`soalin:masuk:${clientIp(req)}`, 10, 600);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan masuk. Tunggu beberapa menit." },
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

    // Cek apakah ini login admin (pakai credential dari env)
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (
      adminUsername &&
      adminPassword &&
      username.trim().toLowerCase() === adminUsername.toLowerCase() &&
      password === adminPassword
    ) {
      const token = await createSessionToken({
        sub: "admin",
        username: adminUsername,
        role: "admin",
      });
      await setSessionCookie(token);
      return NextResponse.json({
        ok: true,
        user: { username: adminUsername, role: "admin" },
      });
    }

    // Login user biasa dari Supabase
    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: { username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("login error:", err);
    // Jangan kirim pesan galat mentah ke klien
    return NextResponse.json(
      { error: "Terjadi kesalahan di server. Coba lagi." },
      { status: 500 }
    );
  }
}
