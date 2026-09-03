-- =========================================================
-- LlévameQ — Tablas para las solicitudes del sitio web
-- =========================================================
-- Cómo usar este archivo:
-- 1. Entra a tu proyecto en supabase.com
-- 2. Ve al menú "SQL Editor" (barra izquierda)
-- 3. Crea una consulta nueva ("New query")
-- 4. Pega TODO este archivo
-- 5. Dale clic a "Run"
-- Esto NO afecta ninguna tabla que ya exista — solo crea 2 tablas nuevas.

-- 1) Solicitudes de conductores (formulario "Únete como conductor")
create table if not exists conductor_solicitudes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null,
  correo text not null,
  documento text not null,
  tipoVehiculo text,
  marca text,
  modelo text,
  placa text,
  ciudad text,
  disponibilidad text,
  experiencia text,
  estado text not null default 'pendiente', -- pendiente | en_revision | aprobado | rechazado
  creado_en timestamptz not null default now()
);

alter table conductor_solicitudes enable row level security;

-- Cualquiera puede ENVIAR una solicitud (necesario para que el formulario público funcione)
create policy "Cualquiera puede crear solicitudes de conductor"
  on conductor_solicitudes for insert
  to anon
  with check (true);

-- Nadie puede LEER las solicitudes usando la clave pública del sitio web
-- (solo se pueden ver desde App Admin, que usa una conexión con más permisos)
-- No se crea política de SELECT para "anon" a propósito.

-- 2) Mensajes del formulario de contacto
create table if not exists mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  correo text not null,
  asunto text,
  mensaje text not null,
  estado text not null default 'nuevo', -- nuevo | leido | respondido
  creado_en timestamptz not null default now()
);

alter table mensajes_contacto enable row level security;

create policy "Cualquiera puede enviar un mensaje de contacto"
  on mensajes_contacto for insert
  to anon
  with check (true);

-- Igual que arriba: sin política de SELECT para "anon", solo lectura desde App Admin.
