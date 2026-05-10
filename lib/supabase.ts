import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Dua jenis Supabase client:
 *
 * 1. Anon client (`getSupabase`) — pakai NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *    Dipakai untuk operasi yang aman di-expose ke client (ex: insert skor).
 *    Terkena aturan RLS.
 *
 * 2. Admin/service-role client (`getSupabaseAdmin`) — pakai SUPABASE_SERVICE_ROLE_KEY.
 *    HANYA dipakai di server-side route untuk operasi privileged
 *    (manajemen user, read password_hash, dll). Bypass RLS.
 *    JANGAN PERNAH expose ke client.
 */

let _anonClient: SupabaseClient | null | undefined;
let _adminClient: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (_anonClient !== undefined) return _anonClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    _anonClient = null;
    return _anonClient;
  }

  _anonClient = createClient(url, anonKey);
  return _anonClient;
}

/**
 * Server-only. Pakai service_role key untuk bypass RLS.
 * Kalau service_role belum di-set, fallback ke anon (supaya dev tidak bingung).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (_adminClient !== undefined) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    _adminClient = null;
    return _adminClient;
  }

  if (!serviceKey) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY belum di-set — operasi admin akan gagal kalau RLS aktif."
    );
    // Fallback ke anon supaya tidak crash, tapi bakal error kalau RLS enabled
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) {
      _adminClient = null;
      return _adminClient;
    }
    _adminClient = createClient(url, anonKey);
    return _adminClient;
  }

  _adminClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _adminClient;
}

export interface QuizSessionInsert {
  semester: number;
  question_count: number;
  score: number;
  total: number;
}

/**
 * Simpan sesi kuis. Pakai anon client (cuma insert sederhana).
 * Kalau tabelnya pakai RLS, perlu policy yang allow insert untuk anon.
 */
export async function saveQuizSession(session: QuizSessionInsert): Promise<void> {
  // Pakai admin client supaya tetap work kalau RLS aktif
  const supabase = getSupabaseAdmin() || getSupabase();
  if (!supabase) return;

  try {
    await supabase.from("quiz_sessions").insert(session);
  } catch (err) {
    // Non-fatal: log saja supaya alur user tidak terganggu
    console.warn("Failed to save quiz session:", err);
  }
}
