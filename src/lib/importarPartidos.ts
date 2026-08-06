export interface FilaPartidoImportada {
  numeroFila: number;
  textoOriginal: string;
  fecha: string | null;
  hora: string | null;
  rival: string;
  condicion: "local" | "visitante" | null;
  golesFavor: number | null;
  golesContra: number | null;
  errores: string[];
}

function pad2(n: string) {
  return n.padStart(2, "0");
}

/** Acepta AAAA-MM-DD, DD/MM/AAAA o DD-MM-AAAA. Devuelve AAAA-MM-DD o null. */
function parsearFecha(raw: string | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;

  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;

  m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${pad2(m[2])}-${pad2(m[1])}`;

  return null;
}

/** Acepta HH:MM (o HH:MM:SS). Devuelve HH:MM o null si esta vacio/invalido. */
function parsearHora(raw: string | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return `${pad2(m[1])}:${m[2]}`;
}

function parsearCondicion(raw: string | undefined): "local" | "visitante" | null {
  const t = (raw ?? "").trim().toLowerCase();
  if (t === "local" || t === "l") return "local";
  if (t === "visitante" || t === "v") return "visitante";
  return null;
}

/** Acepta "N-M" o "N - M". Devuelve [golesFavor, golesContra] o [null, null] si esta vacio. */
function parsearResultado(raw: string | undefined): [number | null, number | null, string | null] {
  const t = (raw ?? "").trim();
  if (!t) return [null, null, null];
  const m = t.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!m) return [null, null, 'El resultado debe tener el formato "2-1"'];
  return [Number(m[1]), Number(m[2]), null];
}

function parsearFila(linea: string, numeroFila: number): FilaPartidoImportada {
  const columnas = linea.split("\t").length >= 3 ? linea.split("\t") : linea.split(",");
  const [fechaRaw, horaRaw, rivalRaw, condicionRaw, resultadoRaw] = columnas.map((c) => c?.trim());

  const errores: string[] = [];

  const fecha = parsearFecha(fechaRaw);
  if (!fecha) errores.push(`Fecha invalida ("${fechaRaw ?? ""}"). Usa AAAA-MM-DD o DD/MM/AAAA.`);

  const hora = parsearHora(horaRaw);

  const rival = (rivalRaw ?? "").trim();
  if (!rival) errores.push("Falta el nombre del rival.");

  const condicion = parsearCondicion(condicionRaw);
  if (!condicion) errores.push(`Condicion invalida ("${condicionRaw ?? ""}"). Usa Local o Visitante.`);

  const [golesFavor, golesContra, errorResultado] = parsearResultado(resultadoRaw);
  if (errorResultado) errores.push(errorResultado);

  return {
    numeroFila,
    textoOriginal: linea,
    fecha,
    hora,
    rival,
    condicion,
    golesFavor,
    golesContra,
    errores,
  };
}

/** Parsea texto pegado desde Excel/Sheets (filas separadas por salto de linea, columnas por tab o coma). */
export function parsearFilasPartidos(texto: string): FilaPartidoImportada[] {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linea, i) => parsearFila(linea, i + 1));
}
