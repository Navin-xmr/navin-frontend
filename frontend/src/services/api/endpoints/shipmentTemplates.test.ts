import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getTemplatePreview, toTemplateFields } from '../../../types/shipmentTemplate';
import type { ShipmentTemplate } from '../../../types/shipmentTemplate';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '../client';
import { shipmentTemplateApi } from './shipmentTemplates';

const mockApiClient = apiClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const STORAGE_KEY = 'navin_shipment_templates';

const sampleFields = {
  origin: 'Chicago, IL',
  destination: 'Houston, TX',
  itemDescription: 'Retail goods',
  weight: '20',
  recipientName: 'Alex',
  recipientContact: 'alex@example.com',
};

const makeTemplate = (overrides: Partial<ShipmentTemplate> = {}): ShipmentTemplate => ({
  id: 'tpl_1',
  name: 'Weekly Route',
  fields: sampleFields,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('shipmentTemplate helpers', () => {
  it('builds template preview with route and weight', () => {
    const preview = getTemplatePreview({
      id: 'tpl_1',
      name: 'NYC to LA',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      fields: {
        origin: 'New York, NY',
        destination: 'Los Angeles, CA',
        itemDescription: 'Electronics',
        weight: '12',
        recipientName: 'Jane Doe',
        recipientContact: 'jane@example.com',
      },
    });

    expect(preview).toBe('New York, NY → Los Angeles, CA · 12 kg');
  });

  it('omits the weight segment from the preview when weight is empty', () => {
    const preview = getTemplatePreview(
      makeTemplate({ fields: { ...sampleFields, weight: '' } }),
    );

    expect(preview).toBe('Chicago, IL → Houston, TX');
  });

  it('excludes delivery date from template fields', () => {
    const fields = toTemplateFields({
      origin: ' Boston ',
      destination: ' Denver ',
      itemDescription: ' Parts ',
      weight: '5',
      recipientName: ' John ',
      recipientContact: ' +1 ',
    });

    expect(fields).toEqual({
      origin: 'Boston',
      destination: 'Denver',
      itemDescription: 'Parts',
      weight: '5',
      recipientName: 'John',
      recipientContact: '+1',
    });
  });
});

describe('shipmentTemplateApi.getAll', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns templates from the API and caches them locally', async () => {
    const templates = [makeTemplate()];
    mockApiClient.get.mockResolvedValueOnce({ data: { data: templates } });

    const result = await shipmentTemplateApi.getAll();

    expect(mockApiClient.get).toHaveBeenCalledWith('/shipment-templates');
    expect(result).toEqual(templates);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(templates);
  });

  it('returns an empty array when the API responds with no data field', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: {} });

    const result = await shipmentTemplateApi.getAll();

    expect(result).toEqual([]);
  });

  it('falls back to local storage templates when the API call fails', async () => {
    const cached = [makeTemplate({ id: 'tpl_cached' })];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

    const result = await shipmentTemplateApi.getAll();

    expect(result).toEqual(cached);
  });

  it('returns an empty array when the API fails and local storage is empty', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

    const result = await shipmentTemplateApi.getAll();

    expect(result).toEqual([]);
  });

  it('returns an empty array when local storage contains invalid JSON', async () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

    const result = await shipmentTemplateApi.getAll();

    expect(result).toEqual([]);
  });

  it('returns an empty array when local storage contains a non-array value', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

    const result = await shipmentTemplateApi.getAll();

    expect(result).toEqual([]);
  });
});

describe('shipmentTemplateApi.create', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates via the API and caches the result locally', async () => {
    const created = makeTemplate({ id: 'tpl_api' });
    mockApiClient.post.mockResolvedValueOnce({ data: { data: created } });

    const result = await shipmentTemplateApi.create({ name: 'Weekly Route', fields: sampleFields });

    expect(mockApiClient.post).toHaveBeenCalledWith('/shipment-templates', {
      name: 'Weekly Route',
      fields: sampleFields,
    });
    expect(result).toEqual(created);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([created]);
  });

  it('deduplicates by id when caching an API-created template locally', async () => {
    const existing = makeTemplate({ id: 'tpl_api', name: 'Old name' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    const created = makeTemplate({ id: 'tpl_api', name: 'New name' });
    mockApiClient.post.mockResolvedValueOnce({ data: { data: created } });

    await shipmentTemplateApi.create({ name: 'New name', fields: sampleFields });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('New name');
  });

  it('falls back to creating a local-only template when the API call fails', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

    const created = await shipmentTemplateApi.create({ name: 'Weekly Route', fields: sampleFields });

    expect(created.id).toMatch(/^tpl_/);
    expect(created.name).toBe('Weekly Route');
    expect(created.fields).toEqual(sampleFields);
    expect(created.createdAt).toBe(created.updatedAt);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(created.id);
  });

  it('trims the name when falling back to local creation', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

    const created = await shipmentTemplateApi.create({ name: '  Padded Name  ', fields: sampleFields });

    expect(created.name).toBe('Padded Name');
  });

  it('appends the local-fallback template to any existing local templates', async () => {
    const existing = makeTemplate({ id: 'tpl_existing' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    mockApiClient.post.mockRejectedValueOnce(new Error('Network error'));

    await shipmentTemplateApi.create({ name: 'New template', fields: sampleFields });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(2);
    expect(stored[0].id).toBe('tpl_existing');
  });
});

