export interface SlotEsquema {
  slot: string;
  linea: number;
  posicionEnLinea: number;
  x: number;
  y: number;
  etiqueta: string;
}

const NOMBRES_LINEA = ["Arqueros", "Defensores", "Mediocampistas", "Delanteros"];

function nombreDeLinea(linea: number, totalLineas: number) {
  if (linea === 0) return "Arqueros";
  if (linea === totalLineas - 1) return "Delanteros";
  if (totalLineas <= 3) return NOMBRES_LINEA[linea] ?? `Línea ${linea}`;
  // esquemas con muchas líneas (ej. 4-2-3-1): nombrar por posición relativa
  if (linea === 1) return "Defensores";
  return `Mediocampistas ${linea - 1}`;
}

/** Convierte "4-4-2" en [4, 4, 2]. Ignora tokens invalidos. */
export function parseEsquema(esquema: string): number[] {
  return esquema
    .split("-")
    .map((n) => Number(n.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Genera los slots (arquero incluido) con coordenadas para dibujar la cancha (viewBox 100x150). */
export function slotsDeEsquema(esquema: string): SlotEsquema[] {
  const lineasJugadores = parseEsquema(esquema);
  const totalLineas = lineasJugadores.length + 1; // + arquero

  const slots: SlotEsquema[] = [
    { slot: "GK", linea: 0, posicionEnLinea: 0, x: 50, y: 134, etiqueta: "Arquero" },
  ];

  lineasJugadores.forEach((cantidad, i) => {
    const linea = i + 1;
    const y = 138 - (linea / Math.max(totalLineas - 1, 1)) * 122;
    for (let pos = 0; pos < cantidad; pos++) {
      const x = ((pos + 1) / (cantidad + 1)) * 100;
      slots.push({
        slot: `L${linea}-${pos}`,
        linea,
        posicionEnLinea: pos,
        x,
        y,
        etiqueta: nombreDeLinea(linea, totalLineas),
      });
    }
  });

  return slots;
}

/** Agrupa los slots por línea, para renderizar el form de admin por bloques. */
export function slotsAgrupados(esquema: string): { etiqueta: string; slots: SlotEsquema[] }[] {
  const slots = slotsDeEsquema(esquema);
  const grupos = new Map<number, { etiqueta: string; slots: SlotEsquema[] }>();

  for (const s of slots) {
    if (!grupos.has(s.linea)) grupos.set(s.linea, { etiqueta: s.etiqueta, slots: [] });
    grupos.get(s.linea)!.slots.push(s);
  }

  return Array.from(grupos.values());
}
