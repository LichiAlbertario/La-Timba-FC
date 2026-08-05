import Link from "next/link";
import { getEventosPorPartidos, getJugadores, getResultados, getTorneos } from "@/lib/queries";
import { formatFechaLarga } from "@/lib/format";
import { goleadoresDe, jugadorDelPartidoDe, resultadoDe } from "@/lib/stats";
import { PageHeader } from "@/components/site/PageHeader";
import { EscudoRival } from "@/components/site/EscudoRival";
import { TorneoFilter } from "@/components/site/TorneoFilter";
import { cardClass } from "@/lib/site-ui";
import { buscarEscudoRival, getEscudosRivales } from "@/lib/escudos-rivales";

export const metadata = { title: "Resultados · La Timba FC" };

const colores = {
  ganado: "border-l-4 border-emerald-500",
  perdido: "border-l-4 border-red-500",
  empatado: "border-l-4 border-black/20",
} as const;

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ torneo?: string }>;
}) {
  const { torneo: torneoId } = await searchParams;
  const torneos = await getTorneos();
  const torneoSeleccionado = torneos.find((t) => t.id === torneoId);

  const [partidos, jugadores, escudosRivales] = await Promise.all([
    getResultados(torneoId),
    getJugadores(),
    getEscudosRivales(torneoId),
  ]);

  const jugadoresMap = new Map(jugadores.map((j) => [j.id, j]));
  const eventos = await getEventosPorPartidos(partidos.map((p) => p.id));

  return (
    <div>
      <PageHeader
        eyebrow={torneoSeleccionado?.nombre ?? "Todos los torneos"}
        title="Resultados"
        action={<TorneoFilter torneos={torneos} seleccionado={torneoId ?? ""} basePath="/resultados" />}
      />

      <div className="flex flex-col gap-3">
        {partidos.map((p) => {
          const goleadores = goleadoresDe(eventos, p.id, jugadoresMap);
          const figura = jugadorDelPartidoDe(eventos, p.id, jugadoresMap);
          const resultado = resultadoDe(p);

          return (
            <Link
              key={p.id}
              href={`/resultados/${p.id}`}
              className={`${cardClass} group flex items-center gap-3 transition hover:bg-timba-blue/10 hover:shadow-md ${colores[resultado]}`}
            >
              <EscudoRival nombre={p.rival} escudoUrl={buscarEscudoRival(escudosRivales, p.rival)} />
              <div>
                <p className="font-semibold text-timba-navy-dark transition-colors group-hover:font-bold group-hover:text-timba-navy">
                  La Timba {p.goles_favor ?? 0} - {p.goles_contra ?? 0} {p.rival}{" "}
                  <span className="text-sm font-normal text-black/40">
                    ({p.condicion === "local" ? "Local" : "Visitante"})
                  </span>
                </p>
                <p className="text-sm capitalize text-black/40">{formatFechaLarga(p.fecha)}</p>
                {goleadores.length > 0 && (
                  <p className="mt-1 text-sm text-black/60">⚽ {goleadores.join(", ")}</p>
                )}
                {figura && <p className="text-sm text-black/60">🏅 {figura}</p>}
              </div>
            </Link>
          );
        })}
        {partidos.length === 0 && (
          <p className="text-sm text-black/50">Todavía no hay partidos jugados.</p>
        )}
      </div>
    </div>
  );
}
