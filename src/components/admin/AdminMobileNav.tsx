"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { logout } from "@/app/admin/actions";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/[0.06] bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="flex items-center gap-3">
          <Image src="/escudo.jpg" alt="Escudo La Timba FC" width={40} height={40} className="rounded-full" />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold uppercase tracking-wide text-timba-navy-dark">
              La Timba FC
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-timba-blue-dark">
              Admin
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="rounded-lg p-2 text-timba-navy-dark hover:bg-timba-blue/15"
        >
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col gap-6 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                <Image src="/escudo.jpg" alt="Escudo La Timba FC" width={36} height={36} className="rounded-full" />
                <span className="font-display text-lg font-semibold uppercase tracking-wide text-timba-navy-dark">
                  La Timba FC
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-2 text-timba-navy-dark hover:bg-timba-blue/15"
              >
                <X size={20} />
              </button>
            </div>

            <AdminSidebarNav onNavigate={() => setOpen(false)} />

            <form action={logout} className="mt-auto">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-black/60 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} strokeWidth={1.75} />
                Salir
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
