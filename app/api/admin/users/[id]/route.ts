import { NextRequest, NextResponse } from "next/server";
import { deleteUser, getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/admin/users/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  if (!id) {
    return NextResponse.json({ error: "ID wajib diisi." }, { status: 400 });
  }

  const ok = await deleteUser(id);
  if (!ok) {
    return NextResponse.json(
      { error: "Gagal menghapus user." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
