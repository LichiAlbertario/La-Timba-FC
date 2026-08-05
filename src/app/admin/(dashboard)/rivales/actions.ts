"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { subirImagenAClub } from "@/lib/storage";

function revalidarTodo() {
  revalidatePath("/admin/rivales");
  revalidatePath("/");
  revalidatePath("/fixture");
  revalidatePath("/resultados");
}

export async function createRival(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;

  const supabase = await createClient();
  const escudo_url = await subirImagenAClub(supabase, formData.get("escudo"), "rivales");

  await supabase.from("rivales").insert({ nombre, escudo_url });
  revalidarTodo();
}

export async function updateRival(id: string, formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;

  const supabase = await createClient();
  const nuevoEscudo = await subirImagenAClub(supabase, formData.get("escudo"), "rivales");

  const update: Record<string, unknown> = { nombre };
  if (nuevoEscudo) update.escudo_url = nuevoEscudo;

  await supabase.from("rivales").update(update).eq("id", id);
  revalidarTodo();
  redirect("/admin/rivales");
}

export async function deleteRival(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("rivales").delete().eq("id", id);
  revalidarTodo();
}
