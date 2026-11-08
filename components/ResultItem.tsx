"use client";

import { AnswerOption } from "./AnswerOption";
import type { OptionKey, QuizQuestion } from "@/lib/types";

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];

export function ResultItem({
  question,
  index,
  answer,
}: {
  question: QuizQuestion;
  index: number;
  answer: string | undefined;
}) {
  const isCorrect = answer === question.correct;

  return (
    <article className="border-t border-rule px-5 py-5 first:border-t-0">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="chapter-label">Soal {index + 1}</span>
        <span
          className={`rounded-[4px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${
            isCorrect
              ? "border-accent/40 bg-accent-soft text-accent"
              : "border-danger/40 bg-danger-soft text-danger"
          }`}
        >
          {isCorrect ? "benar" : answer ? "salah" : "tidak dijawab"}
        </span>
      </header>

      <h3 className="text-[15px] font-medium leading-relaxed text-ink">
        {question.question}
      </h3>

      <div className="mt-3 flex flex-col gap-1.5">
        {OPTION_KEYS.map((letter) => {
          const reviewState =
            letter === question.correct
              ? ("correct" as const)
              : letter === answer
                ? ("wrong" as const)
                : ("muted" as const);
          return (
            <AnswerOption
              key={letter}
              questionId={question.id}
              letter={letter}
              text={question.options[letter]}
              selected={letter === answer}
              reviewState={reviewState}
            />
          );
        })}
      </div>

      <div className="mt-3 border-l-2 border-rule pl-3">
        <p className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
          Pembahasan
        </p>
        <p className="text-sm leading-relaxed text-ink-muted">
          {question.explanation}
        </p>
      </div>
    </article>
  );
}
