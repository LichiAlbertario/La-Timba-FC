"use client";

import { useMemo, useState } from "react";
import { parsearFilasPartidos } from "@/lib/importarPartidos";
import { importarPartidos } from "@/app/admin/(dashboard)/partidos/actions";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/admin-ui";
import type { Torneo } from "@/types/database";

const EJEMPLO = `08/08/2026\t17:00\tQue no pique FC\tLocal\t
13/08/2026\t19:30\tEl Tyne\tVisitante\t
20/06/2026\t14:30\tHoney FC\tLocal\t2-3`;

export function ImportarPartidosForm({ torneos }: { torneos: Torneo[] }) {
  const [texto, setTexto] = useState("");
  const [previsualizado, setPrevisualizado] = useState(false);

  const filas = useMemo(() => parsearFilasPartidos(texto), [texto]);
  const validas = filas.filter((f) => f.errores.length === 0);
  const invalidas = filas.filter((f) => f.errores.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className={`${cardClass} flex flex-col gap-3`}>
        <p className="font-semibold text-timba-navy">1. Pegar partidos</p>
        <p className="text-sm text-black/60">
          Copiá las filas desde Excel o Google Sheets (sin encabezados) con estas columnas, en este
          orden: <strong>Fecha, Hora, Rival, Condición</strong> y opcionalmente{" "}
          <strong>Resultado</strong> (solo si el partido ya se jugó, formato &quot;2-1&quot;). Pegalas
          acá abajo.
        </p>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="import_torneo">
            Torneo para estos partidos
          </label>
          <select id="import_torneo" name="torneo_id" className={inputClass} form="form-importar">
            <option value="">Sin torneo</option>
            {torneos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="texto">
            Partidos pegados
          </label>
          <textarea
            id="texto"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setPrevisualizado(false);
            }}
            placeholder={EJEMPLO}
            rows={8}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>

        <button
          type="button"
          onClick={() => setPrevisualizado(true)}
          disabled={filas.length === 0}
          className={`${primaryButtonClass} self-start`}
        >
          Previsualizar
        </button>
      </div>

      {previsualizado && filas.length > 0 && (
        <div className={`${cardClass} flex flex-col gap-3`}>
          <p className="font-semibold text-timba-navy">2. Revisar y confirmar</p>

          <div className="flex flex-col gap-2">
            {validas.length > 0 && (
              <p className="text-sm text-emerald-700">
                {validas.length} {validas.length === 1 ? "partido listo" : "partidos listos"} para
                importar.
              </p>
            )}
            {invalidas.length > 0 && (
              <p className="text-sm text-red-600">
                {invalidas.length} {invalidas.length === 1 ? "fila tiene" : "filas tienen"} errores y{" "}
                {invalidas.length === 1 ? "no se va a importar" : "no se van a importar"}.
              </p>
            )}
          </div>

          <div className="flex flex-col divide-y divide-black/5 overflow-x-auto">
            {filas.map((f) => (
              <div key={f.numeroFila} className="flex items-start gap-3 py-2 text-sm">
                <span className="w-5 shrink-0 text-black/30">{f.numeroFila}</span>
                {f.errores.length === 0 ? (
                  <p className="text-timba-navy-dark">
                    {f.fecha} {f.hora ? `· ${f.hora} hs` : ""} · vs {f.rival} ·{" "}
                    {f.condicion === "local" ? "Local" : "Visitante"}
                    {f.golesFavor !== null && (
                      <span className="text-black/50"> · {f.golesFavor}-{f.golesContra}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-red-600">
                    <span className="text-black/50">&quot;{f.textoOriginal}&quot;</span> —{" "}
                    {f.errores.join(" ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          <form id="form-importar" action={importarPartidos}>
            <input type="hidden" name="texto" value={texto} />
            <button
              type="submit"
              disabled={validas.length === 0}
              className={`${primaryButtonClass} self-start disabled:cursor-not-allowed`}
            >
              Confirmar e importar {validas.length > 0 ? `(${validas.length})` : ""}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
