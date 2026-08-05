import { slotsDeEsquema } from "@/lib/formacion";
import type { Jugador } from "@/types/database";

export function Cancha({
  esquema,
  jugadorPorSlot,
}: {
  esquema: string;
  jugadorPorSlot: Map<string, Jugador>;
}) {
  const slots = slotsDeEsquema(esquema);

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#050A23]">
      <svg viewBox="0 0 100 150" className="w-full">
        <rect x="0" y="0" width="100" height="150" fill="#050A23" />
        <rect x="3" y="3" width="94" height="144" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
        <line x1="3" y1="75" x2="97" y2="75" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
        <circle cx="50" cy="75" r="12" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
        <rect x="22" y="3" width="56" height="18" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
        <rect x="22" y="129" width="56" height="18" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />

        {slots.map((s) => {
          const jugador = jugadorPorSlot.get(s.slot);
          const nombreMostrar = jugador ? jugador.apellido : "";
          const anchoEtiqueta = Math.max(12, nombreMostrar.length * 2.1 + 2);

          return (
            <g key={s.slot} transform={`translate(${s.x}, ${s.y})`}>
              <circle r="5.5" fill={jugador ? "white" : "rgba(255,255,255,0.15)"} stroke="white" strokeWidth="0.6" />
              {jugador && (
                <text
                  x="0"
                  y="0.8"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="4.5"
                  fontWeight="700"
                  fill="#050A23"
                  className="font-display"
                >
                  {jugador.numero ?? "?"}
                </text>
              )}
              {jugador && (
                <rect
                  x={-anchoEtiqueta / 2}
                  y="9.4"
                  width={anchoEtiqueta}
                  height="4.4"
                  rx="1"
                  fill="#050A23"
                />
              )}
              <text x="0" y="11.5" textAnchor="middle" fontSize="3.6" fill="white">
                {nombreMostrar}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
