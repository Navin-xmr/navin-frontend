import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock API ─────────────────────────────────────────────────────────────────

const { mockGetProfile, mockUpdateProfile, mockUploadLogo } = vi.hoisted(() => ({
  mockGetProfile: vi.fn(),
  mockUpdateProfile: vi.fn(),
  mockUploadLogo: vi.fn(),
}));

vi.mock('@services/api', () => ({
  companyApi: {
    getProfile: mockGetProfile,
    updateProfile: mockUpdateProfile,
    uploadLogo: mockUploadLogo,
  },
}));

// ─── Mock context ─────────────────────────────────────────────────────────────

const { addToast } = vi.hoisted(() => ({ addToast: vi.fn() }));
vi.mock('@context/ToastContext', () => ({ useToast: () => ({ addToast }) }));

// ─── Mock heavy child components ──────────────────────────────────────────────

vi.mock('../../../Settings/NotificationPreferences/NotificationPreferences', () => ({
  default: () => <div data-testid="notif-prefs" />,
}));

vi.mock('../../../Settings/sections/MyTemplatesSection', () => ({
  default: () => <div data-testid="templates" />,
}));

vi.mock('../../../../components/auth/WalletConnectButton/WalletConnectButton', () => ({
  WalletConnectButton: () => <div data-testid="wallet" />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

import CompanySettings from './CompanySettings';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CompanySettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfile.mockResolvedValue({ name: 'Acme Corp', address: '1 Main St' });
    mockUpdateProfile.mockResolvedValue({ name: 'Acme Corp', address: '1 Main St' });
    mockUploadLogo.mockResolvedValue({ logoUrl: 'http://example.com/logo.png' });
  });

  it('shows a loading state initially then displays the profile', async () => {
    render(<CompanySettings />);
    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument());
    expect(screen.getByDisplayValue('1 Main St')).toBeInTheDocument();
  });

  it('shows an error message if profile fails to load', async () => {
    mockGetProfile.mockRejectedValue(new Error('fail'));
    render(<CompanySettings />);
    await waitFor(() => expect(screen.getByText(/failed to load company profile/i)).toBeInTheDocument());
  });

  it('calls updateProfile when Save Changes is clicked', async () => {
    render(<CompanySettings />);
    await waitFor(() => screen.getByDisplayValue('Acme Corp'));
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled());
    expect(addToast).toHaveBeenCalledWith('Settings saved successfully!', 'success');
  });

  it('shows error toast when save fails', async () => {
    mockUpdateProfile.mockRejectedValue(new Error('fail'));
    render(<CompanySettings />);
    await waitFor(() => screen.getByDisplayValue('Acme Corp'));
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(addToast).toHaveBeenCalledWith('Failed to save settings', 'error'));
  });

  it('calls uploadLogo with the selected file when saving', async () => {
    render(<CompanySettings />);
    await waitFor(() => screen.getByDisplayValue('Acme Corp'));

    const file = new File(['img'], 'logo.png', { type: 'image/png' });
    const input = document.querySelector<HTMLInputElement>('#logo-upload')!;
    await userEvent.upload(input, file);

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(mockUploadLogo).toHaveBeenCalledWith(file));
    expect(mockUpdateProfile).toHaveBeenCalled();
  });

  it('revokes the previous object URL when a new file is picked', async () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');

    render(<CompanySettings />);
    await waitFor(() => screen.getByDisplayValue('Acme Corp'));

    const input = document.querySelector<HTMLInputElement>('#logo-upload')!;
    const file1 = new File(['a'], 'a.png', { type: 'image/png' });
    const file2 = new File(['b'], 'b.png', { type: 'image/png' });

    await userEvent.upload(input, file1);
    await userEvent.upload(input, file2);

    // Should have revoked the first URL when the second was picked
    expect(revokeSpy).toHaveBeenCalledWith('blob:fake-url');

    revokeSpy.mockRestore();
  });
});
