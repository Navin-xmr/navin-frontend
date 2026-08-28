import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CoreFeatures from './CoreFeatures';

describe('CoreFeatures', () => {
  it('renders the section title and subtitle', () => {
    render(<CoreFeatures />);

    expect(screen.getByText(/Core/i)).toBeInTheDocument();
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
    expect(
      screen.getByText('Built on Stellar blockchain for transparency, security, and automation')
    ).toBeInTheDocument();
  });

  it('renders all four feature callouts', () => {
    render(<CoreFeatures />);

    expect(screen.getByText('Tokenized Assets')).toBeInTheDocument();
    expect(screen.getByText('IoT-Verified Milestones')).toBeInTheDocument();
    expect(screen.getByText('Smart Settlements')).toBeInTheDocument();
    expect(screen.getByText('Parity Dashboards')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<CoreFeatures />);

    expect(screen.getByText(/unique digital identity on the Stellar blockchain/i)).toBeInTheDocument();
    expect(screen.getByText(/hashed and anchored on-chain/i)).toBeInTheDocument();
    expect(screen.getByText(/released automatically via smart contract/i)).toBeInTheDocument();
    expect(screen.getByText(/single source of truth for Company, Carrier, Customer, and Admin/i)).toBeInTheDocument();
  });

  it('renders the bar-chart visualization', () => {
    render(<CoreFeatures />);

    expect(
      screen.getByRole('img', { name: /illustrative visualization of on-chain shipment activity/i })
    ).toBeInTheDocument();
  });

  it('renders the Track Your Shipment CTA', () => {
    render(<CoreFeatures />);

    const cta = screen.getByRole('link', { name: /track your shipment/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '#track');
  });
});
