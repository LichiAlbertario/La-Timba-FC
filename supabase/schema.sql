-- La Timba FC — schema inicial (Fase 1 + tablas de fases futuras)
-- Correr en el SQL Editor de Supabase (proyecto nuevo) de una sola vez.

create extension if not exists "pgcrypto";

-- =========================================================
-- TABLAS
-- =========================================================

create table if not exists torneos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_inicio date,
  fecha_fin date,
  activo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists jugadores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null default '',
  apodo text,
  numero int,
  posicion text,
  foto_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Migracion idempotente: agrega apellido a bases ya creadas antes de este cambio.
alter table jugadores add column if not exists apellido text not null default '';

create table if not exists rivales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  escudo_url text,
  created_at timestamptz not null default now()
);

create table if not exists partidos (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid references torneos(id) on delete set null,
  fecha date not null,
  hora time,
  rival text not null,
  condicion text not null check (condicion in ('local', 'visitante')),
  goles_favor int,
  goles_contra int,
  estado text not null default 'programado' check (estado in ('programado', 'jugado', 'suspendido')),
  created_at timestamptz not null default now()
);

create table if not exists eventos_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  tipo text not null check (tipo in ('gol', 'asistencia', 'amarilla', 'roja', 'mvp')),
  minuto int,
  created_at timestamptz not null default now()
);

-- Migracion idempotente: si la tabla ya existia con el check anterior
-- (sin 'mvp'), lo actualiza sin perder los datos cargados.
do $$
declare
  nombre_constraint text;
begin
  select conname into nombre_constraint
  from pg_constraint
  where conrelid = 'eventos_partido'::regclass
    and pg_get_constraintdef(oid) like '%tipo%';

  if nombre_constraint is not null then
    execute format('alter table eventos_partido drop constraint %I', nombre_constraint);
  end if;

  alter table eventos_partido
    add constraint eventos_partido_tipo_check
    check (tipo in ('gol', 'asistencia', 'amarilla', 'roja', 'mvp'));
end $$;

create table if not exists formaciones (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  esquema text not null,
  created_at timestamptz not null default now(),
  -- Un partido tiene una sola formacion. Sin esto, una carga duplicada
  -- rompe la pagina publica (la consulta espera una sola fila).
  unique (partido_id)
);

-- Migracion idempotente para bases creadas antes de este unique constraint.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'formaciones_partido_id_key'
  ) then
    alter table formaciones add constraint formaciones_partido_id_key unique (partido_id);
  end if;
end $$;

create table if not exists formacion_jugadores (
  id uuid primary key default gen_random_uuid(),
  formacion_id uuid not null references formaciones(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  posicion_slot text not null,
  titular boolean not null default true
);

create table if not exists camisetas_escudos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('camiseta', 'escudo')),
  temporada text,
  imagen_url text not null,
  descripcion text,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists tabla_posiciones (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid references torneos(id) on delete cascade,
  zona_nombre text,
  equipo_nombre text not null,
  escudo_url text,
  pj int not null default 0,
  pg int not null default 0,
  pe int not null default 0,
  pp int not null default 0,
  gf int not null default 0,
  gc int not null default 0,
  dg int not null default 0,
  puntos int not null default 0,
  actualizado_en timestamptz not null default now()
);

create table if not exists instagram_posts (
  id uuid primary key default gen_random_uuid(),
  embed_code text not null,
  fecha date,
  descripcion text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- INDICES
-- =========================================================

create index if not exists idx_partidos_torneo on partidos(torneo_id);
create index if not exists idx_partidos_fecha on partidos(fecha);
create index if not exists idx_partidos_estado on partidos(estado);
create index if not exists idx_eventos_partido on eventos_partido(partido_id);
create index if not exists idx_eventos_jugador on eventos_partido(jugador_id);
create index if not exists idx_formacion_jugadores_formacion on formacion_jugadores(formacion_id);
create index if not exists idx_tabla_posiciones_torneo on tabla_posiciones(torneo_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- Lectura publica (el sitio es publico), escritura solo para
-- el usuario admin autenticado via Supabase Auth.
-- =========================================================

alter table torneos enable row level security;
alter table jugadores enable row level security;
alter table rivales enable row level security;
alter table partidos enable row level security;
alter table eventos_partido enable row level security;
alter table formaciones enable row level security;
alter table formacion_jugadores enable row level security;
alter table camisetas_escudos enable row level security;
alter table tabla_posiciones enable row level security;
alter table instagram_posts enable row level security;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'torneos', 'jugadores', 'rivales', 'partidos', 'eventos_partido',
      'formaciones', 'formacion_jugadores', 'camisetas_escudos',
      'tabla_posiciones', 'instagram_posts'
    ])
  loop
    execute format('drop policy if exists "lectura_publica" on %I;', t);
    execute format('create policy "lectura_publica" on %I for select using (true);', t);

    execute format('drop policy if exists "escritura_admin" on %I;', t);
    execute format(
      'create policy "escritura_admin" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
      t
    );
  end loop;
end $$;

-- =========================================================
-- STORAGE
-- Bucket publico "club" para fotos de jugadores, camisetas y escudos.
-- Crear el bucket desde el dashboard (Storage > New bucket > "club",
-- marcado como Public) antes de correr esto, o descomentar el insert.
-- =========================================================

insert into storage.buckets (id, name, public)
values ('club', 'club', true)
on conflict (id) do nothing;

drop policy if exists "club_lectura_publica" on storage.objects;
create policy "club_lectura_publica" on storage.objects
  for select using (bucket_id = 'club');

drop policy if exists "club_escritura_admin" on storage.objects;
create policy "club_escritura_admin" on storage.objects
  for all using (bucket_id = 'club' and auth.role() = 'authenticated')
  with check (bucket_id = 'club' and auth.role() = 'authenticated');
