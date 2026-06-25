-- Agenda Escolar Digital — triggers y funciones
-- Ejecutar después de 02-tables.sql (antes o después de 03-views.sql)
--
-- Política documentada en database/docs/relaciones.md § «Borrado entry ↔ calendar_event»

-- ---------------------------------------------------------------------------
-- calendar_events: borrar evento NO borra la entry vinculada
-- ---------------------------------------------------------------------------
-- Política asimétrica:
--   DELETE entries          → DELETE calendar_events (FK ON DELETE CASCADE en entry_id)
--   DELETE calendar_events  → entries se conserva (este trigger + sin FK inversa)
--
-- Además, adjuntos compartidos (entry_id + calendar_event_id) desvinculan el evento
-- antes del DELETE para no perder el archivo en la agenda.

CREATE OR REPLACE FUNCTION fn_calendar_event_before_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Desvincular adjuntos que siguen ligados a la entry de agenda.
  UPDATE attachments
  SET calendar_event_id = NULL
  WHERE calendar_event_id = OLD.id
    AND entry_id IS NOT NULL;

  -- OLD se elimina después; la entry referenciada por OLD.entry_id no se toca.
  RETURN OLD;
END;
$$;

COMMENT ON FUNCTION fn_calendar_event_before_delete IS
  'Antes de borrar calendar_events: conserva la entry vinculada (OLD.entry_id) '
  'y desvincula adjuntos compartidos. Política asimétrica frente a DELETE en entries.';

DROP TRIGGER IF EXISTS trg_calendar_events_before_delete ON calendar_events;
CREATE TRIGGER trg_calendar_events_before_delete
  BEFORE DELETE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION fn_calendar_event_before_delete();

COMMENT ON TRIGGER trg_calendar_events_before_delete ON calendar_events IS
  'Garantiza que DELETE calendar_events no elimine la entry vinculada; ver fn_calendar_event_before_delete.';

-- ---------------------------------------------------------------------------
-- Sincronización entry ↔ calendar_event (cuando calendar_events.entry_id IS NOT NULL)
-- ---------------------------------------------------------------------------
-- Campos espejo:
--   title, description, fecha/hora, section_id, author_id, school_id, type (si aplica)
-- No se sincronizan flags de agenda: is_important, parents_only, requires_ack
--
-- pg_trigger_depth() evita bucle infinito entry → calendar → entry → …

CREATE OR REPLACE FUNCTION fn_entry_type_to_calendar_type(p entry_type)
RETURNS calendar_event_type
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p::text IN ('festivo', 'examen', 'reunion', 'actuacion', 'evento') THEN
    RETURN p::text::calendar_event_type;
  END IF;
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION fn_entry_type_to_calendar_type IS
  'Mapea entry_type a calendar_event_type cuando existe equivalente; NULL si no aplica (ej. tarea).';

CREATE OR REPLACE FUNCTION fn_entry_after_update_sync_calendar()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_calendar_type calendar_event_type;
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  v_calendar_type := fn_entry_type_to_calendar_type(NEW.type);

  UPDATE calendar_events
  SET
    title       = NEW.title,
    description = NEW.description,
    event_date  = NEW.entry_date,
    event_time  = NEW.entry_time,
    section_id  = NEW.section_id,
    author_id   = NEW.author_id,
    school_id   = NEW.school_id,
    type        = COALESCE(v_calendar_type, calendar_events.type),
    updated_at  = now()
  WHERE entry_id = NEW.id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_calendar_event_after_update_sync_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF NEW.entry_id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE entries
  SET
    title       = NEW.title,
    description = COALESCE(NEW.description, ''),
    entry_date  = NEW.event_date,
    entry_time  = COALESCE(NEW.event_time, TIME '08:00'),
    section_id  = COALESCE(NEW.section_id, entries.section_id),
    author_id   = COALESCE(NEW.author_id, entries.author_id),
    school_id   = NEW.school_id,
    type        = NEW.type::text::entry_type,
    updated_at  = now()
  WHERE id = NEW.entry_id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_entry_after_update_sync_calendar IS
  'Propaga cambios de entries al calendar_event vinculado (calendar_events.entry_id).';

COMMENT ON FUNCTION fn_calendar_event_after_update_sync_entry IS
  'Propaga cambios de calendar_events a la entry vinculada cuando entry_id IS NOT NULL.';

DROP TRIGGER IF EXISTS trg_entries_after_update_sync_calendar ON entries;
CREATE TRIGGER trg_entries_after_update_sync_calendar
  AFTER UPDATE OF title, description, entry_date, entry_time, section_id, author_id, school_id, type
  ON entries
  FOR EACH ROW
  EXECUTE FUNCTION fn_entry_after_update_sync_calendar();

DROP TRIGGER IF EXISTS trg_calendar_events_after_update_sync_entry ON calendar_events;
CREATE TRIGGER trg_calendar_events_after_update_sync_entry
  AFTER UPDATE OF title, description, event_date, event_time, section_id, author_id, school_id, type, entry_id
  ON calendar_events
  FOR EACH ROW
  WHEN (NEW.entry_id IS NOT NULL)
  EXECUTE FUNCTION fn_calendar_event_after_update_sync_entry();

COMMENT ON TRIGGER trg_entries_after_update_sync_calendar ON entries IS
  'Mantiene calendar_events alineado cuando existe entry_id apuntando a esta entry.';

COMMENT ON TRIGGER trg_calendar_events_after_update_sync_entry ON calendar_events IS
  'Mantiene entries alineada cuando el evento tiene entry_id; ver fn_calendar_event_after_update_sync_entry.';
