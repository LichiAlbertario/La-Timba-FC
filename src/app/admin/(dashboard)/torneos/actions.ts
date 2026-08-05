"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createTorneo(formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const fecha_inicio = String(formData.get("fecha_inicio") ?? "") || null;
  const fecha_fin = String(formData.get("fecha_fin") ?? "") || null;
  const activo = formData.get("activo") === "on";

  if (!nombre) return;

  if (activo) {
    await supabase.from("torneos").update({ activo: false }).eq("activo", true);
  }

  await supabase.from("torneos").insert({ nombre, fecha_inicio, fecha_fin, activo });
  revalidatePath("/admin/torneos");
}

export async function updateTorneo(id: string, formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const fecha_inicio = String(formData.get("fecha_inicio") ?? "") || null;
  const fecha_fin = String(formData.get("fecha_fin") ?? "") || null;
  const activo = formData.get("activo") === "on";

  if (activo) {
    await supabase.from("torneos").update({ activo: false }).eq("activo", true);
  }

  await supabase
    .from("torneos")
    .update({ nombre, fecha_inicio, fecha_fin, activo })
    .eq("id", id);

  revalidatePath("/admin/torneos");
  redirect("/admin/torneos");
}

export async function deleteTorneo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("torneos").delete().eq("id", id);
  revalidatePath("/admin/torneos");
}
