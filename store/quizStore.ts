import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { QuizQuestion } from "@/lib/types";

interface QuizState {
  // PDF content extracted on the upload step
  pdfText: string;
  fileName: string;

  // Quiz configuration
  semester: number;
  questionCount: number;
  supplementMode: boolean;

  // Quiz data
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  currentQuestion: number;
  quizComplete: boolean;

  // Actions
  setPdfText: (text: string, fileName: string) => void;
  setSemester: (semester: number) => void;
  setQuestionCount: (count: number) => void;
  setSupplementMode: (enabled: boolean) => void;
  setQuestions: (questions: QuizQuestion[]) => void;
  setAnswer: (questionId: number, answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setCurrentQuestion: (index: number) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  resetAll: () => void;
}

// sessionStorage-backed store so state survives page navigation but not tab close
export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      pdfText: "",
      fileName: "",
      semester: 1,
      questionCount: 10,
      supplementMode: false,
      questions: [],
      userAnswers: {},
      currentQuestion: 0,
      quizComplete: false,

      setPdfText: (text, fileName) => set({ pdfText: text, fileName }),
      setSemester: (semester) => set({ semester }),
      setQuestionCount: (questionCount) => set({ questionCount }),
      setSupplementMode: (enabled) => set({ supplementMode: enabled }),

      setQuestions: (questions) =>
        set({
          questions,
          userAnswers: {},
          currentQuestion: 0,
          quizComplete: false,
        }),

      setAnswer: (questionId, answer) =>
        set((state) => ({
          userAnswers: { ...state.userAnswers, [questionId]: answer },
        })),

      nextQuestion: () =>
        set((state) => ({
          currentQuestion: Math.min(
            state.currentQuestion + 1,
            Math.max(0, state.questions.length - 1)
          ),
        })),

      previousQuestion: () =>
        set((state) => ({
          currentQuestion: Math.max(0, state.currentQuestion - 1),
        })),

      setCurrentQuestion: (index) => set({ currentQuestion: index }),

      completeQuiz: () => set({ quizComplete: true }),

      // Reset only answers/progress but keep questions (for retake)
      resetQuiz: () =>
        set({
          userAnswers: {},
          currentQuestion: 0,
          quizComplete: false,
        }),

      // Full reset back to initial state
      resetAll: () =>
        set({
          pdfText: "",
          fileName: "",
          questions: [],
          userAnswers: {},
          currentQuestion: 0,
          quizComplete: false,
        }),
    }),
    {
      name: "soalin-state",
      // Use sessionStorage so data doesn't persist between browser sessions
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.sessionStorage
          : // Fallback no-op storage for SSR
            {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
