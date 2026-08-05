import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormacionJugador, Jugador, Partido } from "@/types/database";
import { slotsAgrupados } from "@/lib/formacion";
import {
  actualizarEsquema,
  agregarSuplente,
  crearFormacion,
  eliminarFormacion,
  guardarTitulares,
  quitarSuplente,
} from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { cardClass, dangerButtonClass, inputClass, labelClass, primaryButtonClass } from "@/lib/admin-ui";
import { nombreCompleto } from "@/lib/format";

export default async function FormacionPartidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: partido }, { data: jugadores }, { data: formacion }] = await Promise.all([
    supabase.from("partidos").select("*").eq("id", id).maybeSingle<Partido>(),
    supabase.from("jugadores").select("*").eq("activo", true).order("numero", { ascending: true }),
    supabase.from("formaciones").select("*").eq("partido_id", id).maybeSingle(),
  ]);

  if (!partido) notFound();

  const jugadoresList = (jugadores as Jugador[] | null) ?? [];

  let formacionJugadores: FormacionJugador[] = [];
  if (formacion) {
    const { data } = await supabase
      .from("formacion_jugadores")
      .select("*")
      .eq("formacion_id", formacion.id);
    formacionJugadores = data ?? [];
  }

  const jugadorPorId = new Map(jugadoresList.map((j) => [j.id, j]));
  const titularPorSlot = new Map(
    formacionJugadores.filter((f) => f.titular).map((f) => [f.posicion_slot, f.jugador_id]),
  );
  const suplentes = formacionJugadores.filter((f) => !f.titular);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Formación · vs {partido.rival}</h1>

      {!formacion ? (
        <form action={crearFormacion.bind(null, id)} className={`${cardClass} flex flex-col gap-3`}>
          <p className="font-semibold text-timba-navy">Definir esquema</p>
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor="esquema">
              Esquema (ej. 4-4-2, 4-3-3, 3-5-2)
            </label>
            <input id="esquema" name="esquema" required placeholder="4-4-2" className={inputClass} />
          </div>
          <button type="submit" className={`${primaryButtonClass} self-start`}>
            Crear formación
          </button>
        </form>
      ) : (
        <>
          <form
            action={actualizarEsquema.bind(null, formacion.id, id)}
            className={`${cardClass} flex flex-wrap items-end gap-3`}
          >
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="esquema">Esquema</label>
              <input
                id="esquema"
                name="esquema"
                required
                defaultValue={formacion.esquema}
                className={inputClass}
              />
            </div>
            <button type="submit" className={primaryButtonClass}>
              Actualizar esquema
            </button>
            <form action={eliminarFormacion} className="ml-auto">
              <input type="hidden" name="formacion_id" value={formacion.id} />
              <input type="hidden" name="partido_id" value={id} />
              <ConfirmSubmitButton
                confirmMessage="¿Eliminar la formación de este partido?"
                className={dangerButtonClass}
              >
                Eliminar formación
              </ConfirmSubmitButton>
            </form>
          </form>

          <form
            action={guardarTitulares.bind(null, formacion.id, id, formacion.esquema)}
            className={`${cardClass} flex flex-col gap-5`}
          >
            <p className="font-semibold text-timba-navy">Titulares</p>
            {slotsAgrupados(formacion.esquema).map((grupo) => (
              <div key={grupo.etiqueta} className="flex flex-col gap-2">
                <p className={labelClass}>{grupo.etiqueta}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {grupo.slots.map((s) => (
                    <select
                      key={s.slot}
                      name={`slot_${s.slot}`}
                      defaultValue={titularPorSlot.get(s.slot) ?? ""}
                      className={inputClass}
                    >
                      <option value="">— vacío —</option>
                      {jugadoresList.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.numero != null ? `#${j.numero} ` : ""}
                          {j.nombre}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" className={`${primaryButtonClass} self-start`}>
              Guardar titulares
            </button>
          </form>

          <div className={`${cardClass} flex flex-col gap-3`}>
            <p className="font-semibold text-timba-navy">Suplentes</p>

            <form action={agregarSuplente.bind(null, formacion.id, id)} className="flex items-end gap-2">
              <select name="jugador_id" required className={`${inputClass} flex-1`}>
                <option value="">Elegir jugador</option>
                {jugadoresList
                  .filter(
                    (j) =>
                      !titularPorSlot.has(j.id) ? true : ![...titularPorSlot.values()].includes(j.id),
                  )
                  .map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.numero != null ? `#${j.numero} ` : ""}
                      {nombreCompleto(j)}
                    </option>
                  ))}
              </select>
              <button type="submit" className={primaryButtonClass}>
                Agregar
              </button>
            </form>

            <div className="flex flex-col divide-y divide-black/5">
              {suplentes.map((s) => {
                const jugador = jugadorPorId.get(s.jugador_id);
                return (
                  <div key={s.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-timba-navy-dark">
                      {jugador?.numero != null ? `#${jugador.numero} ` : ""}
                      {jugador ? nombreCompleto(jugador) : "Jugador eliminado"}
                    </span>
                    <form action={quitarSuplente}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="partido_id" value={id} />
                      <ConfirmSubmitButton confirmMessage="¿Quitar del banco?" className={dangerButtonClass}>
                        Quitar
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                );
              })}
              {suplentes.length === 0 && (
                <p className="py-2 text-sm text-black/50">Sin suplentes cargados.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
