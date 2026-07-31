import { useQuery } from '@tanstack/react-query';
import { projects, resolver } from '../api/resources';
import type { Project } from '../types';

export function useProject(slug: string | undefined) {
  return useQuery<Project>({
    queryKey: ['project', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug');
      const res = await projects.getBySlug(slug);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 30000,
  });
}

export function useProjectById(id: number | undefined) {
  return useQuery<Project>({
    queryKey: ['project-by-id', id],
    queryFn: async () => {
      if (!id) throw new Error('No id');
      const res = await projects.getById(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useResolver(projectSlug: string, params: { us?: number; task?: number; issue?: number; epic?: number; ref?: number }) {
  return useQuery({
    queryKey: ['resolver', projectSlug, params],
    queryFn: async () => {
      const res = await resolver.resolve({ project: projectSlug, ...params });
      return res.data;
    },
    enabled: !!projectSlug,
  });
}
