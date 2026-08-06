import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Torneo } from "@/types/database";
import { ImportarPartidosForm } from "@/components/admin/ImportarPartidosForm";
import { linkButtonClass } from "@/lib/admin-ui";

export default async function ImportarPartidosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: torneos } = await supabase
    .from("torneos")
    .select("*")
    .order("fecha_inicio", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-timba-navy-dark">Importar partidos</h1>
        <Link href="/admin/partidos" className={linkButtonClass}>
          Volver a Partidos
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <ImportarPartidosForm torneos={(torneos as Torneo[] | null) ?? []} />
    </div>
  );
}
