import Link from "next/link";
import { getEstadisticasJugadores, getResultados, getTorneos } from "@/lib/queries";
import { TorneoFilter } from "@/components/site/TorneoFilter";
import { PageHeader } from "@/components/site/PageHeader";
import { ResultadoReciente } from "@/components/site/ResultadoReciente";
import { TablaEstadisticasCompleta } from "@/components/site/TablaEstadisticasCompleta";
import { cardClass, eyebrowClass } from "@/lib/site-ui";
import { estadisticasEquipoDe, recordsEquipoDe, resultadoDe } from "@/lib/stats";
import { abreviarRival, formatFechaCorta, nombreCompleto } from "@/lib/format";
import type { EstadisticaJugador, Partido } from "@/types/database";

export const metadata = { title: "Estadísticas · La Timba FC" };

function StatTile({
  etiqueta,
  valor,
  destacado,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p
        className={`font-display text-2xl font-semibold ${
          destacado ? "text-timba-navy" : "text-timba-navy-dark"
        }`}
      >
        {valor}
      </p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40">{etiqueta}</p>
    </div>
  );
}

function RendimientoTile({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-black/[0.025] px-3 py-2.5">
      <p className="font-display text-xl font-semibold text-timba-navy-dark">{valor}</p>
      <p className="text-xs text-black/50">{etiqueta}</p>
    </div>
  );
}

function RecordTile({
  titulo,
  partido,
  valor,
}: {
  titulo: string;
  partido: Partido | null;
  valor: (p: Partido) => string;
}) {
  return (
    <div className="rounded-2xl bg-black/[0.025] px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-black/40">{titulo}</p>
      {partido ? (
        <>
          <p className="font-display mt-0.5 text-lg font-bold text-timba-navy-dark">{valor(partido)}</p>
          <p className="truncate text-xs text-black/50">
            vs. {partido.rival} · {formatFechaCorta(partido.fecha)}
          </p>
        </>
      ) : (
        <p className="mt-0.5 text-sm text-black/30">Sin datos.</p>
      )}
    </div>
  );
}

function StatCard({
  titulo,
  jugadores,
  valorDe,
}: {
  titulo: string;
  jugadores: EstadisticaJugador[];
  valorDe: (j: EstadisticaJugador) => number;
}) {
  const ranking = jugadores
    .filter((j) => valorDe(j) > 0)
    .sort((a, b) => valorDe(b) - valorDe(a))
    .slice(0, 5);

  return (
    <div className={cardClass}>
      <p className={`${eyebrowClass} mb-3`}>{titulo}</p>
      <div className="flex flex-col divide-y divide-black/5">
        {ranking.map((j, i) => (
          <Link
            key={j.jugador_id}
            href={`/plantel/${j.jugador_id}`}
            className="group -mx-2 flex items-center justify-between rounded-lg px-2 py-2 transition-colors first:pt-2 last:pb-2 hover:bg-timba-blue/15"
          >
            <span className="flex items-center gap-2 text-sm">
              <span className="w-4 text-black/30">{i + 1}</span>
              <span className="font-semibold text-timba-navy-dark transition-colors group-hover:font-bold group-hover:text-timba-navy">{j.apodo || nombreCompleto(j)}</span>
              {j.apodo && <span className="text-black/40">{nombreCompleto(j)}</span>}
            </span>
            <span className="text-sm font-bold tabular-nums text-timba-navy-dark">{valorDe(j)}</span>
          </Link>
        ))}
        {ranking.length === 0 && <p className="py-2 text-sm text-black/40">Sin datos todavía.</p>}
      </div>
    </div>
  );
}

