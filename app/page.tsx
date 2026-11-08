import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buttonStyles } from "@/components/ui/Button";
import { AnswerOption } from "@/components/AnswerOption";
import type { QuizQuestion } from "@/lib/types";

// Contoh tampilan, bukan soal dari materi siapa pun.
const CONTOH: QuizQuestion = {
  id: 1,
  question:
    "Sebuah tabel menyimpan data nilai mahasiswa. Kolom mana yang paling tepat dijadikan kunci utama?",
  options: {
    A: "Kolom nama mahasiswa",
    B: "Kolom nomor induk mahasiswa",
    C: "Kolom nilai akhir",
    D: "Kolom tanggal lahir",
  },
  correct: "B",
  explanation:
    "Kunci utama harus unik dan tidak berubah. Nomor induk mahasiswa memenuhi dua syarat itu, sedangkan nama bisa sama dan nilai bisa berubah.",
};

const LANGKAH = [
  {
    title: "Unggah PDF materi",
    body: "Materi kuliah, rangkuman, atau slide yang sudah diekspor ke PDF. Maksimal 10 MB dan harus berisi teks, bukan hasil pindai.",
  },
  {
    title: "Tentukan kedalaman",
    body: "Pilih semester materi dan jumlah soal. Semester menentukan apakah soal menanyakan definisi, penerapan, atau evaluasi.",
  },
  {
    title: "Kerjakan soal",
    body: "Soal pilihan ganda dengan empat opsi. Jawaban tersimpan di browser, jadi kuis bisa dilanjutkan setelah tab ditutup.",
  },
  {
    title: "Baca pembahasan",
    body: "Setiap soal punya kunci jawaban dan alasan singkat. Skor akhir dan rincian jawaban bisa ditinjau ulang.",
  },
];

const BATAS = [
  {
    title: "PDF harus berisi teks",
    body: "Hasil pindai berupa gambar tidak bisa dibaca. Kalau teks dari PDF terlalu sedikit, Soalin menolak dan meminta berkas lain.",
  },
  {
    title: "Soal disusun model AI",
    body: "Pembahasan bisa keliru pada materi yang ambigu. Selalu cocokkan dengan catatan kuliah dan buku wajib.",
  },
  {
    title: "Kuota AI dibatasi",
    body: "Pendaftaran terbuka, tapi tiap kuis memanggil model AI. Kalau kuota habis, pembuatan soal berhenti sampai kuota dipulihkan admin.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <h1 className="max-w-xl text-[32px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[42px]">
                PDF materi masuk, soal latihan keluar.
              </h1>

              <p className="mt-4 max-w-xl leading-relaxed text-ink-muted">
                Soalin membaca materi kuliahmu, lalu menyusun soal pilihan ganda
                dengan pembahasan. Dipakai untuk latihan sebelum kuis, UTS, dan
                UAS, bukan pengganti membaca materi.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/upload" className={buttonStyles("primary", "md")}>
                  Buat kuis dari PDF
                </Link>
                <Link href="/login" className={buttonStyles("secondary", "md")}>
                  Masuk ke akun
                </Link>
              </div>

              <p className="mt-4 text-sm text-ink-muted">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
                >
                  Daftar sendiri, langsung bisa dipakai
                </Link>
                .
              </p>
            </div>

            <aside className="rounded-[14px] border border-rule bg-surface">
              <div className="flex items-baseline justify-between gap-3 border-b border-rule px-5 py-3">
                <span className="chapter-label">Contoh soal</span>
                <span className="font-mono text-xs text-ink-muted">1 / 10</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-[15px] font-medium leading-relaxed text-ink">
                  {CONTOH.question}
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {(["A", "B", "C", "D"] as const).map((letter) => (
                    <AnswerOption
                      key={letter}
                      questionId={CONTOH.id}
                      letter={letter}
                      text={CONTOH.options[letter]}
                      selected={letter === "B"}
                      reviewState={letter === "B" ? "correct" : "muted"}
                    />
                  ))}
                </div>
              </div>
              <p className="border-t border-rule px-5 py-3 text-xs text-ink-muted">
                Tampilan soal setelah dijawab. Pembahasan muncul di halaman
                hasil.
              </p>
            </aside>
          </div>
        </section>

        <section className="border-t border-rule">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">
                Cara kerjanya
              </h2>
              <p className="text-sm text-ink-muted">
                Empat langkah, dari berkas sampai pembahasan.
              </p>
            </div>

            <ol className="mt-8 grid gap-6 sm:grid-cols-2">
              {LANGKAH.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-0.5 w-6 shrink-0 font-mono text-xs tabular text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-medium text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-rule">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">
              Yang perlu diketahui sebelum mulai
            </h2>

            <dl className="mt-8 grid gap-x-12 gap-y-6 sm:grid-cols-2">
              {BATAS.map((item) => (
                <div key={item.title} className="border-t border-rule pt-4">
                  <dt className="text-[15px] font-medium text-ink">
                    {item.title}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
