import { describe, it, expect, beforeEach } from 'vitest';
import { useHistorySettingsStore, getOrderCommentsStorageKey } from './historySettingsStore';

describe('historySettingsStore', () => {
  beforeEach(() => {
    localStorage.removeItem(getOrderCommentsStorageKey());
    useHistorySettingsStore.getState().setOrderCommentsReversed(false);
  });

  it('persists order to localStorage under Angular key', () => {
    useHistorySettingsStore.getState().setOrderCommentsReversed(true);
    expect(localStorage.getItem(getOrderCommentsStorageKey())).toBe('true');
  });

  it('toggles order', () => {
    expect(useHistorySettingsStore.getState().orderCommentsReversed).toBe(false);
    useHistorySettingsStore.getState().toggleOrderComments();
    expect(useHistorySettingsStore.getState().orderCommentsReversed).toBe(true);
  });
});
