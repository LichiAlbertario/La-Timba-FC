import Image from "next/image";
import Link from "next/link";
import { getJugadores } from "@/lib/queries";
import { PageHeader } from "@/components/site/PageHeader";
import { cardClass, eyebrowClass } from "@/lib/site-ui";
import { nombreGrupoPosicion, ordenPosicion } from "@/lib/posiciones";
import { nombreCompleto } from "@/lib/format";
import type { Jugador } from "@/types/database";

export const metadata = { title: "Plantel · La Timba FC" };

function agruparPorPosicion(jugadores: Jugador[]) {
  const grupos = new Map<string, Jugador[]>();

  for (const j of jugadores) {
    const clave = nombreGrupoPosicion(j.posicion);
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave)!.push(j);
  }

  return Array.from(grupos.entries()).sort(
    ([, a], [, b]) => ordenPosicion(a[0].posicion) - ordenPosicion(b[0].posicion),
  );
}

export default async function PlantelPage() {
  const jugadores = await getJugadores();
  const grupos = agruparPorPosicion(jugadores);

  return (
    <div>
      <PageHeader eyebrow={`${jugadores.length} jugadores`} title="Plantel" />

      <div className="flex flex-col gap-8">
        {grupos.map(([nombreGrupo, jugadoresGrupo]) => (
          <div key={nombreGrupo}>
            <p className={`${eyebrowClass} mb-3`}>{nombreGrupo}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {jugadoresGrupo.map((j) => (
                <Link
                  key={j.id}
                  href={`/plantel/${j.id}`}
                  className={`${cardClass} group flex flex-col items-center gap-2 text-center transition hover:border-timba-blue hover:shadow-md`}
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-timba-navy/10">
                    {j.foto_url ? (
                      <Image src={j.foto_url} alt={nombreCompleto(j)} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-timba-navy/30">
                        {j.numero ?? "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-timba-navy-dark transition-colors group-hover:font-bold group-hover:text-timba-navy">
                      {j.numero != null && <span className="text-black/40">#{j.numero} </span>}
                      {j.apodo || nombreCompleto(j)}
                    </p>
                    <p className="text-xs text-black/40">{j.posicion ?? "—"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {jugadores.length === 0 && (
          <p className="text-sm text-black/50">Todavía no cargaste jugadores.</p>
        )}
      </div>
    </div>
  );
}
