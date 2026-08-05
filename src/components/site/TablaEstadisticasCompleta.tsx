"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { nombreCompleto } from "@/lib/format";
import type { EstadisticaJugador } from "@/types/database";

type Columna =
  | "partidosJugados"
  | "goles"
  | "asistencias"
  | "golesMasAsistencias"
  | "promedioGoles"
  | "promedioAsistencias"
  | "amarillas"
  | "rojas"
  | "jugadorDelPartido";

const columnas: { key: Columna; etiqueta: string; formato?: (v: number) => string }[] = [
  { key: "partidosJugados", etiqueta: "PJ" },
  { key: "goles", etiqueta: "Goles" },
  { key: "asistencias", etiqueta: "Asist." },
  { key: "golesMasAsistencias", etiqueta: "G+A" },
  { key: "promedioGoles", etiqueta: "Prom. G", formato: (v) => v.toFixed(2) },
  { key: "promedioAsistencias", etiqueta: "Prom. A", formato: (v) => v.toFixed(2) },
  { key: "amarillas", etiqueta: "Am." },
  { key: "rojas", etiqueta: "Roj." },
  { key: "jugadorDelPartido", etiqueta: "MVP" },
];

export function TablaEstadisticasCompleta({ jugadores }: { jugadores: EstadisticaJugador[] }) {
  const [orden, setOrden] = useState<{ columna: Columna; direccion: "asc" | "desc" }>({
    columna: "golesMasAsistencias",
    direccion: "desc",
  });

  const lideres = useMemo(() => {
    const mapa = {} as Record<Columna, number>;
    for (const col of columnas) {
      mapa[col.key] = jugadores.reduce((max, j) => Math.max(max, j[col.key]), 0);
    }
    return mapa;
  }, [jugadores]);

  const ordenados = useMemo(() => {
    const copia = [...jugadores];
    copia.sort((a, b) => {
      const diff = a[orden.columna] - b[orden.columna];
      return orden.direccion === "asc" ? diff : -diff;
    });
    return copia;
  }, [jugadores, orden]);

  function alternarOrden(columna: Columna) {
    setOrden((prev) =>
      prev.columna === columna
        ? { columna, direccion: prev.direccion === "desc" ? "asc" : "desc" }
        : { columna, direccion: "desc" },
    );
  }

  if (jugadores.length === 0) {
    return <p className="text-sm text-black/40">Todavía no hay datos de jugadores.</p>;
  }

  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr>
            <th className="pb-2 pr-2 text-left text-xs font-semibold uppercase tracking-wide text-black/40">
              Jugador
            </th>
            {columnas.map((col) => {
              const activo = orden.columna === col.key;
              return (
                <th key={col.key} className="px-2 pb-2 text-center">
                  <button
                    type="button"
                    onClick={() => alternarOrden(col.key)}
                    className={`inline-flex items-center gap-0.5 whitespace-nowrap text-xs font-semibold uppercase tracking-wide transition-colors ${
                      activo ? "text-timba-navy" : "text-black/40 hover:text-timba-blue-dark"
                    }`}
                  >
                    {col.etiqueta}
                    <span className={`text-[8px] ${activo ? "opacity-100" : "opacity-0"}`}>
                      {orden.direccion === "desc" ? "▼" : "▲"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {ordenados.map((j) => (
            <tr key={j.jugador_id}>
              <td className="py-2 pr-2">
                <Link href={`/plantel/${j.jugador_id}`} className="group flex items-center gap-2">
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-timba-navy/10">
                    {j.foto_url ? (
                      <Image src={j.foto_url} alt={nombreCompleto(j)} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-timba-navy/40">
                        {`${j.nombre[0] ?? ""}${j.apellido[0] ?? ""}`.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="whitespace-nowrap font-semibold text-timba-navy-dark transition-colors group-hover:text-timba-navy">
                    {nombreCompleto(j)}
                  </span>
                </Link>
              </td>
              {columnas.map((col) => {
                const valor = j[col.key];
                const esLider = valor > 0 && valor === lideres[col.key];
                return (
                  <td
                    key={col.key}
                    className={`px-2 py-2 text-center tabular-nums ${
                      esLider
                        ? "rounded-lg bg-timba-navy/[0.05] font-bold text-timba-navy-dark"
                        : "text-black/70"
                    }`}
                  >
                    {col.formato ? col.formato(valor) : valor}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
