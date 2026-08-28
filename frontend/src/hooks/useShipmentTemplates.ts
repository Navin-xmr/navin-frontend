import { useCallback, useEffect, useState } from 'react';
import { shipmentTemplateApi } from '@services/api/endpoints/shipmentTemplates';
import type {
  CreateShipmentTemplateRequest,
  ShipmentTemplate,
  UpdateShipmentTemplateRequest,
} from '../types/shipmentTemplate';

export function useShipmentTemplates() {
  const [templates, setTemplates] = useState<ShipmentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await shipmentTemplateApi.getAll();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load templates.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void refresh(); }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const createTemplate = useCallback(async (payload: CreateShipmentTemplateRequest) => {
    const created = await shipmentTemplateApi.create(payload);
    setTemplates((prev) => [...prev.filter((item) => item.id !== created.id), created]);
    return created;
  }, []);

  const updateTemplate = useCallback(async (id: string, payload: UpdateShipmentTemplateRequest) => {
    const updated = await shipmentTemplateApi.update(id, payload);
    setTemplates((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    await shipmentTemplateApi.delete(id);
    setTemplates((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    templates,
    isLoading,
    error,
    refresh,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
