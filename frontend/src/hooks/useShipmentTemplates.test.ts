import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useShipmentTemplates } from './useShipmentTemplates';
import { shipmentTemplateApi } from '@services/api/endpoints/shipmentTemplates';
import type { ShipmentTemplate } from '../types/shipmentTemplate';

vi.mock('@services/api/endpoints/shipmentTemplates', () => ({
  shipmentTemplateApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockTemplates: ShipmentTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Standard Route',
    origin: 'New York',
    destination: 'London',
    priority: 'STANDARD',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('useShipmentTemplates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches templates on mount', async () => {
    vi.mocked(shipmentTemplateApi.getAll).mockResolvedValue(mockTemplates);

    const { result } = renderHook(() => useShipmentTemplates());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(shipmentTemplateApi.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.templates).toEqual(mockTemplates);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles error when fetching templates fails', async () => {
    vi.mocked(shipmentTemplateApi.getAll).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useShipmentTemplates());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Fetch failed');
    expect(result.current.templates).toEqual([]);
  });

  it('handles non-Error thrown during fetch', async () => {
    vi.mocked(shipmentTemplateApi.getAll).mockRejectedValue('Unknown string error');

    const { result } = renderHook(() => useShipmentTemplates());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Unable to load templates.');
  });

  it('creates template and appends it to state', async () => {
    vi.mocked(shipmentTemplateApi.getAll).mockResolvedValue([]);
    const created: ShipmentTemplate = {
      id: 'tmpl-2',
      name: 'Express Route',
      origin: 'Tokyo',
      destination: 'Seoul',
      priority: 'URGENT',
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    };
    vi.mocked(shipmentTemplateApi.create).mockResolvedValue(created);

    const { result } = renderHook(() => useShipmentTemplates());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    let res: ShipmentTemplate | undefined;
    await act(async () => {
      res = await result.current.createTemplate({
        name: 'Express Route',
        origin: 'Tokyo',
        destination: 'Seoul',
        priority: 'URGENT',
      });
    });

    expect(shipmentTemplateApi.create).toHaveBeenCalled();
    expect(res).toEqual(created);
    expect(result.current.templates).toContainEqual(created);
  });

  it('updates an existing template', async () => {
    vi.mocked(shipmentTemplateApi.getAll).mockResolvedValue(mockTemplates);
    const updated: ShipmentTemplate = {
      ...mockTemplates[0],
      name: 'Updated Route',
    };
    vi.mocked(shipmentTemplateApi.update).mockResolvedValue(updated);

    const { result } = renderHook(() => useShipmentTemplates());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    let res: ShipmentTemplate | undefined;
    await act(async () => {
      res = await result.current.updateTemplate('tmpl-1', { name: 'Updated Route' });
    });

    expect(shipmentTemplateApi.update).toHaveBeenCalledWith('tmpl-1', { name: 'Updated Route' });
    expect(res).toEqual(updated);
    expect(result.current.templates[0].name).toBe('Updated Route');
  });

  it('deletes template from state', async () => {
    vi.mocked(shipmentTemplateApi.getAll).mockResolvedValue(mockTemplates);
    vi.mocked(shipmentTemplateApi.delete).mockResolvedValue();

    const { result } = renderHook(() => useShipmentTemplates());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.templates).toHaveLength(1);

    await act(async () => {
      await result.current.deleteTemplate('tmpl-1');
    });

    expect(shipmentTemplateApi.delete).toHaveBeenCalledWith('tmpl-1');
    expect(result.current.templates).toHaveLength(0);
  });

  it('manually refreshes templates', async () => {
    vi.mocked(shipmentTemplateApi.getAll).mockResolvedValue([]);

    const { result } = renderHook(() => useShipmentTemplates());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    vi.mocked(shipmentTemplateApi.getAll).mockResolvedValue(mockTemplates);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.templates).toEqual(mockTemplates);
    expect(result.current.error).toBeNull();
  });
});
