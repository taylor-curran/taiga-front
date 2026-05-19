import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as notifications from '../utils/notifications';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('transfer project', () => {
  test.skip(true, 'Transfer project requires multi-user flow and API token manipulation');
});
