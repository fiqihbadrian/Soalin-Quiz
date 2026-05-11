import { NextRequest, NextResponse } from "next/server";
import type { QuizQuestion } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Long-running request: 20 soal bisa butuh 60-90 detik di model gratis
export const maxDuration = 120;

const ALLOWED_QUESTION_COUNTS = [5, 10, 15, 20];

// Default model. Override via env OPENROUTER_MODEL.
// Gemini 2.0 Flash:free lebih stabil output JSON-nya dibanding openrouter/free
// yang bisa pilih model kecil. Untuk kualitas soal lebih baik:
//   - "anthropic/claude-3.5-sonnet" (berbayar, paling akurat)
//   - "openai/gpt-4o-mini" (berbayar, murah, akurat)
const DEFAULT_MODEL = "google/gemini-2.0-flash-exp:free";

function buildSystemPrompt(
  questionCount: number,
  semester: number,
  supplementMode: boolean
): string {
  const difficultyGuide = getDifficultyGuide(semester);
  const sourcingRules = supplementMode
    ? buildSupplementRules()
    : buildStrictRules();

  return `Kamu adalah generator kuis akademik yang teliti dan akurat. Tugasmu membuat soal pilihan ganda dari materi kuliah yang diberikan.

# ATURAN PALING PENTING: SOAL HARUS SELF-CONTAINED

User akan mengerjakan kuis TANPA akses ke PDF materi. Mereka menjawab dari pemahaman konsep, bukan dari mengintip dokumen. Karena itu:

**DILARANG KERAS** membuat soal yang merujuk ke struktur/lokasi dokumen, misalnya:
- ❌ "Pada pertemuan 2, berapa hasil dari..."
- ❌ "Di halaman 3, disebutkan bahwa..."
- ❌ "Berdasarkan contoh yang disebutkan sebelumnya..."
- ❌ "Seperti tertulis di materi, jawaban dari soal latihan 5 adalah..."
- ❌ "Dalam slide presentasi di atas..."
- ❌ "Pada bab/sub-bab/week X..."
- ❌ "Nilai variabel X pada contoh yang diberikan..."
- ❌ "Hasil perhitungan dari soal latihan di modul..."
- ❌ Segala rujukan ke "materi", "dokumen", "rangkuman", "PDF", "file ini"

**WAJIB**: Setiap soal harus bisa dijawab hanya dengan pemahaman konsep umum. Soal harus berdiri sendiri — seperti soal di buku teks standar, bukan soal kuis dari kelas spesifik.

**Contoh yang BENAR**:
- ✓ "Apa yang dimaksud dengan normalisasi dalam basis data?"
- ✓ "Dalam algoritma bubble sort, berapa kompleksitas waktu rata-ratanya?"
- ✓ "Manakah dari berikut yang merupakan ciri utama OOP?"
- ✓ "Jika sebuah perusahaan menerapkan kebijakan X, efek utamanya terhadap Y adalah..."

**Contoh yang SALAH**:
- ✗ "Berapa hasil dari soal latihan nomor 3 di pertemuan 2?"
- ✗ "Dari data yang disebutkan di materi, berapakah..."
- ✗ "Pada contoh kasus perusahaan ABC di rangkuman, apa yang terjadi?"

# CARA MEMAKAI MATERI PDF

Anggap PDF itu sebagai **sumber tema dan konsep yang perlu diuji**, BUKAN sebagai bank soal yang disalin.
- Baca PDF untuk mengidentifikasi: konsep apa yang dibahas, definisi, teori, prinsip, klasifikasi, perbandingan
- Buat soal tentang konsep-konsep itu dengan cara yang dijawab pakai pemahaman umum
- Kalau PDF berisi contoh soal/latihan dengan angka spesifik, JANGAN salin soal itu. Gunakan konsepnya untuk bikin soal baru yang self-contained.
- Kalau PDF berisi studi kasus perusahaan/nama spesifik, ubah jadi situasi umum atau ambil konsep pelajarannya saja

# ATURAN SUMBER MATERI

${sourcingRules}

# ATURAN UMUM

1. **Bahasa**: Semua soal, pilihan, dan penjelasan WAJIB dalam Bahasa Indonesia yang baik dan benar, apapun bahasa materi aslinya.

2. **Format pilihan jawaban**:
   - Tepat 4 pilihan: A, B, C, D
   - Hanya 1 jawaban benar
   - Pilihan salah (distractor) harus masuk akal dan relevan dengan topik, bukan asal salah
   - Jangan pakai pola "semua benar" atau "semua salah"

3. **Variasi posisi jawaban benar**: Jawaban benar tersebar merata di A, B, C, D. Jangan semua A atau semua B.

4. **Penjelasan tidak boleh rujuk dokumen**: Penjelasan juga tidak boleh bilang "sesuai materi", "seperti di PDF", "di pertemuan X dijelaskan". Cukup jelaskan konsepnya langsung.

# TINGKAT KESULITAN (Semester ${semester})

${difficultyGuide}

# JUMLAH SOAL

Buat ${questionCount} soal.

# FORMAT OUTPUT

Kembalikan HANYA object JSON valid dengan key "questions" yang berisi array soal. TANPA teks pembuka/penutup, TANPA markdown fence. Format persis:

{
  "questions": [
    {
      "id": 1,
      "question": "Teks soal yang jelas, self-contained, dan bisa dijawab tanpa melihat dokumen apapun?",
      "options": {
        "A": "Pilihan A",
        "B": "Pilihan B",
        "C": "Pilihan C",
        "D": "Pilihan D"
      },
      "correct": "B",
      "explanation": "Penjelasan konsep langsung, tanpa merujuk ke materi/PDF/pertemuan/halaman."
    }
  ]
}`;
}

