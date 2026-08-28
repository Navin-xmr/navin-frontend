import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CreateShipment from './CreateShipment';
import type { ShipmentTemplate } from '../../../../types/shipmentTemplate';
import type { Shipment } from '@services/api/endpoints/shipments';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const createShipmentMock = vi.fn();

vi.mock('@services/api/endpoints/shipments', async () => {
  const actual = await vi.importActual<typeof import('@services/api/endpoints/shipments')>(
    '@services/api/endpoints/shipments'
  );
  return {
    ...actual,
    shipmentApi: {
      ...actual.shipmentApi,
      create: (...args: Parameters<typeof actual.shipmentApi.create>) => createShipmentMock(...args),
    },
  };
});

const getAllAddressesMock = vi.fn();

vi.mock('@services/api/endpoints/addresses', async () => {
  const actual = await vi.importActual<typeof import('@services/api/endpoints/addresses')>(
    '@services/api/endpoints/addresses'
  );
  return {
    ...actual,
    addressesApi: {
      ...actual.addressesApi,
      getAll: () => getAllAddressesMock(),
    },
  };
});

const addToastMock = vi.fn();

vi.mock('@context/ToastContext', () => ({
  useToast: () => ({ addToast: addToastMock, removeToast: vi.fn() }),
}));

const useShipmentTemplatesMock = vi.fn();

vi.mock('@hooks/useShipmentTemplates', () => ({
  useShipmentTemplates: () => useShipmentTemplatesMock(),
}));

const emptyTemplatesState = {
  templates: [] as ShipmentTemplate[],
  isLoading: false,
  error: null,
  refresh: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
};

const mockTemplate: ShipmentTemplate = {
  id: 'tpl-1',
  name: 'Weekly Route',
  fields: {
    origin: 'Chicago, IL',
    destination: 'Houston, TX',
    itemDescription: 'Retail goods',
    weight: '20',
    recipientName: 'Alex Smith',
    recipientContact: 'alex@example.com',
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockShipment: Shipment = {
  _id: 'ship-501',
  trackingNumber: 'NAV-501',
  origin: 'Warehouse A, New York',
  destination: 'Store B, Los Angeles',
  enterpriseId: '',
  logisticsId: '',
  status: 'CREATED',
  milestones: [],
  createdAt: '2024-05-01T00:00:00.000Z',
  updatedAt: '2024-05-01T00:00:00.000Z',
};

function renderCreateShipment() {
  return render(
    <MemoryRouter>
      <CreateShipment />
    </MemoryRouter>
  );
}

function fillValidRequiredFields() {
  fireEvent.change(screen.getByLabelText('Origin Address'), { target: { value: 'Warehouse A, New York' } });
  fireEvent.change(screen.getByLabelText('Destination Address'), { target: { value: 'Store B, Los Angeles' } });
  fireEvent.change(screen.getByLabelText('Item Description'), { target: { value: 'Electronics' } });
  fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '12.5' } });
  fireEvent.change(screen.getByLabelText('Recipient Name'), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByLabelText('Recipient Contact'), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText('Expected Delivery Date'), { target: { value: '2026-08-15' } });
}

