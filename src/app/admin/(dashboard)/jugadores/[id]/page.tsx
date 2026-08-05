import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Jugador } from "@/types/database";
import { updateJugador } from "../actions";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/admin-ui";
import { POSICIONES } from "@/lib/posiciones";
import { nombreCompleto } from "@/lib/format";

export default async function EditarJugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: jugador } = await supabase
    .from("jugadores")
    .select("*")
    .eq("id", id)
    .maybeSingle<Jugador>();

  if (!jugador) notFound();

  const updateJugadorWithId = updateJugador.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Editar jugador</h1>

      <form
        action={updateJugadorWithId}
        encType="multipart/form-data"
        className={`${cardClass} flex flex-col gap-3`}
      >
        {jugador.foto_url && (
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-timba-navy/10">
            <Image src={jugador.foto_url} alt={nombreCompleto(jugador)} fill className="object-cover" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" required defaultValue={jugador.nombre} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="apellido">Apellido</label>
            <input
              id="apellido"
              name="apellido"
              required
              defaultValue={jugador.apellido}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="apodo">Apodo</label>
            <input id="apodo" name="apodo" defaultValue={jugador.apodo ?? ""} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="numero">Número</label>
            <input
              id="numero"
              name="numero"
              type="number"
              defaultValue={jugador.numero ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="posicion">Posición</label>
          <select id="posicion" name="posicion" defaultValue={jugador.posicion ?? ""} className={inputClass}>
            <option value="">Sin especificar</option>
            {POSICIONES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="foto">Cambiar foto</label>
          <input id="foto" name="foto" type="file" accept="image/*" className="text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm text-black/70">
          <input type="checkbox" name="activo" defaultChecked={jugador.activo} className="h-4 w-4" />
          Jugador activo
        </label>
        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
