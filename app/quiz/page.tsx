"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { Spinner } from "@/components/ui/Spinner";
import { useQuizStore } from "@/store/quizStore";
import { useCurrentUser } from "@/lib/useCurrentUser";
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
    completeQuiz,
  } = useQuizStore();

  // Hydration guard — tunggu localStorage ke-load sebelum render/redirect
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Sync owner dengan user yang sekarang login
  useEffect(() => {
    if (!userLoading && user) {
      ensureOwner(user.username);
    }
  }, [user, userLoading, ensureOwner]);

  // Kalau user masuk tanpa ada soal (dan state udah hydrated), redirect ke upload
  useEffect(() => {
    if (hydrated && questions.length === 0) {
      router.replace("/upload");
    }
  }, [hydrated, questions.length, router]);

  // Pas pertama kali load dengan state yang udah ada, jump ke soal pertama
  // yang belum dijawab (biar user gak bingung harus mulai dari mana)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Tunggu hydration supaya gak salah redirect sebelum localStorage ke-load
  if (!hydrated || (hydrated && questions.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Spinner label={!hydrated ? "Memuat kuis..." : "Mengalihkan..."} />
        </main>
      </div>
    );
  }

  const current = questions[currentQuestion];
  const selected = userAnswers[current.id];
  const isLast = currentQuestion === questions.length - 1;
  const isFirst = currentQuestion === 0;

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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#8b949e]">
              Soal{" "}
              <span className="text-[#e6edf3] font-medium">
                {currentQuestion + 1}
              </span>{" "}
              dari{" "}
              <span className="text-[#e6edf3] font-medium">
                {questions.length}
              </span>
            </p>
            <p className="text-xs text-[#8b949e]">
              {Object.keys(userAnswers).length} dijawab
            </p>
          </div>

          <ProgressBar value={currentQuestion + 1} max={questions.length} />

          <div className="mt-8">
            <QuestionCard
              question={current}
              selected={selected}
              onSelect={onSelect}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={previousQuestion}
              disabled={isFirst}
            >
              Sebelumnya
            </Button>

            <Button onClick={onNext} disabled={!selected}>
              {isLast ? "Selesai" : "Selanjutnya"}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
