// Definisi tipe yang dipakai di seluruh aplikasi

export type OptionKey = "A" | "B" | "C" | "D";

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: OptionKey;
  explanation: string;
}

export interface GenerateQuizRequest {
  pdfText: string;
  semester: number;
  questionCount: number;
  supplementMode: boolean;
}

export interface GenerateQuizResponse {
  questions: QuizQuestion[];
}

export interface ExtractPdfResponse {
  text: string;
}

export interface ApiError {
  error: string;
}

export type SemesterDescription = {
  level: number;
  label: string;
  description: string;
};

export const SEMESTER_DESCRIPTIONS: SemesterDescription[] = [
  { level: 1, label: "Semester 1", description: "Konsep dasar, definisi, hafalan mendasar" },
  { level: 2, label: "Semester 2", description: "Konsep dasar, definisi, hafalan mendasar" },
  { level: 3, label: "Semester 3", description: "Pemahaman konsep, penerapan sederhana" },
  { level: 4, label: "Semester 4", description: "Pemahaman konsep, penerapan sederhana" },
  { level: 5, label: "Semester 5", description: "Analisis, penalaran berbasis kasus" },
  { level: 6, label: "Semester 6", description: "Analisis, penalaran berbasis kasus" },
  { level: 7, label: "Semester 7", description: "Evaluasi kritis, sintesis, level ahli" },
  { level: 8, label: "Semester 8", description: "Evaluasi kritis, sintesis, level ahli" },
];

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20] as const;
