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
