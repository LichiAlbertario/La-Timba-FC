"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function cambiarPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (password.length < 6) {
    redirect(`/admin/cuenta?error=${encodeURIComponent("La contraseña debe tener al menos 6 caracteres.")}`);
  }

  if (password !== confirmar) {
    redirect(`/admin/cuenta?error=${encodeURIComponent("Las contraseñas no coinciden.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/admin/cuenta?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/cuenta?ok=1");
}
