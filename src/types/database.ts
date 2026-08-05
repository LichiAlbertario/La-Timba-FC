export type Condicion = "local" | "visitante";
export type EstadoPartido = "programado" | "jugado" | "suspendido";
export type TipoEvento = "gol" | "asistencia" | "amarilla" | "roja" | "mvp";
export type TipoCamisetaEscudo = "camiseta" | "escudo";

export interface Torneo {
  id: string;
  nombre: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  activo: boolean;
  created_at: string;
}

export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  apodo: string | null;
  numero: number | null;
  posicion: string | null;
  foto_url: string | null;
  activo: boolean;
  created_at: string;
}

export interface Rival {
  id: string;
  nombre: string;
  escudo_url: string | null;
  created_at: string;
}

export interface Partido {
  id: string;
  torneo_id: string | null;
  fecha: string;
  hora: string | null;
  rival: string;
  condicion: Condicion;
  goles_favor: number | null;
  goles_contra: number | null;
  estado: EstadoPartido;
  created_at: string;
}

export interface EventoPartido {
  id: string;
  partido_id: string;
  jugador_id: string;
  tipo: TipoEvento;
  minuto: number | null;
  created_at: string;
}

export interface Formacion {
  id: string;
  partido_id: string;
  esquema: string;
  created_at: string;
}

export interface FormacionJugador {
  id: string;
  formacion_id: string;
  jugador_id: string;
  posicion_slot: string;
  titular: boolean;
}

export interface CamisetaEscudo {
  id: string;
  tipo: TipoCamisetaEscudo;
  temporada: string | null;
  imagen_url: string;
  descripcion: string | null;
  orden: number;
  created_at: string;
}

export interface TablaPosicionFila {
  id: string;
  torneo_id: string | null;
  zona_nombre: string | null;
  equipo_nombre: string;
  escudo_url: string | null;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  puntos: number;
  actualizado_en: string;
}

export interface InstagramPost {
  id: string;
  embed_code: string;
  fecha: string | null;
  descripcion: string | null;
  created_at: string;
}

/** Fila agregada usada en la pagina de Estadisticas. */
export interface EstadisticaJugador {
  jugador_id: string;
  nombre: string;
  apellido: string;
  apodo: string | null;
  numero: number | null;
  foto_url: string | null;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  jugadorDelPartido: number;
  partidosJugados: number;
  golesMasAsistencias: number;
  promedioGoles: number;
  promedioAsistencias: number;
}
