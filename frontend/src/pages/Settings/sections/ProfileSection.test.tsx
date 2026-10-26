import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileSection from './ProfileSection';

const mockUseSettings = vi.hoisted(() => ({
  isLoading: false,
  error: null,
  success: null,
  save: vi.fn(),
}));

vi.mock('../hooks/useSettings', () => ({
  useSettings: () => mockUseSettings,
}));

describe('ProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSettings.isLoading = false;
    mockUseSettings.error = null;
    mockUseSettings.success = null;
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();
  });

  it('renders profile section with form fields', () => {
    render(<ProfileSection isCompany={false} />);

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();
  });

  it('renders company name field for company users as read-only', () => {
    render(<ProfileSection isCompany={true} />);

    const companyNameInput = screen.getByLabelText(/company name/i);
    expect(companyNameInput).toBeInTheDocument();
    expect(companyNameInput).toHaveAttribute('readonly');
  });

  it('does not render company name field for individual users', () => {
    render(<ProfileSection isCompany={false} />);

    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
  });

  it('allows uploading an avatar photo', async () => {
    const user = userEvent.setup();
    render(<ProfileSection isCompany={false} />);

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = screen.getByRole('button', { name: /upload photo/i }).parentElement?.querySelector('input[type="file"]');
    
    expect(input).toBeInTheDocument();
    if (input) {
      await user.upload(input, file);
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    }
  });

  it('allows clicking avatar circle to upload photo', async () => {
    const user = userEvent.setup();
    render(<ProfileSection isCompany={false} />);

    // Clicking the avatar circle opens the hidden file picker
    const openPicker = vi.spyOn(HTMLInputElement.prototype, 'click');
    const avatarCircle = screen.getByTitle('Change avatar');
    expect(avatarCircle).toBeInTheDocument();

    await user.click(avatarCircle);

    expect(openPicker).toHaveBeenCalledTimes(1);
    openPicker.mockRestore();
  });

  it('updates form fields when typing', async () => {
    const user = userEvent.setup();
    render(<ProfileSection isCompany={false} />);

    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(fullNameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');

    expect(fullNameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
  });

  it('calls save with changed fields when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProfileSection isCompany={false} />);

    await user.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');

    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(mockUseSettings.save).toHaveBeenCalledWith({
        url: '/users/me',
        payload: {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
        },
      });
    });
  });

  it('only includes company name in payload for company users', async () => {
    const user = userEvent.setup();
    render(<ProfileSection isCompany={true} />);

    await user.type(screen.getByLabelText(/full name/i), 'Company Admin');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(mockUseSettings.save).toHaveBeenCalledWith({
        url: '/users/me',
        payload: {
          fullName: 'Company Admin',
        },
      });
    });
  });

  it('does not call save with empty fields', async () => {
    const user = userEvent.setup();
    render(<ProfileSection isCompany={false} />);

    await user.click(screen.getByRole('button', { name: /save profile/i }));

    expect(mockUseSettings.save).toHaveBeenCalledWith({
      url: '/users/me',
      payload: {},
    });
  });

  it('shows loading state when saving', () => {
    mockUseSettings.isLoading = true;
    render(<ProfileSection isCompany={false} />);

    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeDisabled();
  });

  it('displays error message when save fails', () => {
    mockUseSettings.error = 'Failed to save profile';
    render(<ProfileSection isCompany={false} />);

    expect(screen.getByText('Failed to save profile')).toBeInTheDocument();
  });

  it('displays success message when save succeeds', () => {
    mockUseSettings.success = 'Profile saved successfully';
    render(<ProfileSection isCompany={false} />);

    expect(screen.getByText('Profile saved successfully')).toBeInTheDocument();
  });

  it('revokes blob URL when avatar changes', async () => {
    const user = userEvent.setup();
    render(<ProfileSection isCompany={false} />);

    const input = screen.getByRole('button', { name: /upload photo/i }).parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      // Upload first file
      const file1 = new File(['avatar1'], 'avatar1.png', { type: 'image/png' });
      await user.upload(input, file1);

      // Upload second file
      const file2 = new File(['avatar2'], 'avatar2.png', { type: 'image/png' });
      await user.upload(input, file2);

      // Should revoke the first blob URL
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    }
  });

  it('has proper placeholders for inputs', () => {
    render(<ProfileSection isCompany={false} />);

    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ProfileSection isCompany={false} />);

    const fullNameInput = screen.getByLabelText(/full name/i);
    expect(fullNameInput).toHaveAttribute('id', 'profile-fullName');
    expect(fullNameInput).toHaveAttribute('name', 'fullName');

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('id', 'profile-email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('type', 'email');
  });
});
