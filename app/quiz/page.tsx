"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { useQuizStore } from "@/store/quizStore";
import type { OptionKey } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();

  const {
    questions,
    userAnswers,
    currentQuestion,
    setAnswer,
    nextQuestion,
    previousQuestion,
    completeQuiz,
  } = useQuizStore();

  // Kalau user masuk tanpa ada soal, redirect ke upload
  useEffect(() => {
    if (questions.length === 0) {
      router.replace("/upload");
    }
  }, [questions.length, router]);

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
