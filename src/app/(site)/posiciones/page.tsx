import { getTablaPosiciones, getTorneoActivo } from "@/lib/queries";
import { PageHeader } from "@/components/site/PageHeader";
import { cardClass, highlightRowClass, tableHeadClass } from "@/lib/site-ui";

export const metadata = { title: "Posiciones · La Timba FC" };

function formatActualizado(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function PosicionesPage() {
  const torneo = await getTorneoActivo();
  const filas = await getTablaPosiciones(torneo?.id);

  const zonas = Array.from(new Set(filas.map((f) => f.zona_nombre ?? "General")));
  const ultimaActualizacion = filas
    .map((f) => f.actualizado_en)
    .sort()
    .at(-1);

  return (
    <div>
      <PageHeader
        eyebrow={torneo?.nombre ?? "Posiciones"}
        title="Posiciones"
        meta={ultimaActualizacion ? `Actualizada el ${formatActualizado(ultimaActualizacion)} hs` : undefined}
      />

      {filas.length === 0 ? (
        <div className={cardClass}>
          <p className="text-sm text-black/50">
            Todavía no hay tabla de posiciones sincronizada. Se actualiza automáticamente desde la
            liga.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {zonas.map((zona) => (
            <div key={zona} className={`${cardClass} overflow-x-auto`}>
              {zonas.length > 1 && (
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/50">{zona}</p>
              )}
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">Equipo</th>
                    <th className="px-2 py-2 text-center">PJ</th>
                    <th className="px-2 py-2 text-center">PG</th>
                    <th className="px-2 py-2 text-center">PE</th>
                    <th className="px-2 py-2 text-center">PP</th>
                    <th className="px-2 py-2 text-center">GF</th>
                    <th className="px-2 py-2 text-center">GC</th>
                    <th className="px-2 py-2 text-center">DG</th>
                    <th className="px-2 py-2 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {filas
                    .filter((f) => (f.zona_nombre ?? "General") === zona)
                    .map((f, i) => {
                      const esLaTimba = f.equipo_nombre.toUpperCase().includes("TIMBA");
                      return (
                        <tr
                          key={f.id}
                          className={`border-t border-black/5 ${esLaTimba ? highlightRowClass : "text-black/70"}`}
                        >
                          <td className="px-2 py-2">{i + 1}</td>
                          <td className="px-2 py-2">{f.equipo_nombre}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{f.pj}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{f.pg}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{f.pe}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{f.pp}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{f.gf}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{f.gc}</td>
                          <td className="px-2 py-2 text-center tabular-nums">{f.dg}</td>
                          <td className="px-2 py-2 text-center font-bold tabular-nums">{f.puntos}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
