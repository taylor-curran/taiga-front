export function userAvatarSrc(photo: string | null | undefined): string | undefined {
  if (!photo) return undefined;
  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
  return `${window.location.origin}${photo.startsWith('/') ? '' : '/'}${photo}`;
}
