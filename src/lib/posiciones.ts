export const POSICIONES = [
  "Arquero",
  "Defensor",
  "Mediocampista",
  "Delantero",
  "Cuerpo técnico",
] as const;

export type Posicion = (typeof POSICIONES)[number];

/** Palabras clave que mapean variantes de texto libre a cada categoría. */
const ALIAS: [string, number][] = [
  ["arquero", 0],
  ["portero", 0],
  ["golero", 0],
  ["defensor", 1],
  ["defensa", 1],
  ["lateral", 1],
  ["central", 1],
  ["zaguero", 1],
  ["mediocampista", 2],
  ["volante", 2],
  ["medio", 2],
  ["mediocentro", 2],
  ["delantero", 3],
  ["atacante", 3],
  ["punta", 3],
  ["extremo", 3],
  ["wing", 3],
  ["cuerpo tecnico", 4],
  ["director tecnico", 4],
  ["entrenador", 4],
  ["ayudante", 4],
  ["asistente", 4],
  ["preparador", 4],
  ["kinesiolog", 4],
  ["utilero", 4],
  ["delegado", 4],
  ["dt", 4],
];

function normalizar(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Orden de agrupamiento: arquero(0) < defensor(1) < mediocampista(2) < delantero(3) < cuerpo tecnico(4) < sin definir(5). */
export function ordenPosicion(posicion: string | null): number {
  if (!posicion) return 5;
  const clave = normalizar(posicion);

  const exacto = ALIAS.find(([alias]) => clave === alias);
  if (exacto) return exacto[1];

  const parcial = ALIAS.find(([alias]) => clave.includes(alias));
  if (parcial) return parcial[1];

  return 5;
}

const NOMBRES_GRUPO = ["Arqueros", "Defensores", "Mediocampistas", "Delanteros", "Cuerpo técnico", "Otros"];

export function nombreGrupoPosicion(posicion: string | null): string {
  return NOMBRES_GRUPO[ordenPosicion(posicion)];
}
