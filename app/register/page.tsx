import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Info Registrasi — Soalin",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#e6edf3]">
              Cara Dapetin Akun
            </h1>
          </div>

          <Card>
            <p className="text-[#e6edf3] leading-relaxed">
              Saat ini registrasi Soalin belum terbuka untuk umum. Akun dibuat
              manual oleh pembuat aplikasi untuk menjaga kualitas layanan dan
              biaya API tetap terkontrol.
            </p>

            <div className="mt-5 space-y-3">
              <p className="text-sm text-[#8b949e]">
                Kalau kamu mau pakai Soalin, hubungi admin dulu lewat:
              </p>

              <a
                href="https://fiqihbadrian.my.id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-full border border-[#30363d] bg-[#0d1117] hover:border-[#7ba8cc] transition-colors"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#618eb3] text-white font-bold">
                  @
                </span>
                <div>
                  <p className="text-[#e6edf3] font-medium">fiqihbadrian.my.id</p>
                  <p className="text-xs text-[#8b949e]">
                    Kontak admin untuk minta akun
                  </p>
                </div>
              </a>
            </div>

            <div className="mt-6 p-4 rounded-full bg-[#0d1117] border border-[#30363d]">
              <p className="text-sm text-[#8b949e]">
                <span className="text-[#e6edf3] font-medium">Catatan: </span>
                Kasih tahu username yang kamu pengenin dan tunggu konfirmasi
                dari admin. Setelah akun jadi, kamu bisa langsung login di{" "}
                <Link href="/login" className="text-[#7ba8cc] hover:underline">
                  halaman login
                </Link>
                .
              </p>
            </div>
          </Card>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              ← Kembali ke beranda
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
