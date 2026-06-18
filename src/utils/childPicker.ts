import type { Child } from '@/types';
import type { DropdownItem } from '@/components/features/Dropdown';
import { getChildAvatarImage } from '@/constants/childAvatars';

export function buildChildDropdownItems(children: Child[]): DropdownItem[] {
  return children.map(child => ({
    id: child.id,
    label: child.name.split(' ')[0],
    subtitle: child.section,
    initials: child.initials,
    color: child.color,
    image: getChildAvatarImage(child.id),
  }));
}
