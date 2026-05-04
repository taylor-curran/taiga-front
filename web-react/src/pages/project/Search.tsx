import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';

interface SearchResults {
  count: number;
  userstories?: { id: number; ref: number; subject: string }[];
  tasks?: { id: number; ref: number; subject: string }[];
  issues?: { id: number; ref: number; subject: string }[];
  epics?: { id: number; ref: number; subject: string }[];
  wikipages?: { id: number; slug: string }[];
}

export function SearchPage() {
  const project = useCurrentProject();
  const [q, setQ] = useState('');
  const [active, setActive] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['project-search', project.id, active],
    enabled: !!active,
    queryFn: async () => {
      const res = await api.get<SearchResults>('search', {
        params: { project: project.id, text: active },
      });
      return res.data;
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setActive(q.trim());
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Search</h1>
      </header>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="input"
          placeholder="Search this project…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-primary" type="submit">
          Search
        </button>
      </form>
      {!active && (
        <p className="text-sm text-taiga-grey-light">Type a query to begin.</p>
      )}
      {isLoading && active && <Loading />}
      {error && <ErrorBox error={error} />}
      {data && data.count === 0 && active && (
        <Empty title="No results" message={`Nothing matched "${active}".`} />
      )}
      {data && (data.count ?? 0) > 0 && (
        <div className="space-y-4">
          <Section
            title="User stories"
            items={(data.userstories ?? []).map((i) => ({
              key: `us-${i.id}`,
              label: `#${i.ref} ${i.subject}`,
              to: `/project/${project.slug}/us/${i.ref}`,
            }))}
          />
          <Section
            title="Tasks"
            items={(data.tasks ?? []).map((i) => ({
              key: `task-${i.id}`,
              label: `#${i.ref} ${i.subject}`,
              to: `/project/${project.slug}/task/${i.ref}`,
            }))}
          />
          <Section
            title="Issues"
            items={(data.issues ?? []).map((i) => ({
              key: `issue-${i.id}`,
              label: `#${i.ref} ${i.subject}`,
              to: `/project/${project.slug}/issue/${i.ref}`,
            }))}
          />
          <Section
            title="Epics"
            items={(data.epics ?? []).map((i) => ({
              key: `epic-${i.id}`,
              label: `#${i.ref} ${i.subject}`,
              to: `/project/${project.slug}/epic/${i.ref}`,
            }))}
          />
          <Section
            title="Wiki"
            items={(data.wikipages ?? []).map((i) => ({
              key: `wiki-${i.id}`,
              label: i.slug,
              to: `/project/${project.slug}/wiki/${i.slug}`,
            }))}
          />
        </div>
      )}
    </div>
  );
}

interface Item {
  key: string;
  label: string;
  to: string;
}

function Section({ title, items }: { title: string; items: Item[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold mb-2 text-taiga-grey-light uppercase tracking-wide">
        {title} ({items.length})
      </h2>
      <ul className="card divide-y divide-taiga-grey-lighter/40">
        {items.map((item) => (
          <li key={item.key} className="px-4 py-2 hover:bg-taiga-bg/60">
            <Link to={item.to} className="text-taiga-text">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
