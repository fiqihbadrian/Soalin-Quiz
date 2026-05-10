import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Path yang butuh login (selain admin)
const PROTECTED_PATHS = ["/upload", "/quiz", "/results"];

// Path API yang butuh login
const PROTECTED_API_PATHS = ["/api/extract-pdf", "/api/generate-quiz"];

// Path admin (butuh role === "admin")
const ADMIN_PATHS = ["/admin-secret-panel"];
const ADMIN_API_PATHS = ["/api/admin"];

const COOKIE_NAME = "soalin_session";

async function verifyToken(token: string) {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload as {
      sub?: string;
      username?: string;
      role?: "user" | "admin";
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PATHS.some((p) =>
    pathname.startsWith(p)
  );
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAdminApi = ADMIN_API_PATHS.some((p) => pathname.startsWith(p));

  // Login/logout route: bolehkan lewat tanpa cek
  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  if (!isProtected && !isProtectedApi && !isAdmin && !isAdminApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Untuk API: balikin JSON 401
  if (isProtectedApi || isAdminApi) {
    if (!token) {
      return NextResponse.json(
        { error: "Belum login." },
        { status: 401 }
      );
    }
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json(
        { error: "Session tidak valid." },
        { status: 401 }
      );
    }
    if (isAdminApi && session.role !== "admin") {
      return NextResponse.json(
        { error: "Akses ditolak." },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Untuk page: redirect ke /login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const session = await verifyToken(token);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  // Cek role untuk halaman admin
  if (isAdmin && session.role !== "admin") {
    // Pura-pura 404 — biar halaman admin gak ketauan orang biasa
    const url = req.nextUrl.clone();
    url.pathname = "/not-found";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/upload/:path*",
    "/quiz/:path*",
    "/results/:path*",
    "/admin-secret-panel/:path*",
    "/api/extract-pdf",
    "/api/generate-quiz",
    "/api/admin/:path*",
  ],
};
