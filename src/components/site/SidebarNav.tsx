"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Camera,
  Grid3x3,
  Home,
  Images,
  ListOrdered,
  Shirt,
  Trophy,
  Users,
} from "lucide-react";

const FOTOS_URL = "https://drive.google.com/drive/folders/14Teg4M1dojEf7R2IFqr8L2XknwzOYHrF?usp=sharing";

const links = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/fixture", label: "Fixture", icon: Calendar },
  { href: "/resultados", label: "Resultados", icon: Trophy },
  { href: "/posiciones", label: "Posiciones", icon: ListOrdered },
  { href: "/plantel", label: "Plantel", icon: Users },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/formaciones", label: "Formaciones", icon: Grid3x3 },
  { href: "/camisetas", label: "Camisetas", icon: Shirt },
  { href: "/instagram", label: "Instagram", icon: Camera },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-timba-navy/[0.08] text-timba-navy-dark"
                : "text-black/60 hover:bg-timba-blue/15 hover:font-bold hover:text-timba-navy"
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function FotosLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <a
      href={FOTOS_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-lg bg-timba-gold/15 px-3 py-2.5 text-sm font-semibold text-timba-navy-dark transition hover:bg-timba-gold/25"
    >
      <Images size={18} strokeWidth={1.75} className="text-timba-gold" />
      Fotos
    </a>
  );
}
