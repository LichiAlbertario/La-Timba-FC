import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Flame, MapPin, Trophy } from "lucide-react";
import {
  getEventosPorPartidos,
  getFixture,
  getJugadores,
  getProximoPartido,
  getResultados,
  getTablaPosiciones,
  getTorneos,
} from "@/lib/queries";
import { Countdown } from "@/components/site/Countdown";
import { EscudoRival } from "@/components/site/EscudoRival";
import { PageHeader } from "@/components/site/PageHeader";
import { TorneoFilter } from "@/components/site/TorneoFilter";
import { formatFechaLarga, formatFechaCorta, partidoTargetIso } from "@/lib/format";
import { balanceDe, goleadoresDe, rachaDe, type ResultadoPartido } from "@/lib/stats";
import { cardClass, eyebrowClass, eyebrowIconClass, highlightRowClass } from "@/lib/site-ui";
import { buscarEscudoRival, getEscudosRivales } from "@/lib/escudos-rivales";

const rachaEstilo: Record<ResultadoPartido, string> = {
  ganado: "bg-emerald-500 text-white",
  empatado: "bg-black/20 text-white",
  perdido: "bg-red-500 text-white",
};

const rachaLetra: Record<ResultadoPartido, string> = {
  ganado: "G",
  empatado: "E",
  perdido: "P",
};

