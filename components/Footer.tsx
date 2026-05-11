export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#30363d] py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-[#8b949e]">
        <p>
          © {year} Soalin · Dibuat oleh{" "}
          <a
            href="https://fiqihbadrian.my.id"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e6edf3] hover:text-[#7ba8cc] transition-colors underline-offset-2 hover:underline"
          >
            Fiqih Badrian
          </a>
        </p>
      </div>
    </footer>
  );
}
