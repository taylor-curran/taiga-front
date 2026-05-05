import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CurrentUser } from '@/lib/auth';
import { useAuth } from '@/lib/auth';
import type {
  Contact,
  LikedItem,
  Locale,
  NotifyPolicy,
  TimelineEntry,
  UserProjectSettings,
  UserStats,
  VotedItem,
  WatchedItem,
} from '@/types/api';

/* ------------------------------------------------------------------ */
/*  User fetch                                                         */
/* ------------------------------------------------------------------ */

export async function fetchUserBySlug(slug: string): Promise<CurrentUser | null> {
  try {
    const res = await api.get<CurrentUser>('users/by_username', { params: { username: slug } });
    return res.data;
  } catch {
    try {
      const res = await api.get<CurrentUser>(`users/${slug}`);
      return res.data;
    } catch {
      return null;
    }
  }
}

export function useUserBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['user', 'by_slug', slug],
    queryFn: () => fetchUserBySlug(slug as string),
    enabled: !!slug,
  });
}

/* ------------------------------------------------------------------ */
/*  User stats                                                         */
/* ------------------------------------------------------------------ */

export async function fetchUserStats(userId: number): Promise<UserStats> {
  const res = await api.get<UserStats>(`users/${userId}/stats`);
  return res.data;
}

export function useUserStats(userId: number | undefined) {
  return useQuery({
    queryKey: ['user', 'stats', userId],
    queryFn: () => fetchUserStats(userId as number),
    enabled: !!userId,
  });
}

/* ------------------------------------------------------------------ */
/*  User contacts                                                      */
/* ------------------------------------------------------------------ */

export async function fetchUserContacts(userId: number): Promise<Contact[]> {
  const res = await api.get<Contact[]>(`users/${userId}/contacts`);
  return res.data;
}

export function useUserContacts(userId: number | undefined) {
  return useQuery({
    queryKey: ['user', 'contacts', userId],
    queryFn: () => fetchUserContacts(userId as number),
    enabled: !!userId,
  });
}

/* ------------------------------------------------------------------ */
/*  User timeline                                                      */
/* ------------------------------------------------------------------ */

export async function fetchUserTimeline(userId: number): Promise<TimelineEntry[]> {
  const res = await api.get<TimelineEntry[]>(`timeline/user/${userId}`);
  return res.data;
}

export function useUserTimeline(userId: number | undefined) {
  return useQuery({
    queryKey: ['timeline', 'user', userId],
    queryFn: () => fetchUserTimeline(userId as number),
    enabled: !!userId,
  });
}

/* ------------------------------------------------------------------ */
/*  Liked / Voted / Watched                                            */
/* ------------------------------------------------------------------ */

export async function fetchLiked(userId: number): Promise<LikedItem[]> {
  const res = await api.get<LikedItem[]>(`users/${userId}/liked`);
  return res.data;
}

export function useLiked(userId: number | undefined) {
  return useQuery({
    queryKey: ['user', 'liked', userId],
    queryFn: () => fetchLiked(userId as number),
    enabled: !!userId,
  });
}

export async function fetchVoted(userId: number): Promise<VotedItem[]> {
  const res = await api.get<VotedItem[]>(`users/${userId}/voted`);
  return res.data;
}

export function useVoted(userId: number | undefined) {
  return useQuery({
    queryKey: ['user', 'voted', userId],
    queryFn: () => fetchVoted(userId as number),
    enabled: !!userId,
  });
}

export async function fetchWatched(userId: number): Promise<WatchedItem[]> {
  const res = await api.get<WatchedItem[]>(`users/${userId}/watched`);
  return res.data;
}

export function useWatched(userId: number | undefined) {
  return useQuery({
    queryKey: ['user', 'watched', userId],
    queryFn: () => fetchWatched(userId as number),
    enabled: !!userId,
  });
}

/* ------------------------------------------------------------------ */
/*  Locales                                                            */
/* ------------------------------------------------------------------ */

export async function fetchLocales(): Promise<Locale[]> {
  const res = await api.get<Locale[]>('locales');
  return res.data;
}

