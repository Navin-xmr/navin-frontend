import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ApiKeysSection from './ApiKeysSection';
import type { AxiosResponse } from 'axios';

const mockApiClient = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@services/api/client', () => ({
  apiClient: mockApiClient,
}));

const mockApiKeys = [
  {
    id: 'key-1',
    name: 'Production API',
    createdAt: '2024-01-15T10:00:00Z',
    lastUsed: '2024-01-20T15:30:00Z',
    scopes: ['read', 'write'],
  },
  {
    id: 'key-2',
    name: 'Development API',
    createdAt: '2024-01-10T08:00:00Z',
    scopes: [],
  },
];

describe('ApiKeysSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockApiClient.get.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<ApiKeysSection />);

    expect(screen.getByText('Loading keys…')).toBeInTheDocument();
  });

  it('renders API keys list after loading', async () => {
    mockApiClient.get.mockResolvedValue({
      data: { data: mockApiKeys },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    expect(await screen.findByText('Production API')).toBeInTheDocument();
    expect(screen.getByText('Development API')).toBeInTheDocument();
  });

  it('renders empty state when no API keys exist', async () => {
    mockApiClient.get.mockResolvedValue({
      data: { data: [] },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    expect(await screen.findByText('No API keys yet.')).toBeInTheDocument();
  });

  it('displays API key details including creation date and last used', async () => {
    mockApiClient.get.mockResolvedValue({
      data: { data: mockApiKeys },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    await screen.findByText('Production API');

    expect(screen.getByText(/Created 1\/15\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/Last used 1\/20\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/read, write/)).toBeInTheDocument();
  });

  it('allows generating a new API key', async () => {
    const user = userEvent.setup();
    mockApiClient.get.mockResolvedValue({
      data: { data: [] },
    } as AxiosResponse);

    const newKey = {
      key: {
        id: 'key-new',
        name: 'New API Key',
        createdAt: '2024-01-25T12:00:00Z',
        scopes: [],
      },
      secret: 'sk_test_1234567890abcdef',
    };

    mockApiClient.post.mockResolvedValue({
      data: { data: newKey },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    await screen.findByText('No API keys yet.');

    const nameInput = screen.getByPlaceholderText(/Key name/i);
    await user.type(nameInput, 'New API Key');

    const generateButton = screen.getByRole('button', { name: /Generate Key/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/company/api-keys', {
        name: 'New API Key',
      });
    });

    // Should show the secret in a one-time display
    expect(await screen.findByText(/copy it now/i)).toBeInTheDocument();
    expect(screen.getByText('sk_test_1234567890abcdef')).toBeInTheDocument();

    // Should add the key to the list
    expect(screen.getByText('New API Key')).toBeInTheDocument();
  });

  it('disables generate button when name is empty', async () => {
    mockApiClient.get.mockResolvedValue({
      data: { data: [] },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    await screen.findByText('No API keys yet.');

    const generateButton = screen.getByRole('button', { name: /Generate Key/i });
    expect(generateButton).toBeDisabled();
  });

  it('shows loading state while generating key', async () => {
    const user = userEvent.setup();
    mockApiClient.get.mockResolvedValue({
      data: { data: [] },
    } as AxiosResponse);

    mockApiClient.post.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ApiKeysSection />);

    await screen.findByText('No API keys yet.');

    await user.type(screen.getByPlaceholderText(/Key name/i), 'Test Key');
    await user.click(screen.getByRole('button', { name: /Generate Key/i }));

    expect(screen.getByText('Generating…')).toBeInTheDocument();
  });

  it('allows closing the secret display modal', async () => {
    const user = userEvent.setup();
    mockApiClient.get.mockResolvedValue({
      data: { data: [] },
    } as AxiosResponse);

    mockApiClient.post.mockResolvedValue({
      data: {
        data: {
          key: { id: 'key-new', name: 'Test', createdAt: '2024-01-25T12:00:00Z', scopes: [] },
          secret: 'sk_test_secret',
        },
      },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    await screen.findByText('No API keys yet.');

    await user.type(screen.getByPlaceholderText(/Key name/i), 'Test Key');
    await user.click(screen.getByRole('button', { name: /Generate Key/i }));

    await screen.findByText(/copy it now/i);

    // Close the secret display
    const closeButton = screen.getByRole('button', { name: '' }); // X button
    await user.click(closeButton);

    expect(screen.queryByText(/copy it now/i)).not.toBeInTheDocument();
  });

  it('shows confirmation dialog before revoking a key', async () => {
    const user = userEvent.setup();
    mockApiClient.get.mockResolvedValue({
      data: { data: mockApiKeys },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    await screen.findByText('Production API');

    const revokeButtons = screen.getAllByLabelText('Revoke key');
    await user.click(revokeButtons[0]);

    expect(screen.getByText(/Revoke API key\?/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it('revokes an API key after confirmation', async () => {
    const user = userEvent.setup();
    mockApiClient.get.mockResolvedValue({
      data: { data: mockApiKeys },
    } as AxiosResponse);

    mockApiClient.delete.mockResolvedValue({} as AxiosResponse);

    render(<ApiKeysSection />);

    await screen.findByText('Production API');

    const revokeButtons = screen.getAllByLabelText('Revoke key');
    await user.click(revokeButtons[0]);

    // Confirm deletion
    const dialog = screen.getByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', { name: /Revoke Key/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockApiClient.delete).toHaveBeenCalledWith('/company/api-keys/key-1');
    });

    // Key should be removed from list
    await waitFor(() => {
      expect(screen.queryByText('Production API')).not.toBeInTheDocument();
    });
  });

  it('allows canceling key revocation', async () => {
    const user = userEvent.setup();
    mockApiClient.get.mockResolvedValue({
      data: { data: mockApiKeys },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    await screen.findByText('Production API');

    const revokeButtons = screen.getAllByLabelText('Revoke key');
    await user.click(revokeButtons[0]);

    // Cancel deletion
    const dialog = screen.getByRole('dialog');
    const cancelButton = within(dialog).getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockApiClient.delete).not.toHaveBeenCalled();
    expect(screen.getByText('Production API')).toBeInTheDocument();
  });

  it('displays tooltips for API key information', async () => {
    mockApiClient.get.mockResolvedValue({
      data: { data: [] },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    await screen.findByText('No API keys yet.');

    // Should have info icons with aria-labels
    expect(screen.getByLabelText('What are API keys?')).toBeInTheDocument();
    expect(screen.getByLabelText('Key naming help')).toBeInTheDocument();
  });

  it('clears input field after successful key generation', async () => {
    const user = userEvent.setup();
    mockApiClient.get.mockResolvedValue({
      data: { data: [] },
    } as AxiosResponse);

    mockApiClient.post.mockResolvedValue({
      data: {
        data: {
          key: { id: 'key-new', name: 'Test', createdAt: '2024-01-25T12:00:00Z', scopes: [] },
          secret: 'sk_test_secret',
        },
      },
    } as AxiosResponse);

    render(<ApiKeysSection />);

    await screen.findByText('No API keys yet.');

    const nameInput = screen.getByPlaceholderText(/Key name/i) as HTMLInputElement;
    await user.type(nameInput, 'Test Key');
    await user.click(screen.getByRole('button', { name: /Generate Key/i }));

    await screen.findByText(/copy it now/i);

    expect(nameInput.value).toBe('');
  });

  it('handles API errors gracefully when loading keys', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Network error'));

    render(<ApiKeysSection />);

    expect(await screen.findByText('No API keys yet.')).toBeInTheDocument();
  });
});