function buildStrictRules(): string {
  return `MODE: STRICT (cuma topik yang ada di PDF)

1. **Cakupan terbatas ke PDF**: Hanya bikin soal tentang konsep/topik yang disinggung di materi PDF. Jangan melebar ke topik lain di luar scope PDF.

2. **Tapi tetap self-contained**: Soal tetap harus bisa dijawab tanpa baca PDF — pakai pemahaman konsep umum. Ambil KONSEP dari PDF, bukan detail spesifik dokumen.

3. **Jika PDF pendek atau tipis**: Buat soal sebanyak yang memungkinkan (minimal 3) dari konsep yang ada. Jangan mengarang topik yang tidak dibahas sama sekali di PDF.

4. **Contoh yang benar**: PDF bahas tentang "TCP vs UDP" → bikin soal tentang perbedaan keduanya, port yang umum dipakai, kasus pemakaian — semua sebagai pengetahuan konsep umum.

5. **Contoh yang salah**: PDF bahas TCP vs UDP → DILARANG bikin soal "Berapa nilai throughput TCP di tabel pertemuan 2?" karena ini rujuk dokumen spesifik.`;
}

function buildSupplementRules(): string {
  return `MODE: LENGKAPI (boleh perluas pengetahuan umum satu tema)

1. **Prioritas tema PDF**: PDF menentukan tema/topik kuis. Tetap harus seputar tema yang sama.

2. **Identifikasi tema**: Pelajari dulu tema utama materi (misal: "Pemrograman Berorientasi Objek", "Ekonomi Mikro Bab 3", "Jaringan Komputer OSI Model").

3. **Boleh perluas pengetahuan umum**: Kalau topik di PDF terbatas, boleh bikin soal tentang konsep lain yang masih dalam tema sama — asalkan informasi yang SUDAH ada di buku teks standar bidang tersebut (bukan pendapat, tren, atau fakta yang butuh rujukan khusus).

4. **Tetap self-contained**: Semua soal (baik dari PDF maupun supplement) wajib bisa dijawab tanpa PDF, pakai pemahaman konsep.

5. **Rasio**: Idealnya 60% soal mencover konsep yang disinggung di PDF, sisanya boleh konsep lain satu tema.

6. **Konsistensi tingkat**: Soal tambahan harus selevel dengan materi PDF (jangan lebih mendalam dari cakupan semester).

7. **Jangan hallucinate fakta spesifik**: Untuk nama orang, tanggal persis, statistik khusus, rumus niche — jangan karang. Fokus ke konsep umum.`;
}

