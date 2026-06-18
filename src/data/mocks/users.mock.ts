import type { User, Child } from '@/types';

const SECTION_3A = '3° A – Primaria';

const COLORS = ['#4F46E5', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#EC4899', '#6366F1'];

/** 28 familias extra en 3° A (padre-003 … padre-030) para probar listas largas. */
const EXTRA_3A_FAMILIES: ReadonlyArray<{ parent: string; child: string }> = [
  { parent: 'Roberto Méndez', child: 'Tomás Méndez' },
  { parent: 'Laura Silva', child: 'Martina Silva' },
  { parent: 'Fernando Castro', child: 'Joaquín Castro' },
  { parent: 'Patricia Ruiz', child: 'Julieta Ruiz' },
  { parent: 'Miguel Herrera', child: 'Benjamín Herrera' },
  { parent: 'Claudia Vega', child: 'Agustina Vega' },
  { parent: 'Jorge Morales', child: 'Santiago Morales' },
  { parent: 'Silvia Ramos', child: 'Catalina Ramos' },
  { parent: 'Andrés Flores', child: 'Matías Flores' },
  { parent: 'Verónica Navarro', child: 'Francesca Navarro' },
  { parent: 'Ricardo Ortiz', child: 'Ignacio Ortiz' },
  { parent: 'Gabriela Soto', child: 'Antonia Soto' },
  { parent: 'Pablo Domínguez', child: 'Vicente Domínguez' },
  { parent: 'Mónica Acosta', child: 'Rocío Acosta' },
  { parent: 'Daniel Paredes', child: 'Simón Paredes' },
  { parent: 'Elena Ríos', child: 'Isabella Ríos' },
  { parent: 'Gustavo Cabrera', child: 'Thiago Cabrera' },
  { parent: 'Natalia Fuentes', child: 'Luana Fuentes' },
  { parent: 'Héctor Medina', child: 'Bruno Medina' },
  { parent: 'Adriana Cortés', child: 'Milagros Cortés' },
  { parent: 'Luis Aguirre', child: 'Dante Aguirre' },
  { parent: 'Cecilia Romero', child: 'Abril Romero' },
  { parent: 'Marcelo Vargas', child: 'Franco Vargas' },
  { parent: 'Beatriz Núñez', child: 'Pilar Núñez' },
  { parent: 'Oscar Guzmán', child: 'Maximiliano Guzmán' },
  { parent: 'Roxana Ibáñez', child: 'Zoe Ibáñez' },
  { parent: 'Eduardo Salazar', child: 'León Salazar' },
  { parent: 'Carmina Peña', child: 'Alma Peña' },
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function buildExtra3AFamilyMocks(): { users: User[]; students: Child[] } {
  const users: User[] = [];
  const students: Child[] = [];

  EXTRA_3A_FAMILIES.forEach((family, index) => {
    const num = index + 3;
    const parentId = `padre-${String(num).padStart(3, '0')}`;
    const stuId = `stu-${String(index + 10).padStart(3, '0')}`;
    const child: Child = {
      id: stuId,
      name: family.child,
      section: SECTION_3A,
      grade: '3er Grado',
      initials: initialsFromName(family.child),
      color: COLORS[index % COLORS.length],
    };

    students.push(child);
    users.push({
      id: parentId,
      name: family.parent,
      email: `padre${num}@colegio.edu`,
      role: 'padre',
      initials: initialsFromName(family.parent),
      children: [child],
    });
  });

  return { users, students };
}

const { users: EXTRA_3A_USERS, students: EXTRA_3A_STUDENTS } = buildExtra3AFamilyMocks();

export const MOCK_USERS: User[] = [
  {
    id: 'aux-001',
    name: 'María García',
    email: 'auxiliar@colegio.edu',
    role: 'auxiliar',
    initials: 'MG',
    sections: ['3° A – Primaria', '5° A – Primaria', '5° B – Primaria', '5° C – Primaria'],
  },
  {
    id: 'padre-001',
    name: 'Carlos Rodríguez',
    email: 'padre@colegio.edu',
    role: 'padre',
    initials: 'CR',
    children: [
      { id: 'stu-001', name: 'Lucas Rodríguez', section: SECTION_3A, grade: '3er Grado', initials: 'LR', color: '#4F46E5' },
      { id: 'stu-009', name: 'Emma Rodríguez', section: '5° B – Primaria', grade: '5to Grado', initials: 'ER', color: '#0EA5E9' },
    ],
  },
  {
    id: 'padre-002',
    name: 'Ana López',
    email: 'padre2@colegio.edu',
    role: 'padre',
    initials: 'AL',
    children: [
      { id: 'stu-002', name: 'Sofía López', section: SECTION_3A, grade: '3er Grado', initials: 'SL', color: '#8B5CF6' },
      { id: 'stu-003', name: 'Mateo López', section: '5° B – Primaria', grade: '5to Grado', initials: 'ML', color: '#10B981' },
    ],
  },
  ...EXTRA_3A_USERS,
  {
    id: 'stu-001',
    name: 'Lucas Rodríguez',
    email: 'alumno@colegio.edu',
    role: 'alumno',
    initials: 'LR',
    section: SECTION_3A,
  },
];

export const MOCK_STUDENTS: Child[] = [
  { id: 'stu-001', name: 'Lucas Rodríguez', section: SECTION_3A, grade: '3er Grado', initials: 'LR', color: '#4F46E5' },
  { id: 'stu-002', name: 'Sofía López', section: SECTION_3A, grade: '3er Grado', initials: 'SL', color: '#8B5CF6' },
  ...EXTRA_3A_STUDENTS,
  { id: 'stu-009', name: 'Emma Rodríguez', section: '5° B – Primaria', grade: '5to Grado', initials: 'ER', color: '#0EA5E9' },
  { id: 'stu-004', name: 'Valentina Ruiz', section: '5° A – Primaria', grade: '5to Grado', initials: 'VR', color: '#F59E0B' },
  { id: 'stu-005', name: 'Diego Pérez', section: '5° A – Primaria', grade: '5to Grado', initials: 'DP', color: '#EF4444' },
  { id: 'stu-003', name: 'Mateo López', section: '5° B – Primaria', grade: '5to Grado', initials: 'ML', color: '#10B981' },
  { id: 'stu-006', name: 'Camila Torres', section: '5° B – Primaria', grade: '5to Grado', initials: 'CT', color: '#0EA5E9' },
  { id: 'stu-007', name: 'Juan Martínez', section: '5° C – Primaria', grade: '5to Grado', initials: 'JM', color: '#8B5CF6' },
  { id: 'stu-008', name: 'Lucía Fernández', section: '5° C – Primaria', grade: '5to Grado', initials: 'LF', color: '#EC4899' },
];

/** IDs de padres de 3° A (30) — útil para mocks de confirmaciones parciales. */
export const MOCK_3A_PARENT_IDS = MOCK_USERS
  .filter(u => u.role === 'padre' && u.children?.some(c => c.section === SECTION_3A))
  .map(u => u.id);
