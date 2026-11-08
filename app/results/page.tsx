"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ResultItem } from "@/components/ResultItem";
import { useQuizStore } from "@/store/quizStore";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useHydrated } from "@/lib/useHydrated";

export default function ResultsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const { questions, userAnswers, semester, ensureOwner, resetQuiz, resetAll } =
    useQuizStore();

  const hydrated = useHydrated();

  useEffect(() => {
    if (!userLoading && user) ensureOwner(user.username);
  }, [user, userLoading, ensureOwner]);

  const score = useMemo(
    () =>
      questions.reduce(
        (total, question) =>
          userAnswers[question.id] === question.correct ? total + 1 : total,
        0
      ),
    [questions, userAnswers]
  );

  const total = questions.length;
  const answered = Object.keys(userAnswers).length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const wrong = answered - score;
  const skipped = total - answered;

  useEffect(() => {
    if (hydrated && questions.length === 0) {
      router.replace("/upload");
    }
  }, [hydrated, questions.length, router]);

  // Simpan sesi ke Supabase sekali per kunjungan
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    if (!hydrated || questions.length === 0) return;
    savedRef.current = true;

    fetch("/api/save-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semester, question_count: total, score, total }),
    }).catch(() => {});
  }, [hydrated, questions.length, semester, total, score]);

  if (!hydrated || questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <Spinner
            label={!hydrated ? "Memuat hasil" : "Mengalihkan ke unggah"}
          />
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          <p className="chapter-label">Hasil</p>

          <section className="mt-3 rounded-[14px] border border-rule bg-surface">
            <div className="flex flex-col gap-6 px-5 py-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-ink-muted">Skor</p>
                <p className="mt-1 text-[44px] font-semibold leading-none tabular tracking-[-0.02em] text-ink">
                  {score}
                  <span className="text-[22px] font-normal text-ink-muted">
                    /{total}
                  </span>
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  {percentage} persen benar
                </p>
              </div>

              <dl className="grid grid-cols-3 gap-4 text-sm sm:gap-6">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
                    Benar
                  </dt>
                  <dd className="mt-0.5 font-mono text-lg tabular text-accent">
                    {score}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
                    Salah
                  </dt>
                  <dd className="mt-0.5 font-mono text-lg tabular text-danger">
                    {wrong}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
                    Kosong
                  </dt>
                  <dd className="mt-0.5 font-mono text-lg tabular text-ink-muted">
                    {skipped}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col gap-2 border-t border-rule px-5 py-4 sm:flex-row">
              <Button onClick={onRetake}>Ulangi kuis</Button>
              <Button variant="secondary" onClick={onUploadNew}>
                Unggah materi baru
              </Button>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">
                Pembahasan
              </h2>
              <p className="font-mono text-xs tabular text-ink-muted">
                {total} soal
              </p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Jawaban benar ditandai hijau, jawabanmu yang salah ditandai merah.
              Baca alasannya sebelum mengulang.
            </p>

            <div className="mt-4 rounded-[14px] border border-rule bg-surface">
              {questions.map((question, index) => (
                <ResultItem
                  key={question.id}
                  index={index}
                  question={question}
                  answer={userAnswers[question.id]}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
