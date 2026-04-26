import { useAppStore } from '@/stores/appStore';

/** Client-side `storage.remove` + clear user, matching `$tgAuth.logout` in `app/coffee/modules/auth.coffee`. */
export function performLogout() {
    useAppStore.getState().clearSession();
}
