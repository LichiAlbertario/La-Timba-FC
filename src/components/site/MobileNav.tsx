"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { FotosLink, SidebarNav } from "./SidebarNav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/[0.06] bg-white px-4 py-3 md:hidden">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/escudo.jpg" alt="Escudo La Timba FC" width={40} height={40} className="rounded-full" />
          <span className="font-display text-xl font-semibold uppercase tracking-wide text-timba-navy-dark">
            La Timba FC
          </span>
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
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
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

            <SidebarNav onNavigate={() => setOpen(false)} />

            <div className="mt-auto flex flex-col gap-3">
              <FotosLink onNavigate={() => setOpen(false)} />
              <p className="text-center text-sm italic text-timba-blue-dark">
                Redoblo la apuesta por este amor
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
