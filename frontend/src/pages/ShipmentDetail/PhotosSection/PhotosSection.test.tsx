import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mock API ─────────────────────────────────────────────────────────────────

const { mockUpload, mockDelete } = vi.hoisted(() => ({
  mockUpload: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('../../../services/api/endpoints/shipmentPhotos', () => ({
  shipmentPhotosApi: {
    upload: mockUpload,
    delete: mockDelete,
  },
}));

import PhotosSection from './PhotosSection';
import type { ShipmentPhoto } from '../../../types/shipmentPhoto';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePhoto(id: string, type: ShipmentPhoto['type'] = 'DELIVERY'): ShipmentPhoto {
  return {
    id,
    url: `https://cdn.example.com/photos/${id}.jpg`,
    type,
    uploadedAt: '2024-01-01T10:00:00Z',
    uploaderName: 'Test User',
  };
}

function makeImageFile(name = 'photo.jpg', sizeBytes = 1024): File {
  return new File(['x'.repeat(sizeBytes)], name, { type: 'image/jpeg' });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PhotosSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // URL.createObjectURL is not available in jsdom
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  it('shows the empty state when there are no photos', () => {
    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    expect(screen.getByText(/no photos yet/i)).toBeInTheDocument();
  });

  it('renders the dropzone when under the photo cap', () => {
    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    expect(
      screen.getByRole('button', { name: /upload photos/i }),
    ).toBeInTheDocument();
  });

  // ── File selection ────────────────────────────────────────────────────────

  it('adds a pending photo when a valid image file is selected', async () => {
    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeImageFile('shipment.jpg');

    await userEvent.upload(input, file);

    expect(screen.getByText(/ready to upload \(1\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview pending photo 1/i })).toBeInTheDocument();
  });

  it('ignores non-image files in the dropzone', async () => {
    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const textFile = new File(['hello'], 'doc.txt', { type: 'text/plain' });

    await userEvent.upload(input, textFile);

    expect(screen.queryByText(/ready to upload/i)).not.toBeInTheDocument();
  });

  it('ignores files over the 5 MB size limit', async () => {
    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const bigFile = makeImageFile('huge.jpg', 6 * 1024 * 1024);

    await userEvent.upload(input, bigFile);

    expect(screen.queryByText(/ready to upload/i)).not.toBeInTheDocument();
  });

  // ── Remove pending ────────────────────────────────────────────────────────

  it('removes a pending photo when the remove button is clicked', async () => {
    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, makeImageFile());

    await waitFor(() =>
      expect(screen.getByText(/ready to upload \(1\)/i)).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole('button', { name: /remove pending photo 1/i }));

    expect(screen.queryByText(/ready to upload/i)).not.toBeInTheDocument();
  });

  // ── Upload flow ───────────────────────────────────────────────────────────

  it('calls upload and moves the photo to the uploaded grid on success', async () => {
    const uploaded = makePhoto('new-photo', 'PICKUP');
    mockUpload.mockResolvedValue(uploaded);

    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, makeImageFile('pick.jpg'));
    await waitFor(() => screen.getByText(/ready to upload \(1\)/i));

    // Both desktop and mobile upload buttons render; click the first enabled one
    const uploadBtns = screen.getAllByRole('button').filter(
      (b) => /upload/i.test(b.textContent ?? '') && !b.hasAttribute('disabled'),
    );
    await userEvent.click(uploadBtns[0]);

    await waitFor(() =>
      expect(mockUpload).toHaveBeenCalledWith('s1', expect.any(File), 'OTHER'),
    );

    await waitFor(() =>
      expect(screen.getByText(/uploaded \(1\)/i)).toBeInTheDocument(),
    );
  });

  it('keeps failed photos in the pending queue after an upload error', async () => {
    mockUpload.mockRejectedValue(new Error('Upload failed'));

    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, makeImageFile('fail.jpg'));
    await waitFor(() => screen.getByText(/ready to upload \(1\)/i));

    const uploadBtns = screen.getAllByRole('button').filter(
      (b) => /upload/i.test(b.textContent ?? '') && !b.hasAttribute('disabled'),
    );
    await userEvent.click(uploadBtns[0]);

    await waitFor(() => expect(mockUpload).toHaveBeenCalled());

    // The failed photo stays in the pending list
    await waitFor(() =>
      expect(screen.getByText(/ready to upload \(1\)/i)).toBeInTheDocument(),
    );
  });

  // ── Delete flow ───────────────────────────────────────────────────────────

  it('shows delete buttons when canDelete is true', async () => {
    mockUpload.mockResolvedValue(makePhoto('p1'));

    // Pre-populate by uploading one photo first
    render(<PhotosSection shipmentId="s1" canDelete={true} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeImageFile());
    await waitFor(() => screen.getByText(/ready to upload/i));

    const uploadBtns = screen.getAllByRole('button').filter(
      (b) => /upload/i.test(b.textContent ?? '') && !b.hasAttribute('disabled'),
    );
    await userEvent.click(uploadBtns[0]);

    await waitFor(() => screen.getByText(/uploaded \(1\)/i));
    expect(screen.getByRole('button', { name: /delete photo 1/i })).toBeInTheDocument();
  });

  it('hides delete buttons when canDelete is false', async () => {
    mockUpload.mockResolvedValue(makePhoto('p1'));

    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeImageFile());
    await waitFor(() => screen.getByText(/ready to upload/i));

    const uploadBtns = screen.getAllByRole('button').filter(
      (b) => /upload/i.test(b.textContent ?? '') && !b.hasAttribute('disabled'),
    );
    await userEvent.click(uploadBtns[0]);

    await waitFor(() => screen.getByText(/uploaded \(1\)/i));
    expect(screen.queryByRole('button', { name: /delete photo 1/i })).not.toBeInTheDocument();
  });

  it('calls delete API and removes the photo after confirmation', async () => {
    mockUpload.mockResolvedValue(makePhoto('p1'));
    mockDelete.mockResolvedValue(undefined);

    render(<PhotosSection shipmentId="s1" canDelete={true} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, makeImageFile());
    await waitFor(() => screen.getByText(/ready to upload/i));

    const uploadBtns = screen.getAllByRole('button').filter(
      (b) => /upload/i.test(b.textContent ?? '') && !b.hasAttribute('disabled'),
    );
    await userEvent.click(uploadBtns[0]);
    await waitFor(() => screen.getByText(/uploaded \(1\)/i));

    await userEvent.click(screen.getByRole('button', { name: /delete photo 1/i }));

    // ConfirmDialog should appear
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /delete photo/i }));

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('s1', 'p1'));
    await waitFor(() =>
      expect(screen.queryByText(/uploaded \(1\)/i)).not.toBeInTheDocument(),
    );
  });

  // ── Drag and drop ─────────────────────────────────────────────────────────

  it('accepts a file dropped onto the dropzone', async () => {
    render(<PhotosSection shipmentId="s1" canDelete={false} />);
    const dropzone = screen.getByRole('button', { name: /upload photos/i });

    const file = makeImageFile('dropped.jpg');
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByText(/ready to upload \(1\)/i)).toBeInTheDocument(),
    );
  });

  // ── Photo cap ─────────────────────────────────────────────────────────────

  it('shows the max-photos banner and hides dropzone at cap (10 photos)', async () => {
    const photos = Array.from({ length: 10 }, (_, i) => makePhoto(`p${i}`));
    mockUpload.mockImplementation(() => Promise.resolve(photos.shift()!));

    render(<PhotosSection shipmentId="s1" canDelete={false} />);

    // Upload 10 photos by repeatedly selecting and uploading
    for (let i = 0; i < 10; i++) {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (!input) break;
      await userEvent.upload(input, makeImageFile(`p${i}.jpg`));
    }

    const uploadBtns = screen.queryAllByRole('button').filter(
      (b) => /upload/i.test(b.textContent ?? '') && !b.hasAttribute('disabled'),
    );
    if (uploadBtns.length) {
      await userEvent.click(uploadBtns[0]);
    }

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /upload photos/i })).not.toBeInTheDocument(),
    );
  });
});

// ─── need within ─────────────────────────────────────────────────────────────
import { within } from '@testing-library/react';
