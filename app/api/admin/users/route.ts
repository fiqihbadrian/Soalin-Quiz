import { NextRequest, NextResponse } from "next/server";
import { createUser, getSession, listUsers } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

// GET /api/admin/users — list semua user
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const users = await listUsers();
  // Jangan bocorin password_hash
  const safe = users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    created_at: u.created_at,
  }));

  return NextResponse.json({ users: safe });
}

// POST /api/admin/users — buat user baru
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
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

  const result = await createUser(username, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: result.user.id,
      username: result.user.username,
      role: result.user.role,
      created_at: result.user.created_at,
    },
  });
}
