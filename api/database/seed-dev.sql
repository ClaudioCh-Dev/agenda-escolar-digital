-- Seed de desarrollo — ejecutar después de `pnpm db:migrate`
-- Login: code + password=demo123
-- t10000001 auxiliar | p10000001 padre | e10000001 alumno

INSERT INTO schools (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Colegio Demo', 'colegio-demo')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO sedes (id, school_id, name, code) VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Sede Los Olivos',
    'LO'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'Sede Surco',
    'SU'
  )
ON CONFLICT (school_id, code) DO NOTHING;

INSERT INTO sections (id, sede_id, name, grade) VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '3° A – Primaria',
    '3er Grado'
  )
ON CONFLICT (sede_id, name) DO NOTHING;

-- bcrypt hash de "demo123" (cost 10)
INSERT INTO users (id, school_id, code, user_type, password_hash, name, primary_sede_id) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    't10000001',
    'staff',
    '$2b$10$travi1xz6Zg8K.cChlT/w.RgaQ0M2HP32kWoUQ2ukdOac1mB2YC6K',
    'María Auxiliar',
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'p10000001',
    'parent',
    '$2b$10$travi1xz6Zg8K.cChlT/w.RgaQ0M2HP32kWoUQ2ukdOac1mB2YC6K',
    'Carlos Padre',
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'e10000001',
    'student',
    '$2b$10$travi1xz6Zg8K.cChlT/w.RgaQ0M2HP32kWoUQ2ukdOac1mB2YC6K',
    'Lucas Alumno',
    '33333333-3333-3333-3333-333333333333'
  )
