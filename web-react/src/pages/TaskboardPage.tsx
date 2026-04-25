import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import { milestones as milestonesApi, tasks as tasksApi, userstories } from '../api/resources';
import type { Project, Task, UserStory, Milestone, Status } from '../types';
import Loader from '../components/common/Loader';

function TaskCard({ task, project }: { task: Task; project: Project }) {
  return (
    <div
      className={`taskboard-card ${task.is_iocaine ? 'iocaine' : ''}`}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', String(task.id))}
    >
      <Link to={`/project/${project.slug}/task/${task.ref}`} className="ref-link">
        #{task.ref}
      </Link>
      <div className="taskboard-card-subject">{task.subject}</div>
      {task.assigned_to_extra_info && (
        <div className="taskboard-card-assigned">
          {task.assigned_to_extra_info.full_name_display}
        </div>
      )}
    </div>
  );
}

export default function TaskboardPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { sslug } = useParams<{ sslug: string }>();
  const queryClient = useQueryClient();

  const { data: sprintsList } = useQuery({
    queryKey: ['milestones', project.id],
    queryFn: async () => {
      const res = await milestonesApi.list(project.id);
      return res.data;
    },
  });

  const milestone = sprintsList?.find((m: Milestone) => m.slug === sslug);

  const { data: tasksList, isLoading: tasksLoading } = useQuery({
    queryKey: ['sprint-tasks', project.id, milestone?.id],
    queryFn: async () => {
      if (!milestone) return [];
      const res = await tasksApi.list({ project: project.id, milestone: milestone.id });
      return res.data;
    },
    enabled: !!milestone,
  });

  const { data: sprintStories, isLoading: storiesLoading } = useQuery({
    queryKey: ['sprint-stories', project.id, milestone?.id],
    queryFn: async () => {
      if (!milestone) return [];
      const res = await userstories.list({ project: project.id, milestone: milestone.id });
      return res.data;
    },
    enabled: !!milestone,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, statusId }: { taskId: number; statusId: number }) => {
      await tasksApi.update(taskId, { status: statusId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprint-tasks'] });
    },
  });

  if (!sprintsList) return <Loader />;
  if (!milestone) {
    return (
      <div className="error-page">
        <h1>Sprint not found</h1>
        <p>Sprint "{sslug}" not found.</p>
      </div>
    );
  }

  if (tasksLoading || storiesLoading) return <Loader />;

  const taskStatuses = project.task_statuses.slice().sort((a, b) => a.order - b.order);

  const tasksByUs = new Map<number | null, Task[]>();
  for (const t of tasksList || []) {
    const key = t.user_story;
    if (!tasksByUs.has(key)) tasksByUs.set(key, []);
    tasksByUs.get(key)!.push(t);
  }

  const handleDrop = (e: React.DragEvent, statusId: number) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (taskId) {
      updateTaskMutation.mutate({ taskId, statusId });
    }
  };

  return (
    <div className="taskboard-page">
      <div className="taskboard-header">
        <h1>Taskboard: {milestone.name}</h1>
        <div className="sprint-dates">
          {milestone.estimated_start} → {milestone.estimated_finish}
        </div>
      </div>
      <div className="taskboard-grid">
        <div className="taskboard-header-row">
          <div className="taskboard-us-header">User Story</div>
          {taskStatuses.map((st: Status) => (
            <div key={st.id} className="taskboard-status-header">
              <span className="status-color" style={{ backgroundColor: st.color }} />
              {st.name}
            </div>
          ))}
        </div>
        {(sprintStories || []).map((us: UserStory) => (
          <div key={us.id} className="taskboard-row">
            <div className="taskboard-us-cell">
              <Link to={`/project/${project.slug}/us/${us.ref}`}>
                #{us.ref} {us.subject}
              </Link>
            </div>
            {taskStatuses.map((st: Status) => (
              <div
                key={st.id}
                className="taskboard-cell"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, st.id)}
              >
                {(tasksByUs.get(us.id) || [])
                  .filter((t) => t.status === st.id)
                  .map((t) => (
                    <TaskCard key={t.id} task={t} project={project} />
                  ))}
              </div>
            ))}
          </div>
        ))}
        {/* Orphan tasks (no user story) */}
        {(tasksByUs.get(null) || []).length > 0 && (
          <div className="taskboard-row">
            <div className="taskboard-us-cell orphan">Unassigned tasks</div>
            {taskStatuses.map((st: Status) => (
              <div
                key={st.id}
                className="taskboard-cell"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, st.id)}
              >
                {(tasksByUs.get(null) || [])
                  .filter((t) => t.status === st.id)
                  .map((t) => (
                    <TaskCard key={t.id} task={t} project={project} />
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
