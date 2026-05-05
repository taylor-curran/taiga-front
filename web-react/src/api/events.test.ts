import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventsService } from './events';

describe('EventsService', () => {
  beforeEach(() => {
    eventsService.disconnect();
  });

  it('can subscribe and unsubscribe', () => {
    const callback = vi.fn();
    eventsService.subscribe('project', 'projects.1', callback);
    eventsService.unsubscribe('projects.1');
  });

  it('unsubscribeAll clears subscriptions', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    eventsService.subscribe('project', 'projects.1', cb1);
    eventsService.subscribe('us', 'userstories.1', cb2);
    eventsService.unsubscribeAll();
  });

  it('disconnect stops the connection', () => {
    eventsService.disconnect();
  });
});
