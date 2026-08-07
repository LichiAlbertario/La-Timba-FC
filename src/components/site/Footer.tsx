const INSTAGRAM_URL = "https://www.instagram.com/latimbafc_/";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] px-4 py-6 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="text-xs leading-relaxed text-black/40">
          <p>© 2026 La Timba FC · Fundado en 2023</p>
          <p>Creado y diseñado por Lisandro Albertario</p>
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de La Timba FC"
          className="flex items-center gap-2 rounded-full border border-black/[0.08] px-3 py-1.5 text-xs font-semibold text-timba-navy-dark transition hover:border-timba-gold hover:text-timba-gold"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="5.5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
          </svg>
          @latimbafc_
        </a>
      </div>
    </footer>
  );
}
