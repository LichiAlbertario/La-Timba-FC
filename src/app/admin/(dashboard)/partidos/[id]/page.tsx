import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventoPartido, Jugador, Partido, Torneo } from "@/types/database";
import { addEvento, deleteEvento, deletePartido, updatePartido } from "../actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import {
  cardClass,
  dangerButtonClass,
  inputClass,
  labelClass,
  linkButtonClass,
  primaryButtonClass,
} from "@/lib/admin-ui";
import { nombreCompleto } from "@/lib/format";

const tipoLabel: Record<EventoPartido["tipo"], string> = {
  gol: "⚽ Gol",
  asistencia: "🅰️ Asistencia",
  amarilla: "🟨 Amarilla",
  roja: "🟥 Roja",
  mvp: "🏅 Jugador del partido",
};

export default async function EditarPartidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: partido }, { data: torneos }, { data: jugadores }, { data: eventos }] =
    await Promise.all([
      supabase.from("partidos").select("*").eq("id", id).maybeSingle<Partido>(),
      supabase.from("torneos").select("*").order("fecha_inicio", { ascending: false }),
      supabase.from("jugadores").select("*").order("numero", { ascending: true }),
      supabase
        .from("eventos_partido")
        .select("*")
        .eq("partido_id", id)
        .order("minuto", { ascending: true }),
    ]);

  if (!partido) notFound();

  const jugadoresMap = new Map((jugadores as Jugador[] | null)?.map((j) => [j.id, j]));
  const updatePartidoWithId = updatePartido.bind(null, id);
  const addEventoWithId = addEvento.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-timba-navy-dark">vs {partido.rival}</h1>
          <Link href={`/admin/partidos/${partido.id}/formacion`} className={linkButtonClass}>
            Formación
          </Link>
        </div>
        <form action={deletePartido}>
          <input type="hidden" name="id" value={partido.id} />
          <ConfirmSubmitButton
            confirmMessage="¿Eliminar este partido? También se borran sus goles/asistencias/tarjetas."
            className={dangerButtonClass}
          >
            Eliminar partido
          </ConfirmSubmitButton>
        </form>
      </div>

      <form action={updatePartidoWithId} className={`${cardClass} flex flex-col gap-3`}>
        <p className="font-semibold text-timba-navy">Datos del partido</p>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="torneo_id">Torneo</label>
          <select id="torneo_id" name="torneo_id" defaultValue={partido.torneo_id ?? ""} className={inputClass}>
            <option value="">Sin torneo</option>
            {(torneos as Torneo[] | null)?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="fecha">Fecha</label>
            <input id="fecha" name="fecha" type="date" required defaultValue={partido.fecha} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="hora">Hora</label>
            <input id="hora" name="hora" type="time" defaultValue={partido.hora ?? ""} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="rival">Rival</label>
          <input id="rival" name="rival" required defaultValue={partido.rival} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="condicion">Condición</label>
            <select id="condicion" name="condicion" defaultValue={partido.condicion} className={inputClass}>
              <option value="local">Local</option>
              <option value="visitante">Visitante</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="estado">Estado</label>
            <select id="estado" name="estado" defaultValue={partido.estado} className={inputClass}>
              <option value="programado">Programado</option>
              <option value="jugado">Jugado</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-black/50">
          Si el partido ya se jugó, cargá el resultado acá (marcá Estado = Jugado):
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="goles_favor">Goles La Timba</label>
            <input
              id="goles_favor"
              name="goles_favor"
              type="number"
              min={0}
              defaultValue={partido.goles_favor ?? ""}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="goles_contra">Goles rival</label>
            <input
              id="goles_contra"
              name="goles_contra"
              type="number"
              min={0}
              defaultValue={partido.goles_contra ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Guardar cambios
        </button>
      </form>

      <div className={`${cardClass} flex flex-col gap-3`}>
        <p className="font-semibold text-timba-navy">Goles / asistencias / tarjetas</p>

        <form action={addEventoWithId} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1">
            <label className={labelClass} htmlFor="jugador_id">Jugador</label>
            <select id="jugador_id" name="jugador_id" required className={inputClass}>
              {(jugadores as Jugador[] | null)?.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.numero != null ? `#${j.numero} ` : ""}
                  {nombreCompleto(j)}
                  {!j.activo ? " (inactivo)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="tipo">Tipo</label>
            <select id="tipo" name="tipo" required className={inputClass}>
              <option value="gol">Gol</option>
              <option value="asistencia">Asistencia</option>
              <option value="amarilla">Amarilla</option>
              <option value="roja">Roja</option>
              <option value="mvp">Jugador del partido</option>
            </select>
          </div>
          <div className="flex w-20 flex-col gap-1">
            <label className={labelClass} htmlFor="minuto">Min.</label>
            <input id="minuto" name="minuto" type="number" min={0} className={inputClass} />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Agregar
          </button>
        </form>

        <div className="flex flex-col divide-y divide-black/5">
          {(eventos as EventoPartido[] | null)?.map((e) => {
            const jugador = jugadoresMap.get(e.jugador_id);
            return (
              <div key={e.id} className="flex items-center justify-between py-2">
                <p className="text-sm text-timba-navy-dark">
                  {tipoLabel[e.tipo]} — {jugador ? nombreCompleto(jugador) : "Jugador eliminado"}
                  {e.minuto != null && <span className="text-black/40"> ({e.minuto}&apos;)</span>}
                </p>
                <form action={deleteEvento}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="partido_id" value={partido.id} />
                  <ConfirmSubmitButton confirmMessage="¿Eliminar este evento?" className={dangerButtonClass}>
                    Quitar
                  </ConfirmSubmitButton>
                </form>
              </div>
            );
          })}
          {eventos?.length === 0 && (
            <p className="py-2 text-sm text-black/50">Sin eventos cargados todavía.</p>
          )}
        </div>
      </div>
    </div>
  );
}
