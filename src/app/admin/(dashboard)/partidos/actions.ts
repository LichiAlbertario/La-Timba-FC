"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parsearFilasPartidos } from "@/lib/importarPartidos";

export async function createPartido(formData: FormData) {
  const supabase = await createClient();

  const torneo_id = String(formData.get("torneo_id") ?? "") || null;
  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "") || null;
  const rival = String(formData.get("rival") ?? "").trim();
  const condicion = String(formData.get("condicion") ?? "local");

  if (!fecha || !rival) return;

  await supabase.from("partidos").insert({
    torneo_id,
    fecha,
    hora,
    rival,
    condicion,
    estado: "programado",
  });

  revalidatePath("/admin/partidos");
  revalidatePath("/fixture");
}

export async function importarPartidos(formData: FormData) {
  const torneo_id = String(formData.get("torneo_id") ?? "") || null;
  const texto = String(formData.get("texto") ?? "");

  const filas = parsearFilasPartidos(texto);
  const validas = filas.filter((f) => f.errores.length === 0);

  if (validas.length === 0) {
    redirect(
      `/admin/partidos/importar?error=${encodeURIComponent("No se encontro ninguna fila valida para importar.")}`,
    );
  }

  const registros = validas.map((f) => ({
    torneo_id,
    fecha: f.fecha,
    hora: f.hora,
    rival: f.rival,
    condicion: f.condicion,
    goles_favor: f.golesFavor,
    goles_contra: f.golesContra,
    estado: f.golesFavor !== null ? "jugado" : "programado",
  }));

  const supabase = await createClient();
  const { error } = await supabase.from("partidos").insert(registros);

  if (error) {
    redirect(`/admin/partidos/importar?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/partidos");
  revalidatePath("/fixture");
  revalidatePath("/resultados");
  revalidatePath("/estadisticas");
  revalidatePath("/");
  redirect(`/admin/partidos?importados=${validas.length}`);
}

export async function updatePartido(id: string, formData: FormData) {
  const supabase = await createClient();

  const torneo_id = String(formData.get("torneo_id") ?? "") || null;
  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "") || null;
  const rival = String(formData.get("rival") ?? "").trim();
  const condicion = String(formData.get("condicion") ?? "local");
  const estado = String(formData.get("estado") ?? "programado");
  const golesFavorRaw = formData.get("goles_favor");
  const golesContraRaw = formData.get("goles_contra");

  const goles_favor =
    estado === "jugado" && golesFavorRaw !== "" ? Number(golesFavorRaw) : null;
  const goles_contra =
    estado === "jugado" && golesContraRaw !== "" ? Number(golesContraRaw) : null;

  await supabase
    .from("partidos")
    .update({ torneo_id, fecha, hora, rival, condicion, estado, goles_favor, goles_contra })
    .eq("id", id);

  revalidatePath("/admin/partidos");
  revalidatePath(`/admin/partidos/${id}`);
  revalidatePath("/fixture");
  revalidatePath("/resultados");
  revalidatePath("/estadisticas");
  revalidatePath("/");
}

export async function deletePartido(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("partidos").delete().eq("id", id);
  revalidatePath("/admin/partidos");
  revalidatePath("/fixture");
  revalidatePath("/resultados");
}

export async function addEvento(partidoId: string, formData: FormData) {
  const jugador_id = String(formData.get("jugador_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "");
  const minutoRaw = formData.get("minuto");
  const minuto = minutoRaw && minutoRaw !== "" ? Number(minutoRaw) : null;

  if (!jugador_id || !tipo) return;

  const supabase = await createClient();
  await supabase.from("eventos_partido").insert({
    partido_id: partidoId,
    jugador_id,
    tipo,
    minuto,
  });

  revalidatePath(`/admin/partidos/${partidoId}`);
  revalidatePath("/resultados");
  revalidatePath("/estadisticas");
}

export async function deleteEvento(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const partidoId = String(formData.get("partido_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("eventos_partido").delete().eq("id", id);

  revalidatePath(`/admin/partidos/${partidoId}`);
  revalidatePath("/resultados");
  revalidatePath("/estadisticas");
}
