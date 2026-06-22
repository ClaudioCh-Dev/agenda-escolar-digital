-- Agenda Escolar Digital — extensiones y tipos enumerados
-- Ejecutar primero. Requiere PostgreSQL 14+

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tipos enumerados (alineados con src/types)
-- ---------------------------------------------------------------------------

CREATE TYPE entry_type AS ENUM (
  'tarea',
  'comunicado',
  'material',
  'observacion',
  'recordatorio',
  'nota_personal',
  'personalizado',
  -- Tipos de calendario escolar: la agenda anuncia qué se creó/programó
  'festivo',
  'reunion',
  'actuacion',
  'examen',
  'evento'
);

CREATE TYPE calendar_event_type AS ENUM (
  'festivo',
  'examen',
  'reunion',
  'actuacion',
  'evento'
);

CREATE TYPE attachment_file_type AS ENUM ('pdf', 'image', 'doc');

CREATE TYPE notification_category AS ENUM (
  'info',
  'success',
  'warning',
  'important',
  'reminder'
);

CREATE TYPE day_of_week AS ENUM (
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo'
);

CREATE TYPE user_type AS ENUM ('student', 'staff', 'parent');
-- Códigos de login: e… estudiante, t… trabajador, p… padre (único en todo el colegio)
