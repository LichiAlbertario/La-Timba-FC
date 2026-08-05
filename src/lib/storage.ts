import type { createClient } from "@/lib/supabase/server";

/** Sube un archivo al bucket público "club" y devuelve su URL pública, o null si no vino archivo. */
export async function subirImagenAClub(
  supabase: Awaited<ReturnType<typeof createClient>>,
  archivo: FormDataEntryValue | null,
  carpeta: string,
): Promise<string | null> {
  if (!(archivo instanceof File) || archivo.size === 0) return null;

  const ext = archivo.name.split(".").pop() || "jpg";
  const path = `${carpeta}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("club").upload(path, archivo, {
    contentType: archivo.type,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("club").getPublicUrl(path);
  return data.publicUrl;
}
