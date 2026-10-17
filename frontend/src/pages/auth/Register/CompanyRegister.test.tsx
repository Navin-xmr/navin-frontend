import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CompanyRegister from './CompanyRegister';

const authApiMock = vi.hoisted(() => ({ registerCompany: vi.fn() }));
const clearDraftMock = vi.hoisted(() => vi.fn());
vi.mock('../../../services/api', () => ({ authApi: authApiMock }));
vi.mock('../../../hooks/useFormAutosave', () => ({
  default: () => ({ status: 'idle', lastSavedAt: null, clearDraft: clearDraftMock }),
}));
vi.mock('@components/ui/PasswordStrengthMeter', () => ({
  default: () => <div aria-hidden="true" />,
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register/company']}>
      <CompanyRegister />
      <LocationProbe />
    </MemoryRouter>,
  );
}

async function fillCompanyInfo(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Company Name'), 'Acme Logistics');
  await user.selectOptions(screen.getByLabelText('Industry'), 'Technology & Software');
  await user.selectOptions(screen.getByLabelText('Country'), 'Nigeria');
  await user.selectOptions(screen.getByLabelText('Company Size'), '11–50');
}

async function fillAdminInfo(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full Name'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('Business Email'), 'ada@acme.example');
  await user.type(screen.getByLabelText('Password'), 'SecurePass123!');
  await user.type(screen.getByLabelText('Confirm Password'), 'SecurePass123!');
}

describe('CompanyRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authApiMock.registerCompany.mockResolvedValue(undefined);
  });

  it('shows all step-one validation errors before advancing', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Company name is required')).toBeInTheDocument();
    expect(screen.getByText('Please select an industry')).toBeInTheDocument();
    expect(screen.getByText('Please select a country')).toBeInTheDocument();
    expect(screen.getByText('Please select a company size')).toBeInTheDocument();
    expect(screen.getByText('Company Info')).toBeInTheDocument();
  });

  it('validates the admin step before showing the review step', async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillCompanyInfo(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Admin Account')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Password'), 'SecurePass123!');
    await user.type(screen.getByLabelText('Confirm Password'), 'DifferentPass123!');
    await user.click(screen.getByRole('button', { name: 'Review & Submit' }));
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('submits the reviewed company and navigates to email verification', async () => {
    const user = userEvent.setup();
    renderRegister();
    await fillCompanyInfo(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await fillAdminInfo(user);
    await user.click(screen.getByRole('button', { name: 'Review & Submit' }));
    expect(screen.getByText('Review & Submit')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create Company Account' }));
    await waitFor(() => expect(authApiMock.registerCompany).toHaveBeenCalledWith({
      companyName: 'Acme Logistics',
      industry: 'Technology & Software',
      country: 'Nigeria',
      companySize: '11–50',
      adminName: 'Ada Lovelace',
      email: 'ada@acme.example',
      password: 'SecurePass123!',
    }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/register/verify-email'));
    expect(clearDraftMock).toHaveBeenCalledOnce();
  });

  it('shows a registration error and stays on review when submission fails', async () => {
    const user = userEvent.setup();
    authApiMock.registerCompany.mockRejectedValueOnce(new Error('Conflict'));
    renderRegister();
    await fillCompanyInfo(user);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await fillAdminInfo(user);
    await user.click(screen.getByRole('button', { name: 'Review & Submit' }));
    await user.click(screen.getByRole('button', { name: 'Create Company Account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Registration failed. Please try again.');
    expect(screen.getByText('Review & Submit')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/register/company');
  });
});
