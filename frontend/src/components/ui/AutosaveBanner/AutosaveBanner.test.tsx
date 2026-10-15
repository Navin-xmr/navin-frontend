import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AutosaveBanner } from './AutosaveBanner';

describe('AutosaveBanner', () => {
  it('renders the idle status text', () => {
    render(<AutosaveBanner status="idle" />);

    expect(screen.getByText('Changes will be autosaved')).toBeInTheDocument();
  });

  it('renders the saving status text', () => {
    render(<AutosaveBanner status="saving" />);

    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });

  it('renders the saved status text', () => {
    render(<AutosaveBanner status="saved" />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders the error status text', () => {
    render(<AutosaveBanner status="error" />);

    expect(screen.getByText('Autosave failed')).toBeInTheDocument();
  });

  it('shows the formatted "Saved at HH:MM:SS" text when lastSavedAt is provided for the saved state', () => {
    const lastSavedAt = new Date(2024, 0, 15, 9, 5, 7);
    render(<AutosaveBanner status="saved" lastSavedAt={lastSavedAt} />);

    expect(screen.getByText('Saved at 09:05:07')).toBeInTheDocument();
  });

  it('shows "Last saved at ..." for idle with lastSavedAt', () => {
    const lastSavedAt = new Date(2024, 0, 15, 14, 30, 45);
    render(<AutosaveBanner status="idle" lastSavedAt={lastSavedAt} />);

    expect(screen.getByText('Last saved at 14:30:45')).toBeInTheDocument();
  });

  it('shows the fallback "Saved" text for the saved state when lastSavedAt is null', () => {
    render(<AutosaveBanner status="saved" lastSavedAt={null} />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('shows the fallback "Changes will be autosaved" text for idle when lastSavedAt is null', () => {
    render(<AutosaveBanner status="idle" lastSavedAt={null} />);

    expect(screen.getByText('Changes will be autosaved')).toBeInTheDocument();
  });

  it('renders a role="status" container with aria-live="polite" and aria-atomic="true"', () => {
    render(<AutosaveBanner status="saved" />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('applies the custom className', () => {
    render(<AutosaveBanner status="idle" className="custom-class" />);

    const status = screen.getByRole('status');
    expect(status).toHaveClass('custom-class');
  });
});