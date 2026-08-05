import { cambiarPassword } from "./actions";
import { cardClass, labelClass, primaryButtonClass } from "@/lib/admin-ui";
import { PasswordInput } from "@/components/admin/PasswordInput";

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-timba-navy-dark">Cuenta</h1>

      <form action={cambiarPassword} className={`${cardClass} flex flex-col gap-3`}>
        <p className="font-semibold text-timba-navy">Cambiar contraseña</p>

        {ok && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Contraseña actualizada correctamente.
          </p>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="password">Nueva contraseña</label>
          <PasswordInput id="password" name="password" autoComplete="new-password" />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="confirmar">Confirmar contraseña</label>
          <PasswordInput id="confirmar" name="confirmar" autoComplete="new-password" />
        </div>

        <button type="submit" className={`${primaryButtonClass} self-start`}>
          Guardar nueva contraseña
        </button>
      </form>
    </div>
  );
}
