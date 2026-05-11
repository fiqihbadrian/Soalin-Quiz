import type { OptionKey, QuizQuestion } from "@/lib/types";

interface ResultItemProps {
  index: number;
  question: QuizQuestion;
  userAnswer?: string;
}

export function ResultItem({ index, question, userAnswer }: ResultItemProps) {
  const keys: OptionKey[] = ["A", "B", "C", "D"];
  const isCorrect = userAnswer === question.correct;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[#e6edf3] font-medium leading-relaxed">
          <span className="text-[#8b949e] mr-2">Q{index + 1}.</span>
          {question.question}
        </h3>
        <span
          className={[
            "flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full text-sm font-bold",
            isCorrect
              ? "bg-[#1a2a3a] text-[#7ba8cc] border border-[#618eb3]"
              : "bg-[#2d1a1a] text-red-400 border border-red-500/60",
          ].join(" ")}
          aria-label={isCorrect ? "Benar" : "Salah"}
        >
          {isCorrect ? "✓" : "✗"}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {keys.map((k) => {
          const isUserPick = userAnswer === k;
          const isCorrectKey = question.correct === k;

          let containerClass = "border-[#30363d] bg-[#0d1117]";
          if (isCorrectKey) {
            containerClass = "border-[#618eb3] bg-[#1a2a3a]";
          } else if (isUserPick && !isCorrectKey) {
            containerClass = "border-red-500/60 bg-[#2d1a1a]";
          }

          return (
            <li
              key={k}
              className={[
                "flex items-start gap-3 p-3 rounded-full border text-sm",
                containerClass,
              ].join(" ")}
            >
              <span
                className={[
                  "flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold border",
                  isCorrectKey
                    ? "bg-[#618eb3] border-[#618eb3] text-white"
                    : isUserPick
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-[#161b22] border-[#30363d] text-[#8b949e]",
                ].join(" ")}
              >
                {k}
              </span>
              <span className="text-[#e6edf3] flex-1">{question.options[k]}</span>
              {isUserPick ? (
                <span className="text-xs text-[#8b949e]">jawabanmu</span>
              ) : null}
              {isCorrectKey && !isUserPick ? (
                <span className="text-xs text-[#7ba8cc]">benar</span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 p-3 rounded-2xl bg-[#0d1117] border border-[#30363d]">
        <p className="text-sm text-[#8b949e]">
          <span className="text-[#e6edf3] font-medium">Penjelasan: </span>
          {question.explanation}
        </p>
      </div>
    </div>
  );
}
