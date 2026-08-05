import Link from "next/link";
import { Calendar, Camera, Shield, Shirt, Trophy, UserCog, Users } from "lucide-react";

const secciones = [
  {
    href: "/admin/torneos",
    titulo: "Torneos",
    descripcion: "Crear torneos y marcar cuál está activo",
    icon: Trophy,
  },
  {
    href: "/admin/jugadores",
    titulo: "Jugadores",
    descripcion: "Plantel, fotos, número y posición",
    icon: Users,
  },
  {
    href: "/admin/partidos",
    titulo: "Partidos",
    descripcion: "Fixture, resultados, goles/asistencias/tarjetas y formaciones",
    icon: Calendar,
  },
  {
    href: "/admin/rivales",
    titulo: "Equipos rivales",
    descripcion: "Escudos para cuando no vienen de la tabla de posiciones",
    icon: Shield,
  },
  {
    href: "/admin/camisetas",
    titulo: "Camisetas y escudos",
    descripcion: "Galería histórica de indumentaria y escudos",
    icon: Shirt,
  },
  {
    href: "/admin/instagram",
    titulo: "Instagram",
    descripcion: "Pegar embeds de posts puntuales",
    icon: Camera,
  },
  {
    href: "/admin/cuenta",
    titulo: "Cuenta",
    descripcion: "Cambiar tu contraseña de acceso",
    icon: UserCog,
  },
];

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-black/40">Panel de administración</p>
        <h1 className="font-display text-3xl font-semibold uppercase tracking-tight text-timba-navy-dark">
          La Timba FC
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {secciones.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_2px_8px_rgba(16,22,46,0.06)] transition hover:border-timba-blue hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-timba-navy/[0.06] text-timba-navy transition-colors group-hover:bg-timba-navy/[0.1]">
              <s.icon size={20} strokeWidth={1.75} />
            </span>
            <span>
              <p className="font-semibold text-timba-navy transition-colors group-hover:font-bold group-hover:text-timba-navy">
                {s.titulo}
              </p>
              <p className="text-sm text-black/60">{s.descripcion}</p>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
