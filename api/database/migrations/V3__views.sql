-- Agenda Escolar Digital — vistas SQL
-- Ejecutar después de 02-tables.sql

-- Agenda / Inicio: entradas visibles para un alumno
CREATE VIEW v_student_agenda AS
SELECT
  e.*,
  s.name AS section_name,
  sd.name AS sede_name,
  u.name AS author_name
FROM entries e
JOIN sections s ON s.id = e.section_id
JOIN sedes sd ON sd.id = s.sede_id
JOIN users u ON u.id = e.author_id
WHERE e.parents_only = false
  AND (
    NOT EXISTS (SELECT 1 FROM entry_students es WHERE es.entry_id = e.id)
    OR EXISTS (
      SELECT 1 FROM entry_students es
      JOIN students st ON st.id = es.student_id
      WHERE es.entry_id = e.id AND st.user_id IS NOT NULL
    )
  );

-- Padre: entradas de un hijo (por student_id)
CREATE VIEW v_parent_agenda AS
SELECT
  e.*,
  es.student_id,
  su.name AS student_name,
  s.name AS section_name,
  sd.name AS sede_name,
  u.name AS author_name,
  EXISTS (
    SELECT 1 FROM entry_reads er
    JOIN parent_students ps ON ps.parent_id = er.user_id
    WHERE er.entry_id = e.id AND ps.student_id = es.student_id
  ) AS ack_by_parent_for_child
FROM entries e
JOIN sections s ON s.id = e.section_id
JOIN sedes sd ON sd.id = s.sede_id
JOIN users u ON u.id = e.author_id
LEFT JOIN entry_students es ON es.entry_id = e.id
LEFT JOIN students st ON st.id = es.student_id
LEFT JOIN users su ON su.id = st.user_id
WHERE e.parents_only = false OR e.type = 'nota_personal';

-- Auxiliar: comunicados pendientes de confirmación
CREATE VIEW v_pending_entry_acks AS
SELECT
  e.id AS entry_id,
  e.title,
  e.section_id,
  s.name AS section_name,
  sd.name AS sede_name,
  COUNT(DISTINCT ps.parent_id) AS total_parents,
  COUNT(DISTINCT er.user_id) AS confirmed_parents,
  COUNT(DISTINCT ps.parent_id) - COUNT(DISTINCT er.user_id) AS pending_count
FROM entries e
JOIN sections s ON s.id = e.section_id
JOIN sedes sd ON sd.id = s.sede_id
JOIN students st ON st.section_id = e.section_id
JOIN parent_students ps ON ps.student_id = st.id
LEFT JOIN entry_reads er ON er.entry_id = e.id AND er.user_id = ps.parent_id
WHERE e.requires_ack = true
  AND NOT EXISTS (SELECT 1 FROM entry_students es WHERE es.entry_id = e.id)
GROUP BY e.id, e.title, e.section_id, s.name, sd.name;

-- Comunicados dirigidos a un alumno
CREATE VIEW v_pending_student_entry_acks AS
SELECT
  e.id AS entry_id,
  e.title,
  es.student_id,
  su.name AS student_name,
  COUNT(DISTINCT ps.parent_id) AS total_parents,
  COUNT(DISTINCT er.user_id) AS confirmed_parents
FROM entries e
JOIN entry_students es ON es.entry_id = e.id
JOIN students st ON st.id = es.student_id
JOIN users su ON su.id = st.user_id
JOIN parent_students ps ON ps.student_id = st.id
LEFT JOIN entry_reads er ON er.entry_id = e.id AND er.user_id = ps.parent_id
WHERE e.requires_ack = true
GROUP BY e.id, e.title, es.student_id, su.name;

-- Calendario escolar
CREATE VIEW v_calendar_feed AS
SELECT
  ce.*,
  s.name AS section_name,
  sd.name AS sede_name
FROM calendar_events ce
LEFT JOIN sections s ON s.id = ce.section_id
LEFT JOIN sedes sd ON sd.id = s.sede_id
ORDER BY ce.event_date;

-- Notificaciones no leídas por usuario
CREATE VIEW v_unread_notifications AS
SELECT
  n.*,
  u.name AS user_name
FROM notifications n
JOIN users u ON u.id = n.user_id
WHERE n.is_read = false
ORDER BY n.created_at DESC;

-- Resumen dashboard auxiliar por sección
CREATE VIEW v_assistant_section_stats AS
SELECT
  us.user_id AS assistant_id,
  s.id AS section_id,
  s.name AS section_name,
  COUNT(DISTINCT e.id) FILTER (WHERE e.entry_date = CURRENT_DATE) AS entries_today,
  COUNT(DISTINCT ce.id) FILTER (
    WHERE ce.event_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  ) AS events_this_week
FROM user_sections us
JOIN sections s ON s.id = us.section_id
LEFT JOIN entries e ON e.section_id = s.id
LEFT JOIN calendar_events ce ON ce.section_id = s.id OR ce.section_id IS NULL
GROUP BY us.user_id, s.id, s.name;

-- IAM: permisos efectivos por usuario
CREATE VIEW v_user_permissions AS
SELECT DISTINCT
  ur.user_id,
  r.code AS role_code,
  p.code AS permission_code,
  p.module
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id;

CREATE VIEW v_user_roles AS
SELECT
  ur.user_id,
  r.id AS role_id,
  r.code AS role_code,
  r.name AS role_name,
  r.school_id AS role_school_id,
  ur.assigned_at
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id;
