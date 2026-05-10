import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { QuizQuestion } from "@/lib/types";

interface QuizState {
  // Pemilik state ini (username). Dipakai untuk cek apakah user yang sekarang
  // login itu sama dengan yang bikin state, kalau beda → clear.
  ownerUsername: string | null;

  // Isi PDF yang diekstrak
  pdfText: string;
  fileName: string;

  // Konfigurasi kuis
  semester: number;
  questionCount: number;
  supplementMode: boolean;

  // Data kuis
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  currentQuestion: number;
  quizComplete: boolean;

  // Actions
  setOwner: (username: string) => void;
  ensureOwner: (currentUsername: string | null) => void;
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

// Default state — dipakai juga buat reset setelah ganti user
const initialState = {
  ownerUsername: null as string | null,
  pdfText: "",
  fileName: "",
  semester: 1,
  questionCount: 10,
  supplementMode: false,
  questions: [] as QuizQuestion[],
  userAnswers: {} as Record<number, string>,
  currentQuestion: 0,
  quizComplete: false,
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOwner: (username) => set({ ownerUsername: username }),

      // Dipanggil saat mount halaman yang pakai store.
      // Kalau owner state tidak cocok dengan user yang sekarang login,
      // clear state supaya gak ada kebocoran antar user.
      ensureOwner: (currentUsername) => {
        const { ownerUsername } = get();
        if (ownerUsername && currentUsername && ownerUsername !== currentUsername) {
          // User yang login sekarang bukan pemilik data → clear
          set({ ...initialState, ownerUsername: currentUsername });
        } else if (!ownerUsername && currentUsername) {
          // State baru, set owner
          set({ ownerUsername: currentUsername });
        }
      },

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

      // Reset progress tapi keep questions (untuk retake)
      resetQuiz: () =>
        set({
          userAnswers: {},
          currentQuestion: 0,
          quizComplete: false,
        }),

      // Reset semua (tapi keep owner username supaya session masih valid)
      resetAll: () =>
        set((state) => ({
          ...initialState,
          ownerUsername: state.ownerUsername,
        })),
    }),
    {
      name: "soalin-state",
      version: 2,
      // localStorage — persist walau tab ditutup / logout / refresh
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      // Kalau format version lama, skip hydrate (anggap reset)
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          return initialState as QuizState;
        }
        return persistedState as QuizState;
      },
    }
  )
);
