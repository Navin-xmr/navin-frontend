import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddressBookSection from './AddressBookSection';
import type { Address } from '@services/api/endpoints/addresses';

const api = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  setDefault: vi.fn(),
}));

vi.mock('@services/api/endpoints/addresses', () => ({ addressesApi: api }));

const addresses: Address[] = [
  {
    _id: 'addr-1',
    label: 'Warehouse',
    name: 'Alex Smith',
    phone: '+1 555-0100',
    street: '1 Main Street',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postalCode: '60601',
    isDefault: false,
  },
  {
    _id: 'addr-2',
    label: 'Head Office',
    name: 'Jamie Lee',
    phone: '+1 555-0200',
    street: '2 Market Street',
    city: 'Houston',
    state: 'TX',
    country: 'USA',
    postalCode: '77002',
    isDefault: true,
  },
];

function mockLoadedAddresses() {
  api.getAll.mockResolvedValue(addresses);
}

describe('AddressBookSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading and then the saved addresses', async () => {
    mockLoadedAddresses();
    render(<AddressBookSection />);

    expect(screen.getByText('Loading addresses…')).toBeInTheDocument();
    expect(await screen.findByText('Warehouse')).toBeInTheDocument();
    expect(screen.getByText('Head Office')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('shows the empty state when loading fails', async () => {
    api.getAll.mockRejectedValue(new Error('network error'));
    render(<AddressBookSection />);

    expect(
      await screen.findByText(/No saved addresses yet/i),
    ).toBeInTheDocument();
  });

  it('validates required fields before creating an address', async () => {
    mockLoadedAddresses();
    const user = userEvent.setup();
    render(<AddressBookSection />);

    await screen.findByText('Warehouse');
    await user.click(screen.getByRole('button', { name: 'Add Address' }));
    const saveButtons = screen.getAllByRole('button', { name: 'Add Address' });
    await user.click(saveButtons[saveButtons.length - 1]);

    expect(screen.getByText('Label is required')).toBeInTheDocument();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Postal code is required')).toBeInTheDocument();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('creates a valid address and refreshes the list', async () => {
    api.getAll
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([addresses[0]]);
    api.create.mockResolvedValue({});
    const user = userEvent.setup();
    render(<AddressBookSection />);

    await screen.findByText(/No saved addresses yet/i);
    await user.click(screen.getByRole('button', { name: 'Add Address' }));

    const fields = [
      ['e.g. Head Office, Warehouse B', 'New Depot'],
      ['John Doe', 'Taylor Morgan'],
      ['+1 555-0123', '+1 555-0300'],
      ['123 Main Street, Suite 100', '3 River Road'],
      ['New York', 'Austin'],
      ['NY', 'TX'],
      ['United States', 'USA'],
      ['10001', '78701'],
    ] as const;
    for (const [placeholder, value] of fields) {
      const input = screen.getByPlaceholderText(placeholder);
      fireEvent.change(input, { target: { value } });
    }

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Add Address' }));

    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    expect(api.create).toHaveBeenCalledWith({
      label: 'New Depot',
      name: 'Taylor Morgan',
      phone: '+1 555-0300',
      street: '3 River Road',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      postalCode: '78701',
      isDefault: false,
    });
    expect(await screen.findByText('Warehouse')).toBeInTheDocument();
  });

  it('sets a saved address as default and removes an address after confirmation', async () => {
    mockLoadedAddresses();
    api.setDefault.mockResolvedValue({});
    api.delete.mockResolvedValue({});
    const user = userEvent.setup();
    render(<AddressBookSection />);

    await screen.findByText('Warehouse');
    await user.click(screen.getByTitle('Set as default'));
    await waitFor(() => expect(api.setDefault).toHaveBeenCalledWith('addr-1'));
    expect(screen.getAllByText('Default')).toHaveLength(1);
    expect(screen.getByText('Warehouse').parentElement).toHaveTextContent('Default');

    await user.click(screen.getAllByTitle('Delete')[0]);
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    const deleteDialog = screen.getByRole('dialog');
    await user.click(within(deleteDialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('addr-1'));
    expect(screen.queryByText('Warehouse')).not.toBeInTheDocument();
  });
});
