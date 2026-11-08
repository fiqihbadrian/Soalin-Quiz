import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { saveQuizSession } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    const limit = await rateLimit(
      `soalin:simpan:${session.sub}`,
      30,
      600
    );
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Terlalu banyak penyimpanan. Coba lagi nanti." },
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

    const { semester, question_count, score, total } = body as Record<
      string,
      unknown
    >;

    const semesterNum = Number(semester);
    const qcNum = Number(question_count);
    const scoreNum = Number(score);
    const totalNum = Number(total);

    if (
      !Number.isFinite(semesterNum) ||
      !Number.isFinite(qcNum) ||
      !Number.isFinite(scoreNum) ||
      !Number.isFinite(totalNum)
    ) {
      return NextResponse.json(
        { error: "Semua field harus berupa angka." },
        { status: 400 }
      );
    }

    // No-op kalau env Supabase belum di-set
    await saveQuizSession({
      semester: semesterNum,
      question_count: qcNum,
      score: scoreNum,
      total: totalNum,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("save-session error:", err);
    return NextResponse.json({ error: "Gagal menyimpan sesi." }, { status: 500 });
  }
}
