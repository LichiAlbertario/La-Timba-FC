import { createClient } from "@/lib/supabase/server";
import type {
  CamisetaEscudo,
  EstadisticaJugador,
  EventoPartido,
  Formacion,
  InstagramPost,
  Jugador,
  Partido,
  Rival,
  TablaPosicionFila,
  Torneo,
} from "@/types/database";

export async function getTorneos(): Promise<Torneo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("torneos")
    .select("*")
    .order("fecha_inicio", { ascending: false });
  return data ?? [];
}

export async function getTorneoActivo(): Promise<Torneo | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("torneos")
    .select("*")
    .eq("activo", true)
    .order("fecha_inicio", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getProximoPartido(
  torneoId?: string | null,
): Promise<Partido | null> {
  const supabase = await createClient();
  const hoy = new Date().toISOString().slice(0, 10);
  let query = supabase
    .from("partidos")
    .select("*")
    .eq("estado", "programado")
    .gte("fecha", hoy)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true })
    .limit(1);

  if (torneoId) query = query.eq("torneo_id", torneoId);

  const { data } = await query.maybeSingle();
  return data;
}

export async function getFixture(torneoId?: string | null): Promise<Partido[]> {
  const supabase = await createClient();
  const hoy = new Date().toISOString().slice(0, 10);
  let query = supabase
    .from("partidos")
    .select("*")
    .eq("estado", "programado")
    .gte("fecha", hoy)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  if (torneoId) query = query.eq("torneo_id", torneoId);

  const { data } = await query;
  return data ?? [];
}

export async function getResultados(torneoId?: string | null): Promise<Partido[]> {
  const supabase = await createClient();
  let query = supabase
    .from("partidos")
    .select("*")
    .eq("estado", "jugado")
    .order("fecha", { ascending: false });

  if (torneoId) query = query.eq("torneo_id", torneoId);

  const { data } = await query;
  return data ?? [];
}

export async function getPartidoPorId(id: string): Promise<Partido | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("partidos").select("*").eq("id", id).maybeSingle<Partido>();
  return data;
}

export async function getUltimoResultado(
  torneoId?: string | null,
): Promise<Partido | null> {
  const resultados = await getResultados(torneoId);
  return resultados[0] ?? null;
}

export async function getEventosPorPartidos(
  partidoIds: string[],
): Promise<EventoPartido[]> {
  if (partidoIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("eventos_partido")
    .select("*")
    .in("partido_id", partidoIds);
  return data ?? [];
}

export async function getJugadores(soloActivos = true): Promise<Jugador[]> {
  const supabase = await createClient();
  let query = supabase.from("jugadores").select("*").order("numero", {
    ascending: true,
    nullsFirst: false,
  });
  if (soloActivos) query = query.eq("activo", true);
  const { data } = await query;
  return data ?? [];
}

export async function getJugadorPorId(id: string): Promise<Jugador | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("jugadores").select("*").eq("id", id).maybeSingle<Jugador>();
  return data;
}

export interface DetallePartidoJugador {
  partido: Partido;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  jugadorDelPartido: boolean;
}

export interface EstadisticasDeJugador {
  partidosJugados: number;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  jugadorDelPartido: number;
  detalle: DetallePartidoJugador[];
}

export async function getEstadisticasDeJugador(jugadorId: string): Promise<EstadisticasDeJugador> {
  const supabase = await createClient();

  const [{ data: eventos }, { data: formacionesJugador }] = await Promise.all([
    supabase.from("eventos_partido").select("*, partido:partidos(*)").eq("jugador_id", jugadorId),
    supabase
      .from("formacion_jugadores")
      .select("formacion:formaciones(partido_id)")
      .eq("jugador_id", jugadorId),
  ]);

  const eventosTyped = (eventos ?? []) as unknown as (EventoPartido & { partido: Partido | null })[];

  const partidosPorId = new Map<string, Partido>();
  for (const e of eventosTyped) {
    if (e.partido && e.partido.estado === "jugado") partidosPorId.set(e.partido.id, e.partido);
  }

  const formacionesTyped = (formacionesJugador ?? []) as unknown as {
    formacion: { partido_id: string } | null;
  }[];
  const idsDeFormacion = formacionesTyped
    .map((f) => f.formacion?.partido_id)
    .filter((id): id is string => Boolean(id));

  if (idsDeFormacion.length > 0) {
    const { data: partidosDeFormacion } = await supabase
      .from("partidos")
      .select("*")
      .in("id", idsDeFormacion)
      .eq("estado", "jugado");
    for (const p of partidosDeFormacion ?? []) partidosPorId.set(p.id, p);
  }

  const detalle: DetallePartidoJugador[] = Array.from(partidosPorId.values())
    .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
    .map((partido) => {
      const eventosPartido = eventosTyped.filter((e) => e.partido_id === partido.id);
      return {
        partido,
        goles: eventosPartido.filter((e) => e.tipo === "gol").length,
        asistencias: eventosPartido.filter((e) => e.tipo === "asistencia").length,
        amarillas: eventosPartido.filter((e) => e.tipo === "amarilla").length,
        rojas: eventosPartido.filter((e) => e.tipo === "roja").length,
        jugadorDelPartido: eventosPartido.some((e) => e.tipo === "mvp"),
      };
    });

  return {
    partidosJugados: partidosPorId.size,
    goles: eventosTyped.filter((e) => e.tipo === "gol").length,
    asistencias: eventosTyped.filter((e) => e.tipo === "asistencia").length,
    amarillas: eventosTyped.filter((e) => e.tipo === "amarilla").length,
    rojas: eventosTyped.filter((e) => e.tipo === "roja").length,
    jugadorDelPartido: eventosTyped.filter((e) => e.tipo === "mvp").length,
    detalle,
  };
}

