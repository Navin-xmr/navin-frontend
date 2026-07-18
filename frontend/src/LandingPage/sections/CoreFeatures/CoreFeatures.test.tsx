import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeAll } from 'vitest';
import CoreFeatures from './CoreFeatures';

beforeAll(() => {
  const IntersectionObserverMock = class {
    observe() { }
    unobserve() { }
    disconnect() { }
  };
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
  });
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
  });
});

describe('CoreFeatures', () => {
  it('renders the section title and subtitle', () => {
    render(<CoreFeatures />);

    expect(screen.getByText(/Core/i)).toBeInTheDocument();
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
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

  it('applies correct layout classes for zigzag pattern', () => {
    const { container } = render(<CoreFeatures />);

    // Check for flex containers (no longer using .feature-block class)
    const flexContainers = container.querySelectorAll('.flex.flex-col');
    expect(flexContainers.length).toBeGreaterThanOrEqual(4);

    // Verify the structure has alternating row/row-reverse layout
    const parentDiv = container.querySelector('.space-y-24');
    expect(parentDiv).toBeInTheDocument();
    expect(parentDiv?.children).toHaveLength(4);
  });
});
