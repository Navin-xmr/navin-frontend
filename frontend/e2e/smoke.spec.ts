import { expect, test, type Page } from '@playwright/test';

const shipment = {
  _id: 'shp-001',
  id: 'shp-001',
  trackingNumber: 'NAV-E2E-001',
  origin: 'Boston, MA',
  destination: 'Chicago, IL',
  originCity: 'Boston',
  destinationCity: 'Chicago',
  enterpriseId: 'ent-001',
  logisticsId: 'log-001',
  status: 'IN_TRANSIT',
  priority: 'STANDARD',
  milestones: [],
  createdAt: '2026-09-20T12:00:00.000Z',
  updatedAt: '2026-09-24T12:00:00.000Z',
};

const publicShipment = {
  trackingNumber: shipment.trackingNumber,
  status: shipment.status,
  originCity: shipment.originCity,
  destinationCity: shipment.destinationCity,
  expectedDelivery: '2026-10-01T12:00:00.000Z',
  milestones: [],
};

function encodeTokenPart(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function makeToken(role: 'company' | 'customer'): string {
  const header = encodeTokenPart({ alg: 'HS256', typ: 'JWT' });
  const payload = encodeTokenPart({
    sub: `${role}-001`,
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  return `${header}.${payload}.signature`;
}

async function mockApi(page: Page): Promise<() => void> {
  let rejectAuthenticatedRequests = false;
  await page.addInitScript(() => {
    localStorage.setItem('navin_tour_complete', 'true');
  });
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const method = request.method();

    if (pathname.endsWith('/auth/login') && method === 'POST') {
      const credentials = request.postDataJSON() as { email?: string };
      const role = credentials.email?.startsWith('customer') ? 'customer' : 'company';
      await route.fulfill({
        json: {
          data: {
            token: makeToken(role),
            user: {
              id: `${role}-001`,
              email: credentials.email,
              name: role === 'customer' ? 'E2E Customer' : 'E2E Company',
              role,
            },
          },
        },
      });
      return;
    }

    if (pathname.endsWith('/auth/logout')) {
      await route.fulfill({ json: { data: {} } });
      return;
    }

    if (rejectAuthenticatedRequests && method === 'GET' && !pathname.includes('/public/')) {
      await route.fulfill({ status: 401, json: { message: 'Session expired' } });
      return;
    }

    if (pathname.includes('/public/shipments/')) {
      await route.fulfill({ json: { data: publicShipment } });
      return;
    }

    if (pathname.endsWith('/shipments/shp-001')) {
      await route.fulfill({ json: { data: shipment } });
      return;
    }

    if (pathname.endsWith('/shipments')) {
      await route.fulfill({
        json: {
          data: [shipment],
          meta: { nextCursor: null, hasMore: false, total: 1 },
        },
      });
      return;
    }

    if (pathname.endsWith('/analytics/summary')) {
      await route.fulfill({
        json: {
          data: {
            onTimeDeliveryRate: 0,
            onTimeDeliveryRatePrev: 0,
            onTimeDeliverySparkline: [],
            averageTransitDays: 0,
            averageTransitDaysPrev: 0,
            averageTransitDaysSparkline: [],
            totalShipmentsThisMonth: 0,
            totalShipmentsThisMonthPrev: 0,
            totalShipmentsSparkline: [],
            disputeRate: 0,
            disputeRatePrev: 0,
            disputeRateSparkline: [],
          },
        },
      });
      return;
    }

    if (pathname.endsWith('/settlements/summary')) {
      await route.fulfill({
        json: { data: { totalReleased: 0, totalInEscrow: 0, totalPending: 0, sparkline: [] } },
      });
      return;
    }

    if (pathname.endsWith('/notifications/unread-count')) {
      await route.fulfill({ json: { data: { unreadCount: 0 } } });
      return;
    }

    if (pathname.endsWith('/notifications')) {
      await route.fulfill({ json: { data: [], meta: { page: 1, limit: 20, total: 0, hasMore: false } } });
      return;
    }

    if (pathname.includes('/settlements')) {
      await route.fulfill({ json: { data: { data: [], page: 1, limit: 10, total: 0 } } });
      return;
    }

    await route.fulfill({ json: { data: [], meta: { total: 0, hasMore: false } } });
  });

  return () => {
    rejectAuthenticatedRequests = true;
  };
}

async function loginAs(page: Page, role: 'company' | 'customer') {
  const email = role === 'customer' ? 'customer@example.test' : 'company@example.test';
  await page.goto('/login');
  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/^password$/i).fill('password123');
  await page.getByRole('button', { name: /log in/i }).click();
}

test('company login opens the company dashboard', async ({ page }) => {
  await mockApi(page);
  await loginAs(page, 'company');

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: /logistics overview/i })).toBeVisible();
});

test('customer login opens the customer dashboard', async ({ page }) => {
  await mockApi(page);
  await loginAs(page, 'customer');

  await expect(page).toHaveURL(/\/dashboard\/customer$/);
  await expect(page.getByRole('heading', { name: /my shipments/i })).toBeVisible();
});

test('an authenticated user can open shipment detail', async ({ page }) => {
  await mockApi(page);
  await loginAs(page, 'company');
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/dashboard/shipments/shp-001');

  await expect(page.getByRole('heading', { name: `#${shipment._id}` })).toBeVisible();
});

test('public tracking displays the shipment summary', async ({ page }) => {
  await mockApi(page);
  await page.goto(`/track/${shipment.trackingNumber}`);

  await expect(page.getByRole('heading', { name: shipment.trackingNumber })).toBeVisible();
  await expect(page.getByText(shipment.originCity, { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tracking Timeline' })).toBeVisible();
});

test('logout returns the user to login', async ({ page }) => {
  await mockApi(page);
  await loginAs(page, 'company');
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('button', { name: /sign out/i }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel(/email address/i)).toBeVisible();
});

test('a 401 response clears the session and redirects to login', async ({ page }) => {
  const rejectAuthenticatedRequests = await mockApi(page);
  rejectAuthenticatedRequests();
  await loginAs(page, 'company');

  await expect(page).toHaveURL(/\/login$/, { timeout: 10_000 });
  await expect(page.getByLabel(/email address/i)).toBeVisible();
});
