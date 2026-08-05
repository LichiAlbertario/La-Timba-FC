import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f2f3f7] px-6 text-center">
      <Image src="/escudo.jpg" alt="Escudo La Timba FC" width={72} height={72} className="rounded-full" />
      <p className="font-display text-5xl font-bold text-timba-navy-dark">404</p>
      <p className="text-black/60">Esta página se fue al banco de suplentes.</p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-timba-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-timba-navy-light"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