function getDifficultyGuide(semester: number): string {
  if (semester <= 2) {
    return `Semester 1-2 (dasar):
- Fokus pada definisi, istilah, fakta dasar
- Soal langsung: "Apa yang dimaksud dengan X?", "Mana yang termasuk ciri Y?"
- Hindari soal analisis yang kompleks
- Pilihan benar cukup jelas bagi yang sudah baca materi`;
  }
  if (semester <= 4) {
    return `Semester 3-4 (pemahaman & penerapan):
- Fokus pada pemahaman hubungan antar konsep
- Soal penerapan sederhana: "Dalam kasus A, mana yang paling tepat?"
- Boleh ada soal perbandingan konsep dari materi
- Distractor harus kelihatan plausible untuk yang belum paham penuh`;
  }
  if (semester <= 6) {
    return `Semester 5-6 (analisis):
- Fokus pada analisis dan kasus
- Soal skenario: "Diberikan situasi X, bagaimana menerapkan Y?"
- Soal menghubungkan beberapa konsep dari materi
- Distractor bisa mirip tapi ada perbedaan halus`;
  }
  return `Semester 7-8 (evaluasi & sintesis):
- Fokus pada evaluasi kritis dan sintesis
- Soal kompleks: "Di kasus X, pendekatan Y dan Z memberikan hasil berbeda. Mana yang paling tepat dan mengapa?"
- Butuh pemahaman mendalam, bukan sekadar hafalan
- Distractor sangat plausible, sering jadi jebakan`;
}

/**
 * Bersihkan hasil ekstraksi PDF.
 * pdf-parse sering menghasilkan:
 *   - Line break di tengah kalimat (word-wrap dari layout PDF)
 *   - Spasi/tab berlebih
 *   - Karakter non-printable
 *   - Header/footer halaman yang berulang
 *
 * Tujuannya: kasih teks yang lebih koheren ke model.
 */
function cleanPdfText(raw: string): string {
  let text = raw;

  // Hapus null byte dan karakter kontrol kecuali newline & tab
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Gabung baris yang terputus di tengah kalimat (huruf kecil + newline + huruf kecil/lanjutan)
  text = text.replace(/([a-zà-ÿ0-9,])[ \t]*\n[ \t]*([a-zà-ÿ])/g, "$1 $2");

  // Gabung kata yang ke-hyphenate karena word-wrap (mis: "peng-\nertian" -> "pengertian")
  text = text.replace(/([a-zà-ÿ])-\s*\n\s*([a-zà-ÿ])/g, "$1$2");

  // Spasi/tab berlebih -> satu spasi
  text = text.replace(/[ \t]+/g, " ");

  // Lebih dari 2 newline -> 2 newline (jaga paragraf tapi hilangkan gap besar)
  text = text.replace(/\n{3,}/g, "\n\n");

  // Trim tiap baris
  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  return text.trim();
}

/**
 * Extract a JSON array from the model's text response.
 *
 * Strategi bertingkat:
 * 1. Strip markdown fence (```json ... ```)
 * 2. Kalau JSON diapit object wrapper ({"questions":[...]}) → ambil array-nya
 * 3. Cari blok [...] pertama yang valid
 * 4. Fallback: return as-is
 */
function extractJsonArray(raw: string): string {
  let trimmed = raw.trim();

  // Strip markdown fence jika ada
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) trimmed = fenceMatch[1].trim();

  // Kadang model bungkus dalam object: {"questions": [...]}
  // Kita ambil array-nya saja
  const objMatch = trimmed.match(/"questions"\s*:\s*(\[[\s\S]*\])/);
  if (objMatch) return objMatch[1];

  // Langsung array
  if (trimmed.startsWith("[")) return trimmed;

  // Cari [...] terbesar di string
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

