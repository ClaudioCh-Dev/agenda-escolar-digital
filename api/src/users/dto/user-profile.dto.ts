export interface UserChildDto {
  id: string;
  name: string;
  section: string;
  grade: string;
  initials: string;
  avatar?: string;
}

export interface UserProfileDto {
  id: string;
  name: string;
  code: string;
  userType: 'student' | 'staff' | 'parent';
  role: string;
  roles: string[];
  avatar?: string;
  initials: string;
  section?: string;
  sections?: string[];
  sede?: string;
  sedes?: string[];
  children?: UserChildDto[];
}