export async function getTablaPosiciones(
  torneoId?: string | null,
): Promise<TablaPosicionFila[]> {
  const supabase = await createClient();
  let query = supabase
    .from("tabla_posiciones")
    .select("*")
    .order("zona_nombre", { ascending: true })
    .order("puntos", { ascending: false });

  if (torneoId) query = query.eq("torneo_id", torneoId);

  const { data } = await query;
  return data ?? [];
}

export async function getEstadisticasJugadores(
  torneoId?: string | null,
): Promise<EstadisticaJugador[]> {
  const supabase = await createClient();

  let partidosQuery = supabase.from("partidos").select("id").eq("estado", "jugado");
  if (torneoId) partidosQuery = partidosQuery.eq("torneo_id", torneoId);
  const { data: partidos } = await partidosQuery;
  const partidoIds = (partidos ?? []).map((p) => p.id);
  const partidoIdsSet = new Set(partidoIds);

  const [{ data: jugadores }, eventos, { data: formacionFilas }] = await Promise.all([
    supabase.from("jugadores").select("*").order("numero", { ascending: true }),
    getEventosPorPartidos(partidoIds),
    supabase.from("formacion_jugadores").select("jugador_id, formacion:formaciones(partido_id)"),
  ]);

  const base = new Map<string, EstadisticaJugador>();
  for (const j of jugadores ?? []) {
    base.set(j.id, {
      jugador_id: j.id,
      nombre: j.nombre,
      apellido: j.apellido,
      apodo: j.apodo,
      numero: j.numero,
      foto_url: j.foto_url,
      goles: 0,
      asistencias: 0,
      amarillas: 0,
      rojas: 0,
      jugadorDelPartido: 0,
      partidosJugados: 0,
      golesMasAsistencias: 0,
      promedioGoles: 0,
      promedioAsistencias: 0,
    });
  }

  // Partidos jugados por jugador: union de partidos con algun evento del
  // jugador y partidos donde figura en una formacion (titular o suplente).
  const partidosPorJugador = new Map<string, Set<string>>();
  const marcarPartido = (jugadorId: string, partidoId: string) => {
    if (!partidosPorJugador.has(jugadorId)) partidosPorJugador.set(jugadorId, new Set());
    partidosPorJugador.get(jugadorId)!.add(partidoId);
  };

  for (const e of eventos) {
    const fila = base.get(e.jugador_id);
    if (!fila) continue;
    if (e.tipo === "gol") fila.goles += 1;
    else if (e.tipo === "asistencia") fila.asistencias += 1;
    else if (e.tipo === "amarilla") fila.amarillas += 1;
    else if (e.tipo === "roja") fila.rojas += 1;
    else if (e.tipo === "mvp") fila.jugadorDelPartido += 1;

    if (partidoIdsSet.has(e.partido_id)) marcarPartido(e.jugador_id, e.partido_id);
  }

  const formacionTyped = (formacionFilas ?? []) as unknown as {
    jugador_id: string;
    formacion: { partido_id: string } | null;
  }[];
  for (const f of formacionTyped) {
    const partidoId = f.formacion?.partido_id;
    if (partidoId && partidoIdsSet.has(partidoId)) marcarPartido(f.jugador_id, partidoId);
  }

  for (const fila of base.values()) {
    fila.partidosJugados = partidosPorJugador.get(fila.jugador_id)?.size ?? 0;
    fila.golesMasAsistencias = fila.goles + fila.asistencias;
    fila.promedioGoles = fila.partidosJugados > 0 ? fila.goles / fila.partidosJugados : 0;
    fila.promedioAsistencias = fila.partidosJugados > 0 ? fila.asistencias / fila.partidosJugados : 0;
  }

  return Array.from(base.values()).sort(
    (a, b) => b.goles - a.goles || b.asistencias - a.asistencias,
  );
}

export async function getPartidosConFormacion(): Promise<Partido[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("formaciones")
    .select("created_at, partido:partidos(*)")
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as { partido: Partido | null }[])
    .map((d) => d.partido)
    .filter((p): p is Partido => p !== null);
}

export async function getFormacionDePartido(partidoId: string): Promise<{
  formacion: Formacion | null;
  titulares: { slot: string; jugador: Jugador }[];
  suplentes: Jugador[];
}> {
  const supabase = await createClient();
  const { data: formacion } = await supabase
    .from("formaciones")
    .select("*")
    .eq("partido_id", partidoId)
    .maybeSingle<Formacion>();

  if (!formacion) return { formacion: null, titulares: [], suplentes: [] };

  const { data: filas } = await supabase
    .from("formacion_jugadores")
    .select("posicion_slot, titular, jugador:jugadores(*)")
    .eq("formacion_id", formacion.id);

  const filasTyped = (filas ?? []) as unknown as {
    posicion_slot: string;
    titular: boolean;
    jugador: Jugador | null;
  }[];

  return {
    formacion,
    titulares: filasTyped
      .filter((f) => f.titular && f.jugador)
      .map((f) => ({ slot: f.posicion_slot, jugador: f.jugador as Jugador })),
    suplentes: filasTyped.filter((f) => !f.titular && f.jugador).map((f) => f.jugador as Jugador),
  };
}

export async function getRivales(): Promise<Rival[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("rivales").select("*").order("nombre", { ascending: true });
  return data ?? [];
}

export async function getCamisetasEscudos(): Promise<CamisetaEscudo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("camisetas_escudos")
    .select("*")
    .order("orden", { ascending: true });
  return data ?? [];
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("instagram_posts")
    .select("*")
    .order("fecha", { ascending: false });
  return data ?? [];
}