/**
 * Parse JSON array dengan auto-recovery kalau malformed.
 *
 * Kalau JSON.parse gagal, coba ekstrak individual question objects
 * pakai brace-matching. Ini handle kasus:
 * - Response ke-cut di tengah (missing closing bracket)
 * - 1-2 soal rusak format, tapi sisanya OK
 * - Trailing garbage setelah array
 * - Trailing comma (sering di LLM output)
 */
function parseQuestionsWithRecovery(jsonStr: string): unknown[] {
  // Coba parse langsung dulu
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // lanjut ke recovery
  }

  // Coba fix trailing comma (umum di LLM output)
  try {
    const fixed = jsonStr
      .replace(/,\s*]/g, "]")
      .replace(/,\s*}/g, "}");
    const parsed = JSON.parse(fixed);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // lanjut ke recovery
  }

  // Recovery mode: ekstrak tiap object {...} pakai brace matching
  const objects: unknown[] = [];
  const text = jsonStr;
  let i = 0;

  while (i < text.length) {
    const start = text.indexOf("{", i);
    if (start === -1) break;

    // Cari matching closing brace dengan respect terhadap string & escape
    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;

    for (let j = start; j < text.length; j++) {
      const ch = text[j];

      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }

    if (end === -1) {
      // Object yang belum selesai (ke-cut di akhir) — skip
      break;
    }

    const objStr = text.slice(start, end + 1);
    try {
      const obj = JSON.parse(objStr);
      if (obj && typeof obj === "object") {
        objects.push(obj);
      }
    } catch {
      // Object rusak → lanjut cari yang berikutnya
      try {
        // Coba dengan trailing comma fix
        const fixed = objStr.replace(/,\s*}/g, "}");
        const obj = JSON.parse(fixed);
        if (obj && typeof obj === "object") objects.push(obj);
      } catch {
        // skip
      }
    }

    i = end + 1;
  }

  return objects;
}

/**
 * Validasi array of unknowns jadi QuizQuestion[].
 * Mode lenient: skip soal yang invalid, jangan throw. Return hanya yang valid.
 */
function validateQuestions(input: unknown): QuizQuestion[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const validated: QuizQuestion[] = [];

  input.forEach((item, idx) => {
    if (!item || typeof item !== "object") return;
    const q = item as Record<string, unknown>;

    const question = typeof q.question === "string" ? q.question.trim() : null;
    const options = q.options as Record<string, string> | undefined;
    const correctRaw = typeof q.correct === "string" ? q.correct.trim().toUpperCase() : null;
    const explanation =
      typeof q.explanation === "string" ? q.explanation.trim() : "";

    if (!question) return;
    if (
      !options ||
      typeof options.A !== "string" ||
      typeof options.B !== "string" ||
      typeof options.C !== "string" ||
      typeof options.D !== "string"
    ) {
      return;
    }

    // Kadang model kasih "A." atau "A)" — normalize ke "A"
    const correct = correctRaw?.charAt(0);
    if (!correct || !["A", "B", "C", "D"].includes(correct)) return;

    validated.push({
      id: typeof q.id === "number" ? q.id : idx + 1,
      question,
      options: {
        A: options.A.trim(),
        B: options.B.trim(),
        C: options.C.trim(),
        D: options.D.trim(),
      },
      correct: correct as "A" | "B" | "C" | "D",
      explanation,
    });
  });

  return validated;
}

/**
 * Pola yang nunjukin soal rujuk ke dokumen — harus di-filter.
 * Soal yang kena pola ini bakal dibuang karena user gak bisa jawab tanpa PDF.
 */
