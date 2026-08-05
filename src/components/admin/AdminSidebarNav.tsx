"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Camera, Home, Shield, Shirt, Trophy, UserCog, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Inicio", icon: Home },
  { href: "/admin/torneos", label: "Torneos", icon: Trophy },
  { href: "/admin/jugadores", label: "Jugadores", icon: Users },
  { href: "/admin/partidos", label: "Partidos", icon: Calendar },
  { href: "/admin/rivales", label: "Rivales", icon: Shield },
  { href: "/admin/camisetas", label: "Camisetas", icon: Shirt },
  { href: "/admin/instagram", label: "Instagram", icon: Camera },
  { href: "/admin/cuenta", label: "Cuenta", icon: UserCog },
];

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
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
