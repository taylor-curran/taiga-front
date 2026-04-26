import type { TaigaMembership, TaigaUser } from '@/api/types';

const GRAV = 'https://www.gravatar.com/avatar/';

/**
 * @internal exported for tests (matches Angular `tgAvatarService` intent)
 */
export function gravatarFromEmail(email: string | null | undefined): string {
  if (!email) {
    return '/media/unnamed.png';
  }
  const normalized = String(email).trim().toLowerCase();
  if (!normalized) {
    return '/media/unnamed.png';
  }
  // Match backend: MD5 in browser via sync hash not available; use unencoded for tests only
  // In practice Taiga provides photo URLs. Fallback to simple deterministic placeholder.
  return `${GRAV}${simpleHashHex(normalized)}?s=200&d=identicon`;
}

function simpleHashHex(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, '0');
}

export function membershipAvatarSrc(m: TaigaMembership & { photo?: string | null; user?: number | null }) {
  if (m.photo) {
    return m.photo;
  }
  if (m.user) {
    return `/api/v1/users/${m.user}/photo?`;
  }
  return gravatarFromEmail(m.user_email || m.email);
}

export function userAvatarFromUser(u: TaigaUser) {
  if (u.photo) {
    return u.photo;
  }
  if (u.gravatar_id) {
    return `https://www.gravatar.com/avatar/${u.gravatar_id}?s=200`;
  }
  return gravatarFromEmail(u.email);
}
