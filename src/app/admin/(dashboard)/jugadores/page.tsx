import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Jugador } from "@/types/database";
import { createJugador, deleteJugador } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import {
  cardClass,
  dangerButtonClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
} from "@/lib/admin-ui";
import { POSICIONES } from "@/lib/posiciones";
import { nombreCompleto } from "@/lib/format";

export default async function JugadoresPage() {
  const supabase = await createClient();
  const { data: jugadores } = await supabase
    .from("jugadores")
    .select("*")
    .order("numero", { ascending: true, nullsFirst: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Jugadores</h1>

      <form
        action={createJugador}
        encType="multipart/form-data"
        className={`${cardClass} flex flex-col gap-3`}
      >
        <p className="font-semibold text-timba-navy">Nuevo jugador</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="apellido">Apellido</label>
            <input id="apellido" name="apellido" required className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="apodo">Apodo</label>
            <input id="apodo" name="apodo" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="numero">Número</label>
            <input id="numero" name="numero" type="number" className={inputClass} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="posicion">Posición</label>
          <select id="posicion" name="posicion" defaultValue="" className={inputClass}>
            <option value="">Sin especificar</option>
            {POSICIONES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="foto">Foto</label>
          <input id="foto" name="foto" type="file" accept="image/*" className="text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm text-black/70">
          <input type="checkbox" name="activo" defaultChecked className="h-4 w-4" />
          Jugador activo
        </label>
        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Agregar jugador
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {(jugadores as Jugador[] | null)?.map((j) => (
          <div key={j.id} className={`${cardClass} flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-timba-navy/10">
                {j.foto_url && (
                  <Image src={j.foto_url} alt={nombreCompleto(j)} fill className="object-cover" />
                )}
              </div>
              <div>
                <p className="font-semibold text-timba-navy-dark">
                  {j.numero != null && <span className="text-black/40">#{j.numero} </span>}
                  {nombreCompleto(j)}
                  {!j.activo && (
                    <span className="ml-1 rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/50">
                      inactivo
                    </span>
                  )}
                </p>
                <p className="text-sm text-black/50">{j.posicion ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/jugadores/${j.id}`} className={linkButtonClass}>
                Editar
              </Link>
              <form action={deleteJugador}>
                <input type="hidden" name="id" value={j.id} />
                <ConfirmSubmitButton
                  confirmMessage={`¿Eliminar a ${nombreCompleto(j)}? También se borran sus goles/asistencias/tarjetas cargados.`}
                  className={dangerButtonClass}
                >
                  Eliminar
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {jugadores?.length === 0 && (
          <p className="text-sm text-black/50">Todavía no cargaste ningún jugador.</p>
        )}
      </div>
    </div>
  );
}
