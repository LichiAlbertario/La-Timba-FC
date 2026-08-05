export function formatFechaLarga(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${fecha}T00:00:00`));
}

export function formatFechaCorta(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${fecha}T00:00:00`));
}

export function formatFechaDDMM(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${fecha}T00:00:00`));
}

/** Abrevia el nombre de un rival a 3-4 caracteres para mostrar en espacios chicos. */
export function abreviarRival(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "";

  const ultima = palabras[palabras.length - 1];
  if (palabras.length >= 2 && ultima.length <= 3) {
    return (palabras[0][0] + ultima).toUpperCase().slice(0, 4);
  }
  return palabras[0].slice(0, 3).toUpperCase();
}

/** Nombre y apellido juntos, para mostrar el nombre completo de un jugador. */
export function nombreCompleto(j: { nombre: string; apellido: string }): string {
  return `${j.nombre} ${j.apellido}`.trim();
}

export function partidoTargetIso(fecha: string, hora: string | null) {
  // Supabase devuelve las columnas `time` como "HH:MM:SS"; nos quedamos
  // solo con "HH:MM" para no duplicar los segundos al concatenar.
  const horaCorta = (hora ?? "00:00").slice(0, 5);
  return `${fecha}T${horaCorta}:00`;
}