export function useLocales() {
  return useQuery({ queryKey: ['locales'], queryFn: fetchLocales });
}

/* ------------------------------------------------------------------ */
/*  Update profile (PATCH /users/:id)                                  */
/* ------------------------------------------------------------------ */

export type ProfilePatch = Partial<
  Pick<CurrentUser, 'full_name' | 'lang' | 'theme'> & { bio: string }
>;

export async function patchProfile(userId: number, patch: ProfilePatch): Promise<CurrentUser> {
  const res = await api.patch<CurrentUser>(`users/${userId}`, patch);
  return res.data;
}

export function usePatchProfile() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfilePatch) => patchProfile(user!.id, patch),
    onSuccess(data) {
      setUser(data);
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Change password                                                    */
/* ------------------------------------------------------------------ */

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('users/change_password', {
    current_password: currentPassword,
    password: newPassword,
  });
}

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */

export async function changeAvatar(file: File): Promise<CurrentUser> {
  const data = new FormData();
  data.append('avatar', file);
  const res = await api.post<CurrentUser>('users/change_avatar', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function removeAvatar(): Promise<void> {
  await api.post('users/remove_avatar');
}

export function useChangeAvatar() {
  const refreshMe = useAuth((s) => s.refreshMe);
  return useMutation({
    mutationFn: changeAvatar,
    async onSuccess() {
      await refreshMe();
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Notify policies                                                    */
/* ------------------------------------------------------------------ */

export async function fetchNotifyPolicies(): Promise<NotifyPolicy[]> {
  const res = await api.get<NotifyPolicy[]>('notify-policies');
  return res.data;
}

export async function patchNotifyPolicy(
  id: number,
  patch: Partial<Pick<NotifyPolicy, 'notify_level' | 'live_notify_level' | 'web_notify_level'>>,
): Promise<NotifyPolicy> {
  const res = await api.patch<NotifyPolicy>(`notify-policies/${id}`, patch);
  return res.data;
}

export function useNotifyPolicies() {
  return useQuery({ queryKey: ['notify-policies'], queryFn: fetchNotifyPolicies });
}

export function usePatchNotifyPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number } & Partial<Pick<NotifyPolicy, 'notify_level' | 'live_notify_level' | 'web_notify_level'>>) =>
      patchNotifyPolicy(id, patch),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['notify-policies'] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  User project settings                                              */
/* ------------------------------------------------------------------ */

export async function fetchUserProjectSettings(): Promise<UserProjectSettings[]> {
  const res = await api.get<UserProjectSettings[]>('user-project-settings');
  return res.data;
}

export async function patchUserProjectSettings(
  id: number,
  patch: { homepage: number },
): Promise<UserProjectSettings> {
  const res = await api.patch<UserProjectSettings>(`user-project-settings/${id}`, patch);
  return res.data;
}

export function useUserProjectSettings() {
  return useQuery({ queryKey: ['user-project-settings'], queryFn: fetchUserProjectSettings });
}

export function usePatchUserProjectSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, homepage }: { id: number; homepage: number }) =>
      patchUserProjectSettings(id, { homepage }),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['user-project-settings'] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Verify email                                                       */
/* ------------------------------------------------------------------ */

export async function sendVerificationEmail(): Promise<void> {
  await api.post('users/send_verification_email');
}

/* ------------------------------------------------------------------ */
/*  Delete / cancel account                                            */
/* ------------------------------------------------------------------ */

export async function deleteAccount(): Promise<void> {
  await api.post('users/cancel');
}

/* ------------------------------------------------------------------ */
/*  Projects by user (for profile page)                                */
/* ------------------------------------------------------------------ */

export async function fetchProjectsByUser(userId: number): Promise<import('@/types/api').ProjectSummary[]> {
  const res = await api.get<import('@/types/api').ProjectSummary[]>('projects', {
    params: { member: userId, order_by: 'memberships__user_order' },
  });
  return res.data;
}

export function useProjectsByUser(userId: number | undefined) {
  return useQuery({
    queryKey: ['projects', 'by_user', userId],
    queryFn: () => fetchProjectsByUser(userId as number),
    enabled: !!userId,
  });
}
