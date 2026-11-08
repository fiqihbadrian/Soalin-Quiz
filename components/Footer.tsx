import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Soalin, dibuat oleh{" "}
          <a
            href="https://fiqihbadrian.my.id"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
          >
            Fiqih Badrian
          </a>
          . Kuis disusun oleh model AI, selalu cek ulang ke materi aslinya.
        </p>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
        >
          Masuk
        </Link>
      </div>
    </footer>
  );
}
