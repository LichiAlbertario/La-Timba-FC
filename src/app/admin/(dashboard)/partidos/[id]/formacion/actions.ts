"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slotsDeEsquema } from "@/lib/formacion";

export async function crearFormacion(partidoId: string, formData: FormData) {
  const esquema = String(formData.get("esquema") ?? "").trim();
  if (!esquema) return;

  const supabase = await createClient();
  await supabase.from("formaciones").insert({ partido_id: partidoId, esquema });

  revalidatePath(`/admin/partidos/${partidoId}/formacion`);
  revalidatePath("/formaciones");
}

export async function actualizarEsquema(
  formacionId: string,
  partidoId: string,
  formData: FormData,
) {
  const esquema = String(formData.get("esquema") ?? "").trim();
  if (!esquema) return;

  const supabase = await createClient();
  await supabase.from("formaciones").update({ esquema }).eq("id", formacionId);

  revalidatePath(`/admin/partidos/${partidoId}/formacion`);
  revalidatePath("/formaciones");
}

export async function eliminarFormacion(formData: FormData) {
  const formacionId = String(formData.get("formacion_id") ?? "");
  const partidoId = String(formData.get("partido_id") ?? "");
  if (!formacionId) return;

  const supabase = await createClient();
  await supabase.from("formaciones").delete().eq("id", formacionId);

  revalidatePath(`/admin/partidos/${partidoId}/formacion`);
  revalidatePath("/formaciones");
}

export async function guardarTitulares(
  formacionId: string,
  partidoId: string,
  esquema: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const slots = slotsDeEsquema(esquema);

  await supabase
    .from("formacion_jugadores")
    .delete()
    .eq("formacion_id", formacionId)
    .eq("titular", true);

  const filas = slots
    .map((s) => ({
      formacion_id: formacionId,
      jugador_id: String(formData.get(`slot_${s.slot}`) ?? ""),
      posicion_slot: s.slot,
      titular: true,
    }))
    .filter((f) => f.jugador_id);

  if (filas.length > 0) {
    await supabase.from("formacion_jugadores").insert(filas);
  }

  revalidatePath(`/admin/partidos/${partidoId}/formacion`);
  revalidatePath("/formaciones");
}

export async function agregarSuplente(
  formacionId: string,
  partidoId: string,
  formData: FormData,
) {
  const jugador_id = String(formData.get("jugador_id") ?? "");
  if (!jugador_id) return;

  const supabase = await createClient();
  const posicion_slot = `SUP-${Date.now()}`;

  await supabase.from("formacion_jugadores").insert({
    formacion_id: formacionId,
    jugador_id,
    posicion_slot,
    titular: false,
  });

  revalidatePath(`/admin/partidos/${partidoId}/formacion`);
  revalidatePath("/formaciones");
}

export async function quitarSuplente(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const partidoId = String(formData.get("partido_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("formacion_jugadores").delete().eq("id", id);

  revalidatePath(`/admin/partidos/${partidoId}/formacion`);
  revalidatePath("/formaciones");
}
