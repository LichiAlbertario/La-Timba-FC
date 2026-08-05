import { createClient } from "@/lib/supabase/server";
import type { InstagramPost } from "@/types/database";
import { createInstagramPost, deleteInstagramPost } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { cardClass, dangerButtonClass, inputClass, labelClass, primaryButtonClass } from "@/lib/admin-ui";

export default async function InstagramAdminPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("instagram_posts")
    .select("*")
    .order("fecha", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Instagram</h1>

      <form action={createInstagramPost} className={`${cardClass} flex flex-col gap-3`}>
        <p className="font-semibold text-timba-navy">Nuevo post</p>
        <p className="text-sm text-black/50">
          En Instagram: abrí el post → menú (⋯) → Insertar (Embed) → Copiar código, y pegalo acá tal
          cual.
        </p>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="embed_code">Código de embed</label>
          <textarea
            id="embed_code"
            name="embed_code"
            required
            rows={6}
            placeholder="<blockquote class=&quot;instagram-media&quot; ...>...</blockquote>"
            className={`${inputClass} font-mono text-xs`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="fecha">Fecha</label>
            <input id="fecha" name="fecha" type="date" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="descripcion">Descripción</label>
            <input id="descripcion" name="descripcion" className={inputClass} />
          </div>
        </div>

        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Agregar post
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {(posts as InstagramPost[] | null)?.map((p) => (
          <div key={p.id} className={`${cardClass} flex items-center justify-between gap-3`}>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-timba-navy-dark">
                {p.descripcion || "Post sin descripción"}
              </p>
              <p className="text-xs text-black/40">{p.fecha ?? "sin fecha"}</p>
            </div>
            <form action={deleteInstagramPost}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmSubmitButton confirmMessage="¿Eliminar este post?" className={dangerButtonClass}>
                Eliminar
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
        {posts?.length === 0 && (
          <p className="text-sm text-black/50">Todavía no cargaste posts de Instagram.</p>
        )}
      </div>
    </div>
  );
}
