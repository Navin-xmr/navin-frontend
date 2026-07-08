import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FileUpload from './FileUpload';

function makeFile(name: string, type: string, sizeBytes = 1024): File {
  const file = new File(['x'.repeat(sizeBytes)], name, { type });
  return file;
}

describe('FileUpload', () => {
  it('renders the dropzone with helper text', () => {
    render(<FileUpload onFilesSelected={vi.fn()} />);
    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
  });

  it('opens the file picker when the dropzone is clicked', async () => {
    render(<FileUpload onFilesSelected={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    await userEvent.click(screen.getByRole('button', { name: /file upload dropzone/i }));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('highlights the zone on dragover and resets on dragleave', async () => {
    render(<FileUpload onFilesSelected={vi.fn()} />);
    const zone = screen.getByRole('button', { name: /file upload dropzone/i });

    fireEvent.dragOver(zone);
    expect(zone.className).toMatch(/border-primary/);

    fireEvent.dragLeave(zone, { relatedTarget: document.body });
    expect(zone.className).not.toMatch(/border-primary bg-primary/);
  });

  it('calls onFilesSelected with a valid file selected via input', async () => {
    const onFilesSelected = vi.fn();
    render(<FileUpload onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('doc.pdf', 'application/pdf');
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(onFilesSelected).toHaveBeenCalledWith([file]);
    });
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
  });

  it('shows a thumbnail for image files', async () => {
    render(<FileUpload onFilesSelected={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const img = makeFile('photo.png', 'image/png');
    await userEvent.upload(input, img);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'photo.png' })).toBeInTheDocument();
    });
  });

  it('shows filename and size (not a thumbnail) for non-image files', async () => {
    render(<FileUpload onFilesSelected={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('report.pdf', 'application/pdf', 2048);
    await userEvent.upload(input, file);

    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    expect(screen.queryByRole('img', { name: 'report.pdf' })).not.toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('rejects a file whose type is not in the accept list', async () => {
    const onFilesSelected = vi.fn();
    render(
      <FileUpload accept={['image/*']} onFilesSelected={onFilesSelected} />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('report.pdf', 'application/pdf');

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/file type not allowed/i)).toBeInTheDocument();
    });
    expect(onFilesSelected).toHaveBeenCalledWith([]);
  });

  it('rejects a file that exceeds maxSizeMB', async () => {
    const onFilesSelected = vi.fn();
    render(
      <FileUpload maxSizeMB={1} onFilesSelected={onFilesSelected} />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const bigFile = makeFile('huge.zip', 'application/zip', 2 * 1024 * 1024);
    await userEvent.upload(input, bigFile);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/exceeds 1 mb limit/i);
    });
    expect(onFilesSelected).toHaveBeenCalledWith([]);
  });

  it('removes a file when the × button is clicked', async () => {
    const onFilesSelected = vi.fn();
    render(<FileUpload onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('remove-me.txt', 'text/plain');
    await userEvent.upload(input, file);

    await waitFor(() => expect(screen.getByText('remove-me.txt')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /remove remove-me\.txt/i }));
    expect(screen.queryByText('remove-me.txt')).not.toBeInTheDocument();
    expect(onFilesSelected).toHaveBeenLastCalledWith([]);
  });

  it('shows the upload progress bar when uploadProgress is provided', () => {
    render(<FileUpload onFilesSelected={vi.fn()} uploadProgress={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('accepts multiple files when multiple is true', async () => {
    const onFilesSelected = vi.fn();
    render(<FileUpload multiple onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = [makeFile('a.txt', 'text/plain'), makeFile('b.txt', 'text/plain')];
    await userEvent.upload(input, files);

    await waitFor(() => {
      expect(onFilesSelected).toHaveBeenCalledWith(files);
    });
    expect(screen.getByText('a.txt')).toBeInTheDocument();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
  });

  it('processes a file dropped onto the zone', async () => {
    const onFilesSelected = vi.fn();
    render(<FileUpload onFilesSelected={onFilesSelected} />);
    const zone = screen.getByRole('button', { name: /file upload dropzone/i });
    const file = makeFile('dropped.txt', 'text/plain');

    fireEvent.drop(zone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('dropped.txt')).toBeInTheDocument();
    });
    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });
});
