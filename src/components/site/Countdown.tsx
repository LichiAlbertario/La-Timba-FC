"use client";

import { useEffect, useState } from "react";

function calcular(target: number) {
  const diff = Math.max(0, target - Date.now());
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((diff / (1000 * 60)) % 60);
  const segundos = Math.floor((diff / 1000) % 60);
  return { dias, horas, minutos, segundos, terminado: diff === 0 };
}

const ETIQUETAS = ["días", "hs", "min", "seg"];

export function Countdown({ targetIso }: { targetIso: string }) {
  // null hasta que hidrata en el cliente: el server y el primer render del
  // cliente tienen que coincidir exacto, y Date.now() difiere entre ambos.
  const [tiempo, setTiempo] = useState<ReturnType<typeof calcular> | null>(null);

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    // Valor deliberadamente client-only para evitar mismatch de hidratacion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTiempo(calcular(target));
    const id = setInterval(() => setTiempo(calcular(target)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!tiempo) {
    return (
      <div className="flex gap-4">
        {ETIQUETAS.map((label) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-4xl font-bold tabular-nums text-white">--</span>
            <span className="text-xs uppercase tracking-wide text-white/60">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (tiempo.terminado) {
    return <p className="text-sm font-medium text-timba-gold">¡Es hoy!</p>;
  }

  const bloques = [
    { valor: tiempo.dias, label: "días" },
    { valor: tiempo.horas, label: "hs" },
    { valor: tiempo.minutos, label: "min" },
    { valor: tiempo.segundos, label: "seg" },
  ];

  return (
    <div className="flex gap-4">
      {bloques.map((b) => (
        <div key={b.label} className="flex flex-col items-center">
          <span className="text-4xl font-bold tabular-nums text-white">
            {String(b.valor).padStart(2, "0")}
          </span>
          <span className="text-xs uppercase tracking-wide text-white/60">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
