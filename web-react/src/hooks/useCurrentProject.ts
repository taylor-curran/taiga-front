import { createContext, useContext } from 'react';
import type { ProjectDetail } from '@/types/api';

export const ProjectContext = createContext<ProjectDetail | null>(null);

export function useCurrentProject(): ProjectDetail {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useCurrentProject must be used inside <ProjectShell>');
  }
  return ctx;
}
