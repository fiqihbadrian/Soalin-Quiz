/**
 * Pembatas laju request dengan dua backend:
 *
 * 1. `memory` (bawaan) menyimpan hitungan di memori proses. Cukup untuk satu
 *    instance, tapi hitungannya hilang saat server restart dan tidak dibagi
 *    antar instance.
 * 2. `redis` memakai Upstash REST, aktif otomatis kalau
 *    `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` diisi. Ini yang
 *    dipakai di produksi supaya hitungan berlaku lintas instance.
 *
 * Pemakaian: `await rateLimit("daftar:1.2.3.4", 5, 600)`.
 */

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // detik sampai jendela berikutnya
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MEMORY_MAX_KEYS = 10_000;

function memoryLimit(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    if (buckets.size > MEMORY_MAX_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, remaining: limit - 1, retryAfter: windowSec };
  }

  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));

  if (current.count >= limit) {
    return { ok: false, remaining: 0, retryAfter };
  }

  current.count += 1;
  return { ok: true, remaining: limit - current.count, retryAfter };
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult | null> {
  const config = redisConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec, "NX"],
        ["TTL", key],
      ]),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    const count = Number(data[0]?.result);
    const ttl = Number(data[2]?.result);

    if (!Number.isFinite(count)) return null;

    const retryAfter = Number.isFinite(ttl) && ttl > 0 ? ttl : windowSec;
    return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfter };
  } catch {
    // Kalau Redis tidak bisa dihubungi, jangan blokir pengguna. Batas di memori
    // tetap jalan sebagai jaring pengaman terakhir.
    return null;
  }
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const redis = await redisLimit(key, limit, windowSec);
  if (redis) return redis;
  return memoryLimit(key, limit, windowSec);
}

/** Alamat IP pemanggil, dipakai sebagai kunci pembatas. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || req.headers.get("x-vercel-forwarded-for") || "lokal";
}