describe('shipmentTemplateApi.update', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates via the API and syncs the local cache', async () => {
    const existing = makeTemplate({ id: 'tpl_1', name: 'Old name' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    const updated = makeTemplate({ id: 'tpl_1', name: 'New name' });
    mockApiClient.patch.mockResolvedValueOnce({ data: { data: updated } });

    const result = await shipmentTemplateApi.update('tpl_1', { name: 'New name' });

    expect(mockApiClient.patch).toHaveBeenCalledWith('/shipment-templates/tpl_1', { name: 'New name' });
    expect(result).toEqual(updated);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored[0].name).toBe('New name');
  });

  it('falls back to a local update, merging only the provided fields', async () => {
    const existing = makeTemplate({ id: 'tpl_1', name: 'Old name' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    mockApiClient.patch.mockRejectedValueOnce(new Error('Network error'));

    const updated = await shipmentTemplateApi.update('tpl_1', { name: 'New name' });

    expect(updated.name).toBe('New name');
    expect(updated.fields).toEqual(existing.fields);
    expect(updated.updatedAt).not.toBe(existing.updatedAt);
  });

  it('trims the name during local-fallback update', async () => {
    const existing = makeTemplate({ id: 'tpl_1' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    mockApiClient.patch.mockRejectedValueOnce(new Error('Network error'));

    const updated = await shipmentTemplateApi.update('tpl_1', { name: '  Padded  ' });

    expect(updated.name).toBe('Padded');
  });

  it('updates fields during local-fallback update when fields are provided', async () => {
    const existing = makeTemplate({ id: 'tpl_1' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    mockApiClient.patch.mockRejectedValueOnce(new Error('Network error'));

    const newFields = { ...sampleFields, weight: '99' };
    const updated = await shipmentTemplateApi.update('tpl_1', { fields: newFields });

    expect(updated.fields).toEqual(newFields);
  });

  it('throws when the local-fallback update target does not exist', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    mockApiClient.patch.mockRejectedValueOnce(new Error('Network error'));

    await expect(shipmentTemplateApi.update('missing-id', { name: 'X' })).rejects.toThrow(
      'Template not found',
    );
  });

  it('only updates the matching template, leaving others untouched', async () => {
    const other = makeTemplate({ id: 'tpl_other', name: 'Other' });
    const target = makeTemplate({ id: 'tpl_1', name: 'Target' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([other, target]));
    mockApiClient.patch.mockRejectedValueOnce(new Error('Network error'));

    await shipmentTemplateApi.update('tpl_1', { name: 'Updated target' });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored.find((t: ShipmentTemplate) => t.id === 'tpl_other').name).toBe('Other');
    expect(stored.find((t: ShipmentTemplate) => t.id === 'tpl_1').name).toBe('Updated target');
  });
});

describe('shipmentTemplateApi.delete', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deletes via the API and removes the template from the local cache', async () => {
    const existing = makeTemplate({ id: 'tpl_1' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    mockApiClient.delete.mockResolvedValueOnce({});

    await shipmentTemplateApi.delete('tpl_1');

    expect(mockApiClient.delete).toHaveBeenCalledWith('/shipment-templates/tpl_1');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([]);
  });

  it('still removes the template locally when the API call fails', async () => {
    const existing = makeTemplate({ id: 'tpl_1' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    mockApiClient.delete.mockRejectedValueOnce(new Error('Network error'));

    await shipmentTemplateApi.delete('tpl_1');

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([]);
  });

  it('leaves other templates untouched after deleting one', async () => {
    const target = makeTemplate({ id: 'tpl_1' });
    const other = makeTemplate({ id: 'tpl_2' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([target, other]));
    mockApiClient.delete.mockResolvedValueOnce({});

    await shipmentTemplateApi.delete('tpl_1');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toEqual([other]);
  });

  it('is a no-op on local storage when deleting a non-existent id', async () => {
    const existing = makeTemplate({ id: 'tpl_1' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));
    mockApiClient.delete.mockResolvedValueOnce({});

    await shipmentTemplateApi.delete('does-not-exist');

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([existing]);
  });
});

describe('shipmentTemplateApi local fallback (integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockApiClient.get.mockRejectedValue(new Error('offline'));
    mockApiClient.post.mockRejectedValue(new Error('offline'));
    mockApiClient.patch.mockRejectedValue(new Error('offline'));
    mockApiClient.delete.mockRejectedValue(new Error('offline'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates and reads templates from local storage when the API is unavailable', async () => {
    const created = await shipmentTemplateApi.create({
      name: 'Weekly Route',
      fields: sampleFields,
    });

    const templates = await shipmentTemplateApi.getAll();
    expect(templates).toHaveLength(1);
    expect(created.name).toBe('Weekly Route');
    expect(templates[0].fields.origin).toBe('Chicago, IL');
  });

  it('supports a full offline create → update → delete lifecycle', async () => {
    const created = await shipmentTemplateApi.create({ name: 'Route A', fields: sampleFields });
    expect((await shipmentTemplateApi.getAll())).toHaveLength(1);

    const updated = await shipmentTemplateApi.update(created.id, { name: 'Route A (updated)' });
    expect(updated.name).toBe('Route A (updated)');
    expect((await shipmentTemplateApi.getAll())[0].name).toBe('Route A (updated)');

    await shipmentTemplateApi.delete(created.id);
    expect(await shipmentTemplateApi.getAll()).toEqual([]);
  });
});
