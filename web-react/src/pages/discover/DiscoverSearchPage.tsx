import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DiscoverSearchBar } from './DiscoverSearchBar';
import { DiscoverSearchListHeader } from './DiscoverSearchListHeader';
import { useTaigaConfig } from '../../contexts/ConfigContext';
import { listProjects } from '../../api/projects';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import type { ProjectSummary } from '../../api/types';
import { resolveNavUrl } from '../../lib/navUrls';
import { filterParamsForDiscover } from '../../lib/discoverSearchParams';

export function DiscoverSearchPage() {
  const { t } = useTranslation();
  const config = useTaigaConfig();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('text') || '';
  const filter = searchParams.get('filter') || 'all';
  const orderBy = searchParams.get('order_by') || '';

  useDocumentMeta(t('DISCOVER.SEARCH.PAGE_TITLE'), t('DISCOVER.SEARCH.PAGE_DESCRIPTION'));

  const [page, setPage] = useState(1);
  const [results, setResults] = useState<ProjectSummary[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const runSearch = useCallback(
    async (pageNum: number, append: boolean) => {
      const extra = filterParamsForDiscover(filter);
      const { projects, nextPage } = await listProjects(config, {
        discover_mode: true,
        page: pageNum,
        q: q || undefined,
        order_by: orderBy || undefined,
        ...extra,
      });
      setHasNext(nextPage);
      if (append) setResults((prev) => [...prev, ...projects]);
      else setResults(projects);
    },
    [config, filter, orderBy, q],
  );

  const signature = useMemo(() => `${q}|${filter}|${orderBy}`, [q, filter, orderBy]);

  useEffect(() => {
    setPage(1);
    let cancelled = false;
    (async () => {
      setLoadingGlobal(true);
      try {
        await runSearch(1, false);
      } finally {
        if (!cancelled) setLoadingGlobal(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signature, runSearch]);

  const onChangeFilter = (newFilter: string, newQ: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('filter', newFilter);
    if (newQ) next.set('text', newQ);
    else next.delete('text');
    setSearchParams(next, { replace: true });
  };

  const onChangeOrder = (ob: string) => {
    const next = new URLSearchParams(searchParams);
    if (ob) next.set('order_by', ob);
    else next.delete('order_by');
    setSearchParams(next, { replace: true });
  };

  const showMore = async () => {
    if (loadingMore || !hasNext) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      await runSearch(nextPage, true);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  const empty = !loadingGlobal && results.length === 0;

  return (
    <div className="discover-search">
      <DiscoverSearchBar mode="search" filter={filter} q={q} onChangeFilter={onChangeFilter} />
      {empty && (
        <div className="empty-large">
          <p className="title" dangerouslySetInnerHTML={{ __html: t('DISCOVER.EMPTY') }} />
        </div>
      )}
      {(results.length > 0 || loadingGlobal) && (
        <div className="discover-results">
          {loadingGlobal && <div className="tg-spin">{t('COMMON.LOADING')}</div>}
          {!loadingGlobal && (
            <div className="discover-results-inner">
              <DiscoverSearchListHeader orderBy={orderBy} onChangeOrder={onChangeOrder} />
              {results.length > 0 && (
                <ul className="project-list">
                  {results.map((project) => (
                    <li key={project.id} className="list-itemtype-project">
                      <div className="list-itemtype-project-left">
                        <a
                          className="list-itemtype-project-image"
                          href={`/${resolveNavUrl('project', { project: project.slug })}`}
                        >
                          {project.logo_small_url ? (
                            <img src={project.logo_small_url} alt={project.name} />
                          ) : (
                            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" />
                          )}
                        </a>
                        <div className="list-itemtype-project-data">
                          <div className="list-itemtype-data-title">
                            <Link to={`/${resolveNavUrl('project', { project: project.slug })}`}>
                              {project.name}
                            </Link>
                          </div>
                          <div className="list-itemtype-data-meta">
                            {(project.description || '').slice(0, 300)}
                            {(project.description?.length || 0) > 300 ? '…' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="list-itemtype-project-right project-statistics">
                        <span className={`statistic${project.is_fan ? ' active' : ''}`}>
                          ♥ <span>{project.total_fans ?? 0}</span>
                        </span>
                        <span className={`statistic${project.is_watcher ? ' active' : ''}`}>
                          ◉ <span>{project.total_watchers ?? 0}</span>
                        </span>
                        <span className={`statistic${project.i_am_member ? ' active' : ''}`}>
                          ⚑ <span>{Array.isArray(project.members) ? project.members.length : 0}</span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {hasNext && (
                <button type="button" className="btn-small more-results" onClick={() => void showMore()} disabled={loadingMore}>
                  {loadingMore ? t('COMMON.LOADING') : t('DISCOVER.VIEW_MORE')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
