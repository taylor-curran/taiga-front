import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProjects, fetchProjectStats } from "../api/backlogApi";
import type { BacklogStats, Project } from "../types/backlogStats";
import BurndownChart from "../components/BurndownChart";
import BacklogSummary from "../components/BacklogSummary";

const BURNDOWN_COLLAPSED_KEY = "taiga.backlog.burndownCollapsed";

interface BacklogPageProps {
  onLogout: () => void;
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(BURNDOWN_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean): void {
  try {
    localStorage.setItem(BURNDOWN_COLLAPSED_KEY, value ? "true" : "false");
  } catch {
    // ignore storage errors
  }
}

export default function BacklogPage({ onLogout }: BacklogPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [stats, setStats] = useState<BacklogStats | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed());

  useEffect(() => {
    let cancelled = false;
    setLoadingProjects(true);
    setError(null);
    fetchProjects()
      .then((list) => {
        if (cancelled) return;
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId((prev) => prev ?? list[0].id);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load projects.");
      })
      .finally(() => {
        if (!cancelled) setLoadingProjects(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedProjectId == null) return;
    let cancelled = false;
    setLoadingStats(true);
    setError(null);
    setStats(null);
    fetchProjectStats(selectedProjectId)
      .then((data) => {
        if (cancelled) return;
        setStats(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load project stats.");
      })
      .finally(() => {
        if (!cancelled) setLoadingStats(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  const toggleBurndown = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writeCollapsed(next);
      return next;
    });
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  return (
    <div className="backlog-page">
      <header className="backlog-header">
        <h1>Taiga Backlog</h1>
        <div className="backlog-header-controls">
          <label className="project-picker">
            <span>Project:</span>
            <select
              value={selectedProjectId ?? ""}
              disabled={loadingProjects || projects.length === 0}
              onChange={(e) => {
                const next = Number(e.target.value);
                setSelectedProjectId(Number.isFinite(next) ? next : null);
              }}
            >
              {projects.length === 0 ? (
                <option value="">{loadingProjects ? "Loading…" : "No projects"}</option>
              ) : null}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="logout-button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      {error ? <div className="backlog-error">{error}</div> : null}

      {selectedProject && stats ? (
        <section className="backlog-content">
          <h2 className="project-title">{selectedProject.name}</h2>
          <BacklogSummary
            stats={stats}
            onToggleBurndown={toggleBurndown}
            burndownVisible={!collapsed}
          />
          {!collapsed ? (
            <div className="burndown-section">
              <h3>Burndown</h3>
              <BurndownChart stats={stats} />
            </div>
          ) : null}
        </section>
      ) : (
        <div className="backlog-loading">
          {loadingProjects || loadingStats ? "Loading…" : "Select a project to view stats."}
        </div>
      )}
    </div>
  );
}
