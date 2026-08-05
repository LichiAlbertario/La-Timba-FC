import Image from "next/image";
import { login } from "@/app/admin/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-timba-navy-dark px-4">
      <div className="w-full max-w-sm rounded-2xl bg-timba-navy p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image
            src="/escudo.jpg"
            alt="Escudo La Timba FC"
            width={72}
            height={72}
            className="rounded-full"
          />
          <h1 className="text-lg font-semibold text-white">Panel de administración</h1>
          <p className="text-sm text-white/60">La Timba FC</p>
        </div>

        <form action={login} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next ?? "/admin"} />

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-white/80">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-timba-gold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-white/80">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-timba-gold"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-timba-gold px-3 py-2.5 font-semibold text-timba-navy-dark transition hover:bg-timba-gold-light"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
