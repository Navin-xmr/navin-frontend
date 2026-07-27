export interface ShipmentTemplateFields {
  origin: string;
  destination: string;
  itemDescription: string;
  weight: string;
  recipientName: string;
  recipientContact: string;
}

export interface ShipmentTemplate {
  id: string;
  name: string;
  fields: ShipmentTemplateFields;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentTemplateRequest {
  name: string;
  fields: ShipmentTemplateFields;
}

export interface UpdateShipmentTemplateRequest {
  name?: string;
  fields?: ShipmentTemplateFields;
}

export function getTemplatePreview(template: ShipmentTemplate): string {
  const { origin, destination, weight } = template.fields;
  const route = `${origin} → ${destination}`;
  return weight ? `${route} · ${weight} kg` : route;
}

export function toTemplateFields(formData: {
  origin: string;
  destination: string;
  itemDescription: string;
  weight: string;
  recipientName: string;
  recipientContact: string;
}): ShipmentTemplateFields {
  return {
    origin: formData.origin.trim(),
    destination: formData.destination.trim(),
    itemDescription: formData.itemDescription.trim(),
    weight: formData.weight.trim(),
    recipientName: formData.recipientName.trim(),
    recipientContact: formData.recipientContact.trim(),
  };
}
