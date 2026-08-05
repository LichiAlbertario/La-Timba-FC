# La Timba FC

Sitio web del equipo — Fase 1 (MVP) + Fase 2 (formaciones, camisetas/escudos, sync de posiciones) + Fase 3 (Instagram, pulido visual).

Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres, Auth, Storage) + Vercel.

## 1. Crear el proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com), creá una cuenta/organización y un **New project**.
2. Guardá la contraseña de la base — no hace falta después, Supabase la maneja.
3. Una vez creado, andá a **SQL Editor** → **New query**, pegá todo el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecutalo. Esto crea todas las tablas, los índices, las políticas de seguridad (RLS) y el bucket de Storage `club` para las fotos.
4. Andá a **Authentication → Users → Add user** y creá tu usuario admin (email + contraseña). Es el único login que va a existir para `/admin`.
5. Andá a **Project Settings → API Keys** y copiá:
   - `Project URL` (en **Project Settings → General**)
   - La **Publishable key** (o `anon public` key si tu proyecto usa el sistema de keys anterior)
   - La **Secret key** (o `service_role` key) — solo la necesitás para el paso 3 de abajo (sync de posiciones), nunca se usa en el navegador.

## 2. Configurar variables de entorno

Copiá `.env.local.example` a `.env.local` y completá con los valores del paso anterior:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-publishable-o-anon-key

# Solo para el cron de sincronización de posiciones (Fase 2):
SUPABASE_SERVICE_ROLE_KEY=tu-secret-o-service-role-key
LIGA_TORNEO_ID=46
LIGA_APP_HEADER=tu-header-de-la-liga
CRON_SECRET=
```

`SUPABASE_SERVICE_ROLE_KEY` nunca lleva el prefijo `NEXT_PUBLIC_` — es secreta, solo se usa server-side en el route handler del cron para poder escribir en `tabla_posiciones` sin depender del login del admin.

## 3. Sincronización de la tabla de posiciones

La liga usa la plataforma "Todo Torneos" (iBaires), que expone un endpoint interno sin autenticación con la tabla de posiciones. El route handler [`/api/cron/sync-posiciones`](src/app/api/cron/sync-posiciones/route.ts) lo consulta y actualiza `tabla_posiciones` para el torneo marcado como activo en el admin.

- **`LIGA_TORNEO_ID`**: el ID de torneo de tu liga en esa plataforma. Para Liga Pro Argentina confirmamos que es `46` (aparece en la URL `pos-index.html?idTorneo=46` de la página de posiciones de la liga).
- **`LIGA_APP_HEADER`**: la plataforma aloja varias ligas sobre el mismo backend, y el endpoint necesita este header (`nombreappheader`) para saber a cuál pertenece cada pedido — sin él, devuelve datos de otra liga/torneo demo en vez de dar un error. Para Liga Pro Argentina el valor es `imNodBFHaOpe0uOy`. Si en algún momento hay que volver a buscarlo: abrí la página de posiciones de tu liga, F12 → Console, y corré `localStorage.getItem('NOMBRE_APP_HEADER')`.
- **`CRON_SECRET`** (opcional pero recomendado en producción): si lo definís, el endpoint solo responde a pedidos con header `Authorization: Bearer <CRON_SECRET>`. Vercel Cron lo agrega automáticamente si configurás la misma variable en el proyecto de Vercel.
- El cron está configurado en [`vercel.json`](vercel.json) para correr cada 6 horas. Solo se activa cuando el proyecto está desplegado en Vercel (con Cron Jobs habilitado en tu plan).
- Si el endpoint externo falla, cambia de formato o no responde, el job no borra ni rompe los datos existentes — se mantiene la última tabla sincronizada, con su timestamp de "actualizado el..." visible en `/posiciones`.
- Para probarlo en local antes de desplegar: con el server corriendo, entrá a `http://localhost:3000/api/cron/sync-posiciones` en el navegador (necesitás tener `SUPABASE_SERVICE_ROLE_KEY` cargada y un torneo marcado como activo).

## 4. Correr en local

```bash
npm install
npm run dev
```

- Sitio público: [http://localhost:3000](http://localhost:3000)
- Panel de admin: [http://localhost:3000/admin](http://localhost:3000/admin) (te pide login)

## 5. Cargar datos desde el admin

Orden recomendado la primera vez:

1. **Torneos** → crear el torneo actual y marcarlo como activo.
2. **Jugadores** → cargar el plantel (foto opcional, se sube a Supabase Storage).
3. **Partidos** → cargar el fixture. Cuando se juega un partido, entrá a ese partido, marcá **Estado = Jugado**, cargá el resultado y agregá los goles/asistencias/tarjetas de cada jugador desde la misma pantalla. Las estadísticas de la sección pública se calculan automáticamente a partir de esos eventos.
4. **Formación** (opcional, por partido) → desde la pantalla de un partido, entrá a "Formación", definí el esquema (ej. `4-4-2`) y asigná titulares y suplentes.
5. **Camisetas** → cargá la galería histórica de camisetas y escudos.
6. **Instagram** → en Instagram, abrí el post → menú (⋯) → Insertar → Copiar código, y pegalo en `/admin/instagram`.

## 6. Deploy en Vercel

1. Subí el repo a GitHub (o el proveedor que uses) e importalo en [Vercel](https://vercel.com/new).
2. En **Environment Variables** cargá todas las variables de `.env.local` (incluida `SUPABASE_SERVICE_ROLE_KEY` si vas a usar el sync de posiciones).
3. Deploy. Cada push a la rama principal vuelve a desplegar automáticamente, y Vercel toma el cron de `vercel.json` solo.

## Notas de fases

Fases 1, 2 y 3 de `CLAUDE.md` completas: sitio público, admin, formaciones, camisetas/escudos, sync de posiciones, Instagram y una pasada de pulido visual (incluye página 404 con identidad del club). Queda pendiente el deploy a producción.

## Stack técnico

- **Next.js 16 (App Router)** + TypeScript
- **Tailwind CSS v4** — colores de marca y fuente condensada (Oswald) definidos en `src/app/globals.css` / `src/app/layout.tsx`
- **Supabase**: Postgres + Auth (login de admin) + Storage (bucket `club`, público en lectura)
- **Vercel** para el despliegue y el Cron Job de sincronización de posiciones
