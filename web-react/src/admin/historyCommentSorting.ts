import type { HistoryComment } from '../api/historyTypes';

export function filterNonEmptyComments(list: HistoryComment[]): HistoryComment[] {
  return list.filter((c) => c.comment !== '');
}

export function sortComments(list: HistoryComment[], reverse: boolean): HistoryComment[] {
  const filtered = filterNonEmptyComments(list);
  if (reverse) return [...filtered].reverse();
  return filtered;
}
