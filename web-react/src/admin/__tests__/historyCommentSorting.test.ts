import { describe, expect, it } from 'vitest';
import { filterNonEmptyComments, sortComments } from '../historyCommentSorting';
import type { HistoryComment } from '../../api/historyTypes';

function c(id: number, text: string): HistoryComment {
  return {
    id,
    comment: text,
    created_at: '2020-01-01T00:00:00Z',
    user: { pk: 1, name: 'U' },
  };
}

describe('sortComments (Angular HistorySection parity)', () => {
  it('older first: preserves API order when reverse is false', () => {
    const input = [c(3, 'third'), c(2, 'second'), c(1, 'first')];
    expect(sortComments(input, false).map((x) => x.id)).toEqual([3, 2, 1]);
  });

  it('newer first: reverses when reverse is true', () => {
    const input = [c(3, 'third'), c(2, 'second'), c(1, 'first')];
    expect(sortComments(input, true).map((x) => x.id)).toEqual([1, 2, 3]);
  });

  it('drops empty comment strings like Angular _.filter', () => {
    const input = [c(1, 'a'), c(2, ''), c(3, 'b')];
    expect(filterNonEmptyComments(input).map((x) => x.id)).toEqual([1, 3]);
  });
});
