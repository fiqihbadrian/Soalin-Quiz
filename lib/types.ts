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

// Tiap semester punya tingkat kesulitan dan jenis soal yang berbeda,
// supaya pilihan user benar-benar mengubah soal yang keluar.
export const SEMESTER_DESCRIPTIONS: SemesterDescription[] = [
  { level: 1, label: "Semester 1", description: "Definisi dan istilah kunci" },
  {
    level: 2,
    label: "Semester 2",
    description: "Konsep dasar dan contoh sederhana",
  },
  {
    level: 3,
    label: "Semester 3",
    description: "Penerapan konsep pada kasus rutin",
  },
  {
    level: 4,
    label: "Semester 4",
    description: "Penerapan pada kasus yang belum dicontoh",
  },
  {
    level: 5,
    label: "Semester 5",
    description: "Analisis hubungan antar konsep",
  },
  {
    level: 6,
    label: "Semester 6",
    description: "Analisis kasus dengan penalaran bertahap",
  },
  {
    level: 7,
    label: "Semester 7",
    description: "Evaluasi dan sintesis antar bab",
  },
  {
    level: 8,
    label: "Semester 8",
    description: "Evaluasi kritis, setara tugas akhir",
  },
];

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20] as const;
