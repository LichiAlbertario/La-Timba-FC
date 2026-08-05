import { notFound } from "next/navigation";
import { getEventosPorPartidos, getJugadores, getPartidoPorId } from "@/lib/queries";
import { resultadoDe } from "@/lib/stats";
import { buscarEscudoRival, getEscudosRivales } from "@/lib/escudos-rivales";
import { PageHeader } from "@/components/site/PageHeader";
import { EscudoRival } from "@/components/site/EscudoRival";
import { cardClass, tableHeadClass } from "@/lib/site-ui";
import { formatFechaLarga, nombreCompleto } from "@/lib/format";
import type { Jugador } from "@/types/database";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partido = await getPartidoPorId(id);
  return { title: partido ? `vs ${partido.rival} · La Timba FC` : "Resultado · La Timba FC" };
}

interface FilaJugador {
  jugador: Jugador;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  mvp: boolean;
}

const colores = {
  ganado: "text-emerald-600",
  perdido: "text-red-500",
  empatado: "text-black/60",
} as const;

export default async function ResultadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partido = await getPartidoPorId(id);
  if (!partido || partido.estado !== "jugado") notFound();

  const [eventos, jugadores, escudosRivales] = await Promise.all([
    getEventosPorPartidos([id]),
    getJugadores(),
    getEscudosRivales(partido.torneo_id),
  ]);

  const jugadoresMap = new Map(jugadores.map((j) => [j.id, j]));

  const filasPorJugador = new Map<string, FilaJugador>();
  for (const e of eventos) {
    const jugador = jugadoresMap.get(e.jugador_id);
    if (!jugador) continue;
    if (!filasPorJugador.has(jugador.id)) {
      filasPorJugador.set(jugador.id, {
        jugador,
        goles: 0,
        asistencias: 0,
        amarillas: 0,
        rojas: 0,
        mvp: false,
      });
    }
    const fila = filasPorJugador.get(jugador.id)!;
    if (e.tipo === "gol") fila.goles += 1;
    else if (e.tipo === "asistencia") fila.asistencias += 1;
    else if (e.tipo === "amarilla") fila.amarillas += 1;
    else if (e.tipo === "roja") fila.rojas += 1;
    else if (e.tipo === "mvp") fila.mvp = true;
  }

  const filas = Array.from(filasPorJugador.values()).sort(
    (a, b) =>
      b.goles - a.goles ||
      b.asistencias - a.asistencias ||
      (a.jugador.numero ?? 99) - (b.jugador.numero ?? 99),
  );

  const resultado = resultadoDe(partido);

  return (
    <div>
      <PageHeader eyebrow="Resultados" title={`vs ${partido.rival}`} />

      <div className={`${cardClass} mb-6 flex items-center gap-4`}>
        <EscudoRival
          nombre={partido.rival}
          escudoUrl={buscarEscudoRival(escudosRivales, partido.rival)}
          size={56}
        />
        <div>
          <p className={`font-display text-2xl font-bold ${colores[resultado]}`}>
            La Timba {partido.goles_favor ?? 0} - {partido.goles_contra ?? 0} {partido.rival}
          </p>
          <p className="text-sm capitalize text-black/50">
            {formatFechaLarga(partido.fecha)} · {partido.condicion === "local" ? "Local" : "Visitante"}
          </p>
        </div>
      </div>

      <div className={`${cardClass} overflow-x-auto`}>
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className={tableHeadClass}>
              <th className="px-2 py-2 text-left">Jugador</th>
              <th className="px-2 py-2 text-center">⚽</th>
              <th className="px-2 py-2 text-center">🅰️</th>
              <th className="px-2 py-2 text-center">🟨</th>
              <th className="px-2 py-2 text-center">🟥</th>
              <th className="px-2 py-2 text-center">🏅</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(({ jugador, goles, asistencias, amarillas, rojas, mvp }) => (
              <tr key={jugador.id} className="border-t border-black/5">
                <td className="px-2 py-2 font-medium text-timba-navy-dark">
                  {jugador.numero != null ? `#${jugador.numero} ` : ""}
                  {jugador.apodo || nombreCompleto(jugador)}
                </td>
                <td className="px-2 py-2 text-center tabular-nums">{goles || ""}</td>
                <td className="px-2 py-2 text-center tabular-nums">{asistencias || ""}</td>
                <td className="px-2 py-2 text-center tabular-nums">{amarillas || ""}</td>
                <td className="px-2 py-2 text-center tabular-nums">{rojas || ""}</td>
                <td className="px-2 py-2 text-center">{mvp ? "⭐" : ""}</td>
              </tr>
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-2 py-6 text-center text-black/50">
                  No hay goles, asistencias ni tarjetas cargadas para este partido.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
