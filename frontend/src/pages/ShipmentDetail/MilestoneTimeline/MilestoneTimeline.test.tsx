import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MilestoneTimeline, { MilestoneDetail } from './MilestoneTimeline';

describe('MilestoneTimeline', () => {
  const mockMilestones: MilestoneDetail[] = [
    {
      id: '1',
      name: 'Order Confirmed',
      timestamp: '2026-02-20 09:15 AM',
      location: 'New York, NY',
      blockchainAddress: 'GABCD1234567890WXYZ',
      status: 'completed',
      notes: 'Order confirmed',
      sensorReadings: {
        temperature: '22°C',
        humidity: '45%',
      },
    },
    {
      id: '2',
      name: 'In Transit',
      timestamp: '2026-02-21 10:00 AM',
      location: 'Philadelphia, PA',
      blockchainAddress: 'GEFGH2345678901YZAB',
      status: 'current',
    },
    {
      id: '3',
      name: 'Delivered',
      timestamp: 'Expected: 2026-02-23 05:00 PM',
      location: 'Boston, MA',
      blockchainAddress: 'GIJKL3456789012ZABC',
      status: 'upcoming',
    },
  ];

  it('renders all milestones', () => {
    render(<MilestoneTimeline milestones={mockMilestones} />);
    
    expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('displays truncated blockchain addresses', () => {
    render(<MilestoneTimeline milestones={mockMilestones} />);
    
    expect(screen.getByText('GABCD...WXYZ')).toBeInTheDocument();
    expect(screen.getByText('GEFGH...YZAB')).toBeInTheDocument();
  });

  it('shows timestamps and locations', () => {
    render(<MilestoneTimeline milestones={mockMilestones} />);
    
    expect(screen.getByText('2026-02-20 09:15 AM')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
  });

  it('expands milestone details when expand button is clicked', () => {
    render(<MilestoneTimeline milestones={mockMilestones} />);
    
    // Notes should not be visible initially
    expect(screen.queryByText('Order confirmed')).not.toBeInTheDocument();
    
    // Find and click the expand button for the first milestone
    const expandButtons = screen.getAllByLabelText('Expand details');
    fireEvent.click(expandButtons[0]);
    
    // Notes should now be visible
    expect(screen.getByText('Order confirmed')).toBeInTheDocument();
  });

  it('displays sensor readings when expanded', () => {
    render(<MilestoneTimeline milestones={mockMilestones} />);
    
    // Expand the first milestone
    const expandButtons = screen.getAllByLabelText('Expand details');
    fireEvent.click(expandButtons[0]);
    
    // Check for sensor readings
    expect(screen.getByText('22°C')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('collapses milestone details when expand button is clicked again', () => {
    render(<MilestoneTimeline milestones={mockMilestones} />);
    
    const expandButtons = screen.getAllByLabelText('Expand details');
    
    // Expand
    fireEvent.click(expandButtons[0]);
    expect(screen.getByText('Order confirmed')).toBeInTheDocument();
    
    // Collapse
    const collapseButton = screen.getByLabelText('Collapse details');
    fireEvent.click(collapseButton);
    expect(screen.queryByText('Order confirmed')).not.toBeInTheDocument();
  });

  it('does not show expand button for milestones without additional details', () => {
    render(<MilestoneTimeline milestones={mockMilestones} />);
    
    // The second milestone has no notes or sensor readings
    const expandButtons = screen.getAllByLabelText(/Expand details|Collapse details/);
    
    // Only the first milestone should have an expand button
    expect(expandButtons.length).toBe(1);
  });

  it('applies correct status classes', () => {
    const { container } = render(<MilestoneTimeline milestones={mockMilestones} />);
    
    const completedItem = container.querySelector('.milestone-item-completed');
    const currentItem = container.querySelector('.milestone-item-current');
    const upcomingItem = container.querySelector('.milestone-item-upcoming');
    
    expect(completedItem).toBeInTheDocument();
    expect(currentItem).toBeInTheDocument();
    expect(upcomingItem).toBeInTheDocument();
  });

  it('renders connectors between milestones', () => {
    const { container } = render(<MilestoneTimeline milestones={mockMilestones} />);
    
    const connectors = container.querySelectorAll('.milestone-connector');
    
    // Should have n-1 connectors for n milestones
    expect(connectors.length).toBe(mockMilestones.length - 1);
  });

  it('handles empty milestones array', () => {
    render(<MilestoneTimeline milestones={[]} />);
    
    const timeline = screen.getByRole('list');
    expect(timeline).toBeInTheDocument();
    expect(timeline.children.length).toBe(0);
  });
});
