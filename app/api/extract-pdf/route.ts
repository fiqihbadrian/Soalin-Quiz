import { NextRequest, NextResponse } from "next/server";

// Pastikan ini jalan di Node.js (pdf-parse butuh Node API)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Tidak ada file ter-upload. Field 'file' wajib ada." },
        { status: 400 }
      );
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Hanya file PDF yang diperbolehkan." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 10MB." },
        { status: 413 }
      );
    }

    // Baca file ke Buffer untuk pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Import dinamis supaya probe file test di pdf-parse tidak ikut jalan
    // pas Next.js build. Kita impor langsung implementasi intinya.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as (
      data: Buffer
    ) => Promise<{ text: string }>;

    let parsed: { text: string };
    try {
      parsed = await pdfParse(buffer);
    } catch (err) {
      console.error("pdf-parse error:", err);
      return NextResponse.json(
        { error: "Tidak bisa membaca PDF ini. File mungkin rusak atau ter-enkripsi." },
        { status: 422 }
      );
    }

    const text = (parsed.text || "").trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "Tidak ada teks yang bisa diekstrak. PDF hasil scan tanpa OCR tidak didukung.",
        },
        { status: 422 }
      );
    }

    // Batasi panjang teks supaya payload ke LLM tetap wajar
    // 60k karakter kira-kira ~15k token, cukup untuk 1-6 minggu materi
    // tanpa bikin model kehilangan fokus
    const MAX_TEXT = 60_000;
    const truncated = text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) : text;

    return NextResponse.json({ text: truncated });
  } catch (err) {
    console.error("extract-pdf unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memproses PDF." },
      { status: 500 }
    );
  }
}
