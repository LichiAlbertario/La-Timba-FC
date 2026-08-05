import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CamisetaEscudo } from "@/types/database";
import { updateCamisetaEscudo } from "../actions";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/admin-ui";

export default async function EditarCamisetaEscudoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("camisetas_escudos")
    .select("*")
    .eq("id", id)
    .maybeSingle<CamisetaEscudo>();

  if (!item) notFound();

  const updateWithId = updateCamisetaEscudo.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Editar ítem</h1>

      <form action={updateWithId} encType="multipart/form-data" className={`${cardClass} flex flex-col gap-3`}>
        <div className="relative aspect-square w-32 overflow-hidden rounded-lg bg-timba-navy/5">
          <Image src={item.imagen_url} alt={item.descripcion ?? item.tipo} fill className="object-cover" />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" defaultValue={item.tipo} className={inputClass}>
            <option value="camiseta">Camiseta</option>
            <option value="escudo">Escudo</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="temporada">Temporada</label>
            <input id="temporada" name="temporada" defaultValue={item.temporada ?? ""} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="orden">Orden</label>
            <input id="orden" name="orden" type="number" defaultValue={item.orden} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="descripcion">Descripción</label>
          <input id="descripcion" name="descripcion" defaultValue={item.descripcion ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="imagen">Cambiar imagen</label>
          <input id="imagen" name="imagen" type="file" accept="image/*" className="text-sm" />
        </div>

        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
