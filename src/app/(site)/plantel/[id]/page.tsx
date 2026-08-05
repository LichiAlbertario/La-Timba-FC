import Image from "next/image";
import { notFound } from "next/navigation";
import { getEstadisticasDeJugador, getJugadorPorId } from "@/lib/queries";
import { PageHeader } from "@/components/site/PageHeader";
import { cardClass, eyebrowClass } from "@/lib/site-ui";
import { formatFechaCorta, nombreCompleto } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jugador = await getJugadorPorId(id);
  return { title: jugador ? `${nombreCompleto(jugador)} · La Timba FC` : "Jugador · La Timba FC" };
}

export default async function JugadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jugador = await getJugadorPorId(id);
  if (!jugador) notFound();

  const stats = await getEstadisticasDeJugador(id);

  const tiles = [
    { valor: stats.partidosJugados, label: "Partidos" },
    { valor: stats.goles, label: "Goles" },
    { valor: stats.asistencias, label: "Asistencias" },
    { valor: stats.amarillas, label: "Amarillas" },
    { valor: stats.rojas, label: "Rojas" },
    { valor: stats.jugadorDelPartido, label: "Figura" },
  ];

  return (
    <div>
      <PageHeader eyebrow="Plantel" title={jugador.apodo || nombreCompleto(jugador)} />

      <div className={`${cardClass} mb-6 flex items-center gap-4`}>
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-timba-navy/10">
          {jugador.foto_url ? (
            <Image src={jugador.foto_url} alt={nombreCompleto(jugador)} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-timba-navy/30">
              {jugador.numero ?? "?"}
            </div>
          )}
        </div>
        <div>
          <p className="font-display text-xl font-semibold text-timba-navy-dark">
            {jugador.numero != null && <span className="text-black/40">#{jugador.numero} </span>}
            {nombreCompleto(jugador)}
          </p>
          {jugador.apodo && <p className="text-sm text-black/50">&quot;{jugador.apodo}&quot;</p>}
          <p className="mt-1 text-sm text-black/50">{jugador.posicion ?? "Posición sin definir"}</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className={`${cardClass} text-center`}>
            <p className="text-2xl font-bold text-timba-navy-dark">{t.valor}</p>
            <p className="text-xs text-black/40">{t.label}</p>
          </div>
        ))}
      </div>

      <p className={`${eyebrowClass} mb-3`}>Partido a partido</p>
      <div className="flex flex-col gap-3">
        {stats.detalle.map(({ partido, goles, asistencias, amarillas, rojas, jugadorDelPartido }) => (
          <div key={partido.id} className={`${cardClass} flex items-center justify-between gap-3`}>
            <div>
              <p className="font-semibold text-timba-navy-dark">
                La Timba {partido.goles_favor ?? 0} - {partido.goles_contra ?? 0} {partido.rival}
              </p>
              <p className="text-sm text-black/40">{formatFechaCorta(partido.fecha)}</p>
            </div>
            <div className="flex gap-2 text-sm text-black/60">
              {goles > 0 && <span>⚽ {goles}</span>}
              {asistencias > 0 && <span>🅰️ {asistencias}</span>}
              {amarillas > 0 && <span>🟨 {amarillas}</span>}
              {rojas > 0 && <span>🟥 {rojas}</span>}
              {jugadorDelPartido && <span>🏅</span>}
            </div>
          </div>
        ))}
        {stats.detalle.length === 0 && (
          <p className="text-sm text-black/50">Todavía no hay partidos jugados registrados.</p>
        )}
      </div>
    </div>
  );
}
