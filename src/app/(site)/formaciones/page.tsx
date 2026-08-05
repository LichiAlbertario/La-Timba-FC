import { getFormacionDePartido, getPartidosConFormacion } from "@/lib/queries";
import { PageHeader } from "@/components/site/PageHeader";
import { Cancha } from "@/components/site/Cancha";
import { cardClass, eyebrowClass } from "@/lib/site-ui";
import { formatFechaDDMM } from "@/lib/format";

export const metadata = { title: "Formaciones · La Timba FC" };

export default async function FormacionesPage() {
  const partidos = await getPartidosConFormacion();

  if (partidos.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Táctica" title="Formaciones" />
        <div className={cardClass}>
          <p className="text-sm text-black/50">Todavía no hay formaciones cargadas.</p>
        </div>
      </div>
    );
  }

  const detalles = await Promise.all(
    partidos.map(async (partido) => ({
      partido,
      ...(await getFormacionDePartido(partido.id)),
    })),
  );

  return (
    <div>
      <PageHeader eyebrow="Táctica" title="Formaciones" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {detalles
          .filter(({ formacion }) => formacion)
          .map(({ partido, formacion, titulares }) => {
            const jugadorPorSlot = new Map(titulares.map((t) => [t.slot, t.jugador]));
            return (
              <div key={partido.id} className={cardClass}>
                <p className={eyebrowClass}>{formacion!.esquema}</p>
                <p className="font-display text-lg font-semibold uppercase tracking-tight text-timba-navy-dark">
                  vs. {partido.rival}
                </p>
                <p className="mb-3 text-sm text-black/40">
                  {formatFechaDDMM(partido.fecha)}
                  {partido.estado === "jugado" && (
                    <> · {partido.goles_favor ?? 0}-{partido.goles_contra ?? 0}</>
                  )}
                </p>
                <Cancha esquema={formacion!.esquema} jugadorPorSlot={jugadorPorSlot} />
              </div>
            );
          })}
      </div>
    </div>
  );
}
