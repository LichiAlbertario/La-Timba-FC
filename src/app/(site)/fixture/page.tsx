import { getFixture, getTorneoActivo } from "@/lib/queries";
import { formatFechaLarga } from "@/lib/format";
import { PageHeader } from "@/components/site/PageHeader";
import { EscudoRival } from "@/components/site/EscudoRival";
import { cardClass } from "@/lib/site-ui";
import { buscarEscudoRival, getEscudosRivales } from "@/lib/escudos-rivales";

export const metadata = { title: "Fixture · La Timba FC" };

export default async function FixturePage() {
  const torneo = await getTorneoActivo();
  const [partidos, escudosRivales] = await Promise.all([
    getFixture(torneo?.id),
    getEscudosRivales(torneo?.id),
  ]);

  return (
    <div>
      <PageHeader eyebrow={torneo?.nombre ?? "Fixture"} title="Fixture" />

      <div className="flex flex-col gap-3">
        {partidos.map((p) => (
          <div key={p.id} className={`${cardClass} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <EscudoRival nombre={p.rival} escudoUrl={buscarEscudoRival(escudosRivales, p.rival)} />
              <div>
                <p className="font-semibold text-timba-navy-dark">vs. {p.rival}</p>
                <p className="text-sm capitalize text-black/40">
                  {formatFechaLarga(p.fecha)}
                  {p.hora ? ` · ${p.hora.slice(0, 5)} hs` : ""}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-timba-navy/[0.06] px-2.5 py-1 text-xs font-semibold text-timba-navy">
              {p.condicion === "local" ? "Local" : "Visitante"}
            </span>
          </div>
        ))}
        {partidos.length === 0 && (
          <p className="text-sm text-black/50">No hay partidos programados por ahora.</p>
        )}
      </div>
    </div>
  );
}
