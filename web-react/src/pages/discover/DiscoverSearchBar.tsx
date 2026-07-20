import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTaigaConfig } from '../../contexts/ConfigContext';
import { fetchDiscoverStats } from '../../api/projects';

type Props =
  | {
      mode: 'home';
      onSubmit: (q: string) => void;
    }
  | {
      mode: 'search';
      filter: string;
      q: string;
      onChangeFilter: (filter: string, q: string) => void;
    };

export function DiscoverSearchBar(props: Props) {
  const { t } = useTranslation();
  const config = useTaigaConfig();
  const [q, setQ] = useState(props.mode === 'search' ? props.q : '');
  const [filter, setFilter] = useState(props.mode === 'search' ? props.filter : 'all');

  useEffect(() => {
    if (props.mode === 'search') {
      setQ(props.q);
      setFilter(props.filter);
    }
  }, [props]);

  const statsQ = useQuery({
    queryKey: ['discover-stats'],
    queryFn: () => fetchDiscoverStats(config),
  });

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (props.mode === 'home') {
      props.onSubmit(q.trim());
    } else {
      props.onChangeFilter(filter, q.trim());
    }
  };

  const selectFilter = (f: string) => {
    setFilter(f);
    if (props.mode === 'search') {
      props.onChangeFilter(f, q.trim());
    }
  };

  const count = statsQ.data ?? null;

  return (
    <div className="discover-header">
      <div className="discover-header-inner">
        <h1 className="title">{t('DISCOVER.DISCOVER_TITLE')}</h1>
        {count !== null && (
          <p className="project-number">
            {t('DISCOVER.DISCOVER_SUBTITLE', { projects: String(count) })}
          </p>
        )}
        <form onSubmit={submit}>
          <div className="searchbox">
            <button type="submit" className="search-button" aria-label={t('DISCOVER.SEARCH.ACTION_TITLE')}>
              ⌕
            </button>
            <input
              name="search"
              type="text"
              placeholder={t('DISCOVER.SEARCH.INPUT_PLACEHOLDER')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {props.mode === 'search' && (
            <fieldset className="searchbox-filters">
              {(['all', 'kanban', 'scrum', 'people'] as const).map((f) => (
                <label key={f} className={filter === f ? 'active' : ''}>
                  <input
                    type="radio"
                    name="filter-search"
                    checked={filter === f}
                    onChange={() => selectFilter(f)}
                  />
                  {t(`DISCOVER.FILTERS.${f.toUpperCase()}` as 'DISCOVER.FILTERS.ALL')}
                </label>
              ))}
            </fieldset>
          )}
        </form>
      </div>
    </div>
  );
}
