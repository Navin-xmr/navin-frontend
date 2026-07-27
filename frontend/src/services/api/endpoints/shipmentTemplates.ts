import { apiClient } from '../client';
import type {
  CreateShipmentTemplateRequest,
  ShipmentTemplate,
  UpdateShipmentTemplateRequest,
} from '../../../types/shipmentTemplate';

const STORAGE_KEY = 'navin_shipment_templates';

function readLocalTemplates(): ShipmentTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShipmentTemplate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalTemplates(templates: ShipmentTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function createLocalTemplate(data: CreateShipmentTemplateRequest): ShipmentTemplate {
  const now = new Date().toISOString();
  const template: ShipmentTemplate = {
    id: `tpl_${crypto.randomUUID()}`,
    name: data.name.trim(),
    fields: data.fields,
    createdAt: now,
    updatedAt: now,
  };
  const templates = [...readLocalTemplates(), template];
  writeLocalTemplates(templates);
  return template;
}

export const shipmentTemplateApi = {
  async getAll(): Promise<ShipmentTemplate[]> {
    try {
      const res = await apiClient.get<{ data: ShipmentTemplate[] }>('/shipment-templates');
      const templates = res.data.data ?? [];
      writeLocalTemplates(templates);
      return templates;
    } catch {
      return readLocalTemplates();
    }
  },

  async create(data: CreateShipmentTemplateRequest): Promise<ShipmentTemplate> {
    try {
      const res = await apiClient.post<{ data: ShipmentTemplate }>('/shipment-templates', data);
      const created = res.data.data;
      const templates = [...readLocalTemplates().filter((item) => item.id !== created.id), created];
      writeLocalTemplates(templates);
      return created;
    } catch {
      return createLocalTemplate(data);
    }
  },

  async update(id: string, data: UpdateShipmentTemplateRequest): Promise<ShipmentTemplate> {
    try {
      const res = await apiClient.patch<{ data: ShipmentTemplate }>(`/shipment-templates/${id}`, data);
      const updated = res.data.data;
      const templates = readLocalTemplates().map((item) => (item.id === id ? updated : item));
      writeLocalTemplates(templates);
      return updated;
    } catch {
      const templates = readLocalTemplates();
      const index = templates.findIndex((item) => item.id === id);
      if (index === -1) throw new Error('Template not found');
      const updated: ShipmentTemplate = {
        ...templates[index],
        ...data,
        name: data.name?.trim() ?? templates[index].name,
        fields: data.fields ?? templates[index].fields,
        updatedAt: new Date().toISOString(),
      };
      templates[index] = updated;
      writeLocalTemplates(templates);
      return updated;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/shipment-templates/${id}`);
    } catch {
      // Fall back to local delete when API is unavailable.
    }
    writeLocalTemplates(readLocalTemplates().filter((item) => item.id !== id));
  },
};
