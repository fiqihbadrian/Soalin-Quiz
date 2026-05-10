# Soalin

Bikin kuis otomatis dari PDF materi kuliah, bertenaga AI. Upload rangkuman kuliahmu, pilih level semester (1–8) dan jumlah soal, lalu dapetin soal pilihan ganda yang nyesuai sama materi dan tingkat semesternya.

Dibuat oleh [Fiqih Badrian](https://fiqihbadrian.my.id).

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- OpenRouter (gateway OpenAI-compatible — bisa pakai banyak model, termasuk yang gratis)
- `pdf-parse` untuk ekstraksi teks dari PDF
- Supabase (wajib — untuk user & simpan skor kuis)
- JWT cookie auth (bcrypt + jose)
- Zustand untuk state client

## Fitur

- Login-only: cuma user yang terdaftar yang bisa upload & generate kuis
- Admin panel tersembunyi (`/admin-secret-panel`) untuk bikin user baru
- Registrasi manual — user harus kontak admin dulu

## Cara Menjalankan

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ambil API key gratis di https://openrouter.ai/keys

3. Buat project Supabase baru di https://supabase.com, lalu jalankan SQL schema di bawah.

4. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

5. Isi `.env.local`:
   - `OPENROUTER_API_KEY` (wajib)
   - `AUTH_SECRET` — random 32+ karakter, generate pakai:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - `ADMIN_USERNAME` dan `ADMIN_PASSWORD` — kredensial kamu buat akses panel admin
   - `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari dashboard Supabase

6. Jalankan dev server:
   ```bash
   npm run dev
   ```

7. Buka http://localhost:3000

## Schema Supabase (WAJIB)

Jalankan SQL ini di SQL Editor Supabase:

```sql
-- Tabel user
create table users (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp default now(),
  username text unique not null,
  password_hash text not null,
  role text default 'user' not null check (role in ('user', 'admin'))
);

create index users_username_idx on users(username);

-- Tabel sesi kuis (opsional tapi direkomendasikan)
create table quiz_sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp default now(),
  semester int,
  question_count int,
  score int,
  total int
);
```

**Penting tentang RLS (Row Level Security):**
Aplikasi ini pakai anon key dari client ke Supabase (lewat server route). Kalau kamu enable RLS di Supabase, bikin policy yang sesuai atau pakai service_role key. Cara paling simpel untuk development: jangan enable RLS di tabel `users` dan `quiz_sessions` dulu.

## Alur Autentikasi

1. Admin (kamu) login di `/login` pakai kredensial `ADMIN_USERNAME` & `ADMIN_PASSWORD` dari `.env.local`
2. Admin diarahkan ke `/admin-secret-panel` untuk bikin user baru
3. User biasa login di `/login` pakai username & password yang dibuat admin
4. Setelah login, user bisa akses `/upload`, `/quiz`, dan `/results`

## Memilih Model AI

Set `OPENROUTER_MODEL` di `.env.local`:

| Model | Biaya | Keterangan |
|-------|------|-------|
| `openrouter/free` | Gratis | Auto-pilih model gratis yang cocok |
| `google/gemini-2.0-flash-exp:free` | Gratis | Cepat, kualitas bagus |
| `meta-llama/llama-3.3-70b-instruct:free` | Gratis | Model open-source besar |
| `anthropic/claude-3.5-sonnet` | Berbayar | Kualitas terbaik untuk task ini |
| `openai/gpt-4o-mini` | Berbayar, murah | Cepat dan stabil |

Lihat semua model: https://openrouter.ai/models

## Path

- `/` — beranda (public)
- `/login` — halaman masuk (public)
- `/register` — info cara dapat akun (public)
- `/upload` — upload & konfigurasi (butuh login)
- `/quiz` — mengerjakan soal (butuh login)
- `/results` — hasil kuis (butuh login)
- `/admin-secret-panel` — kelola user (butuh login admin)

> Path admin sengaja dibuat obscure. Kalau mau ubah, ganti di `middleware.ts` dan rename folder `app/admin-secret-panel`.

## Catatan

- Maksimal PDF 10 MB. PDF hasil scan gambar tanpa OCR tidak didukung.
- Model gratis di OpenRouter ada rate limit. Kalau kena, tunggu sebentar atau ganti ke model berbayar.
- Password disimpan dalam bentuk bcrypt hash di Supabase.
- Session disimpan di httpOnly cookie JWT dengan masa berlaku 7 hari.

## Kredit

Dibuat oleh **Fiqih Badrian** — [fiqihbadrian.my.id](https://fiqihbadrian.my.id)
