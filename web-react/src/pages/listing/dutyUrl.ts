import type { DashboardDuty } from '@/api/homeDashboard';

/**
 * `app/coffee/app.coffee` project ref route: `/project/:pslug/t/:ref`
 */
export function dutyDetailHref(d: DashboardDuty): string {
  return `/project/${d.projectInfo.slug}/t/${d.ref}`;
}
