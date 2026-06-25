export type Role = 'auxiliar' | 'padre' | 'alumno';

export interface Child {
  id: string;
  name: string;
  section: string;
  grade: string;
  initials: string;
  color: string;
  avatar?: string;
}

export interface User {
  id: string;
  name: string;
  code?: string;
  email: string;
  role: Role;
  avatar?: string;
  initials: string;
  section?: string;
  sections?: string[];
  children?: Child[];
}

export interface VisibilityContext {
  selectedChildId?: string;
  selectedSection?: string;
}
