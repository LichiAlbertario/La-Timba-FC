"use client";

import { useState } from "react";
import type { ResultadoPartido } from "@/lib/stats";

const colorPorResultado: Record<ResultadoPartido, string> = {
  ganado: "bg-emerald-500",
  empatado: "bg-black/20",
  perdido: "bg-red-500",
};

const letraPorResultado: Record<ResultadoPartido, string> = {
  ganado: "G",
  empatado: "E",
  perdido: "P",
};

const nombrePorResultado: Record<ResultadoPartido, string> = {
  ganado: "Victoria",
  empatado: "Empate",
  perdido: "Derrota",
};

export function ResultadoReciente({
  resultado,
  abreviatura,
  marcador,
  rival,
  fecha,
  torneoNombre,
}: {
  resultado: ResultadoPartido;
  abreviatura: string;
  marcador: string;
  rival: string;
  fecha: string;
  torneoNombre: string;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setAbierto((v) => !v)}
      onBlur={() => setAbierto(false)}
      className="group relative flex flex-col items-center gap-1"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${colorPorResultado[resultado]}`}
      >
        {letraPorResultado[resultado]}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-black/50">{abreviatura}</span>
      <span className="text-[10px] tabular-nums text-black/40">{marcador}</span>

      <div
        className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-40 -translate-x-1/2 rounded-xl bg-timba-navy-dark px-3 py-2 text-left text-white shadow-lg transition-opacity duration-150 ${
          abierto ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100`}
      >
        <p className="truncate text-xs font-semibold">{rival}</p>
        <p className="text-[11px] text-white/70">{fecha}</p>
        <p className="text-[11px] text-white/70">
          {marcador} · {nombrePorResultado[resultado]}
        </p>
        <p className="truncate text-[11px] text-white/50">{torneoNombre}</p>
      </div>
    </button>
  );
}
