import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CoreFeatures from './CoreFeatures';

describe('CoreFeatures', () => {
  it('renders the section title and subtitle', () => {
    render(<CoreFeatures />);
    
    expect(screen.getByText('Core Features')).toBeInTheDocument();
    expect(screen.getByText(/Everything you need for transparent, secure, and automated logistics/i)).toBeInTheDocument();
  });

  it('renders all 4 feature blocks', () => {
    render(<CoreFeatures />);
    
    // Check for all 4 feature headlines
    expect(screen.getByText('Track every delivery, every step of the way')).toBeInTheDocument();
    expect(screen.getByText("Don't trust. Verify.")).toBeInTheDocument();
    expect(screen.getByText('Payments that release themselves')).toBeInTheDocument();
    expect(screen.getByText('Everyone sees what they need to see')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<CoreFeatures />);
    
    expect(screen.getByText(/Navin gives you full visibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Hash-and-Emit architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/Soroban smart contract escrow/i)).toBeInTheDocument();
    expect(screen.getByText(/four roles — Company, Carrier, Customer, and Admin/i)).toBeInTheDocument();
  });

  it('renders all bullet points for each feature', () => {
    render(<CoreFeatures />);
    
    // Tracking feature bullets
    expect(screen.getByText('Live status updates at every checkpoint')).toBeInTheDocument();
    expect(screen.getByText('IoT-powered temperature and condition monitoring')).toBeInTheDocument();
    
    // Blockchain feature bullets
    expect(screen.getByText('SHA-256 hashes of all shipment data published on-chain')).toBeInTheDocument();
    
    // Escrow feature bullets
    expect(screen.getByText('Funds locked on shipment creation')).toBeInTheDocument();
    expect(screen.getByText('Auto-release on delivery confirmation')).toBeInTheDocument();
    
    // Roles feature bullets
    expect(screen.getByText('On-chain role assignment — permissions enforced at the contract level')).toBeInTheDocument();
  });

  it('renders images with correct alt text', () => {
    render(<CoreFeatures />);
    
    expect(screen.getByAltText('Real-time shipment tracking visualization')).toBeInTheDocument();
    expect(screen.getByAltText('Blockchain verification data flow diagram')).toBeInTheDocument();
    expect(screen.getByAltText('Smart escrow payment flow')).toBeInTheDocument();
    expect(screen.getByAltText('Role-based multi-party collaboration diagram')).toBeInTheDocument();
  });
});
