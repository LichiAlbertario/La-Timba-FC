"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createInstagramPost(formData: FormData) {
  const embed_code = String(formData.get("embed_code") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "") || null;
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;

  if (!embed_code.includes("instagram-media")) return;

  const supabase = await createClient();
  await supabase.from("instagram_posts").insert({ embed_code, fecha, descripcion });

  revalidatePath("/admin/instagram");
  revalidatePath("/instagram");
}

export async function deleteInstagramPost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("instagram_posts").delete().eq("id", id);

  revalidatePath("/admin/instagram");
  revalidatePath("/instagram");
}
