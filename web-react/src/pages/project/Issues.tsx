import { useState, useCallback, useMemo } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useIssues,
  useIssueFiltersData,
  useCreateIssue,
  patchIssue,
  deleteIssue,
  type IssueListFilters,
} from '@/services/issues';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { IssuesTable } from '@/components/issues/IssuesTable';
import { IssueFilterBar, type ActiveFilter } from '@/components/issues/IssueFilterBar';
import { BulkActionsBar } from '@/components/issues/BulkActionsBar';
import { CreateIssueModal } from '@/components/issues/CreateIssueModal';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Issue } from '@/types/api';

const PAGE_SIZE = 50;

interface SavedFilter {
  name: string;
  filter: Record<string, string>;
}

export function IssuesPage() {
  const project = useCurrentProject();
  const qc = useQueryClient();

  // Sort
  const [sortField, setSortField] = useState('ref');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filters
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [filterQ, setFilterQ] = useState('');
  const [page, setPage] = useState(1);
  const [showTags, setShowTags] = useState(true);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    try {
      const raw = localStorage.getItem(`issues-saved-filters-${project.id}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const createMutation = useCreateIssue();

  // Build API filters
  const apiFilters = useMemo((): IssueListFilters => {
    const f: IssueListFilters = { project: project.id, page };
    if (filterQ) f.q = filterQ;

    const orderBy = `${sortDir === 'desc' ? '-' : ''}${sortField}`;
    f.order_by = orderBy;

    for (const af of activeFilters) {
      const key = (af.mode === 'exclude' ? `exclude_${af.category}` : af.category) as keyof IssueListFilters;
      const existing = f[key];
      if (typeof existing === 'string') {
        (f as unknown as Record<string, unknown>)[key] = `${existing},${af.id}`;
      } else {
        (f as unknown as Record<string, unknown>)[key] = af.id;
      }
    }

    return f;
  }, [project.id, page, filterQ, sortField, sortDir, activeFilters]);

  // Build filters data params
  const filtersDataParams = useMemo(() => {
    const p: Record<string, unknown> = { project: project.id };
    if (filterQ) p.q = filterQ;
    for (const af of activeFilters) {
      const key = af.mode === 'exclude' ? `exclude_${af.category}` : af.category;
      const existing = p[key];
      if (typeof existing === 'string') {
        p[key] = `${existing},${af.id}`;
      } else {
        p[key] = af.id;
      }
    }
    return p;
  }, [project.id, filterQ, activeFilters]);

  const { data: issuesResult, isLoading, error } = useIssues(apiFilters);
  const { data: filtersData } = useIssueFiltersData(filtersDataParams);

  const issues = issuesResult?.data ?? [];
  const totalCount = issuesResult?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Handlers
  const handleSort = useCallback(
    (field: string) => {
      if (field === sortField) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('asc');
      }
      setPage(1);
    },
    [sortField],
  );

  const handleAddFilter = useCallback(
    (category: string, id: string, mode: 'include' | 'exclude' = 'include') => {
      setActiveFilters((prev) => {
        const exists = prev.find(
          (f) => f.category === category && f.id === id && f.mode === mode,
        );
        if (exists) {
          return prev.filter((f) => f !== exists);
        }
        const items = filtersData?.[
          (category === 'assigned_to'
            ? 'assigned_to'
            : category === 'owner'
              ? 'owners'
              : category === 'role'
                ? 'roles'
                : category === 'tags'
                  ? 'tags'
                  : `${category === 'type' ? 'types' : category === 'severity' ? 'severities' : category === 'priority' ? 'priorities' : 'statuses'}`
          ) as keyof typeof filtersData
        ] as Array<Record<string, unknown>> | undefined;
        const match = items?.find((it) => {
          const itemId = category === 'tags' ? String(it.name) : String(it.id ?? 'null');
          return itemId === id;
        });
        return [
          ...prev,
          {
            category,
            id,
            name: String(
              (match as Record<string, unknown>)?.full_name ??
                (match as Record<string, unknown>)?.name ??
                id,
            ),
            color: ((match as Record<string, unknown>)?.color as string | null) ?? null,
            mode,
          },
        ];
      });
      setPage(1);
    },
    [filtersData],
  );

  const handleRemoveFilter = useCallback((filter: ActiveFilter) => {
    setActiveFilters((prev) =>
      prev.filter(
        (f) => !(f.category === filter.category && f.id === filter.id && f.mode === filter.mode),
      ),
    );
    setPage(1);
  }, []);

  const handleChangeQ = useCallback((q: string) => {
    setFilterQ(q);
    setPage(1);
  }, []);

  const handleSelectSavedFilter = useCallback(
    (sf: SavedFilter) => {
      const newFilters: ActiveFilter[] = [];
      for (const [key, value] of Object.entries(sf.filter)) {
        if (key === 'order_by' || !value) continue;
        const isExclude = key.startsWith('exclude_');
        const category = isExclude ? key.replace('exclude_', '') : key;
        for (const id of value.split(',')) {
          newFilters.push({
            category,
            id,
            name: id,
            mode: isExclude ? 'exclude' : 'include',
          });
        }
      }
      setActiveFilters(newFilters);
      setPage(1);
    },
    [],
  );

  const handleSaveFilter = useCallback(
    (name: string) => {
      const filter: Record<string, string> = {};
      for (const af of activeFilters) {
        const key = af.mode === 'exclude' ? `exclude_${af.category}` : af.category;
        const existing = filter[key];
        filter[key] = existing ? `${existing},${af.id}` : af.id;
      }
      const newSaved = [...savedFilters.filter((f) => f.name !== name), { name, filter }];
      setSavedFilters(newSaved);
      localStorage.setItem(`issues-saved-filters-${project.id}`, JSON.stringify(newSaved));
    },
    [activeFilters, savedFilters, project.id],
  );

  const handleDeleteSavedFilter = useCallback(
    (sf: SavedFilter) => {
      const newSaved = savedFilters.filter((f) => f.name !== sf.name);
      setSavedFilters(newSaved);
      localStorage.setItem(`issues-saved-filters-${project.id}`, JSON.stringify(newSaved));
    },
    [savedFilters, project.id],
  );

  // Selection
  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedIds.size === issues.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(issues.map((i) => i.id)));
    }
  }, [selectedIds, issues]);

  // Bulk operations
  const handleBulkChangeStatus = useCallback(
    async (statusId: number) => {
      await Promise.all(
        Array.from(selectedIds).map((id) => patchIssue(id, { status: statusId })),
      );
      setSelectedIds(new Set());
      qc.invalidateQueries({ queryKey: ['issues'] });
    },
    [selectedIds, qc],
  );

  const handleBulkAssign = useCallback(
    async (userId: number | null) => {
      await Promise.all(
        Array.from(selectedIds).map((id) => patchIssue(id, { assigned_to: userId })),
      );
      setSelectedIds(new Set());
      qc.invalidateQueries({ queryKey: ['issues'] });
    },
    [selectedIds, qc],
  );

  const handleBulkDelete = useCallback(async () => {
    await Promise.all(Array.from(selectedIds).map((id) => deleteIssue(id)));
    setSelectedIds(new Set());
    qc.invalidateQueries({ queryKey: ['issues'] });
  }, [selectedIds, qc]);

  // Create issue
  const handleCreateIssue = useCallback(
    (data: {
      subject: string;
      description: string;
      type: number;
      severity: number;
      priority: number;
      status: number;
      assigned_to: number | null;
      tags: string[];
    }) => {
      createMutation.mutate(
        {
          project: project.id,
          subject: data.subject,
          description: data.description,
          type: data.type,
          severity: data.severity,
          priority: data.priority,
          status: data.status,
          assigned_to: data.assigned_to,
          tags: data.tags.map((t) => [t, null]) as unknown as Issue['tags'],
        },
        {
          onSuccess: () => setCreateModalOpen(false),
        },
      );
    },
    [createMutation, project.id],
  );

  // CSV export
  const handleCsvExport = useCallback(async () => {
    try {
      const res = await api.get<{ url: string }>('issues/csv', {
        params: { project: project.id },
      });
      if (res.data.url) {
        window.open(res.data.url, '_blank');
      }
    } catch {
      // Fallback: construct URL directly
      const base = api.defaults.baseURL || '/api/v1/';
      window.open(`${base}issues/csv?project=${project.id}`, '_blank');
    }
  }, [project.id]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Issues</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-taiga-grey-light">
            {totalCount} issue{totalCount !== 1 ? 's' : ''}
          </span>
          <label className="flex items-center gap-1 text-xs text-taiga-grey-light cursor-pointer">
            <input
              type="checkbox"
              checked={showTags}
              onChange={(e) => setShowTags(e.target.checked)}
              className="accent-taiga-green-dark"
            />
            Tags
          </label>
          <button className="btn btn-sm" onClick={handleCsvExport} title="Export CSV">
            CSV
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setCreateModalOpen(true)}
          >
            + New Issue
          </button>
        </div>
      </header>

      <IssueFilterBar
        filtersData={filtersData}
        activeFilters={activeFilters}
        filterQ={filterQ}
        savedFilters={savedFilters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
        onChangeQ={handleChangeQ}
        onSelectSavedFilter={handleSelectSavedFilter}
        onSaveFilter={handleSaveFilter}
        onDeleteSavedFilter={handleDeleteSavedFilter}
      />

      {selectedIds.size > 0 && (
        <BulkActionsBar
          count={selectedIds.size}
          project={project}
          onChangeStatus={handleBulkChangeStatus}
          onAssign={handleBulkAssign}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      {!isLoading && !error && issues.length === 0 && (
        <Empty title="No issues" message="No issues match the current filters." />
      )}
      {!isLoading && issues.length > 0 && (
        <>
          <IssuesTable
            issues={issues}
            projectSlug={project.slug}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            allSelected={selectedIds.size === issues.length && issues.length > 0}
            sort={{ field: sortField, direction: sortDir }}
            onSort={handleSort}
            showTags={showTags}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-2">
              <button
                className="btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-sm text-taiga-grey-light">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <CreateIssueModal
        project={project}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateIssue}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
