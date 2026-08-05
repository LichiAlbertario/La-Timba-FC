import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Partido, Torneo } from "@/types/database";
import { createPartido } from "./actions";
import { cardClass, inputClass, labelClass, linkButtonClass, primaryButtonClass } from "@/lib/admin-ui";

const estadoLabel: Record<Partido["estado"], string> = {
  programado: "Programado",
  jugado: "Jugado",
  suspendido: "Suspendido",
};

export default async function PartidosPage() {
  const supabase = await createClient();
  const [{ data: partidos }, { data: torneos }] = await Promise.all([
    supabase.from("partidos").select("*").order("fecha", { ascending: false }),
    supabase.from("torneos").select("*").order("fecha_inicio", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Partidos</h1>

      <form action={createPartido} className={`${cardClass} flex flex-col gap-3`}>
        <p className="font-semibold text-timba-navy">Nuevo partido</p>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="torneo_id">Torneo</label>
          <select id="torneo_id" name="torneo_id" className={inputClass}>
            <option value="">Sin torneo</option>
            {(torneos as Torneo[] | null)?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="fecha">Fecha</label>
            <input id="fecha" name="fecha" type="date" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="hora">Hora</label>
            <input id="hora" name="hora" type="time" className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="rival">Rival</label>
          <input id="rival" name="rival" required className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="condicion">Condición</label>
          <select id="condicion" name="condicion" className={inputClass}>
            <option value="local">Local</option>
            <option value="visitante">Visitante</option>
          </select>
        </div>

        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Crear partido
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {(partidos as Partido[] | null)?.map((p) => (
          <Link
            key={p.id}
            href={`/admin/partidos/${p.id}`}
            className={`${cardClass} group flex items-center justify-between gap-3 transition hover:border-timba-blue hover:shadow-md`}
          >
            <div>
              <p className="font-semibold text-timba-navy-dark transition-colors group-hover:font-bold group-hover:text-timba-navy">
                vs {p.rival}{" "}
                <span className="text-sm font-normal text-black/50">
                  ({p.condicion === "local" ? "L" : "V"})
                </span>
              </p>
              <p className="text-sm text-black/50">
                {p.fecha} {p.hora ?? ""} ·{" "}
                {p.estado === "jugado"
                  ? `${p.goles_favor ?? 0} - ${p.goles_contra ?? 0}`
                  : estadoLabel[p.estado]}
              </p>
            </div>
            <span className={linkButtonClass}>Abrir</span>
          </Link>
        ))}
        {partidos?.length === 0 && (
          <p className="text-sm text-black/50">Todavía no cargaste ningún partido.</p>
        )}
      </div>
    </div>
  );
}
