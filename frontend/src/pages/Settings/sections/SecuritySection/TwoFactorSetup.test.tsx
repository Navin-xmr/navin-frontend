import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TwoFactorSetup from './TwoFactorSetup';

// Mock the API client
vi.mock('@services/api/client', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock the toast context
const mockShowToast = vi.fn();
vi.mock('@context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

import apiClient from '@services/api/client';

const mockedPost = vi.mocked(apiClient.post);
const mockedDelete = vi.mocked(apiClient.delete);

const QR_CODE_URL = 'data:image/png;base64,qrcode';
const SECRET = 'JBSWY3DPEHPK3PXP';
const BACKUP_CODES = ['ABCD-1234', 'EFGH-5678', 'IJKL-9012'];

describe('TwoFactorSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the disabled state with an Enable 2FA button', () => {
    render(<TwoFactorSetup enabled={false} />);

    expect(screen.getByRole('button', { name: /enable 2fa/i })).toBeInTheDocument();
    expect(screen.queryByAltText(/qr code/i)).not.toBeInTheDocument();
  });

  it('calls POST /auth/2fa/setup and renders the QR code when Enable is clicked', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { qrCodeUrl: QR_CODE_URL, secret: SECRET },
    });

    render(<TwoFactorSetup enabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: /enable 2fa/i }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith('/auth/2fa/setup');
    });

    const qrImage = await screen.findByAltText(/qr code/i);
    expect(qrImage).toHaveAttribute('src', QR_CODE_URL);
    expect(screen.getByText(SECRET)).toBeInTheDocument();
  });

  it('enables Verify only for a 6-digit code and calls POST /auth/2fa/verify', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { qrCodeUrl: QR_CODE_URL, secret: SECRET },
    });
    mockedPost.mockResolvedValueOnce({
      data: { backupCodes: BACKUP_CODES },
    });

    render(<TwoFactorSetup enabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: /enable 2fa/i }));

    const codeInput = await screen.findByLabelText(/verification code/i);
    const verifyButton = screen.getByRole('button', { name: /^verify$/i });

    expect(verifyButton).toBeDisabled();

    fireEvent.change(codeInput, { target: { value: '12345' } });
    expect(verifyButton).toBeDisabled();

    fireEvent.change(codeInput, { target: { value: '123456' } });
    expect(verifyButton).toBeEnabled();

    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith('/auth/2fa/verify', { code: '123456' });
    });

    // Backup codes are displayed
    for (const code of BACKUP_CODES) {
      expect(await screen.findByText(code)).toBeInTheDocument();
    }
  });

  it('shows the Enabled state after acknowledging backup codes', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { qrCodeUrl: QR_CODE_URL, secret: SECRET },
    });
    mockedPost.mockResolvedValueOnce({
      data: { backupCodes: BACKUP_CODES },
    });

    render(<TwoFactorSetup enabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: /enable 2fa/i }));

    const codeInput = await screen.findByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));

    await screen.findByText(BACKUP_CODES[0]);

    fireEvent.click(screen.getByRole('button', { name: /i've saved my backup codes/i }));

    await waitFor(() => {
      expect(screen.getByText(/2fa is enabled/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /disable 2fa/i })).toBeInTheDocument();
  });

  it('copies backup codes to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    mockedPost.mockResolvedValueOnce({
      data: { qrCodeUrl: QR_CODE_URL, secret: SECRET },
    });
    mockedPost.mockResolvedValueOnce({
      data: { backupCodes: BACKUP_CODES },
    });

    render(<TwoFactorSetup enabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: /enable 2fa/i }));
    const codeInput = await screen.findByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));

    await screen.findByText(BACKUP_CODES[0]);

    fireEvent.click(screen.getByRole('button', { name: /copy/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(BACKUP_CODES.join('\n'));
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' })
    );
  });

  it('downloads backup codes as a file', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    mockedPost.mockResolvedValueOnce({
      data: { qrCodeUrl: QR_CODE_URL, secret: SECRET },
    });
    mockedPost.mockResolvedValueOnce({
      data: { backupCodes: BACKUP_CODES },
    });

    render(<TwoFactorSetup enabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: /enable 2fa/i }));
    const codeInput = await screen.findByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));

    await screen.findByText(BACKUP_CODES[0]);

    fireEvent.click(screen.getByRole('button', { name: /download/i }));

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalled();
    });
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('regenerates backup codes via POST /auth/2fa/backup-codes/regenerate', async () => {
    const newCodes = ['WXYZ-0000', 'QRST-1111'];

    render(<TwoFactorSetup enabled={true} />);

    mockedPost.mockResolvedValueOnce({
      data: { backupCodes: newCodes },
    });

    fireEvent.click(screen.getByRole('button', { name: /regenerate backup codes/i }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith('/auth/2fa/backup-codes/regenerate');
    });

    for (const code of newCodes) {
      expect(await screen.findByText(code)).toBeInTheDocument();
    }
  });

  it('opens the disable modal and calls DELETE /auth/2fa with the password', async () => {
    const user = userEvent.setup();

    render(<TwoFactorSetup enabled={true} />);

    mockedDelete.mockResolvedValueOnce({ data: { success: true } });

    fireEvent.click(screen.getByRole('button', { name: /disable 2fa/i }));

    const dialog = await screen.findByRole('dialog');
    const passwordInput = within(dialog).getByLabelText(/password/i);
    await user.type(passwordInput, 'my-secret-password');

    fireEvent.click(within(dialog).getByRole('button', { name: /^disable$/i }));

    await waitFor(() => {
      expect(mockedDelete).toHaveBeenCalledWith('/auth/2fa', {
        data: { password: 'my-secret-password' },
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enable 2fa/i })).toBeInTheDocument();
    });
  });

  it('shows an error message and toast when setup fails', async () => {
    mockedPost.mockRejectedValueOnce({
      response: { data: { message: 'Setup failed' } },
    });

    render(<TwoFactorSetup enabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: /enable 2fa/i }));

    expect(await screen.findByText('Setup failed')).toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', message: 'Setup failed' })
    );
  });

  it('shows an error message and toast when verification fails', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { qrCodeUrl: QR_CODE_URL, secret: SECRET },
    });
    mockedPost.mockRejectedValueOnce({
      response: { data: { message: 'Invalid code' } },
    });

    render(<TwoFactorSetup enabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: /enable 2fa/i }));
    const codeInput = await screen.findByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /^verify$/i }));

    expect(await screen.findByText('Invalid code')).toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', message: 'Invalid code' })
    );
  });

  it('shows an error message and toast when disabling fails', async () => {
    const user = userEvent.setup();

    render(<TwoFactorSetup enabled={true} />);

    mockedDelete.mockRejectedValueOnce({
      response: { data: { message: 'Incorrect password' } },
    });

    fireEvent.click(screen.getByRole('button', { name: /disable 2fa/i }));

    const dialog = await screen.findByRole('dialog');
    const passwordInput = within(dialog).getByLabelText(/password/i);
    await user.type(passwordInput, 'wrong-password');

    fireEvent.click(within(dialog).getByRole('button', { name: /^disable$/i }));

    expect(await screen.findByText('Incorrect password')).toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', message: 'Incorrect password' })
    );
  });
});