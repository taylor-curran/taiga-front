/**
 * Project context.
 *
 * Ports `app/modules/services/project.service.coffee` to React. Tracks the
 * currently-loaded project, computed `activeMembers`, and the current
 * "section" of the UI (used for breadcrumbs).
 */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { projectsResource } from "../api/projects-resource";
import { Project, ProjectMember } from "../api/types";

const REFRESH_INTERVAL_MS = 60 * 10 * 1000; // 10 minutes — matches AngularJS

export type ProjectSection =
  | "project-timeline"
  | "epics"
  | "backlog"
  | "kanban"
  | "backlog-kanban"
  | "issues"
  | "wiki"
  | "team"
  | "search"
  | "admin"
  | null;

export interface ProjectContextValue {
  project: Project | null;
  activeMembers: ProjectMember[];
  section: ProjectSection;
  sectionsBreadcrumb: ProjectSection[];
  isLoading: boolean;
  error: unknown;
  setProject: (project: Project | null) => void;
  setProjectBySlug: (slug: string) => Promise<Project>;
  setSection: (section: ProjectSection) => void;
  fetchProject: () => Promise<Project | null>;
  cleanProject: () => void;
  hasPermission: (permission: string) => boolean;
  isArchived: () => boolean;
  canEdit: (permission: string) => boolean;
  isEpicsDashboardEnabled: () => boolean;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [project, setProjectState] = useState<Project | null>(null);
  const [section, setSectionState] = useState<ProjectSection>(null);
  const [sectionsBreadcrumb, setSectionsBreadcrumb] = useState<ProjectSection[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refreshTimerRef = useRef<number | null>(null);

  const activeMembers = useMemo<ProjectMember[]>(() => {
    if (!project?.members) return [];
    return project.members.filter((m) => m.is_active);
  }, [project]);

  const setProject = useCallback((next: Project | null) => {
    setProjectState(next);
  }, []);

  const cleanProject = useCallback(() => {
    setProjectState(null);
    setSectionState(null);
    setSectionsBreadcrumb([]);
  }, []);

  const setSection = useCallback((next: ProjectSection) => {
    setSectionState(next);
    setSectionsBreadcrumb((prev) => (next ? [...prev, next] : []));
  }, []);

  const fetchProject = useCallback(async (): Promise<Project | null> => {
    if (!project) return null;
    try {
      const fresh = await projectsResource.getBySlug(project.slug);
      setProjectState(fresh);
      return fresh;
    } catch (err) {
      setError(err);
      return null;
    }
  }, [project]);

  const setProjectBySlug = useCallback(
    async (slug: string): Promise<Project> => {
      if (project && project.slug === slug) {
        return project;
      }
      setIsLoading(true);
      setError(null);
      try {
        const fresh = await projectsResource.getBySlug(slug);
        setProjectState(fresh);
        return fresh;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [project],
  );

  // Auto-refresh every 10 minutes while a project is loaded — mirrors AngularJS.
  useEffect(() => {
    if (!project) return;
    if (refreshTimerRef.current !== null) {
      window.clearInterval(refreshTimerRef.current);
    }
    refreshTimerRef.current = window.setInterval(() => {
      void fetchProject();
    }, REFRESH_INTERVAL_MS);
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [project, fetchProject]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!project?.my_permissions) return false;
      return project.my_permissions.includes(permission);
    },
    [project],
  );

  const isArchived = useCallback((): boolean => {
    return Boolean(project?.archived_code);
  }, [project]);

  const canEdit = useCallback(
    (permission: string): boolean => {
      if (isArchived()) return false;
      return hasPermission(permission);
    },
    [isArchived, hasPermission],
  );

  const isEpicsDashboardEnabled = useCallback((): boolean => {
    return Boolean(project?.is_epics_activated);
  }, [project]);

  const value = useMemo<ProjectContextValue>(
    () => ({
      project,
      activeMembers,
      section,
      sectionsBreadcrumb,
      isLoading,
      error,
      setProject,
      setProjectBySlug,
      setSection,
      fetchProject,
      cleanProject,
      hasPermission,
      isArchived,
      canEdit,
      isEpicsDashboardEnabled,
    }),
    [
      project,
      activeMembers,
      section,
      sectionsBreadcrumb,
      isLoading,
      error,
      setProject,
      setProjectBySlug,
      setSection,
      fetchProject,
      cleanProject,
      hasPermission,
      isArchived,
      canEdit,
      isEpicsDashboardEnabled,
    ],
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used within a <ProjectProvider>");
  }
  return ctx;
}
