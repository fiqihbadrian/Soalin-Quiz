"use client";

import { AnswerOption } from "./AnswerOption";
import type { OptionKey, QuizQuestion } from "@/lib/types";

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];

export function QuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  selected: string | undefined;
  onSelect: (letter: OptionKey) => void;
}) {
  return (
    <article className="rounded-[14px] border border-rule bg-surface">
      <header className="flex items-baseline justify-between gap-4 border-b border-rule px-5 py-3">
        <span className="chapter-label">Soal {index + 1}</span>
        <span className="font-mono text-xs tabular text-ink-muted">
          {index + 1} / {total}
        </span>
      </header>

      <div className="px-5 py-5">
        <h2 className="text-[17px] font-semibold leading-relaxed text-ink sm:text-lg">
          {question.question}
        </h2>

        <fieldset
          className="mt-5 flex flex-col gap-2"
          aria-label={`Pilihan jawaban soal ${index + 1}`}
        >
          <legend className="sr-only">Pilih satu jawaban</legend>
          {OPTION_KEYS.map((letter) => (
            <AnswerOption
              key={letter}
              questionId={question.id}
              letter={letter}
              text={question.options[letter]}
              selected={selected === letter}
              onSelect={onSelect}
            />
          ))}
        </fieldset>
      </div>
    </article>
  );
}
