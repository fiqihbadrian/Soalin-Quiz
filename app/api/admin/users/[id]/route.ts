import { NextRequest, NextResponse } from "next/server";
import { deleteUser, getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/admin/users/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  if (!params.id) {
    return NextResponse.json({ error: "ID wajib diisi." }, { status: 400 });
  }

  const ok = await deleteUser(params.id);
  if (!ok) {
    return NextResponse.json(
      { error: "Gagal menghapus user." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
