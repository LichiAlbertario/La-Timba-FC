import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Torneo } from "@/types/database";
import { createTorneo, deleteTorneo } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import {
  cardClass,
  dangerButtonClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
} from "@/lib/admin-ui";

export default async function TorneosPage() {
  const supabase = await createClient();
  const { data: torneos } = await supabase
    .from("torneos")
    .select("*")
    .order("fecha_inicio", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Torneos</h1>

      <form action={createTorneo} className={`${cardClass} flex flex-col gap-3`}>
        <p className="font-semibold text-timba-navy">Nuevo torneo</p>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" required className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="fecha_inicio">Inicio</label>
            <input id="fecha_inicio" name="fecha_inicio" type="date" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="fecha_fin">Fin</label>
            <input id="fecha_fin" name="fecha_fin" type="date" className={inputClass} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-black/70">
          <input type="checkbox" name="activo" className="h-4 w-4" />
          Marcar como torneo activo
        </label>
        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Crear torneo
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {(torneos as Torneo[] | null)?.map((t) => (
          <div key={t.id} className={`${cardClass} flex items-center justify-between gap-3`}>
            <div>
              <p className="font-semibold text-timba-navy-dark">
                {t.nombre}{" "}
                {t.activo && (
                  <span className="ml-1 rounded-full bg-timba-gold/20 px-2 py-0.5 text-xs font-medium text-timba-gold">
                    activo
                  </span>
                )}
              </p>
              <p className="text-sm text-black/50">
                {t.fecha_inicio ?? "—"} a {t.fecha_fin ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/torneos/${t.id}`} className={linkButtonClass}>
                Editar
              </Link>
              <form action={deleteTorneo}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmSubmitButton
                  confirmMessage={`¿Eliminar el torneo "${t.nombre}"? Sus partidos quedarán sin torneo asignado.`}
                  className={dangerButtonClass}
                >
                  Eliminar
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {torneos?.length === 0 && (
          <p className="text-sm text-black/50">Todavía no cargaste ningún torneo.</p>
        )}
      </div>
    </div>
  );
}
