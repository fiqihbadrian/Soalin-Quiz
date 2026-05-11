"use client";

import { useState, useRef, useCallback, useEffect, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { SemesterSelector } from "@/components/SemesterSelector";
import { useQuizStore } from "@/store/quizStore";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { QUESTION_COUNT_OPTIONS } from "@/lib/types";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

type Phase = "idle" | "extracting" | "generating";

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const {
    pdfText,
    fileName,
    semester,
    questionCount,
    supplementMode,
    questions,
    userAnswers,
    quizComplete,
    ensureOwner,
    setPdfText,
    setSemester,
    setQuestionCount,
    setSupplementMode,
    setQuestions,
  } = useQuizStore();

  // Hydration guard — jangan render UI yang pakai persisted state
  // sampai localStorage beneran ke-load
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Pastikan state yang ke-load milik user yang sekarang login,
  // bukan bekas user sebelumnya
  useEffect(() => {
    if (!userLoading && user) {
      ensureOwner(user.username);
    }
  }, [user, userLoading, ensureOwner]);

  const [dragActive, setDragActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setError("Hanya file PDF yang didukung.");
        return;
      }

      if (file.size > MAX_BYTES) {
        setError("File terlalu besar. Maksimal 10MB.");
        return;
      }

      try {
        setPhase("extracting");
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Gagal membaca teks dari PDF.");
        }

        const data = (await res.json()) as { text: string };
        if (!data.text || data.text.trim().length < 20) {
          throw new Error(
            "Teks yang terbaca dari PDF terlalu sedikit. Coba file lain."
          );
        }
        setPdfText(data.text, file.name);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
        setError(message);
      } finally {
        setPhase("idle");
      }
    },
    [setPdfText]
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onGenerate = async () => {
    setError(null);

    if (!pdfText) {
      setError("Upload PDF terlebih dahulu.");
      return;
    }

    try {
      setPhase("generating");
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText, semester, questionCount, supplementMode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal membuat kuis.");
      }

      const data = await res.json();
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Tidak ada soal yang dihasilkan. Coba lagi.");
      }

      setQuestions(data.questions);
      router.push("/quiz");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
      setPhase("idle");
    }
  };

  const busy = phase !== "idle";
  const canGenerate = !!pdfText && !busy;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#e6edf3]">
              Upload & Konfigurasi
            </h1>
            <p className="mt-2 text-[#8b949e]">
              Drop ringkasan kuliah kamu, lalu pilih semester dan jumlah soal.
            </p>
          </div>

          {error ? (
            <Card error className="mb-6">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 border border-red-500/60 text-red-400 text-sm font-bold">
                  !
                </span>
                <div>
                  <p className="text-red-400 font-medium">Terjadi kesalahan</p>
                  <p className="text-sm text-[#8b949e] mt-1">{error}</p>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Banner: ada kuis yang belum selesai */}
          {hydrated && questions.length > 0 && !quizComplete ? (
            <Card className="mb-6 border-[#618eb3] bg-[#1a2a3a]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#618eb3] text-white text-sm font-bold flex-shrink-0">
                    ↺
                  </span>
                  <div className="min-w-0">
                    <p className="text-[#e6edf3] font-medium">
                      Kamu punya kuis yang belum selesai
                    </p>
                    <p className="text-sm text-[#8b949e] mt-0.5">
                      {Object.keys(userAnswers).length} dari {questions.length} soal terjawab
                      {fileName ? ` · ${fileName}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => router.push("/quiz")}
                    size="sm"
                  >
                    Lanjutkan
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(
                          "Buang kuis yang belum selesai dan mulai upload PDF baru?"
                        )
                      ) {
                        useQuizStore.getState().resetAll();
                      }
                    }}
                  >
                    Buang
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Banner: PDF udah ke-upload tapi belum generate */}
          {hydrated &&
          pdfText &&
          questions.length === 0 &&
          fileName ? (
            <Card className="mb-6 border-[#30363d] bg-[#0d1117]">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#21262d] border border-[#30363d] text-[#8b949e] text-xs font-bold flex-shrink-0">
                  i
                </span>
                <p className="text-sm text-[#8b949e]">
                  PDF <span className="text-[#e6edf3] font-medium">{fileName}</span> masih
                  tersimpan. Langsung lanjut generate kuis di bawah, atau upload PDF lain
                  untuk menggantinya.
                </p>
              </div>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KIRI: Upload */}
            <Card>
              <h2 className="text-lg font-semibold text-[#e6edf3]">Upload PDF</h2>
              <p className="text-sm text-[#8b949e] mt-1">Maksimal 10MB, hanya PDF</p>

              <div
                onDragEnter={onDrag}
                onDragLeave={onDrag}
                onDragOver={onDrag}
                onDrop={onDrop}
                className={[
                  "mt-4 border-2 border-dashed rounded-full p-8 text-center transition-colors",
                  dragActive
                    ? "border-[#7ba8cc] bg-[#0d1117]"
                    : "border-[#30363d] bg-[#0d1117]",
                ].join(" ")}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="h-10 w-10 text-[#8b949e]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5" />
                  </svg>

                  <p className="mt-3 text-[#e6edf3]">
                    Seret & lepas PDF di sini
                  </p>
                  <p className="text-sm text-[#8b949e] mt-1">atau</p>

                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    className="mt-3 px-4 py-2 text-sm rounded-full border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] transition-colors disabled:opacity-50"
                  >
                    Pilih File
                  </button>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={onInputChange}
                  />
                </div>
              </div>

              {phase === "extracting" ? (
                <div className="mt-4">
                  <Spinner label="Membaca PDF..." />
                </div>
              ) : null}

              {fileName && phase !== "extracting" ? (
                <div className="mt-4 flex items-center gap-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-full">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-xs font-bold">
                    PDF
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-[#e6edf3] truncate">{fileName}</p>
                    <p className="text-xs text-[#8b949e]">
                      {pdfText.length.toLocaleString("id-ID")} karakter terbaca
                    </p>
                  </div>
                </div>
              ) : null}
            </Card>

            {/* KANAN: Konfigurasi */}
            <Card>
              <h2 className="text-lg font-semibold text-[#e6edf3]">Pengaturan Kuis</h2>

              <div className="mt-5">
                <label className="block text-sm text-[#e6edf3] mb-2">
                  Semester
                </label>
                <SemesterSelector value={semester} onChange={setSemester} />
              </div>

              <div className="mt-6">
                <label className="block text-sm text-[#e6edf3] mb-2">
                  Jumlah Soal
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {QUESTION_COUNT_OPTIONS.map((count) => {
                    const isActive = count === questionCount;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={[
                          "py-2 px-2 text-sm rounded-full border transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-[#7ba8cc] focus:ring-offset-2 focus:ring-offset-[#0d1117]",
                          isActive
                            ? "bg-[#618eb3] border-[#618eb3] text-white hover:bg-[#7ba8cc]"
                            : "bg-[#161b22] border-[#30363d] text-[#e6edf3] hover:border-[#8b949e]",
                        ].join(" ")}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode sumber soal */}
              <div className="mt-6">
                <label className="block text-sm text-[#e6edf3] mb-2">
                  Cakupan Soal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSupplementMode(false)}
                    className={[
                      "py-3 px-3 text-left rounded-2xl border transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-[#7ba8cc] focus:ring-offset-2 focus:ring-offset-[#0d1117]",
                      !supplementMode
                        ? "bg-[#1a2a3a] border-[#618eb3]"
                        : "bg-[#161b22] border-[#30363d] hover:border-[#8b949e]",
                    ].join(" ")}
                    aria-pressed={!supplementMode}
                  >
                    <p className="text-sm font-medium text-[#e6edf3]">
                      Fokus
                    </p>
                    <p className="text-xs text-[#8b949e] mt-1">
                      Sesuai topik PDF
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSupplementMode(true)}
                    className={[
                      "py-3 px-3 text-left rounded-2xl border transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-[#7ba8cc] focus:ring-offset-2 focus:ring-offset-[#0d1117]",
                      supplementMode
                        ? "bg-[#1a2a3a] border-[#618eb3]"
                        : "bg-[#161b22] border-[#30363d] hover:border-[#8b949e]",
                    ].join(" ")}
                    aria-pressed={supplementMode}
                  >
                    <p className="text-sm font-medium text-[#e6edf3]">
                      Luas
                    </p>
                    <p className="text-xs text-[#8b949e] mt-1">
                      PDF + konsep tema sejenis
                    </p>
                  </button>
                </div>
                <p className="text-xs text-[#8b949e] mt-2">
                  {supplementMode
                    ? "Soal menguji pemahaman umum seputar tema PDF, bisa meluas ke konsep sejenis yang tidak disebut langsung."
                    : "Soal hanya menguji konsep yang dibahas di PDF, tapi ditulis sebagai pengetahuan umum (bukan soal tentang isi dokumen)."}
                </p>
              </div>

              <div className="mt-8">
                <Button
                  onClick={onGenerate}
                  disabled={!canGenerate}
                  fullWidth
                  size="lg"
                >
                  {phase === "generating" ? (
                    <Spinner label="Membuat soal dengan AI..." size="sm" />
                  ) : (
                    "Buat Kuis"
                  )}
                </Button>

                {!pdfText && !busy ? (
                  <p className="text-xs text-[#8b949e] mt-2 text-center">
                    Upload PDF dulu untuk mengaktifkan tombol ini.
                  </p>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
