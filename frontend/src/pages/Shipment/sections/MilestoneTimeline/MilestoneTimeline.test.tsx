import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MilestoneTimeline from './MilestoneTimeline';
import { Milestone } from './types';

describe('MilestoneTimeline', () => {
  const mockMilestones: Milestone[] = [
    {
      id: '1',
      status: 'Created',
      label: 'Order Created',
      timestamp: '2026-02-20 09:15 AM',
      location: 'New York, NY',
      isCompleted: true,
    },
    {
      id: '2',
      status: 'In Transit',
      label: 'In Transit',
      timestamp: '2026-02-21 10:00 AM',
      location: 'Philadelphia, PA',
      isCompleted: false,
      isCurrent: true,
    },
    {
      id: '3',
      status: 'Delivered',
      label: 'Delivered',
      timestamp: 'Expected: 2026-02-23 05:00 PM',
      location: 'Boston, MA',
      isCompleted: false,
    },
  ];

  it('renders all milestones in desktop view', () => {
    render(<MilestoneTimeline milestones={mockMilestones} />);
    
    // Check for labels
    expect(screen.getAllByText('Order Created').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Transit').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Delivered').length).toBeGreaterThan(0);
  });

  it('shows timestamps and locations', () => {
    render(<MilestoneTimeline milestones={mockMilestones} />);
    
    expect(screen.getAllByText('2026-02-20 09:15 AM').length).toBeGreaterThan(0);
    expect(screen.getAllByText('New York, NY').length).toBeGreaterThan(0);
  });

  it('highlights the current milestone', () => {
    const { container } = render(<MilestoneTimeline milestones={mockMilestones} />);
    
    // The current milestone should have a primary color border (part of classes)
    const currentMilestone = container.querySelector('.border-primary\\/30');
    expect(currentMilestone).toBeInTheDocument();
    expect(currentMilestone).toHaveTextContent('In Transit');
  });

  it('marks completed milestones', () => {
    const { container } = render(<MilestoneTimeline milestones={mockMilestones} />);
    
    // Completed milestones use bg-accent-blue for the node
    const completedNode = container.querySelector('.bg-accent-blue');
    expect(completedNode).toBeInTheDocument();
  });
});
