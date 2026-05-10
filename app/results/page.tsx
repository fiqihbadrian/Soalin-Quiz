"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ResultItem } from "@/components/ResultItem";
import { useQuizStore } from "@/store/quizStore";

export default function ResultsPage() {
  const router = useRouter();

  const {
    questions,
    userAnswers,
    semester,
    resetQuiz,
    resetAll,
  } = useQuizStore();

  // Hitung skor
  const score = useMemo(() => {
    return questions.reduce((acc, q) => {
      return userAnswers[q.id] === q.correct ? acc + 1 : acc;
    }, 0);
  }, [questions, userAnswers]);

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Redirect kalau tidak ada data
  useEffect(() => {
    if (questions.length === 0) {
      router.replace("/upload");
    }
  }, [questions.length, router]);

  // Simpan ke Supabase satu kali per kunjungan
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    if (questions.length === 0) return;
    savedRef.current = true;

    // Fire-and-forget — kalau gagal tidak masalah
    fetch("/api/save-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        semester,
        question_count: total,
        score,
        total,
      }),
    }).catch(() => {
      // Diabaikan — tidak kritis
    });
  }, [questions.length, semester, total, score]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-[#8b949e]">Mengalihkan...</p>
        </main>
      </div>
    );
  }

  const onRetake = () => {
    resetQuiz();
    router.push("/quiz");
  };

  const onUploadNew = () => {
    resetAll();
    router.push("/upload");
  };

  // Warna persentase berdasarkan skor
  const pctColor =
    percentage >= 80
      ? "text-[#2ea043]"
      : percentage >= 50
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Ringkasan skor */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 sm:p-8 text-center">
            <p className="text-sm text-[#8b949e] uppercase tracking-wider">
              Skor Kamu
            </p>
            <p className="mt-2 text-4xl sm:text-5xl font-semibold text-[#e6edf3]">
              {score} / {total} Benar
            </p>
            <p className={`mt-2 text-2xl font-semibold ${pctColor}`}>
              {percentage}%
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={onRetake} variant="primary">
                Ulangi Kuis
              </Button>
              <Button onClick={onUploadNew} variant="secondary">
                Upload PDF Baru
              </Button>
            </div>
          </div>

          {/* Bagian review */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-[#e6edf3]">Review Jawaban</h2>
            <p className="text-sm text-[#8b949e] mt-1">
              Lihat jawaban benar dan penjelasan singkat untuk setiap soal.
            </p>

            <div className="mt-5 space-y-4">
              {questions.map((q, i) => (
                <ResultItem
                  key={q.id}
                  index={i}
                  question={q}
                  userAnswer={userAnswers[q.id]}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
