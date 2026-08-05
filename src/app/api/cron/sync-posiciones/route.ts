import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface ExternalEquipo {
  nombre: string;
  urlEscudo: string | null;
}

interface ExternalPosicion {
  equipo: ExternalEquipo | null;
  pj: number | null;
  pg: number | null;
  pe: number | null;
  pp: number | null;
  gf: number | null;
  gc: number | null;
  dg: number | null;
  puntos: number | null;
}

interface ExternalZona {
  nombre: string | null;
  posiciones: ExternalPosicion[] | null;
}

function endpointDePosiciones() {
  const torneoId = process.env.LIGA_TORNEO_ID || "46";
  return `https://ihotelapp.com:8443/TorneoFutbolRestV1_5/app/posiciones/posicioness/torneo/${torneoId}`;
}

/**
 * La plataforma aloja varias ligas sobre el mismo backend y usa este header
 * para saber a cual pertenece cada pedido. Sin el, el endpoint responde con
 * datos de otra liga/torneo demo en vez de un error, asi que es obligatorio.
 * Se consigue mirando localStorage.NOMBRE_APP_HEADER en el sitio de la liga.
 */
function headersDeLiga(): HeadersInit {
  const appHeader = process.env.LIGA_APP_HEADER;
  return appHeader ? { nombreappheader: appHeader } : {};
}

/**
 * Sincroniza tabla_posiciones desde la plataforma "Todo Torneos" (iBaires).
 * Es un endpoint interno no documentado: si falla o cambia de formato,
 * no tocamos los datos ya guardados (se sigue mostrando la ultima
 * tabla sincronizada con su timestamp de "actualizado_en").
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const res = await fetch(endpointDePosiciones(), {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      headers: headersDeLiga(),
    });

    if (!res.ok) {
      throw new Error(`El endpoint de la liga respondió ${res.status}`);
    }

    const zonas: unknown = await res.json();
    if (!Array.isArray(zonas)) {
      throw new Error("La respuesta no tiene el formato esperado (array de zonas)");
    }

    const supabase = createAdminClient();

    const { data: torneoActivo, error: errorTorneo } = await supabase
      .from("torneos")
      .select("id")
      .eq("activo", true)
      .maybeSingle();

    if (errorTorneo) throw errorTorneo;

    if (!torneoActivo) {
      return NextResponse.json(
        { ok: false, motivo: "No hay ningún torneo marcado como activo en el admin" },
        { status: 200 },
      );
    }

    const ahora = new Date().toISOString();
    const filas = (zonas as ExternalZona[]).flatMap((zona) =>
      (zona.posiciones ?? [])
        .filter((p): p is ExternalPosicion => Boolean(p?.equipo?.nombre))
        .map((p) => ({
          torneo_id: torneoActivo.id,
          zona_nombre: zona.nombre?.trim() || null,
          equipo_nombre: p.equipo!.nombre.trim(),
          escudo_url: p.equipo?.urlEscudo ?? null,
          pj: p.pj ?? 0,
          pg: p.pg ?? 0,
          pe: p.pe ?? 0,
          pp: p.pp ?? 0,
          gf: p.gf ?? 0,
          gc: p.gc ?? 0,
          dg: p.dg ?? 0,
          puntos: p.puntos ?? 0,
          actualizado_en: ahora,
        })),
    );

    if (filas.length === 0) {
      throw new Error("El endpoint respondió sin posiciones");
    }

    const { error: errorDelete } = await supabase
      .from("tabla_posiciones")
      .delete()
      .eq("torneo_id", torneoActivo.id);
    if (errorDelete) throw errorDelete;

    const { error: errorInsert } = await supabase.from("tabla_posiciones").insert(filas);
    if (errorInsert) throw errorInsert;

    return NextResponse.json({ ok: true, filas: filas.length });
  } catch (error) {
    console.error("[sync-posiciones] no se pudo sincronizar:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    );
  }
}
