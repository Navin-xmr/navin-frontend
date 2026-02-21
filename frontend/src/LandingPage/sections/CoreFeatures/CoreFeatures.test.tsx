import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CoreFeatures from './CoreFeatures';

describe('CoreFeatures', () => {
  it('renders the section title and subtitle', () => {
    render(<CoreFeatures />);

    expect(screen.getByText('Core Features')).toBeInTheDocument();
    expect(
      screen.getByText('Built on Stellar blockchain for transparency, security, and automation')
    ).toBeInTheDocument();
  });

  it('renders all four feature blocks', () => {
    render(<CoreFeatures />);

    expect(screen.getByText('Track every delivery, every step of the way')).toBeInTheDocument();
    expect(screen.getByText("Don't trust. Verify.")).toBeInTheDocument();
    expect(screen.getByText('Payments that release themselves')).toBeInTheDocument();
    expect(screen.getByText('Everyone sees what they need to see')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<CoreFeatures />);

    expect(
      screen.getByText(/Navin gives you full visibility into every shipment/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Hash-and-Emit architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/smart contract escrow/i)).toBeInTheDocument();
    expect(screen.getByText(/four roles — Company, Carrier, Customer, and Admin/i)).toBeInTheDocument();
  });

  it('renders bullet points for each feature', () => {
    render(<CoreFeatures />);

    expect(screen.getByText('Live status updates at every checkpoint')).toBeInTheDocument();
    expect(screen.getByText('IoT-powered temperature and condition monitoring')).toBeInTheDocument();
    expect(screen.getByText(/SHA-256 hashes of all shipment data/i)).toBeInTheDocument();
    expect(screen.getByText('Funds locked on shipment creation')).toBeInTheDocument();
    expect(screen.getByText(/On-chain role assignment/i)).toBeInTheDocument();
  });

  it('renders images for each feature with proper alt text', () => {
    render(<CoreFeatures />);

    expect(screen.getByAltText('Real-time shipment tracking visualization')).toBeInTheDocument();
    expect(screen.getByAltText('Blockchain verification data flow diagram')).toBeInTheDocument();
    expect(screen.getByAltText('Smart escrow payment flow illustration')).toBeInTheDocument();
    expect(screen.getByAltText('Role-based access control diagram')).toBeInTheDocument();
  });

  it('applies correct CSS classes for zigzag layout', () => {
    const { container } = render(<CoreFeatures />);

    const blocks = container.querySelectorAll('.feature-block');
    expect(blocks).toHaveLength(4);

    expect(blocks[0]).toHaveClass('feature-block--image-left');
    expect(blocks[1]).toHaveClass('feature-block--image-right');
    expect(blocks[2]).toHaveClass('feature-block--image-left');
    expect(blocks[3]).toHaveClass('feature-block--image-right');
  });
});
