import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ShareQRCodeModal from './ShareQRCodeModal';

vi.mock('qrcode.react', () => ({ QRCodeCanvas: () => <canvas data-testid="qr-canvas" /> }));
vi.mock('@components/ui/CopyToClipboard', () => ({ default: ({ label }: { label: string }) => <button>{label}</button> }));
vi.mock('../../../components/common/Modal/Modal', () => ({ default: ({ isOpen, title, children }: { isOpen: boolean; title: string; children: React.ReactNode }) => isOpen ? <div role="dialog" aria-label={title}>{children}</div> : null }));

describe('ShareQRCodeModal', () => {
  it('renders the tracking URL and QR sharing actions', () => {
    const onClose = vi.fn();
    render(<ShareQRCodeModal isOpen onClose={onClose} trackingNumber="TRK-123" />);
    expect(screen.getByRole('dialog', { name: 'Share Tracking QR Code' })).toBeInTheDocument();
    expect(screen.getByText('https://app.navin.io/track/TRK-123')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download QR/i })).toBeInTheDocument();
  });

  it('downloads the rendered QR canvas', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', { value: vi.fn(() => 'data:image/png;base64,qr') });
    render(<ShareQRCodeModal isOpen onClose={vi.fn()} trackingNumber="TRK-123" />);
    fireEvent.click(screen.getByRole('button', { name: /Download QR/i }));
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });
});
