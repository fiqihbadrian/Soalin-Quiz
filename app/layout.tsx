import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://soalin.fiqihbadrian.my.id"
  ),
  title: {
    default: "Soalin, kuis dari materi kuliahmu",
    template: "%s · Soalin",
  },
  description:
    "Ubah PDF materi kuliah jadi soal pilihan ganda dengan pembahasan, lalu kerjakan sebagai latihan sebelum kuis, UTS, atau UAS.",
  icons: {
    icon: "/logo-removebg.png",
    apple: "/logo-removebg.png",
  },
  openGraph: {
    title: "Soalin, kuis dari materi kuliahmu",
    description:
      "Ubah PDF materi kuliah jadi soal pilihan ganda dengan pembahasan, lalu kerjakan sebagai latihan sebelum kuis, UTS, atau UAS.",
    images: ["/logo-removebg.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
