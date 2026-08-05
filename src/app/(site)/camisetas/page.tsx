import Image from "next/image";
import { getCamisetasEscudos } from "@/lib/queries";
import { PageHeader } from "@/components/site/PageHeader";
import { cardClass } from "@/lib/site-ui";

export const metadata = { title: "Camisetas y escudos · La Timba FC" };

export default async function CamisetasPage() {
  const items = await getCamisetasEscudos();

  return (
    <div>
      <PageHeader eyebrow="Identidad" title="Camisetas y escudos" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className={cardClass}>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-timba-navy/5">
              <Image src={item.imagen_url} alt={item.descripcion ?? item.tipo} fill className="object-cover" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-black/40">
              {item.tipo} {item.temporada ? `· ${item.temporada}` : ""}
            </p>
            {item.descripcion && (
              <p className="text-sm text-timba-navy-dark">{item.descripcion}</p>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="col-span-full text-sm text-black/50">
            Todavía no hay camisetas ni escudos cargados.
          </p>
        )}
      </div>
    </div>
  );
}
