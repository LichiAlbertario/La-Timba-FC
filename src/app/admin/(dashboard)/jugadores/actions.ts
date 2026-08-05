"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { subirImagenAClub } from "@/lib/storage";

function readFields(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    apellido: String(formData.get("apellido") ?? "").trim(),
    apodo: String(formData.get("apodo") ?? "").trim() || null,
    numero: formData.get("numero") ? Number(formData.get("numero")) : null,
    posicion: String(formData.get("posicion") ?? "").trim() || null,
    activo: formData.get("activo") === "on",
  };
}

export async function createJugador(formData: FormData) {
  const supabase = await createClient();
  const fields = readFields(formData);
  if (!fields.nombre || !fields.apellido) return;

  const foto_url = await subirImagenAClub(supabase, formData.get("foto"), "jugadores");

  await supabase.from("jugadores").insert({ ...fields, foto_url });
  revalidatePath("/admin/jugadores");
  revalidatePath("/plantel");
}

export async function updateJugador(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = readFields(formData);
  const nuevaFoto = await subirImagenAClub(supabase, formData.get("foto"), "jugadores");

  const update: Record<string, unknown> = { ...fields };
  if (nuevaFoto) update.foto_url = nuevaFoto;

  await supabase.from("jugadores").update(update).eq("id", id);
  revalidatePath("/admin/jugadores");
  revalidatePath("/plantel");
  redirect("/admin/jugadores");
}

export async function deleteJugador(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("jugadores").delete().eq("id", id);
  revalidatePath("/admin/jugadores");
  revalidatePath("/plantel");
}