describe('CreateShipment', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    createShipmentMock.mockReset();
    getAllAddressesMock.mockReset();
    getAllAddressesMock.mockResolvedValue([]);
    addToastMock.mockReset();
    useShipmentTemplatesMock.mockReset();
    useShipmentTemplatesMock.mockReturnValue(emptyTemplatesState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all required fields', () => {
    renderCreateShipment();

    expect(screen.getByLabelText('Origin Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Item Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Weight (kg)')).toBeInTheDocument();
    expect(screen.getByLabelText('Recipient Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Recipient Contact')).toBeInTheDocument();
    expect(screen.getByLabelText('Expected Delivery Date')).toBeInTheDocument();
  });

  it('shows inline validation errors for every required field on empty submit', () => {
    renderCreateShipment();

    fireEvent.click(screen.getByRole('button', { name: 'Create Shipment' }));

    expect(screen.getByText('Origin address is required')).toBeInTheDocument();
    expect(screen.getByText('Destination address is required')).toBeInTheDocument();
    expect(screen.getByText('Item description is required')).toBeInTheDocument();
    expect(screen.getByText('Valid weight is required')).toBeInTheDocument();
    expect(screen.getByText('Recipient name is required')).toBeInTheDocument();
    expect(screen.getByText('Recipient contact is required')).toBeInTheDocument();
    expect(screen.getByText('Expected delivery date is required')).toBeInTheDocument();
    expect(createShipmentMock).not.toHaveBeenCalled();
  });

  it('shows a weight validation error when a non-numeric value is entered', () => {
    renderCreateShipment();

    fireEvent.change(screen.getByLabelText('Origin Address'), { target: { value: 'Warehouse A, New York' } });
    fireEvent.change(screen.getByLabelText('Destination Address'), { target: { value: 'Store B, Los Angeles' } });
    fireEvent.change(screen.getByLabelText('Item Description'), { target: { value: 'Electronics' } });
    fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText('Recipient Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Recipient Contact'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Expected Delivery Date'), { target: { value: '2026-08-15' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Shipment' }));

    expect(screen.getByText('Valid weight is required')).toBeInTheDocument();
    expect(screen.queryByText('Origin address is required')).not.toBeInTheDocument();
    expect(createShipmentMock).not.toHaveBeenCalled();
  });

  it('clears a field error as soon as the user provides a valid value', () => {
    renderCreateShipment();

    fireEvent.click(screen.getByRole('button', { name: 'Create Shipment' }));
    expect(screen.getByText('Origin address is required')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Origin Address'), { target: { value: 'Warehouse A, New York' } });

    expect(screen.queryByText('Origin address is required')).not.toBeInTheDocument();
    expect(screen.getByText('Destination address is required')).toBeInTheDocument();
  });

  it('populates form fields when a template is selected', () => {
    useShipmentTemplatesMock.mockReturnValue({ ...emptyTemplatesState, templates: [mockTemplate] });

    renderCreateShipment();

    fireEvent.change(screen.getByLabelText('Load Template'), { target: { value: mockTemplate.id } });

    expect((screen.getByLabelText('Origin Address') as HTMLInputElement).value).toBe('Chicago, IL');
    expect((screen.getByLabelText('Destination Address') as HTMLInputElement).value).toBe('Houston, TX');
    expect((screen.getByLabelText('Item Description') as HTMLTextAreaElement).value).toBe('Retail goods');
    expect((screen.getByLabelText('Weight (kg)') as HTMLInputElement).value).toBe('20');
    expect((screen.getByLabelText('Recipient Name') as HTMLInputElement).value).toBe('Alex Smith');
    expect((screen.getByLabelText('Recipient Contact') as HTMLInputElement).value).toBe('alex@example.com');
    expect(addToastMock).toHaveBeenCalledWith('Loaded template "Weekly Route"', 'success');
  });

  it('opens the address book picker modal when its button is clicked', async () => {
    renderCreateShipment();

    const addressBookButtons = screen.getAllByRole('button', { name: /Address Book/i });
    fireEvent.click(addressBookButtons[0]);

    // Modal's overlay wrapper carries aria-hidden="true", so the dialog role
    // is excluded from the accessibility tree; query with hidden: true.
    expect(await screen.findByRole('dialog', { hidden: true })).toBeInTheDocument();
    expect(screen.getByText('Select Address')).toBeInTheDocument();
  });

  it('submits the correct payload and shows a success toast', async () => {
    createShipmentMock.mockResolvedValue(mockShipment);

    renderCreateShipment();
    fillValidRequiredFields();

    fireEvent.click(screen.getByRole('button', { name: 'Create Shipment' }));

    expect(await screen.findByText('Shipment Created Successfully!')).toBeInTheDocument();

    expect(createShipmentMock).toHaveBeenCalledWith({
      origin: 'Warehouse A, New York',
      destination: 'Store B, Los Angeles',
      enterpriseId: '',
      logisticsId: '',
      offChainMetadata: {
        itemDescription: 'Electronics',
        weight: '12.5',
        recipientName: 'Jane Doe',
        recipientContact: 'jane@example.com',
        expectedDeliveryDate: '2026-08-15',
      },
    });
    expect(addToastMock).toHaveBeenCalledWith('Shipment created successfully!', 'success');
  });
});
