import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { userstories, milestones as milestonesApi, projects } from '../api/resources';
import type { Project, UserStory, Milestone } from '../types';
import Loader from '../components/common/Loader';
import { useState, useMemo } from 'react';

interface ProjectStats {
  total_milestones: number;
  total_points: number;
  closed_points: number;
  defined_points: number;
  assigned_points: number;
  speed: number;
  milestones: Array<{
    name: string;
    optimal: number;
    evolution: number | null;
    'team-increment': number;
    'client-increment': number;
  }>;
}

function BurndownChart({ stats }: { stats: ProjectStats }) {
  if (!stats.milestones?.length) return null;

  const ms = stats.milestones;
  const maxVal = Math.max(
    ...ms.map((m) => Math.max(m.optimal, m.evolution ?? 0, Math.abs((m['team-increment'] || 0) + (m['client-increment'] || 0)))),
    1,
  );
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = 700;
  const height = 160;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const xScale = (i: number) => padding.left + (i / Math.max(ms.length - 1, 1)) * plotW;
  const yScale = (v: number) => padding.top + plotH - (v / maxVal) * plotH;

  const optimalPath = ms.map((m, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(m.optimal)}`).join(' ');
  const optimalFill = `${optimalPath} L${xScale(ms.length - 1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`;

  const evolutions = ms.filter((m) => m.evolution != null);
  const evolutionPath = evolutions.map((m, i) => {
    const idx = ms.indexOf(m);
    return `${i === 0 ? 'M' : 'L'}${xScale(idx)},${yScale(m.evolution!)}`;
  }).join(' ');
  const evolutionFill = evolutions.length > 0
    ? `${evolutionPath} L${xScale(ms.indexOf(evolutions[evolutions.length - 1]))},${yScale(0)} L${xScale(ms.indexOf(evolutions[0]))},${yScale(0)} Z`
    : '';

  const yTicks = [0, Math.round(maxVal / 4), Math.round(maxVal / 2), Math.round(maxVal * 3 / 4), Math.round(maxVal)];

  return (
    <div className="burndown-chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={padding.left} y1={yScale(v)} x2={width - padding.right} y2={yScale(v)} stroke="#e5e9f0" strokeWidth={1} />
            <text x={padding.left - 8} y={yScale(v) + 4} textAnchor="end" fontSize={10} fill="#7b88a0">{v}</text>
          </g>
        ))}
        {/* Optimal line (gray) + fill */}
        <path d={optimalFill} fill="rgba(200,201,196,0.2)" />
        <path d={optimalPath} fill="none" stroke="#d8dee9" strokeWidth={2} />
        {ms.map((_, i) => (
          <circle key={`opt-${i}`} cx={xScale(i)} cy={yScale(ms[i].optimal)} r={4} fill="#fff" stroke="#d8dee9" strokeWidth={2} />
        ))}
        {/* Evolution line (green) + fill */}
        {evolutions.length > 0 && (
          <>
            <path d={evolutionFill} fill="rgba(147,196,0,0.2)" />
            <path d={evolutionPath} fill="none" stroke="#a8e440" strokeWidth={2} />
            {evolutions.map((m) => {
              const idx = ms.indexOf(m);
              return <circle key={`evo-${idx}`} cx={xScale(idx)} cy={yScale(m.evolution!)} r={4} fill="#fff" stroke="#a8e440" strokeWidth={2} />;
            })}
          </>
        )}
        {/* X axis label */}
        <text x={width / 2} y={height - 5} textAnchor="middle" fontSize={11} fill="#7b88a0">Sprints</text>
        {/* Y axis label */}
        <text x={12} y={height / 2} textAnchor="middle" fontSize={11} fill="#7b88a0" transform={`rotate(-90, 12, ${height / 2})`}>Points</text>
      </svg>
    </div>
  );
}

function StatsBar({ stats }: { stats: ProjectStats }) {
  const totalPoints = stats.total_points || stats.defined_points || 0;
  const pct = totalPoints > 0 ? Math.round(100 * stats.closed_points / totalPoints) : 0;

  return (
    <div className="backlog-stats-bar">
      <div className="stats-progress">
        <div className="stats-progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <span className="stat-item"><strong>{pct}%</strong></span>
      <span className="stat-item"><strong>{stats.total_points}</strong> <small>project points</small></span>
      <span className="stat-item"><strong>{stats.defined_points}</strong> <small>defined points</small></span>
      <span className="stat-item"><strong>{stats.closed_points}</strong> <small>closed points</small></span>
      <span className="stat-item"><strong>{stats.speed || 0}</strong> <small>points / sprint</small></span>
    </div>
  );
}

function StoryRow({ story, project, showTags }: { story: UserStory; project: Project; showTags: boolean }) {
  const statusInfo = project.us_statuses.find((s) => s.id === story.status);
  return (
    <div className="backlog-row">
      <div className="backlog-row-ref">
        <Link to={`/project/${project.slug}/us/${story.ref}`} className="ref-link">
          #{story.ref}
        </Link>
      </div>
      <div className="backlog-row-subject">
        <Link to={`/project/${project.slug}/us/${story.ref}`}>{story.subject}</Link>
        {showTags && story.tags?.length > 0 && (
          <span className="inline-tags">
            {story.tags.map(([tag, color]) => (
              <span key={tag} className="tag-badge" style={{ backgroundColor: color || '#a9aabc' }}>{tag}</span>
            ))}
          </span>
        )}
        {story.epics?.map((epic) => (
          <span key={epic.id} className="epic-dot" style={{ backgroundColor: epic.color }} title={epic.subject} />
        ))}
      </div>
      <div className="backlog-row-status">
        <span className="status-badge" style={{ borderColor: statusInfo?.color, color: statusInfo?.color }}>
          {statusInfo?.name || 'Unknown'}
        </span>
      </div>
      <div className="backlog-row-points">
        {story.total_points != null ? story.total_points : '-'}
      </div>
      <div className="backlog-row-assigned">
        {story.assigned_to_extra_info?.full_name_display || 'Unassigned'}
      </div>
    </div>
  );
}

function SprintPanel({ milestone, project, showTags }: { milestone: Milestone; project: Project; showTags: boolean }) {
  const [collapsed, setCollapsed] = useState(milestone.closed);
  const pct = milestone.total_points > 0
    ? Math.round(100 * milestone.closed_points / milestone.total_points)
    : 0;

  return (
    <div className={`sprint-panel ${milestone.closed ? 'closed' : 'open'}`}>
      <div className="sprint-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="sprint-toggle">{collapsed ? '▶' : '▼'}</span>
        <h3>
          <Link to={`/project/${project.slug}/taskboard/${milestone.slug}`}>{milestone.name}</Link>
        </h3>
        <div className="sprint-meta">
          <span>{milestone.estimated_start} - {milestone.estimated_finish}</span>
          <span className="sprint-points">
            <strong>{milestone.closed_points}</strong> closed / <strong>{milestone.total_points}</strong> total
          </span>
        </div>
      </div>
      <div className="sprint-progress-bar-container">
        <div className="sprint-progress-bar" style={{ width: `${pct}%` }} />
      </div>
      {!collapsed && (
        <>
          <div className="sprint-stories">
            {milestone.user_stories?.map((us: UserStory) => (
              <StoryRow key={us.id} story={us} project={project} showTags={showTags} />
            ))}
            {(!milestone.user_stories || milestone.user_stories.length === 0) && (
              <p className="empty-state-small">No user stories in this sprint</p>
            )}
          </div>
          <div className="sprint-footer">
            <Link to={`/project/${project.slug}/taskboard/${milestone.slug}`} className="btn btn-secondary btn-sm">
              Sprint Taskboard
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function BacklogPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const queryClient = useQueryClient();
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  void showFilters;

  const { data: stats } = useQuery<ProjectStats>({
    queryKey: ['project-stats', project.id],
    queryFn: async () => {
      const res = await projects.getStats(project.id);
      return res.data as ProjectStats;
    },
  });

  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ['backlog-stories', project.id],
    queryFn: async () => {
      const res = await userstories.list({
        project: project.id,
        milestone__isnull: true,
        order_by: 'backlog_order',
      });
      return res.data;
    },
  });

  const { data: sprintsList, isLoading: sprintsLoading } = useQuery({
    queryKey: ['milestones', project.id],
    queryFn: async () => {
      const res = await milestonesApi.list(project.id, { order_by: '-estimated_start' });
      return res.data;
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (text: string) => {
      await userstories.bulkCreate(project.id, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-stories', project.id] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', project.id] });
      setBulkText('');
      setShowBulk(false);
    },
  });

  const filteredStories = useMemo(() => {
    if (!stories) return [];
    if (!searchQuery.trim()) return stories;
    const q = searchQuery.toLowerCase();
    return stories.filter((s: UserStory) =>
      s.subject.toLowerCase().includes(q) || String(s.ref).includes(q),
    );
  }, [stories, searchQuery]);

  if (storiesLoading || sprintsLoading) return <Loader />;

  return (
    <div className="backlog-page">
      <div className="backlog-top">
        <div className="backlog-top-left">
          <header className="backlog-title-row">
            <h1>Scrum</h1>
          </header>
          {stats && <StatsBar stats={stats} />}
          <div className="graph-toggle">
            <button className={`btn btn-icon ${showGraph ? 'active' : ''}`} onClick={() => setShowGraph(!showGraph)} title="Show/Hide burndown graph">
              📊
            </button>
          </div>
          {showGraph && stats && (
            <div
              {...{ 'tg-backlog-graph': '' }}
              className="backlog-graph-wrapper burndown forecasting"
            >
              <BurndownChart stats={stats} />
            </div>
          )}
        </div>
        {sprintsList && sprintsList.length > 0 && (
          <div className="backlog-top-right">
            <h3>{sprintsList.length} Sprint{sprintsList.length !== 1 ? 's' : ''}</h3>
            {sprintsList.map((milestone: Milestone) => (
              <SprintPanel key={milestone.id} milestone={milestone} project={project} showTags={showTags} />
            ))}
          </div>
        )}
      </div>

      <div className="backlog-toolbar">
        <h2>Backlog <span className="count">{filteredStories.length} user stories</span></h2>
        <div className="backlog-toolbar-actions">
          <button type="button" className="btn btn-default filters-btn" onClick={() => setShowFilters(!showFilters)}>
            Filters
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowBulk(!showBulk)}>
            + Add user stories
          </button>
          <div className="search-input">
            <input
              type="search"
              placeholder="subject or reference"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <label className="toggle-label">
            <input type="checkbox" checked={showTags} onChange={() => setShowTags(!showTags)} />
            Tags
          </label>
        </div>
      </div>

      {showBulk && (
        <div className="bulk-create-form">
          <textarea
            placeholder="Write one user story per line"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={4}
          />
          <div className="bulk-actions">
            <button className="btn btn-primary" onClick={() => bulkCreateMutation.mutate(bulkText)} disabled={!bulkText.trim()}>
              Create
            </button>
            <button className="btn btn-secondary" onClick={() => setShowBulk(false)}>Cancel</button>
          </div>
        </div>
      )}

      <tg-backlog-table className="backlog-list product-backlog">
        <div className="backlog-row backlog-row-header row title">
          <div className="backlog-row-ref">User Story</div>
          <div className="backlog-row-subject" />
          <div className="backlog-row-status">Status</div>
          <div className="backlog-row-points">Points</div>
          <div className="backlog-row-assigned" />
        </div>
        {filteredStories.map((story: UserStory) => (
          <StoryRow key={story.id} story={story} project={project} showTags={showTags} />
        ))}
        {filteredStories.length === 0 && (
          <div className="empty-state">
            <p>{searchQuery ? 'No matching user stories' : 'The backlog is empty'}</p>
          </div>
        )}
      </tg-backlog-table>
    </div>
  );
}
