import { create } from 'zustand';

export type ZoomLevel = 0 | 1 | 2 | 3;

/** Which card fields are visible at each zoom level (cumulative). */
const ZOOM_FIELDS: string[][] = [
  ['assigned_to', 'ref'],
  ['subject', 'card-data', 'assigned_to_extended'],
  ['tags', 'extra_info', 'unfold'],
  ['related_tasks', 'attachments'],
];

export function getVisibleFields(level: ZoomLevel): Set<string> {
  const fields = new Set<string>();
  for (let i = 0; i <= level; i++) {
    for (const f of ZOOM_FIELDS[i]) fields.add(f);
  }
  return fields;
}

export interface KanbanFilterState {
  q: string;
  assignedUsers: number[];
  tags: string[];
  epics: number[];
  owners: number[];
  roles: number[];
}

const emptyFilters: KanbanFilterState = {
  q: '',
  assignedUsers: [],
  tags: [],
  epics: [],
  owners: [],
  roles: [],
};

interface KanbanStore {
  zoom: ZoomLevel;
  setZoom: (level: ZoomLevel) => void;

  filters: KanbanFilterState;
  setFilter: <K extends keyof KanbanFilterState>(key: K, value: KanbanFilterState[K]) => void;
  clearFilters: () => void;
  isFilterOpen: boolean;
  toggleFilter: () => void;

  foldedColumns: Set<number>;
  toggleColumnFold: (statusId: number) => void;

  foldedSwimlanes: Set<number>;
  toggleSwimlaneFold: (swimlaneId: number) => void;

  foldedCards: Set<number>;
  toggleCardFold: (usId: number) => void;

  selectedCards: Set<number>;
  toggleCardSelection: (usId: number) => void;
  clearSelection: () => void;
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  zoom: 1,
  setZoom: (level) => set({ zoom: level }),

  filters: { ...emptyFilters },
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: { ...emptyFilters } }),
  isFilterOpen: false,
  toggleFilter: () => set((s) => ({ isFilterOpen: !s.isFilterOpen })),

  foldedColumns: new Set(),
  toggleColumnFold: (statusId) =>
    set((s) => {
      const next = new Set(s.foldedColumns);
      if (next.has(statusId)) next.delete(statusId);
      else next.add(statusId);
      return { foldedColumns: next };
    }),

  foldedSwimlanes: new Set(),
  toggleSwimlaneFold: (swimlaneId) =>
    set((s) => {
      const next = new Set(s.foldedSwimlanes);
      if (next.has(swimlaneId)) next.delete(swimlaneId);
      else next.add(swimlaneId);
      return { foldedSwimlanes: next };
    }),

  foldedCards: new Set(),
  toggleCardFold: (usId) =>
    set((s) => {
      const next = new Set(s.foldedCards);
      if (next.has(usId)) next.delete(usId);
      else next.add(usId);
      return { foldedCards: next };
    }),

  selectedCards: new Set(),
  toggleCardSelection: (usId) =>
    set((s) => {
      const next = new Set(s.selectedCards);
      if (next.has(usId)) next.delete(usId);
      else next.add(usId);
      return { selectedCards: next };
    }),
  clearSelection: () => set({ selectedCards: new Set() }),
}));
