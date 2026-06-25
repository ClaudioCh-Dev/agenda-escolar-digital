import type { UserChildDto } from '../../users/dto/user-profile.dto';

export class ParentResponseDto {
  id!: string;
  name!: string;
  code!: string;
  role!: string;
  initials!: string;
  avatar?: string;
  sections?: string[];
  children?: UserChildDto[];
}
