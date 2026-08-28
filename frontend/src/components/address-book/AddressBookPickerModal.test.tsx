import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AddressBookPickerModal from './AddressBookPickerModal';
import type { Address } from '@services/api/endpoints/addresses';

const getAllMock = vi.fn();

vi.mock('@services/api/endpoints/addresses', () => ({
  addressesApi: {
    getAll: () => getAllMock(),
  },
}));

const addresses: Address[] = [
  {
    _id: 'a1',
    label: 'Home',
    name: 'Alex Smith',
    phone: '555-1000',
    street: '1 Main St',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postalCode: '60601',
    isDefault: false,
  },
  {
    _id: 'a2',
    label: 'Office',
    name: 'Jamie Lee',
    phone: '555-2000',
    street: '2 Market St',
    city: 'Houston',
    state: 'TX',
    country: 'USA',
    postalCode: '77002',
    isDefault: true,
  },
];

describe('AddressBookPickerModal', () => {
  beforeEach(() => {
    getAllMock.mockReset();
  });

  it('renders nothing when closed', () => {
    render(<AddressBookPickerModal isOpen={false} onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.queryByText('Select Address')).not.toBeInTheDocument();
  });

  it('shows a loading state then the fetched addresses, default first', async () => {
    getAllMock.mockResolvedValue(addresses);
    render(<AddressBookPickerModal isOpen onClose={vi.fn()} onSelect={vi.fn()} />);

    expect(screen.getByText('Loading addresses…')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument());
    expect(screen.getByText('Office')).toBeInTheDocument();

    const labels = screen.getAllByText(/Home|Office/).map((el) => el.textContent);
    expect(labels).toEqual(['Office', 'Home']);
  });

  it('shows an empty state message when there are no saved addresses', async () => {
    getAllMock.mockResolvedValue([]);
    render(<AddressBookPickerModal isOpen onClose={vi.fn()} onSelect={vi.fn()} />);

    expect(
      await screen.findByText('No saved addresses. Add one in Settings.')
    ).toBeInTheDocument();
  });

  it('shows an empty state on fetch failure', async () => {
    getAllMock.mockRejectedValue(new Error('network error'));
    render(<AddressBookPickerModal isOpen onClose={vi.fn()} onSelect={vi.fn()} />);

    expect(
      await screen.findByText('No saved addresses. Add one in Settings.')
    ).toBeInTheDocument();
  });

  it('filters addresses by search text', async () => {
    getAllMock.mockResolvedValue(addresses);
    render(<AddressBookPickerModal isOpen onClose={vi.fn()} onSelect={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText('Search addresses…'), 'Houston');

    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.getByText('Office')).toBeInTheDocument();
  });

  it('selects an address and closes the modal', async () => {
    getAllMock.mockResolvedValue(addresses);
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<AddressBookPickerModal isOpen onClose={onClose} onSelect={onSelect} />);

    await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Home'));

    expect(onSelect).toHaveBeenCalledWith(addresses[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
