"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { Spinner } from "@/components/ui/Spinner";
import { useQuizStore } from "@/store/quizStore";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useHydrated } from "@/lib/useHydrated";
import type { OptionKey } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const {
    questions,
    userAnswers,
    currentQuestion,
    ensureOwner,
    setAnswer,
    nextQuestion,
    previousQuestion,
    setCurrentQuestion,
    completeQuiz,
  } = useQuizStore();

  // Tunggu localStorage dibaca sebelum render atau redirect
  const hydrated = useHydrated();

  useEffect(() => {
    if (!userLoading && user) ensureOwner(user.username);
  }, [user, userLoading, ensureOwner]);

  useEffect(() => {
    if (hydrated && questions.length === 0) {
      router.replace("/upload");
    }
  }, [hydrated, questions.length, router]);

  // Lanjutkan dari soal pertama yang belum dijawab
  const jumpedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || jumpedRef.current) return;
    if (questions.length === 0) return;
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount > 0 && answeredCount < questions.length) {
      const firstUnanswered = questions.findIndex((q) => !userAnswers[q.id]);
      if (firstUnanswered >= 0) {
        useQuizStore.getState().setCurrentQuestion(firstUnanswered);
      }
    }
    jumpedRef.current = true;
  }, [hydrated, questions, userAnswers]);

  if (!hydrated || questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <Spinner label={!hydrated ? "Memuat kuis" : "Mengalihkan ke unggah"} />
        </main>
      </div>
    );
  }

  const current = questions[currentQuestion];
  const selected = userAnswers[current.id];
  const isLast = currentQuestion === questions.length - 1;
  const isFirst = currentQuestion === 0;
  const answeredCount = Object.keys(userAnswers).length;

  const onSelect = (key: OptionKey) => setAnswer(current.id, key);

  const onNext = () => {
    if (isLast) {
      completeQuiz();
      router.push("/results");
    } else {
      nextQuestion();
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-ink">
                Soal{" "}
                <span className="font-mono tabular">
                  {currentQuestion + 1}/{questions.length}
                </span>
              </p>
              <p className="font-mono text-xs tabular text-ink-muted">
                {answeredCount} terjawab
              </p>
            </div>

            <ProgressBar
              current={answeredCount}
              total={questions.length}
              label="Soal terjawab"
            />
          </div>

          <QuestionCard
            question={current}
            index={currentQuestion}
            total={questions.length}
            selected={selected}
            onSelect={onSelect}
          />

          <div className="mt-5 flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              onClick={previousQuestion}
              disabled={isFirst}
            >
              Sebelumnya
            </Button>

            <Button onClick={onNext} disabled={!selected}>
              {isLast ? "Lihat hasil" : "Selanjutnya"}
            </Button>
          </div>

          <nav aria-label="Pindah soal" className="mt-8 border-t border-rule pt-4">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
              Lompat ke soal
            </p>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((question, index) => {
                const answered = Boolean(userAnswers[question.id]);
                const active = index === currentQuestion;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentQuestion(index)}
                    aria-current={active ? "step" : undefined}
                    aria-label={`Soal ${index + 1}${
                      answered ? ", sudah dijawab" : ", belum dijawab"
                    }`}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] border font-mono text-xs tabular transition-colors ${
                      active
                        ? "border-ink bg-ink text-paper"
                        : answered
                          ? "border-accent/50 bg-accent-soft text-accent"
                          : "border-rule text-ink-muted hover:border-ink-muted hover:text-ink"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </main>

      <Footer />
    </div>
  );
}
