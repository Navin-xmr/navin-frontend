import { beforeEach, describe, expect, it } from 'vitest';
import { getTemplatePreview, toTemplateFields } from '../../../types/shipmentTemplate';
import { shipmentTemplateApi } from './shipmentTemplates';

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

describe('shipmentTemplateApi local fallback', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates and reads templates from local storage when API is unavailable', async () => {
    const created = await shipmentTemplateApi.create({
      name: 'Weekly Route',
      fields: {
        origin: 'Chicago, IL',
        destination: 'Houston, TX',
        itemDescription: 'Retail goods',
        weight: '20',
        recipientName: 'Alex',
        recipientContact: 'alex@example.com',
      },
    });

    const templates = await shipmentTemplateApi.getAll();
    expect(templates).toHaveLength(1);
    expect(created.name).toBe('Weekly Route');
    expect(templates[0].fields.origin).toBe('Chicago, IL');
  });
});