export default async function InicioPage({
  searchParams,
}: {
  searchParams: Promise<{ torneo?: string }>;
}) {
  const { torneo: torneoId } = await searchParams;
  const torneos = await getTorneos();
  const torneoSeleccionado = torneos.find((t) => t.id === torneoId);

  const [proximo, resultados, jugadores, proximosPartidos, posiciones, escudosRivales] = await Promise.all([
    getProximoPartido(torneoId),
    getResultados(torneoId),
    getJugadores(),
    getFixture(torneoId),
    getTablaPosiciones(torneoId),
    getEscudosRivales(torneoId),
  ]);

  const ultimo = resultados[0] ?? null;
  const balance = balanceDe(resultados);
  const racha = rachaDe(resultados);

  const jugadoresMap = new Map(jugadores.map((j) => [j.id, j]));
  const eventosUltimo = ultimo ? await getEventosPorPartidos([ultimo.id]) : [];
  const goleadores = ultimo ? goleadoresDe(eventosUltimo, ultimo.id, jugadoresMap) : [];

  // La tabla de posiciones solo tiene sentido dentro de un torneo puntual:
  // sumar puntos de ligas distintas en un mismo ranking no dice nada.
  const top5Posiciones = torneoId ? posiciones.slice(0, 5) : [];

  return (
    <div>
      <PageHeader
        eyebrow="INICIO"
        title="LA TIMBA FC"
        meta={`${torneoSeleccionado?.nombre ?? "Todos los torneos"} · ${resultados.length} partidos jugados`}
        action={<TorneoFilter torneos={torneos} seleccionado={torneoId ?? ""} basePath="/" />}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
        <div className="flex flex-col gap-6">
          <div className={cardClass}>
            <p className={`${eyebrowClass} mb-4 flex items-center gap-2`}>
              <Trophy size={16} className={eyebrowIconClass} /> Balance
            </p>
            <div className="flex justify-between text-center">
              <div>
                <p className="text-4xl font-bold text-emerald-600">{balance.victorias}</p>
                <p className="mt-1 text-sm text-black/40">Victorias</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-black/50">{balance.empates}</p>
                <p className="mt-1 text-sm text-black/40">Empates</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-red-500">{balance.derrotas}</p>
                <p className="mt-1 text-sm text-black/40">Derrotas</p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <p className={`${eyebrowClass} mb-4 flex items-center gap-2`}>
              <Flame size={16} className={eyebrowIconClass} /> Racha actual
            </p>
            {racha.length > 0 ? (
              <>
                <div className="flex gap-2.5">
                  {racha.map((r, i) => (
                    <span
                      key={i}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold ${rachaEstilo[r]}`}
                    >
                      {rachaLetra[r]}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-black/40">Del más reciente al más antiguo.</p>
              </>
            ) : (
              <p className="text-sm text-black/40">Todavía no hay partidos jugados.</p>
            )}
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <p className={eyebrowClass}>Último resultado</p>
              <Link href="/resultados" className="text-xs font-semibold text-timba-navy">
                Ver todos
              </Link>
            </div>
            {ultimo ? (
              <>
                <p className="text-lg font-semibold text-timba-navy-dark">
                  La Timba {ultimo.goles_favor} - {ultimo.goles_contra} {ultimo.rival}
                </p>
                <p className="text-sm text-black/40">{formatFechaCorta(ultimo.fecha)}</p>
                {goleadores.length > 0 && (
                  <p className="mt-2 text-sm text-black/60">⚽ {goleadores.join(", ")}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-black/40">Todavía no hay resultados cargados.</p>
            )}
          </div>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-3xl bg-timba-navy-dark text-center text-white shadow-lg">
          <Image
            src="/proximo-partido-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-timba-navy-dark/55 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-timba-navy-dark/15 via-timba-navy-dark/65 to-timba-navy-dark" />

          <div className="relative flex-1 px-6 pt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-timba-gold-light">
              Próximo partido
            </p>
            {proximo ? (
              <>
                <p className="mt-1 text-sm text-white/60">
                  {torneoSeleccionado ? `${torneoSeleccionado.nombre} · ` : ""}
                  {proximo.condicion === "local" ? "Local" : "Visitante"}
                </p>

                <div className="mt-7 flex items-center justify-center gap-7">
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src="/escudo-card.png"
                      alt="Escudo La Timba FC"
                      width={64}
                      height={64}
                      unoptimized
                      className="rounded-full"
                    />
                    <span className="text-xs font-semibold uppercase text-white/70">La Timba</span>
                  </div>
                  <span className="text-sm text-white/40">vs.</span>
                  <div className="flex flex-col items-center gap-2">
                    <EscudoRival
                      nombre={proximo.rival}
                      escudoUrl={buscarEscudoRival(escudosRivales, proximo.rival)}
                      size={64}
                      variant="dark"
                    />
                    <span className="text-xs font-semibold uppercase text-white/70">
                      {proximo.rival}
                    </span>
                  </div>
                </div>

                <div className="mt-9 flex justify-center">
                  <Countdown targetIso={partidoTargetIso(proximo.fecha, proximo.hora)} />
                </div>
              </>
            ) : (
              <p className="py-10 text-sm text-white/50">No hay partidos programados por ahora.</p>
            )}
          </div>

          {proximo && (
            <div className="relative mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-white/10 px-6 py-5">
              <div className="flex flex-col items-center gap-1">
                <Calendar size={16} className="text-timba-gold-light" />
                <span className="text-xs capitalize text-white/70">{formatFechaLarga(proximo.fecha)}</span>
              </div>
              {proximo.hora && (
                <div className="flex flex-col items-center gap-1">
                  <Clock size={16} className="text-timba-gold-light" />
                  <span className="text-xs text-white/70">{proximo.hora.slice(0, 5)} hs</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                <MapPin size={16} className="text-timba-gold-light" />
                <span className="text-xs text-white/70">Predio AFALP</span>
              </div>
            </div>
          )}

          <p className="relative border-t border-white/10 px-6 py-4 text-xs italic text-timba-blue">
            Redoblo la apuesta por este amor
          </p>
          {/* dark card keeps the lighter timba-blue for contrast against the navy background */}
        </div>

        <div className="flex flex-col gap-6">
          <div className={cardClass}>
            <div className="mb-4 flex items-center justify-between">
              <p className={eyebrowClass}>Próximos partidos</p>
              <Link href="/fixture" className="text-xs font-semibold text-timba-navy">
                Ver calendario
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-black/5">
              {proximosPartidos.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-timba-navy-dark">vs. {p.rival}</p>
                    <p className="text-xs text-black/40">
                      {formatFechaCorta(p.fecha)} {p.hora ? `· ${p.hora.slice(0, 5)} hs` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-timba-navy/[0.06] px-2.5 py-1 text-xs font-semibold text-timba-navy">
                    {p.condicion === "local" ? "Local" : "Visitante"}
                  </span>
                </div>
              ))}
              {proximosPartidos.length === 0 && (
                <p className="py-2 text-sm text-black/40">No hay partidos programados.</p>
              )}
            </div>
          </div>

          {top5Posiciones.length > 0 && (
            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <p className={eyebrowClass}>Posiciones</p>
                <Link href="/posiciones" className="text-xs font-semibold text-timba-navy">
                  Tabla completa
                </Link>
              </div>
              <div className="flex flex-col text-sm">
                {top5Posiciones.map((fila, i) => {
                  const esLaTimba = fila.equipo_nombre.toUpperCase().includes("TIMBA");
                  return (
                    <div
                      key={fila.id}
                      className={`flex items-center justify-between rounded-lg px-2 py-2 ${
                        esLaTimba ? highlightRowClass : "text-black/70"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-4 text-black/40">{i + 1}</span>
                        {fila.equipo_nombre}
                      </span>
                      <span className="font-semibold">{fila.puntos}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