function TarjetasCard({ jugadores }: { jugadores: EstadisticaJugador[] }) {
  const ranking = jugadores
    .filter((j) => j.amarillas > 0 || j.rojas > 0)
    .sort((a, b) => b.amarillas + b.rojas - (a.amarillas + a.rojas) || b.rojas - a.rojas)
    .slice(0, 5);

  return (
    <div className={cardClass}>
      <div className="mb-3 flex items-center justify-between">
        <p className={eyebrowClass}>Tarjetas</p>
        {ranking.length > 0 && (
          <span className="flex items-center gap-3 text-xs">
            <span className="w-5 text-center not-italic opacity-100">🟨</span>
            <span className="w-5 text-center not-italic opacity-100">🟥</span>
          </span>
        )}
      </div>
      <div className="flex flex-col divide-y divide-black/5">
        {ranking.map((j, i) => (
          <Link
            key={j.jugador_id}
            href={`/plantel/${j.jugador_id}`}
            className="group -mx-2 flex items-center justify-between rounded-lg px-2 py-2 transition-colors first:pt-2 last:pb-2 hover:bg-timba-blue/15"
          >
            <span className="flex items-center gap-2 text-sm">
              <span className="w-4 text-black/30">{i + 1}</span>
              <span className="font-semibold text-timba-navy-dark transition-colors group-hover:font-bold group-hover:text-timba-navy">{j.apodo || nombreCompleto(j)}</span>
              {j.apodo && <span className="text-black/40">{nombreCompleto(j)}</span>}
            </span>
            <span className="flex items-center gap-3 text-sm font-bold tabular-nums text-timba-navy-dark">
              <span className="w-5 text-center">{j.amarillas}</span>
              <span className="w-5 text-center">{j.rojas}</span>
            </span>
          </Link>
        ))}
        {ranking.length === 0 && <p className="py-2 text-sm text-black/40">Sin datos todavía.</p>}
      </div>
    </div>
  );
}

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ torneo?: string }>;
}) {
  const { torneo: torneoId } = await searchParams;
  const [torneos, estadisticas, resultados] = await Promise.all([
    getTorneos(),
    getEstadisticasJugadores(torneoId),
    getResultados(torneoId),
  ]);

  const equipo = estadisticasEquipoDe(resultados);
  const records = recordsEquipoDe(resultados);
  const ultimos5 = resultados.slice(0, 5);
  const torneoNombrePorId = new Map(torneos.map((t) => [t.id, t.nombre]));

  const jugadoresConDatos = estadisticas
    .filter(
      (j) => j.goles > 0 || j.asistencias > 0 || j.amarillas > 0 || j.rojas > 0 || j.jugadorDelPartido > 0,
    )
    .sort((a, b) => b.golesMasAsistencias - a.golesMasAsistencias || b.goles - a.goles);

  return (
    <div>
      <PageHeader
        eyebrow="Estadísticas"
        title="Estadísticas"
        action={<TorneoFilter torneos={torneos} seleccionado={torneoId ?? ""} basePath="/estadisticas" />}
      />

      <div className="flex flex-col gap-4">
        <div className={cardClass}>
          <p className={`${eyebrowClass} mb-4`}>Resumen general</p>
          <div className="grid grid-cols-4 gap-y-4 sm:grid-cols-8">
            <StatTile etiqueta="PJ" valor={String(equipo.pj)} />
            <StatTile etiqueta="PG" valor={String(equipo.pg)} />
            <StatTile etiqueta="PE" valor={String(equipo.pe)} />
            <StatTile etiqueta="PP" valor={String(equipo.pp)} />
            <StatTile etiqueta="GF" valor={String(equipo.gf)} />
            <StatTile etiqueta="GC" valor={String(equipo.gc)} />
            <StatTile etiqueta="DG" valor={`${equipo.dg > 0 ? "+" : ""}${equipo.dg}`} />
            <StatTile etiqueta="Efectividad" valor={`${Math.round(equipo.efectividad)}%`} destacado />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
          <div className={cardClass}>
            <p className={`${eyebrowClass} mb-3`}>Rendimiento</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <RendimientoTile etiqueta="Prom. goles a favor" valor={equipo.promedioGF.toFixed(1)} />
              <RendimientoTile etiqueta="Prom. goles en contra" valor={equipo.promedioGC.toFixed(1)} />
              <RendimientoTile etiqueta="Vallas invictas" valor={String(equipo.vallasInvictas)} />
              <RendimientoTile etiqueta="Racha invicta actual" valor={String(equipo.rachaInvictaActual)} />
              <RendimientoTile etiqueta="% de victorias" valor={`${Math.round(equipo.porcentajeVictorias)}%`} />
              <RendimientoTile
                etiqueta="% de vallas invictas"
                valor={`${Math.round(equipo.porcentajeVallasInvictas)}%`}
              />
            </div>
          </div>

          <div className={cardClass}>
            <p className={`${eyebrowClass} mb-3`}>Últimos 5 partidos</p>
            {ultimos5.length > 0 ? (
              <div className="flex items-center gap-3">
                {ultimos5.map((p) => (
                  <ResultadoReciente
                    key={p.id}
                    resultado={resultadoDe(p)}
                    abreviatura={abreviarRival(p.rival)}
                    marcador={`${p.goles_favor ?? 0}-${p.goles_contra ?? 0}`}
                    rival={p.rival}
                    fecha={formatFechaCorta(p.fecha)}
                    torneoNombre={
                      (p.torneo_id && torneoNombrePorId.get(p.torneo_id)) || "Sin torneo"
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-black/40">Todavía no hay partidos jugados.</p>
            )}
            <p className="mt-3 text-xs text-black/40">Del más reciente al más antiguo. Tocá un resultado para ver el detalle.</p>
          </div>
        </div>

        <div className={cardClass}>
          <p className={`${eyebrowClass} mb-3`}>Récords de La Timba</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <RecordTile
              titulo="Mayor goleada a favor"
              partido={records.mayorGoleadaFavor}
              valor={(p) => `${p.goles_favor ?? 0}-${p.goles_contra ?? 0}`}
            />
            <RecordTile
              titulo="Peor derrota"
              partido={records.peorDerrota}
              valor={(p) => `${p.goles_favor ?? 0}-${p.goles_contra ?? 0}`}
            />
            <RecordTile
              titulo="Partido con más goles"
              partido={records.masGoles}
              valor={(p) => `${(p.goles_favor ?? 0) + (p.goles_contra ?? 0)} goles`}
            />
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <RendimientoTile etiqueta="Mayor racha de victorias" valor={String(equipo.mayorRachaVictorias)} />
            <RendimientoTile etiqueta="Mayor racha invicta" valor={String(equipo.mayorRachaInvicta)} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard titulo="Goleadores" jugadores={estadisticas} valorDe={(j) => j.goles} />
          <StatCard titulo="Asistencias" jugadores={estadisticas} valorDe={(j) => j.asistencias} />
          <TarjetasCard jugadores={estadisticas} />
          <StatCard
            titulo="Jugador del partido"
            jugadores={estadisticas}
            valorDe={(j) => j.jugadorDelPartido}
          />
        </div>

        <div className={cardClass}>
          <p className={`${eyebrowClass} mb-3`}>Estadísticas individuales completas</p>
          <TablaEstadisticasCompleta jugadores={jugadoresConDatos} />
        </div>
      </div>
    </div>
  );
}