const DOC_REFERENCE_PATTERNS = [
  /\bpertemuan\s+\d+/i,
  /\bpertemuan\s+ke[-\s]?\d+/i,
  /\bminggu\s+(ke[-\s]?)?\d+/i,
  /\bweek\s+\d+/i,
  /\bhalaman\s+\d+/i,
  /\bpada\s+(materi|dokumen|file|pdf|rangkuman|modul|slide|bahan)/i,
  /\b(di|dalam|pada)\s+(materi|dokumen|pdf|rangkuman|modul|bahan\s+ajar)\s+(di\s+atas|yang\s+diberikan|tersebut|ini)/i,
  /\bsesuai\s+(materi|dokumen|pdf|rangkuman)/i,
  /\bseperti\s+(disebutkan|dijelaskan|tertulis|tercantum)\s+(di|dalam|pada)/i,
  /\bberdasarkan\s+(contoh|data|tabel|gambar|soal\s+latihan)\s+(di\s+atas|yang\s+diberikan|tersebut)/i,
  /\bsoal\s+(latihan|nomor)\s+\d+/i,
  /\bdari\s+(data|contoh|kasus|tabel|gambar)\s+(yang\s+diberikan|di\s+atas|tersebut|tadi)/i,
  /\bcontoh\s+(di\s+atas|yang\s+diberikan|tersebut|tadi)/i,
  /\bseperti\s+(contoh|dijelaskan)\s+(sebelumnya|di\s+atas|tadi)/i,
  /\bsebelumnya\s+(disebutkan|dijelaskan|dipelajari)/i,
];

/**
 * Cek apakah soal merujuk ke dokumen (dan karenanya tidak self-contained).
 */
function referencesDocument(text: string): boolean {
  return DOC_REFERENCE_PATTERNS.some((re) => re.test(text));
}

/**
 * Filter soal yang merujuk ke dokumen. Cek question, options, dan explanation.
 */
