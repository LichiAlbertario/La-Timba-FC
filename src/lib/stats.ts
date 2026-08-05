import type { EventoPartido, Jugador, Partido } from "@/types/database";
import { nombreCompleto } from "@/lib/format";

export type ResultadoPartido = "ganado" | "empatado" | "perdido";

export function resultadoDe(p: Partido): ResultadoPartido {
  const gf = p.goles_favor ?? 0;
  const gc = p.goles_contra ?? 0;
  if (gf > gc) return "ganado";
  if (gf < gc) return "perdido";
  return "empatado";
}

/** Recibe partidos jugados (cualquier orden) y devuelve el balance V/E/D. */
export function balanceDe(partidos: Partido[]) {
  return partidos.reduce(
    (acc, p) => {
      const r = resultadoDe(p);
      if (r === "ganado") acc.victorias += 1;
      else if (r === "empatado") acc.empates += 1;
      else acc.derrotas += 1;
      return acc;
    },
    { victorias: 0, empates: 0, derrotas: 0 },
  );
}

/** Recibe partidos jugados ordenados del más reciente al más antiguo. */
export function rachaDe(partidosDesc: Partido[], cantidad = 5): ResultadoPartido[] {
  return partidosDesc.slice(0, cantidad).map(resultadoDe);
}

export function goleadoresDe(
  eventos: EventoPartido[],
  partidoId: string,
  jugadoresMap: Map<string, Jugador>,
): string[] {
  const conteo = new Map<string, number>();

  for (const e of eventos) {
    if (e.partido_id !== partidoId || e.tipo !== "gol") continue;
    conteo.set(e.jugador_id, (conteo.get(e.jugador_id) ?? 0) + 1);
  }

  return Array.from(conteo.entries()).map(([jugadorId, cantidad]) => {
    const jugador = jugadoresMap.get(jugadorId);
    const nombre = jugador ? nombreCompleto(jugador) : "Jugador";
    return cantidad > 1 ? `${nombre} (${cantidad})` : nombre;
  });
}

export interface EstadisticasEquipo {
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  puntos: number;
  puntosPosibles: number;
  efectividad: number;
  promedioGF: number;
  promedioGC: number;
  vallasInvictas: number;
  rachaInvictaActual: number;
  mayorRachaInvicta: number;
  mayorRachaVictorias: number;
  porcentajeVictorias: number;
  porcentajeVallasInvictas: number;
}

/** Recibe partidos jugados ordenados del mas reciente al mas antiguo. */
export function estadisticasEquipoDe(partidosDesc: Partido[]): EstadisticasEquipo {
  let pg = 0;
  let pe = 0;
  let pp = 0;
  let gf = 0;
  let gc = 0;
  let vallasInvictas = 0;

  for (const p of partidosDesc) {
    const golesFavor = p.goles_favor ?? 0;
    const golesContra = p.goles_contra ?? 0;
    gf += golesFavor;
    gc += golesContra;
    if (golesContra === 0) vallasInvictas += 1;

    const r = resultadoDe(p);
    if (r === "ganado") pg += 1;
    else if (r === "empatado") pe += 1;
    else pp += 1;
  }

  const pj = partidosDesc.length;
  const puntos = pg * 3 + pe;
  const puntosPosibles = pj * 3;

  let rachaInvictaActual = 0;
  for (const p of partidosDesc) {
    if (resultadoDe(p) === "perdido") break;
    rachaInvictaActual += 1;
  }

  // Para las rachas record recorremos en orden cronologico (mas antiguo primero).
  let mayorRachaInvicta = 0;
  let mayorRachaVictorias = 0;
  let rachaInvictaIter = 0;
  let rachaVictoriasIter = 0;

  for (let i = partidosDesc.length - 1; i >= 0; i--) {
    const r = resultadoDe(partidosDesc[i]);

    rachaInvictaIter = r === "perdido" ? 0 : rachaInvictaIter + 1;
    mayorRachaInvicta = Math.max(mayorRachaInvicta, rachaInvictaIter);

    rachaVictoriasIter = r === "ganado" ? rachaVictoriasIter + 1 : 0;
    mayorRachaVictorias = Math.max(mayorRachaVictorias, rachaVictoriasIter);
  }

  return {
    pj,
    pg,
    pe,
    pp,
    gf,
    gc,
    dg: gf - gc,
    puntos,
    puntosPosibles,
    efectividad: puntosPosibles > 0 ? (puntos / puntosPosibles) * 100 : 0,
    promedioGF: pj > 0 ? gf / pj : 0,
    promedioGC: pj > 0 ? gc / pj : 0,
    vallasInvictas,
    rachaInvictaActual,
    mayorRachaInvicta,
    mayorRachaVictorias,
    porcentajeVictorias: pj > 0 ? (pg / pj) * 100 : 0,
    porcentajeVallasInvictas: pj > 0 ? (vallasInvictas / pj) * 100 : 0,
  };
}

export interface RecordsEquipo {
  mayorGoleadaFavor: Partido | null;
  peorDerrota: Partido | null;
  masGoles: Partido | null;
}

/** Records historicos del equipo. No importa el orden de `partidos`. */
export function recordsEquipoDe(partidos: Partido[]): RecordsEquipo {
  let mayorGoleadaFavor: Partido | null = null;
  let peorDerrota: Partido | null = null;
  let masGoles: Partido | null = null;

  for (const p of partidos) {
    const gf = p.goles_favor ?? 0;
    const gc = p.goles_contra ?? 0;
    const diff = gf - gc;
    const total = gf + gc;

    if (diff > 0) {
      const mejorDiff = mayorGoleadaFavor
        ? (mayorGoleadaFavor.goles_favor ?? 0) - (mayorGoleadaFavor.goles_contra ?? 0)
        : -Infinity;
      if (diff > mejorDiff) mayorGoleadaFavor = p;
    }

    if (diff < 0) {
      const peorDiff = peorDerrota
        ? (peorDerrota.goles_favor ?? 0) - (peorDerrota.goles_contra ?? 0)
        : Infinity;
      if (diff < peorDiff) peorDerrota = p;
    }

    const totalActual = masGoles ? (masGoles.goles_favor ?? 0) + (masGoles.goles_contra ?? 0) : -1;
    if (total > totalActual) masGoles = p;
  }

  return { mayorGoleadaFavor, peorDerrota, masGoles };
}

export function jugadorDelPartidoDe(
  eventos: EventoPartido[],
  partidoId: string,
  jugadoresMap: Map<string, Jugador>,
): string | null {
  const evento = eventos.find((e) => e.partido_id === partidoId && e.tipo === "mvp");
  if (!evento) return null;
  const jugador = jugadoresMap.get(evento.jugador_id);
  return jugador ? jugador.apodo || nombreCompleto(jugador) : null;
}
