/** Same keys as Angular `$tgStorage` (`app/coffee/modules/base/storage.coffee`). */
export const STORAGE_TOKEN = 'token';
export const STORAGE_USER_INFO = 'userInfo';

export function legacyIndexPath(): string {
  return '/legacy/index.html';
}

/** URL the iframe loads so Angular html5 routes resolve under /legacy/. */
export function legacyFrameSrc(pathname: string, search: string, hash: string = ''): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (path === '/' || path === '') {
    return `${legacyIndexPath()}${search}${hash}`;
  }
  return `/legacy${path}${search}${hash}`;
}
