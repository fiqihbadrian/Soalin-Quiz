import { NextRequest, NextResponse } from "next/server";
import { saveQuizSession } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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
