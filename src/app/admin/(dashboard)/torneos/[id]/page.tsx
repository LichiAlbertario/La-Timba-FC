import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Torneo } from "@/types/database";
import { updateTorneo } from "../actions";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/admin-ui";

export default async function EditarTorneoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: torneo } = await supabase
    .from("torneos")
    .select("*")
    .eq("id", id)
    .maybeSingle<Torneo>();

  if (!torneo) notFound();

  const updateTorneoWithId = updateTorneo.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Editar torneo</h1>

      <form action={updateTorneoWithId} className={`${cardClass} flex flex-col gap-3`}>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" required defaultValue={torneo.nombre} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="fecha_inicio">Inicio</label>
            <input
              id="fecha_inicio"
              name="fecha_inicio"
              type="date"
              defaultValue={torneo.fecha_inicio ?? ""}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="fecha_fin">Fin</label>
            <input
              id="fecha_fin"
              name="fecha_fin"
              type="date"
              defaultValue={torneo.fecha_fin ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-black/70">
          <input type="checkbox" name="activo" defaultChecked={torneo.activo} className="h-4 w-4" />
          Marcar como torneo activo
        </label>
        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
