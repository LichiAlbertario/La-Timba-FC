import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Rival } from "@/types/database";
import { updateRival } from "../actions";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/admin-ui";

export default async function EditarRivalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: rival } = await supabase
    .from("rivales")
    .select("*")
    .eq("id", id)
    .maybeSingle<Rival>();

  if (!rival) notFound();

  const updateWithId = updateRival.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Editar rival</h1>

      <form action={updateWithId} encType="multipart/form-data" className={`${cardClass} flex flex-col gap-3`}>
        {rival.escudo_url && (
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-timba-navy/10">
            <Image src={rival.escudo_url} alt={rival.nombre} fill className="object-cover" />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" required defaultValue={rival.nombre} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="escudo">Cambiar escudo</label>
          <input id="escudo" name="escudo" type="file" accept="image/*" className="text-sm" />
        </div>

        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
