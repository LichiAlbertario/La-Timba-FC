"use client";

import { useRouter } from "next/navigation";
import type { Torneo } from "@/types/database";

export function TorneoFilter({
  torneos,
  seleccionado,
  basePath,
}: {
  torneos: Torneo[];
  seleccionado: string;
  basePath: string;
}) {
  const router = useRouter();

  return (
    <select
      defaultValue={seleccionado}
      onChange={(e) => {
        const value = e.target.value;
        router.push(value ? `${basePath}?torneo=${value}` : basePath);
      }}
      className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-timba-navy-dark transition-colors hover:border-timba-blue"
    >
      <option value="">Todos los torneos</option>
      {torneos.map((t) => (
        <option key={t.id} value={t.id}>
          {t.nombre}
        </option>
      ))}
    </select>
  );
}
