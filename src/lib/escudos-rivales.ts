import { getRivales, getTablaPosiciones } from "@/lib/queries";

function normalizarNombre(nombre: string): string {
  return nombre.trim().toUpperCase().replace(/\s+/g, " ");
}

/**
 * Arma un mapa nombre-normalizado -> escudo_url combinando dos fuentes:
 * - tabla_posiciones (automatico, viene del sync con la liga)
 * - rivales (manual, cargado a mano en /admin/rivales)
 * Si un rival tiene ambos, gana el logo manual porque es una eleccion
 * explicita del admin.
 */
export async function getEscudosRivales(torneoId?: string | null): Promise<Map<string, string>> {
  const [posiciones, rivales] = await Promise.all([getTablaPosiciones(torneoId), getRivales()]);

  const mapa = new Map<string, string>();

  for (const fila of posiciones) {
    if (fila.escudo_url) mapa.set(normalizarNombre(fila.equipo_nombre), fila.escudo_url);
  }

  for (const rival of rivales) {
    if (rival.escudo_url) mapa.set(normalizarNombre(rival.nombre), rival.escudo_url);
  }

  return mapa;
}

export function buscarEscudoRival(mapa: Map<string, string>, nombreRival: string): string | null {
  return mapa.get(normalizarNombre(nombreRival)) ?? null;
}
