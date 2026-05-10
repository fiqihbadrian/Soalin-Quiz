import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soalin — Bikin Kuis Otomatis dari Materi Kuliah",
  description:
    "Upload PDF materi atau rangkuman kuliahmu, terus langsung dapet soal pilihan ganda yang nyesuai sama semester dan materi yang kamu pelajari. Cocok buat latihan sebelum quiz, uts, atau uas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="bg-[#0d1117]">
      <body className="min-h-screen bg-[#0d1117] text-[#e6edf3] antialiased">
        {children}
      </body>
    </html>
  );
}
