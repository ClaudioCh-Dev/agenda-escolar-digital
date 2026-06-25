export const DEFAULT_CLOUDINARY_FOLDER = 'agenda-escolar';

export function getDocMonthSegment(date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `Doc-${mm}-${yyyy}`;
}

export function getDocumentFolder(
  rootFolder: string,
  schoolId: string,
  date = new Date(),
): string {
  return `${rootFolder}/${schoolId}/${getDocMonthSegment(date)}`;
}

export function getProfileFolder(rootFolder: string, schoolId: string): string {
  return `${rootFolder}/profiles/${schoolId}`;
}

export function isDocumentPublicIdInSchoolScope(
  publicId: string,
  rootFolder: string,
  schoolId: string,
): boolean {
  return publicId.startsWith(`${rootFolder}/${schoolId}/`);
}

export function isProfilePublicIdInSchoolScope(
  publicId: string,
  rootFolder: string,
  schoolId: string,
): boolean {
  return publicId.startsWith(`${rootFolder}/profiles/${schoolId}/`);
}
