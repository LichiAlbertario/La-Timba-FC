import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CamisetaEscudo } from "@/types/database";
import { createCamisetaEscudo, deleteCamisetaEscudo } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import {
  cardClass,
  dangerButtonClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
} from "@/lib/admin-ui";

export default async function CamisetasAdminPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("camisetas_escudos")
    .select("*")
    .order("orden", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Camisetas y escudos</h1>

      <form
        action={createCamisetaEscudo}
        encType="multipart/form-data"
        className={`${cardClass} flex flex-col gap-3`}
      >
        <p className="font-semibold text-timba-navy">Nuevo ítem</p>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" className={inputClass}>
            <option value="camiseta">Camiseta</option>
            <option value="escudo">Escudo</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="temporada">Temporada</label>
            <input id="temporada" name="temporada" placeholder="2026" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="orden">Orden</label>
            <input id="orden" name="orden" type="number" defaultValue={0} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="descripcion">Descripción</label>
          <input id="descripcion" name="descripcion" placeholder="Titular azul marino" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="imagen">Imagen</label>
          <input id="imagen" name="imagen" type="file" accept="image/*" required className="text-sm" />
        </div>

        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Agregar
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(items as CamisetaEscudo[] | null)?.map((item) => (
          <div key={item.id} className={`${cardClass} flex flex-col gap-2`}>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-timba-navy/5">
              <Image src={item.imagen_url} alt={item.descripcion ?? item.tipo} fill className="object-cover" />
            </div>
            <p className="text-xs font-semibold uppercase text-black/40">
              {item.tipo} {item.temporada ? `· ${item.temporada}` : ""}
            </p>
            {item.descripcion && <p className="text-sm text-timba-navy-dark">{item.descripcion}</p>}
            <div className="mt-auto flex items-center justify-between">
              <Link href={`/admin/camisetas/${item.id}`} className={linkButtonClass}>
                Editar
              </Link>
              <form action={deleteCamisetaEscudo}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmSubmitButton confirmMessage="¿Eliminar este ítem?" className={dangerButtonClass}>
                  Eliminar
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {items?.length === 0 && (
          <p className="col-span-full text-sm text-black/50">Todavía no cargaste camisetas ni escudos.</p>
        )}
      </div>
    </div>
  );
}
