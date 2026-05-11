import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <span className="inline-block text-xs uppercase tracking-widest text-[#8b949e] border border-[#30363d] rounded-full px-2 py-1">
              Alat belajar bertenaga AI
            </span>

            <h1 className="mt-6 text-3xl sm:text-5xl font-semibold tracking-tight text-[#e6edf3]">
              Bikin Kuis Otomatis dari Materi Kuliah
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
              Upload PDF materi atau rangkuman kuliahmu, terus langsung dapet
              soal pilihan ganda yang nyesuai sama semester dan materi yang
              kamu pelajari. Cocok buat latihan sebelum quiz, uts, atau uas.
            </p>

            <div className="mt-10">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#618eb3] hover:bg-[#7ba8cc] text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#7ba8cc] focus:ring-offset-2 focus:ring-offset-[#0d1117]"
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>

          {/* Grid fitur sederhana */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
              <h3 className="text-[#e6edf3] font-medium">Upload PDF</h3>
              <p className="mt-2 text-sm text-[#8b949e]">
                Tinggal drop ringkasan kuliahmu. Maksimal 10MB per file.
              </p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
              <h3 className="text-[#e6edf3] font-medium">Sesuai Semester</h3>
              <p className="mt-2 text-sm text-[#8b949e]">
                Soal menyesuaikan kedalaman dari hafalan sampai analisis ahli.
              </p>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
              <h3 className="text-[#e6edf3] font-medium">Review Lengkap</h3>
              <p className="mt-2 text-sm text-[#8b949e]">
                Lihat jawaban benar dan penjelasan singkat untuk tiap soal.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
