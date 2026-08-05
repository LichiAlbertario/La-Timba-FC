import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Rival } from "@/types/database";
import { createRival, deleteRival } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import {
  cardClass,
  dangerButtonClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
} from "@/lib/admin-ui";

export default async function RivalesPage() {
  const supabase = await createClient();
  const { data: rivales } = await supabase
    .from("rivales")
    .select("*")
    .order("nombre", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-timba-navy-dark">Equipos rivales</h1>
        <p className="mt-1 text-sm text-black/50">
          El escudo de un rival aparece automático si ya está en la tabla de posiciones sincronizada.
          Cargalo acá solo para rivales que no estén en esa liga (amistosos, copas) o si querés otro
          logo.
        </p>
      </div>

      <form action={createRival} encType="multipart/form-data" className={`${cardClass} flex flex-col gap-3`}>
        <p className="font-semibold text-timba-navy">Nuevo rival</p>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="nombre">
            Nombre (tiene que coincidir con el que usás en Partidos)
          </label>
          <input id="nombre" name="nombre" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="escudo">Escudo</label>
          <input id="escudo" name="escudo" type="file" accept="image/*" className="text-sm" />
        </div>
        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Agregar rival
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {(rivales as Rival[] | null)?.map((r) => (
          <div key={r.id} className={`${cardClass} flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-timba-navy/10">
                {r.escudo_url && <Image src={r.escudo_url} alt={r.nombre} fill className="object-cover" />}
              </div>
              <p className="font-semibold text-timba-navy-dark">{r.nombre}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/rivales/${r.id}`} className={linkButtonClass}>
                Editar
              </Link>
              <form action={deleteRival}>
                <input type="hidden" name="id" value={r.id} />
                <ConfirmSubmitButton confirmMessage={`¿Eliminar a ${r.nombre}?`} className={dangerButtonClass}>
                  Eliminar
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {rivales?.length === 0 && (
          <p className="text-sm text-black/50">Todavía no cargaste rivales a mano.</p>
        )}
      </div>
    </div>
  );
}
