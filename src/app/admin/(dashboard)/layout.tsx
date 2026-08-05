import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#f5f6fa]">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col gap-8 border-r border-black/[0.06] bg-white px-6 py-8 md:flex">
        <Link href="/admin" className="flex flex-col items-center gap-2 text-center">
          <Image
            src="/escudo.jpg"
            alt="Escudo La Timba FC"
            width={72}
            height={72}
            className="rounded-full"
            priority
          />
          <span className="font-display text-lg font-semibold uppercase tracking-wide text-timba-navy-dark">
            La Timba FC
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-timba-blue-dark">
            Panel de administración
          </span>
        </Link>

        <AdminSidebarNav />

        <form action={logout} className="mt-auto">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-black/60 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Salir
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