ON CONFLICT (code) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', r.id
FROM roles r
WHERE r.code = 'auxiliar' AND r.school_id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', r.id
FROM roles r
WHERE r.code = 'padre' AND r.school_id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 'cccccccc-cccc-cccc-cccc-cccccccccccc', r.id
FROM roles r
WHERE r.code = 'alumno' AND r.school_id IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO user_sedes (user_id, sede_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444')
ON CONFLICT DO NOTHING;

INSERT INTO user_sections (user_id, section_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

INSERT INTO students (id, school_id, section_id, user_id) VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'cccccccc-cccc-cccc-cccc-cccccccccccc'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO parent_students (parent_id, student_id) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT DO NOTHING;

-- ===========================================================================
-- Agenda, calendario, notificaciones y chat (demo alineado a TODAY = 2026-06-13)
-- ===========================================================================

INSERT INTO entries (
  id, school_id, section_id, author_id, type, title, description,
  entry_date, entry_time, is_important, parents_only, requires_ack
) VALUES
  (
    'e1011111-1111-1111-1111-111111111101',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'tarea',
    'Matemáticas – Página 45',
    'Resolver los ejercicios 1 al 5. Recordar mostrar el procedimiento completo. Entregar el lunes.',
    '2026-06-13', '08:30', true, false, false
  ),
  (
    'e1011111-1111-1111-1111-111111111102',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'comunicado',
    'Reunión de padres – Viernes 20 de junio',
    'Se convoca a todos los padres a la reunión del tercer trimestre. Horario: 18:00 a 19:30 hs. Aula 12. Asistencia obligatoria.',
    '2026-06-13', '09:00', true, false, false
  ),
  (
    'e1011111-1111-1111-1111-111111111103',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'material',
    'Materiales para proyecto de Arte',
    'Para el miércoles traer: cartulina de colores (A3), tijeras, pegamento en barra y marcadores. Proyecto sobre ecosistemas.',
    '2026-06-13', '10:15', false, false, false
  ),
  (
    'e1011111-1111-1111-1111-111111111104',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'examen',
    'Examen de Ciencias Naturales – Lunes 17/06',
    'El examen abarca las unidades 3 y 4: ecosistema y cadena alimentaria. Repasar cuaderno y libro páginas 78-95.',
    '2026-06-13', '11:00', true, false, false
  ),
  (
    'e1011111-1111-1111-1111-111111111105',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'recordatorio',
    'Celebración Día del Padre – Miércoles 18/06',
    'Invitamos a todos los papás al acto especial del Día del Padre. Horario: 10:00 hs.',
    '2026-06-13', '12:00', false, false, false
  ),
  (
    'e1011111-1111-1111-1111-111111111106',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'observacion',
    'Observación: excelente participación',
    'El grupo demostró muy buena participación durante la clase de Ciencias. Se destacaron varios alumnos en la exposición oral.',
    '2026-06-13', '13:30', false, false, false
  ),
  (
    'e1011111-1111-1111-1111-111111111107',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'comunicado',
    'Salida educativa – Parque Mirador',
    'El jueves 19/06 realizaremos salida educativa al Parque Mirador. Salida 8:00 hs, regreso 14:00 hs. Traer refrigerio y gorra.',
    '2026-06-13', '14:00', true, false, true
  ),
  (
    'e1011111-1111-1111-1111-111111111108',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'nota_personal',
    'Recordatorio: traer gorra',
    'Lucas, no olvides la gorra para la actividad al aire libre del lunes.',
    '2026-06-13', '07:45', false, false, false
  ),
  (
    'e1011111-1111-1111-1111-111111111109',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'tarea',
    'Lengua – Comprensión lectora',
    'Leer el cuento "El principito" capítulos 1-5 y responder las preguntas del cuadernillo.',
    '2026-06-12', '09:00', false, false, false
  ),
  (
    'e1011111-1111-1111-1111-111111111110',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'evento',
    'Visita al Museo de Ciencias Naturales',
    'La salida educativa fue un éxito. Los alumnos disfrutaron los dinosaurios y el planetario.',
    '2026-06-12', '08:00', false, false, false
  ),
  (
    'e1011111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'comunicado',
    'Circular: uso del uniforme de invierno',
    'A partir del lunes 16/06 el uniforme de invierno es obligatorio en todas las actividades.',
    '2026-06-11', '15:00', false, true, false
  )
ON CONFLICT (id) DO NOTHING;

-- Nota personal dirigida solo a Lucas
INSERT INTO entry_students (entry_id, student_id) VALUES
  ('e1011111-1111-1111-1111-111111111108', 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT DO NOTHING;

-- Padre ya confirmó lectura de algunos comunicados (no el de salida con requires_ack)
INSERT INTO entry_reads (entry_id, user_id, read_at) VALUES
  ('e1011111-1111-1111-1111-111111111102', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-13 09:30:00+00'),
  ('e1011111-1111-1111-1111-111111111103', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-13 10:45:00+00'),
  ('e1011111-1111-1111-1111-111111111109', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-12 18:00:00+00')
ON CONFLICT DO NOTHING;

-- Calendario escolar (institucional + sección 3° A)
INSERT INTO calendar_events (
  id, school_id, section_id, author_id, title, description,
  event_date, event_time, type
) VALUES
  (
    'c2011111-1111-1111-1111-111111111201',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Día Festivo',
    'Feriado escolar — sin clases',
    '2026-06-16', NULL, 'festivo'
  ),
  (
    'c2011111-1111-1111-1111-111111111202',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Examen Ciencias',
    'Unidades 3 y 4 — 3° A',
    '2026-06-17', '09:00', 'examen'
  ),
  (
    'c2011111-1111-1111-1111-111111111203',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Día del Padre',
    'Acto especial en el patio central',
    '2026-06-18', '10:00', 'actuacion'
  ),
  (
    'c2011111-1111-1111-1111-111111111204',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Reunión de Padres',
    'Tercer trimestre — 3° A, aula 12',
    '2026-06-20', '18:00', 'reunion'
  ),
  (
    'c2011111-1111-1111-1111-111111111205',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Examen Matemáticas',
    'Evaluación trimestral',
    '2026-06-24', '09:00', 'examen'
  ),
  (
    'c2011111-1111-1111-1111-111111111206',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Día del Deporte',
    'Actividades deportivas por turnos',
    '2026-06-25', '08:30', 'actuacion'
  ),
  (
    'c2011111-1111-1111-1111-111111111207',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Entrega de Boletines',
    'Retiro de boletines en secretaría',
    '2026-06-30', '14:00', 'evento'
  ),
  (
    'c2011111-1111-1111-1111-111111111208',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Feria de Ciencias',
    'Exposición de proyectos por salones',
    '2026-07-05', '10:00', 'evento'
  )
ON CONFLICT (id) DO NOTHING;

-- Notificaciones in-app (padre Carlos — incluye pendientes de lectura)
INSERT INTO notifications (
  id, user_id, title, body, category, entry_id, is_read, created_at
) VALUES
  (
    'n3011111-1111-1111-1111-111111111301',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Matemáticas – Página 45',
    'Resolver los ejercicios 1 al 5. Recordar mostrar el procedimiento completo. Entregar el lunes.',
    'info',
    'e1011111-1111-1111-1111-111111111101',
    false,
    '2026-06-13 08:35:00+00'
  ),
  (
    'n3011111-1111-1111-1111-111111111302',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Reunión de padres – Viernes 20 de junio',
    'Se convoca a todos los padres a la reunión del tercer trimestre. Horario: 18:00 a 19:30 hs.',
    'important',
    'e1011111-1111-1111-1111-111111111102',
    false,
    '2026-06-13 09:05:00+00'
  ),
  (
    'n3011111-1111-1111-1111-111111111303',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Examen de Ciencias Naturales – Lunes 17/06',
    'El examen abarca las unidades 3 y 4. Repasar cuaderno y libro páginas 78-95.',
    'warning',
    'e1011111-1111-1111-1111-111111111104',
    true,
    '2026-06-13 11:05:00+00'
  ),
  (
    'n3011111-1111-1111-1111-111111111304',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Salida educativa – Parque Mirador',
    'El jueves 19/06 salida al Parque Mirador. Confirmá lectura en la agenda.',
    'important',
    'e1011111-1111-1111-1111-111111111107',
    false,
    '2026-06-13 14:05:00+00'
  ),
  (
    'n3011111-1111-1111-1111-111111111305',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Lengua – Comprensión lectora',
    'Leer El Principito capítulos 1-5.',
    'info',
    'e1011111-1111-1111-1111-111111111109',
    true,
    '2026-06-12 09:05:00+00'
  ),
  (
    'n3011111-1111-1111-1111-111111111306',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Recordatorio: traer gorra',
    'Lucas, no olvides la gorra para la actividad al aire libre del lunes.',
    'reminder',
    'e1011111-1111-1111-1111-111111111108',
    false,
    '2026-06-13 07:50:00+00'
  ),
  (
    'n3011111-1111-1111-1111-111111111307',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Examen Ciencias',
    'Unidades 3 y 4 — 3° A. Calendario escolar.',
    'warning',
    NULL,
    false,
    '2026-06-13 08:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;

UPDATE notifications
SET calendar_event_id = 'c2011111-1111-1111-1111-111111111202'
WHERE id = 'n3011111-1111-1111-1111-111111111307'
  AND calendar_event_id IS NULL;

-- Chat auxiliar ↔ padre
INSERT INTO conversations (
  id, school_id, assistant_id, participant_id,
  last_message_preview, last_message_at
) VALUES
  (
    'cv411111-1111-1111-1111-111111111401',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Gracias por la información sobre el examen.',
    '2026-06-13 10:30:00+00'
  )
ON CONFLICT (assistant_id, participant_id) DO NOTHING;

INSERT INTO messages (id, conversation_id, sender_id, text, is_read, created_at) VALUES
  (
    'ms511111-1111-1111-1111-111111111501',
    'cv411111-1111-1111-1111-111111111401',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Buenas tardes, quería consultar si Lucas puede entregar la tarea el martes.',
    true,
    '2026-06-12 15:20:00+00'
  ),
  (
    'ms511111-1111-1111-1111-111111111502',
    'cv411111-1111-1111-1111-111111111401',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Hola Carlos, sí puede entregarla el martes sin problema. ¡Que tengas buen fin de semana!',
    true,
    '2026-06-12 16:05:00+00'
  ),
  (
    'ms511111-1111-1111-1111-111111111503',
    'cv411111-1111-1111-1111-111111111401',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Muchas gracias. Igualmente.',
    true,
    '2026-06-12 16:10:00+00'
  ),
  (
    'ms511111-1111-1111-1111-111111111504',
    'cv411111-1111-1111-1111-111111111401',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Gracias por la información sobre el examen.',
    true,
    '2026-06-13 10:30:00+00'
  )
ON CONFLICT (id) DO NOTHING;
