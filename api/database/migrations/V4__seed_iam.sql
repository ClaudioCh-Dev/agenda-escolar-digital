-- Agenda Escolar Digital — seed IAM (permisos, roles, role_permissions)
-- Ejecutar después de 02-tables.sql

INSERT INTO permissions (code, name, module, description) VALUES
  ('entries.read', 'Ver agenda', 'entries', 'Listar y ver anotaciones visibles'),
  ('entries.create', 'Crear anotaciones', 'entries', 'Nueva anotación / registro'),
  ('entries.update', 'Editar anotaciones', 'entries', 'Modificar entries propias o de sección'),
  ('entries.delete', 'Eliminar anotaciones', 'entries', 'Borrar entries'),
  ('entries.ack', 'Confirmar lectura', 'entries', 'Padres confirman lectura'),
  ('calendar.read', 'Ver calendario', 'calendar', 'Eventos del calendario escolar'),
  ('calendar.create', 'Crear eventos', 'calendar', 'Programar eventos de calendario'),
  ('calendar.update', 'Editar eventos', 'calendar', 'Modificar calendar_events'),
  ('calendar.delete', 'Eliminar eventos', 'calendar', 'Borrar calendar_events'),
  ('notifications.read', 'Ver notificaciones', 'notifications', 'Bandeja de avisos'),
  ('chat.read', 'Ver chat', 'chat', 'Listar conversaciones y mensajes'),
  ('chat.send', 'Enviar mensajes', 'chat', 'Responder en chat'),
  ('students.read', 'Ver alumnos', 'students', 'Listar alumnos por sección'),
  ('sections.read', 'Ver secciones', 'sections', 'Listar secciones del colegio'),
  ('sections.manage', 'Gestionar secciones', 'sections', 'Alta/edición de secciones'),
  ('users.read', 'Ver usuarios', 'users', 'Listar cuentas del colegio'),
  ('users.manage', 'Gestionar usuarios', 'users', 'Crear/editar usuarios y roles'),
  ('schedules.read', 'Ver horarios', 'schedules', 'Consultar grilla horaria'),
  ('schedules.manage', 'Gestionar horarios', 'schedules', 'Editar schedules y bloques')
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles (school_id, code, name, description, is_system) VALUES
  (NULL, 'auxiliar', 'Auxiliar escolar', 'Gestiona agenda y calendario de sus secciones', true),
  (NULL, 'padre', 'Padre / tutor', 'Ve agenda de sus hijos y confirma lectura', true),
  (NULL, 'alumno', 'Alumno', 'Ve su agenda y calendario', true),
  (NULL, 'profesor', 'Profesor', 'Consulta agenda/horario de sus cursos', true),
  (NULL, 'direccion', 'Dirección', 'Visión global del colegio y administración', true)
ON CONFLICT (code) WHERE (school_id IS NULL) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'auxiliar' AND r.school_id IS NULL
  AND p.code IN (
    'entries.read', 'entries.create', 'entries.update', 'entries.delete',
    'calendar.read', 'calendar.create', 'calendar.update', 'calendar.delete',
    'notifications.read', 'chat.read', 'chat.send',
    'students.read', 'sections.read', 'schedules.read', 'schedules.manage'
  )
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'padre' AND r.school_id IS NULL
  AND p.code IN (
    'entries.read', 'entries.ack', 'calendar.read', 'notifications.read', 'chat.read', 'chat.send'
  )
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'alumno' AND r.school_id IS NULL
  AND p.code IN ('entries.read', 'calendar.read', 'notifications.read')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'profesor' AND r.school_id IS NULL
  AND p.code IN (
    'entries.read', 'entries.create', 'calendar.read', 'notifications.read',
    'chat.read', 'chat.send', 'students.read', 'sections.read', 'schedules.read'
  )
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'direccion' AND r.school_id IS NULL
ON CONFLICT DO NOTHING;
