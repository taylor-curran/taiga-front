import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { projects } from '../api/resources';

type ProjectType = 'scrum' | 'kanban';

export default function CreateProjectPage() {
  const { type: routeType } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<'choose' | 'form'>(routeType ? 'form' : 'choose');
  const [projectType, setProjectType] = useState<ProjectType>(
    (routeType as ProjectType) || 'scrum',
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => projects.create(data),
    onSuccess: (res) => {
      navigate(`/project/${res.data.slug}/`);
    },
    onError: () => setError('Failed to create project. Please try again.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    setError('');
    createMutation.mutate({
      name,
      description,
      is_private: isPrivate,
      creation_template: projectType === 'scrum' ? 1 : 2,
    });
  };

  if (step === 'choose') {
    return (
      <div className="create-project-page">
        <h1>Create a project</h1>
        <p className="create-subtitle">Start by choosing a template</p>
        <div className="project-type-cards">
          <div
            className="project-type-card"
            onClick={() => { setProjectType('scrum'); setStep('form'); }}
          >
            <div className="type-icon">S</div>
            <h3>Scrum</h3>
            <p>For teams that deliver work on a regular cadence with sprints, backlogs, and story points.</p>
          </div>
          <div
            className="project-type-card"
            onClick={() => { setProjectType('kanban'); setStep('form'); }}
          >
            <div className="type-icon">K</div>
            <h3>Kanban</h3>
            <p>For teams that focus on continuous delivery using a board with work-in-progress limits.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-project-page">
      <h1>New {projectType === 'scrum' ? 'Scrum' : 'Kanban'} project</h1>
      {!routeType && (
        <button className="btn btn-link" onClick={() => setStep('choose')}>
          &larr; Back to templates
        </button>
      )}
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit} className="create-project-form">
        <div className="form-field">
          <label htmlFor="project-name">Project name</label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            placeholder="My awesome project"
          />
        </div>
        <div className="form-field">
          <label htmlFor="project-desc">Description</label>
          <textarea
            id="project-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Briefly describe the project..."
          />
        </div>
        <div className="form-field">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            Private project
          </label>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create project'}
        </button>
      </form>
    </div>
  );
}
