# DESIGN.md: Soalin

Arah visual untuk aplikasi kuis dari materi kuliah. Dokumen ini sumber identitas
(bukan aturan filter). antislop dipakai sebagai saringan di atasnya.

Dial: ENERGY 1 / RHYTHM 2 / MOTION 1

## Produk dan audiens

- Produk: ubah PDF materi kuliah jadi kuis pilihan ganda. Dipakai mahasiswa
  Indonesia sebelum kuis, UTS, dan UAS.
- Audiens: mahasiswa yang sedang mengejar ujian. Sesi pemakaian pendek, sering
  dilakukan malam hari, di laptop dan HP.
- Kesan yang dituju: buku catatan kuliah yang rapi. Tenang, terbaca lama,
  bukan dashboard SaaS.

## Identitas

- Warna asal proyek dipertahankan: biru baja sebagai aksen, latar gelap
  #0D1117 seperti GitHub, sedikit terang untuk mode siang.
- Metafora: lembar ujian. Garis tipis seperti garis buku, biru tua untuk
  penanda dan aksi utama, merah bata untuk salah.
- Motif identitas: label bab bergaya buku pelajaran (`BAB 1` diikuti judul
  dengan huruf tebal) dipakai sebagai penanda bagian halaman, bukan sebagai
  badge dekoratif. Muncul di halaman dan di kartu soal.
- Satu titik fokus per layar: pertanyaan atau angka skor. Elemen lain menurun.

## Palet

Mode terang:

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `paper` | #F3F5F6 | latar halaman |
| `surface` | #FAFBFC | kartu |
| `surface-strong` | #E7ECF0 | panel sekunder |
| `ink` | #14202B | teks utama |
| `ink-muted` | #43525E | teks sekunder |
| `rule` | #D5DDE4 | garis pemisah dan border |
| `accent` | #2C5F8A | aksi utama, jawaban benar |
| `accent-soft` | #E2EBF2 | latar jawaban benar |
| `danger` | #A63A2B | salah, hapus |
| `danger-soft` | #F6E1DC | latar jawaban salah |
| `warn` | #8A5B12 | peringatan |

Mode gelap (bawaan):

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `paper` | #0D1117 | latar halaman |
| `surface` | #161B22 | kartu |
| `surface-strong` | #1C2430 | panel sekunder |
| `ink` | #E6EDF3 | teks utama |
| `ink-muted` | #8B949E | teks sekunder |
| `rule` | #30363D | garis dan border |
| `accent` | #7BA8CC | aksi, benar |
| `accent-soft` | #152734 | latar jawaban benar |
| `danger` | #F09A8D | salah |
| `warn` | #E4C583 | peringatan |

Aturan paket: satu keluarga biru (latar, permukaan, garis, aksen) di kedua
mode. Merah dan kuning hanya status, tidak pernah dekorasi.

## Tipografi

- Judul dan teks: Geist Sans (variable). Alasan: netral dan terbaca, tidak
  membawa karakter "startup" seperti font display.
- Angka skor dan label kecil: Geist Mono. Alasan: angka skor dan nomor soal
  butuh lebar tetap supaya tidak bergeser saat nilainya berubah.
- Skala: 12 / 14 / 16 / 20 / 26 / 34 px. Heading memakai letter-spacing -0.01em.
  Teks isi baris 1.7.

## Bentuk dan jarak

- Radius: 4px untuk label kecil, 10px untuk tombol dan input, 14px untuk kartu.
  Tidak ada bentuk pil di seluruh aplikasi.
- Garis: 1px `rule` sebagai pemisah utama. Bayangan hanya untuk elemen yang
  benar-benar melayang (menu pengguna), satu tingkat saja.
- Jarak: skala 4 / 8 / 12 / 16 / 24 / 32 / 48. Bagian halaman dipisah 48 atau
  32, di dalam kartu 16 atau 24.

## Gerak

- MOTION 1: hover dan transisi 150ms untuk warna dan border. Tidak ada animasi
  masuk, tidak ada loop, tidak ada parallax. Semua dimatikan saat pengguna
  memilih `prefers-reduced-motion`.

## Ikon

- Ikon garis 1.5px, digambar sendiri seperlunya: berkas, panah, centang,
  silang. Tidak memakai pustaka ikon supaya tidak satu gaya dengan situs lain.
- Ikon hanya ada kalau maknanya jelas. Sisanya teks.

## Yang dihindari

- Gradien, glow, glassmorphism, kartu seragam berikon bintang.
- Badge kapsul di atas judul dan angka statistik tanpa sumber.
- Tema gelap sebagai satu-satunya tema tanpa jalan keluar. Gelap tetap jadi
  bawaan karena dipakai malam hari, tetapi tombol di header harus benar-benar
  bekerja ke arah sebaliknya, dan mode terang tidak boleh jadi versi pucat.
