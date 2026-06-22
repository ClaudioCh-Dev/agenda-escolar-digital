import type { UserEntity } from '../../users/entities/user.entity';

export interface ScopedUserContext {
  user: UserEntity;
  primaryRole: string;
  roles: string[];
  sectionIds: string[];
  sectionNames: string[];
  studentIds: string[];
  childStudentIds: string[];
}

export interface VisibilityOptions {
  selectedSection?: string;
  selectedChildId?: string;
}
