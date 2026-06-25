-- Flyway V2 — tablas e índices (después de V1)
-- ---------------------------------------------------------------------------
-- Núcleo: colegio → sedes → secciones → usuarios
-- Login: code + password (sin schoolSlug)
-- ---------------------------------------------------------------------------

CREATE TABLE schools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- IAM: permisos, roles y asignaciones (RBAC)
-- ---------------------------------------------------------------------------

CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,     -- ej. entries.create, calendar.read
  name        TEXT NOT NULL,
  module      TEXT NOT NULL,            -- entries, calendar, chat, users, …
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_permissions_module ON permissions (module);

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID REFERENCES schools (id) ON DELETE CASCADE,  -- NULL = rol global del sistema
  code        TEXT NOT NULL,            -- auxiliar, padre, alumno, profesor, direccion
  name        TEXT NOT NULL,
  description TEXT,
  is_system   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_roles_system_code ON roles (code) WHERE school_id IS NULL;
CREATE UNIQUE INDEX idx_roles_school_code ON roles (school_id, code) WHERE school_id IS NOT NULL;

CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_permission ON role_permissions (permission_id);

CREATE TABLE sedes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES schools (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,          -- ej. "Sede Los Olivos"
  code        TEXT NOT NULL,          -- ej. "LO", "SUR" (corto, único por colegio)
  address     TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code),
  UNIQUE (school_id, name)
);

CREATE INDEX idx_sedes_school ON sedes (school_id);

CREATE TABLE sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id     UUID NOT NULL REFERENCES sedes (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,          -- ej. "3° A – Primaria"
  grade       TEXT,                   -- ej. "3er Grado"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sede_id, name)
);

CREATE INDEX idx_sections_sede ON sections (sede_id);

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES schools (id) ON DELETE CASCADE,
  code            TEXT NOT NULL UNIQUE,   -- e13234542, t353252, p35235452
  user_type       user_type NOT NULL,
  password_hash   TEXT NOT NULL,
  name            TEXT NOT NULL,
  avatar_url      TEXT,
  avatar_cloudinary_public_id TEXT,
  primary_sede_id UUID REFERENCES sedes (id) ON DELETE SET NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_school ON users (school_id);
CREATE INDEX idx_users_primary_sede ON users (primary_sede_id) WHERE primary_sede_id IS NOT NULL;

CREATE TABLE user_sedes (
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  sede_id     UUID NOT NULL REFERENCES sedes (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, sede_id)
);

CREATE INDEX idx_user_sedes_sede ON user_sedes (sede_id);

CREATE TABLE user_roles (
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_role ON user_roles (role_id);

CREATE TABLE refresh_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,
  replaced_by_id  UUID REFERENCES refresh_tokens (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens (token_hash);

CREATE TABLE user_sections (
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  section_id  UUID NOT NULL REFERENCES sections (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, section_id)
);

CREATE TABLE students (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES schools (id) ON DELETE CASCADE,
  section_id  UUID NOT NULL REFERENCES sections (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_students_section ON students (section_id);

CREATE TABLE parent_students (
  parent_id   UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, student_id)
);

CREATE INDEX idx_parent_students_student ON parent_students (student_id);

-- ---------------------------------------------------------------------------
-- Agenda / anotaciones (Entry)
-- ---------------------------------------------------------------------------

CREATE TABLE entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES schools (id) ON DELETE CASCADE,
  section_id      UUID NOT NULL REFERENCES sections (id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  type            entry_type NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  entry_date      DATE NOT NULL,
  entry_time      TIME NOT NULL DEFAULT '08:00',
  is_important    BOOLEAN NOT NULL DEFAULT false,
  parents_only    BOOLEAN NOT NULL DEFAULT false,
  requires_ack    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entries_section_date ON entries (section_id, entry_date DESC);
CREATE INDEX idx_entries_school_date ON entries (school_id, entry_date DESC);
CREATE INDEX idx_entries_type ON entries (type);

CREATE TABLE entry_students (
  entry_id    UUID NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, student_id)
);

CREATE INDEX idx_entry_students_student ON entry_students (student_id);

CREATE TABLE entry_reads (
  entry_id    UUID NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  read_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (entry_id, user_id)
);

CREATE INDEX idx_entry_reads_user ON entry_reads (user_id);

-- ---------------------------------------------------------------------------
-- Calendario escolar (CalendarEvent)
-- ---------------------------------------------------------------------------

CREATE TABLE calendar_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES schools (id) ON DELETE CASCADE,
  section_id      UUID REFERENCES sections (id) ON DELETE SET NULL, -- NULL = todo el colegio
  author_id       UUID REFERENCES users (id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  event_date      DATE NOT NULL,
  event_time      TIME,
  type            calendar_event_type NOT NULL,
  -- Vínculo opcional con agenda. Política asimétrica (R__triggers.sql + relacion.md):
  --   DELETE entry           → borra este evento (ON DELETE CASCADE)
  --   DELETE calendar_event  → la entry se conserva (trigger trg_calendar_events_before_delete)
  entry_id        UUID UNIQUE DEFAULT NULL REFERENCES entries (id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_events_school_date ON calendar_events (school_id, event_date);
CREATE INDEX idx_calendar_events_section_date ON calendar_events (section_id, event_date);
CREATE INDEX idx_calendar_events_entry ON calendar_events (entry_id) WHERE entry_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Adjuntos unificados (entries y calendar_events)
-- ---------------------------------------------------------------------------

CREATE TABLE attachments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id          UUID REFERENCES entries (id) ON DELETE CASCADE,
  calendar_event_id UUID REFERENCES calendar_events (id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  size_label        TEXT NOT NULL,          -- ej. "1.2 MB"
  file_type         attachment_file_type NOT NULL,
  storage_url       TEXT NOT NULL,                   -- URL en Cloudinary
  cloudinary_public_id TEXT,                         -- public_id para borrado remoto
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (entry_id IS NOT NULL OR calendar_event_id IS NOT NULL)
);

CREATE INDEX idx_attachments_entry ON attachments (entry_id) WHERE entry_id IS NOT NULL;
CREATE INDEX idx_attachments_calendar ON attachments (calendar_event_id) WHERE calendar_event_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Notificaciones
-- ---------------------------------------------------------------------------

CREATE TABLE notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  body                TEXT NOT NULL,
  category            notification_category NOT NULL DEFAULT 'info',
  entry_id            UUID REFERENCES entries (id) ON DELETE SET NULL,
  calendar_event_id   UUID REFERENCES calendar_events (id) ON DELETE SET NULL,
  is_read             BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_entry ON notifications (entry_id) WHERE entry_id IS NOT NULL;
CREATE INDEX idx_notifications_calendar ON notifications (calendar_event_id) WHERE calendar_event_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Chat
-- ---------------------------------------------------------------------------

CREATE TABLE conversations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID NOT NULL REFERENCES schools (id) ON DELETE CASCADE,
  assistant_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  participant_id        UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  last_message_preview  TEXT,
  last_message_at       TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assistant_id, participant_id)
);

CREATE INDEX idx_conversations_assistant ON conversations (assistant_id, last_message_at DESC);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  text            TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);
