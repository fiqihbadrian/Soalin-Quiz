"use client";

import type { OptionKey, QuizQuestion } from "@/lib/types";
import { AnswerOption } from "./AnswerOption";

interface QuestionCardProps {
  question: QuizQuestion;
  selected?: string;
  onSelect: (optionKey: OptionKey) => void;
}

export function QuestionCard({
  question,
  selected,
  onSelect,
}: QuestionCardProps) {
  const keys: OptionKey[] = ["A", "B", "C", "D"];

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg sm:text-xl text-[#e6edf3] leading-relaxed">
        {question.question}
      </h2>

      <div className="mt-5 space-y-3">
        {keys.map((k) => (
          <AnswerOption
            key={k}
            optionKey={k}
            text={question.options[k]}
            selected={selected === k}
            onSelect={() => onSelect(k)}
          />
        ))}
      </div>
    </div>
  );
}
