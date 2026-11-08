"use client";

import type { OptionKey } from "@/lib/types";

type ReviewState = "correct" | "wrong" | "muted" | undefined;

interface AnswerOptionProps {
  questionId: number;
  letter: OptionKey;
  text: string;
  selected: boolean;
  onSelect?: (letter: OptionKey) => void;
  reviewState?: ReviewState;
  disabled?: boolean;
}

const borderByState: Record<"correct" | "wrong" | "muted", string> = {
  correct: "border-accent bg-accent-soft",
  wrong: "border-danger bg-danger-soft",
  muted: "border-rule bg-surface",
};

export function AnswerOption({
  questionId,
  letter,
  text,
  selected,
  onSelect,
  reviewState,
  disabled = false,
}: AnswerOptionProps) {
  const interactive = typeof onSelect === "function" && !disabled;

  const shell = [
    "flex w-full items-start gap-3 rounded-[10px] border px-3 py-3 text-left text-sm",
    "transition-colors",
  ].join(" ");

  const look = reviewState
    ? borderByState[reviewState]
    : selected
      ? "border-accent bg-accent-soft"
      : interactive
        ? "border-rule bg-paper hover:border-ink-muted"
        : "border-rule bg-paper";

  const letterLook = reviewState
    ? reviewState === "correct"
      ? "border-accent bg-accent text-accent-fg"
      : reviewState === "wrong"
        ? "border-danger bg-danger text-paper dark:text-surface"
        : "border-rule text-ink-muted"
    : selected
      ? "border-accent bg-accent text-accent-fg"
      : "border-rule text-ink-muted";

  const content = (
    <>
      <span
        aria-hidden="true"
        className={`mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border font-mono text-xs font-semibold ${letterLook}`}
      >
        {letter}
      </span>
      <span className="flex-1 text-ink">{text}</span>
      {reviewState === "correct" ? (
        <span className="mt-px font-mono text-[10px] uppercase tracking-[0.08em] text-accent">
          benar
        </span>
      ) : null}
      {reviewState === "wrong" ? (
        <span className="mt-px font-mono text-[10px] uppercase tracking-[0.08em] text-danger">
          jawabanmu
        </span>
      ) : null}
    </>
  );

  if (!interactive) {
    return <div className={`${shell} ${look}`}>{content}</div>;
  }

  return (
    <label className={`${shell} ${look} cursor-pointer has-focus-visible:outline has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent`}>
      <input
        type="radio"
        name={`question-${questionId}`}
        value={letter}
        checked={selected}
        onChange={() => onSelect(letter)}
        className="sr-only"
      />
      {content}
    </label>
  );
}
