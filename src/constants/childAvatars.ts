import type { ImageSourcePropType } from 'react-native';

export const CHILD_AVATAR_IMAGES: Record<string, ImageSourcePropType> = {
  'stu-001': require('../../assets/mock-avatars/lucas.jpg'),
  'stu-002': require('../../assets/mock-avatars/sofia.jpg'),
  'stu-003': require('../../assets/mock-avatars/mateo.png'),
  'stu-009': require('../../assets/mock-avatars/mateo.png'),
};

export function getChildAvatarImage(childId: string): ImageSourcePropType | undefined {
  return CHILD_AVATAR_IMAGES[childId];
}
