"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { Spinner } from "@/components/ui/Spinner";
import { SemesterSelector } from "@/components/SemesterSelector";
import { useQuizStore } from "@/store/quizStore";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useHydrated } from "@/lib/useHydrated";
import { QUESTION_COUNT_OPTIONS } from "@/lib/types";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

type Phase = "idle" | "extracting" | "generating";

const CAKUPAN = [
  {
    value: false,
    title: "Fokus",
    body: "Soal hanya dari konsep yang dibahas di PDF.",
  },
  {
    value: true,
    title: "Luas",
    body: "PDF jadi pijakan, soal boleh merambah konsep sejenis.",
  },
];

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
    resetAll,
  } = useQuizStore();

  // Tunggu localStorage selesai dibaca sebelum menampilkan state tersimpan
  const hydrated = useHydrated();

  // Buang state kuis kalau pemiliknya user lain
  useEffect(() => {
    if (!userLoading && user) ensureOwner(user.username);
  }, [user, userLoading, ensureOwner]);

  const [dragActive, setDragActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setError("Berkas harus berformat PDF.");
        return;
      }

      if (file.size > MAX_BYTES) {
        setError("Ukuran berkas melebihi 10 MB. Kompres atau pisahkan materinya.");
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
            "Teks yang terbaca terlalu sedikit. Kemungkinan PDF hasil pindai tanpa lapisan teks."
          );
        }

        setPdfText(data.text, file.name);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan.";
        setError(message);
      } finally {
        setPhase("idle");
      }
    },
    [setPdfText]
  );

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onGenerate = async () => {
    setError(null);

    if (!pdfText) {
      setError("Unggah PDF terlebih dahulu.");
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
  const canGenerate = Boolean(pdfText) && !busy;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <p className="chapter-label">Langkah 1 dan 2</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.01em] text-ink sm:text-3xl">
            Unggah materi, atur kuis
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">
            Teks diambil langsung dari PDF, lalu dikirim ke model AI untuk
            disusun jadi soal. Berkas tidak disimpan di server.
          </p>

          {error ? (
            <div className="mt-6">
              <Notice tone="danger">{error}</Notice>
            </div>
          ) : null}

          {hydrated && questions.length > 0 && !quizComplete ? (
            <div className="mt-6 rounded-[14px] border border-rule bg-accent-soft px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">
                    Ada kuis yang belum selesai
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {answeredCount} dari {questions.length} soal terjawab
                    {fileName ? `, ${fileName}` : ""}
                  </p>
                </div>

                {confirmReset ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-ink-muted">Buang kuis ini?</span>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        resetAll();
                        setConfirmReset(false);
                      }}
                    >
                      Ya, buang
                    </Button>
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() => setConfirmReset(false)}
                    >
                      Batal
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => router.push("/quiz")}>
                      Lanjutkan kuis
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setConfirmReset(true)}
                    >
                      Buang
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            {/* Berkas */}
            <section className="rounded-[14px] border border-rule bg-surface">
              <div className="flex items-baseline justify-between gap-3 border-b border-rule px-5 py-3">
                <h2 className="text-sm font-medium text-ink">Berkas PDF</h2>
                <span className="font-mono text-xs text-ink-muted">
                  maks 10 MB
                </span>
              </div>

              <div className="p-5">
                {fileName && pdfText ? (
                  <div className="rounded-[10px] border border-rule bg-paper px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-rule bg-surface font-mono text-[10px] text-ink-muted"
                      >
                        PDF
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {fileName}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {pdfText.length.toLocaleString("id-ID")} karakter
                          terbaca
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => inputRef.current?.click()}
                        disabled={busy}
                      >
                        Ganti berkas
                      </Button>
                      <Button
                        size="sm"
                        variant="quiet"
                        onClick={() => setPdfText("", "")}
                        disabled={busy}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={onDrag}
                    onDragLeave={onDrag}
                    onDragOver={onDrag}
                    onDrop={onDrop}
                    className={`rounded-[10px] border border-dashed px-5 py-10 text-center transition-colors ${
                      dragActive
                        ? "border-accent bg-accent-soft"
                        : "border-rule bg-paper"
                    }`}
                  >
                    {phase === "extracting" ? (
                      <Spinner label="Membaca teks dari PDF" />
                    ) : (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          className="mx-auto h-8 w-8 text-ink-muted"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
                          <path d="M14 3v5h5" />
                          <path d="M12 17v-5M9.5 14.5 12 12l2.5 2.5" />
                        </svg>

                        <p className="mt-3 text-sm text-ink">
                          Tarik PDF ke sini
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          Materi kuliah, rangkuman, atau slide
                        </p>

                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-4"
                          onClick={() => inputRef.current?.click()}
                          disabled={busy}
                        >
                          Pilih berkas
                        </Button>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={inputRef}
                  id="pdf-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={onInputChange}
                  className="sr-only"
                  tabIndex={-1}
                />

                <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                  PDF harus berisi teks yang bisa dipilih. Hasil pindai tanpa
                  lapisan teks tidak terbaca.
                </p>
              </div>
            </section>

            {/* Pengaturan */}
            <section className="rounded-[14px] border border-rule bg-surface">
              <div className="border-b border-rule px-5 py-3">
                <h2 className="text-sm font-medium text-ink">Pengaturan</h2>
              </div>

              <div className="flex flex-col gap-6 p-5">
                <SemesterSelector value={semester} onChange={setSemester} />

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-ink">
                    Jumlah soal
                  </legend>
                  <div className="grid grid-cols-4 gap-2">
                    {QUESTION_COUNT_OPTIONS.map((count) => {
                      const selected = count === questionCount;
                      return (
                        <button
                          key={count}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setQuestionCount(count)}
                          className={`min-h-11 rounded-[10px] border font-mono text-sm tabular transition-colors ${
                            selected
                              ? "border-accent bg-accent-soft text-accent"
                              : "border-rule bg-paper text-ink-muted hover:border-ink-muted hover:text-ink"
                          }`}
                        >
                          {count}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-ink">
                    Cakupan soal
                  </legend>
                  <div className="flex flex-col gap-2">
                    {CAKUPAN.map((option) => {
                      const selected = option.value === supplementMode;
                      return (
                        <button
                          key={option.title}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSupplementMode(option.value)}
                          className={`rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                            selected
                              ? "border-accent bg-accent-soft"
                              : "border-rule bg-paper hover:border-ink-muted"
                          }`}
                        >
                          <span className="block text-sm font-medium text-ink">
                            {option.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                            {option.body}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="border-t border-rule pt-4">
                  <Button
                    onClick={onGenerate}
                    disabled={!canGenerate}
                    block
                  >
                    {phase === "generating" ? (
                      <Spinner label="Menyusun soal" />
                    ) : (
                      `Buat ${questionCount} soal`
                    )}
                  </Button>

                  <p className="mt-2 text-center text-xs leading-relaxed text-ink-muted">
                    {!pdfText
                      ? "Tombol aktif setelah ada PDF yang terbaca."
                      : phase === "generating"
                        ? "Soal disusun setelah teks PDF dikirim."
                        : `Soal akan menyesuaikan semester ${semester}.`}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