function filterSelfContained(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.filter((q) => {
    if (referencesDocument(q.question)) return false;
    if (referencesDocument(q.explanation)) return false;
    if (referencesDocument(q.options.A)) return false;
    if (referencesDocument(q.options.B)) return false;
    if (referencesDocument(q.options.C)) return false;
    if (referencesDocument(q.options.D)) return false;
    return true;
  });
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server belum di-set OPENROUTER_API_KEY. Set dulu di .env.local." },
        { status: 500 }
      );
    }

    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
    }

    const { pdfText, semester, questionCount, supplementMode } = body as {
      pdfText?: unknown;
      semester?: unknown;
      questionCount?: unknown;
      supplementMode?: unknown;
    };

    if (typeof pdfText !== "string" || pdfText.trim().length < 20) {
      return NextResponse.json(
        { error: "pdfText wajib diisi dan harus berupa konten yang bermakna." },
        { status: 400 }
      );
    }

    const semesterNum = Number(semester);
    if (!Number.isInteger(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      return NextResponse.json(
        { error: "semester harus berupa bilangan bulat 1-8." },
        { status: 400 }
      );
    }

    const countNum = Number(questionCount);
    if (!ALLOWED_QUESTION_COUNTS.includes(countNum)) {
      return NextResponse.json(
        { error: "questionCount harus salah satu dari 5, 10, 15, atau 20." },
        { status: 400 }
      );
    }

    const supplement = supplementMode === true;

    const systemPrompt = buildSystemPrompt(countNum, semesterNum, supplement);

    // Bersihkan teks PDF sebelum dikirim ke model — pdf-parse sering
    // ninggalin whitespace berlebih, line break ditengah kalimat, dll
    const cleanedText = cleanPdfText(pdfText);

    const modeInstruction = supplement
      ? `Gunakan materi PDF di bawah untuk menentukan TEMA kuis. Kamu boleh bikin soal tentang konsep-konsep yang ada di PDF, dan juga boleh perluas ke konsep umum yang masih satu tema. Semua soal harus self-contained dan dapat dijawab tanpa PDF.`
      : `Gunakan materi PDF di bawah untuk menentukan KONSEP apa saja yang akan diuji. Bikin soal tentang konsep-konsep tersebut, tapi ditulis sebagai pengetahuan umum yang bisa dijawab tanpa PDF (bukan pertanyaan tentang isi dokumen).`;

    const userMessage = `<materi_kuliah>
${cleanedText}
</materi_kuliah>

${modeInstruction}

Buat ${countNum} soal pilihan ganda untuk mahasiswa Semester ${semesterNum}.

PENGINGAT PENTING:
- User mengerjakan kuis TANPA akses ke PDF. Setiap soal HARUS self-contained.
- DILARANG soal yang bilang "di pertemuan X", "pada halaman", "di materi", "dari data yang diberikan", atau rujukan ke dokumen dalam bentuk apapun.
- Ambil KONSEP dari PDF, tulis ulang jadi soal pengetahuan umum.
- Semua output dalam Bahasa Indonesia.
- Kembalikan HANYA object JSON dengan key "questions", tanpa teks lain.
- Variasikan posisi jawaban benar (A, B, C, D).

Mulai output JSON-nya sekarang:`;

    // Scale max_tokens berdasarkan jumlah soal:
    // ~500 token per soal (q + 4 pilihan + explanation + overhead), plus buffer
    const maxTokens = Math.max(3000, countNum * 600);

    // OpenRouter uses an OpenAI-compatible chat completions endpoint
    const orResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          // Optional but recommended by OpenRouter for analytics/rate-limit tiers
          "HTTP-Referer":
            process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_SITE_NAME || "Soalin",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: maxTokens,
          // Temperature: 0.3 untuk strict (akurat, patuh ke sumber),
          // 0.5 untuk supplement (butuh sedikit keleluasaan mengembangkan soal)
          temperature: supplement ? 0.5 : 0.3,
          frequency_penalty: 0.3,
          // Minta output JSON-formatted kalau model support
          // (Gemini, GPT-4o, Claude Sonnet mendukung ini)
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!orResponse.ok) {
      const errText = await orResponse.text().catch(() => "");
      console.error("OpenRouter error:", orResponse.status, errText);
      return NextResponse.json(
        {
          error: `Provider AI mengembalikan ${orResponse.status}. ${
            errText.slice(0, 200) || "Coba lagi."
          }`,
        },
        { status: 502 }
      );
    }

    const data = (await orResponse.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const raw = data.choices?.[0]?.message?.content?.trim() || "";

    if (!raw) {
      return NextResponse.json(
        { error: "AI mengembalikan respons kosong." },
        { status: 502 }
      );
    }

    const jsonStr = extractJsonArray(raw);

    // Pakai recovery parser — handle JSON ke-cut, trailing comma, dll
    const parsedObjects = parseQuestionsWithRecovery(jsonStr);

    if (parsedObjects.length === 0) {
      console.error("Recovery parser gagal. Raw:", raw.slice(0, 800));
      return NextResponse.json(
        {
          error:
            "Respons AI tidak bisa di-parse. Coba lagi atau kurangi jumlah soal.",
        },
        { status: 502 }
      );
    }

    // Validasi lenient — skip soal yang rusak, ambil yang valid
    let questions = validateQuestions(parsedObjects);

    if (questions.length === 0) {
      console.error("Semua soal gagal validasi. Raw:", raw.slice(0, 800));
      return NextResponse.json(
        {
          error:
            "AI mengembalikan soal tapi formatnya tidak valid. Coba lagi.",
        },
        { status: 502 }
      );
    }

    // Safety net: buang soal yang rujuk dokumen (AI kadang tetep bandel)
    const beforeFilter = questions.length;
    questions = filterSelfContained(questions);
    if (questions.length < beforeFilter) {
      console.info(
        `Filter self-contained: ${beforeFilter - questions.length} soal dibuang karena rujuk ke dokumen.`
      );
    }

    // Renumber ID setelah filter supaya urut lagi
    questions = questions.map((q, i) => ({ ...q, id: i + 1 }));

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "AI mengembalikan soal yang semuanya merujuk ke dokumen. Coba lagi dengan materi yang lebih konseptual.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("generate-quiz unexpected error:", err);
    const message =
      err instanceof Error ? err.message : "Kesalahan server yang tak terduga.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
