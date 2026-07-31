export function getAvatarUrl(user: { photo?: string | null; gravatar_id?: string } | null | undefined, size = 60): string {
  if (user?.photo) return user.photo;
  if (user?.gravatar_id) return `https://www.gravatar.com/avatar/${user.gravatar_id}?s=${size}&d=identicon`;
  return `https://www.gravatar.com/avatar/?s=${size}&d=identicon`;
}

export function getUserColor(user: { color?: string } | null | undefined): string {
  return user?.color || '#a9aabc';
}
