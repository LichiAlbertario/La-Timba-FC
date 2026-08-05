import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/site/MobileNav";
import { FotosLink, SidebarNav } from "@/components/site/SidebarNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col gap-8 border-r border-black/[0.06] bg-white px-6 py-8 md:flex">
        <Link href="/" className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/escudo.jpg"
            alt="Escudo La Timba FC"
            width={84}
            height={84}
            className="rounded-full"
            priority
          />
          <span className="font-display text-xl font-semibold uppercase tracking-wide text-timba-navy-dark">
            La Timba FC
          </span>
        </Link>

        <SidebarNav />

        <div className="mt-auto flex flex-col gap-3">
          <FotosLink />
          <p className="text-center text-base italic text-timba-blue-dark">
            Redoblo la apuesta por este amor
          </p>
        </div>
      </aside>

      <div
        className="flex min-w-0 flex-1 flex-col bg-cover bg-fixed bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,246,250,0.94), rgba(245,246,250,0.94)), url(/fondo-sitio.jpg)",
        }}
      >
        <MobileNav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
