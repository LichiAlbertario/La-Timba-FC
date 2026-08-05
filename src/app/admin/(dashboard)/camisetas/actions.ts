"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { subirImagenAClub } from "@/lib/storage";

function readFields(formData: FormData) {
  return {
    tipo: String(formData.get("tipo") ?? "camiseta"),
    temporada: String(formData.get("temporada") ?? "").trim() || null,
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    orden: formData.get("orden") ? Number(formData.get("orden")) : 0,
  };
}

export async function createCamisetaEscudo(formData: FormData) {
  const supabase = await createClient();
  const fields = readFields(formData);
  const imagen_url = await subirImagenAClub(supabase, formData.get("imagen"), "camisetas-escudos");

  if (!imagen_url) return;

  await supabase.from("camisetas_escudos").insert({ ...fields, imagen_url });
  revalidatePath("/admin/camisetas");
  revalidatePath("/camisetas");
}

export async function updateCamisetaEscudo(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = readFields(formData);
  const nuevaImagen = await subirImagenAClub(supabase, formData.get("imagen"), "camisetas-escudos");

  const update: Record<string, unknown> = { ...fields };
  if (nuevaImagen) update.imagen_url = nuevaImagen;

  await supabase.from("camisetas_escudos").update(update).eq("id", id);
  revalidatePath("/admin/camisetas");
  revalidatePath("/camisetas");
  redirect("/admin/camisetas");
}

export async function deleteCamisetaEscudo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("camisetas_escudos").delete().eq("id", id);
  revalidatePath("/admin/camisetas");
  revalidatePath("/camisetas");
}
