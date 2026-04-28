import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TrackingTimeline, { Milestone } from './TrackingTimeline';

describe('TrackingTimeline', () => {
  const mockMilestones: Milestone[] = [
    {
      id: '1',
      name: 'Order Placed',
      timestamp: '2026-02-20 10:00 AM',
      location: 'New York, NY',
      status: 'completed',
    },
    {
      id: '2',
      name: 'Picked Up',
      timestamp: '2026-02-20 02:30 PM',
      location: 'New York, NY',
      status: 'completed',
    },
    {
      id: '3',
      name: 'In Transit',
      timestamp: '2026-02-21 08:15 AM',
      location: 'Philadelphia, PA',
      status: 'completed',
    },
    {
      id: '4',
      name: 'Out for Delivery',
      timestamp: '2026-02-23 09:00 AM',
      location: 'Boston, MA',
      status: 'current',
    },
    {
      id: '5',
      name: 'Delivered',
      timestamp: 'Expected: 2026-02-23 05:00 PM',
      location: 'Boston, MA',
      status: 'upcoming',
    },
  ];

  it('renders a vertical timeline with at least 5 milestones', () => {
    render(<TrackingTimeline milestones={mockMilestones} />);

    const timeline = screen.getByRole('list', { name: /shipment tracking timeline/i });
    expect(timeline).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(5);
  });

  it('displays milestone name, timestamp, and location for each node', () => {
    render(<TrackingTimeline milestones={mockMilestones} />);

    expect(screen.getByText('Order Placed')).toBeInTheDocument();
    expect(screen.getByText('2026-02-20 10:00 AM')).toBeInTheDocument();
    expect(screen.getAllByText('New York, NY').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Out for Delivery')).toBeInTheDocument();
    expect(screen.getByText('2026-02-23 09:00 AM')).toBeInTheDocument();
    expect(screen.getAllByText('Boston, MA').length).toBeGreaterThanOrEqual(1);
  });

  it('shows visual distinction between completed, current, and upcoming nodes', () => {
    render(<TrackingTimeline milestones={mockMilestones} />);

    // Icons use aria-label to indicate status
    const completedIcons = screen.getAllByLabelText('Completed');
    expect(completedIcons.length).toBeGreaterThanOrEqual(1);

    const currentIcon = screen.getByLabelText('Current');
    expect(currentIcon).toBeInTheDocument();

    const upcomingIcon = screen.getByLabelText('Upcoming');
    expect(upcomingIcon).toBeInTheDocument();
  });

  it('renders the correct number of completed, current, and upcoming icons', () => {
    render(<TrackingTimeline milestones={mockMilestones} />);

    expect(screen.getAllByLabelText('Completed').length).toBe(3);
    expect(screen.getAllByLabelText('Current').length).toBe(1);
    expect(screen.getAllByLabelText('Upcoming').length).toBe(1);
  });

  it('marks the current milestone as the active step for assistive technologies', () => {
    render(<TrackingTimeline milestones={mockMilestones} />);

    const currentMilestone = screen.getByRole('listitem', { name: /out for delivery/i });
    expect(currentMilestone).toHaveAttribute('aria-current', 'step');
  });

  it('renders connectors between milestones (n-1 connectors for n milestones)', () => {
    const { container } = render(<TrackingTimeline milestones={mockMilestones} />);

    // Connectors are aria-hidden divs (not SVGs) between milestone items
    const connectors = container.querySelectorAll('div[aria-hidden="true"]');
    expect(connectors.length).toBe(mockMilestones.length - 1);
  });

  it('completed connectors use solid background color', () => {
    const { container } = render(<TrackingTimeline milestones={mockMilestones} />);

    const connectors = container.querySelectorAll('div[aria-hidden="true"]');
    // First 3 milestones are completed — their connectors should have bg-accent-blue
    const solidConnectors = Array.from(connectors).filter(el =>
      el.className.includes('bg-accent-blue')
    );
    expect(solidConnectors.length).toBeGreaterThan(0);
  });

  it('non-completed connectors use dashed style', () => {
    const { container } = render(<TrackingTimeline milestones={mockMilestones} />);

    const connectors = container.querySelectorAll('div[aria-hidden="true"]');
    const dashedConnectors = Array.from(connectors).filter(el =>
      el.className.includes('connector-dashed')
    );
    expect(dashedConnectors.length).toBeGreaterThan(0);
  });

  it('accepts milestone data as props (reusable component)', () => {
    const customMilestones: Milestone[] = [
      {
        id: 'a',
        name: 'Custom Milestone',
        timestamp: '2026-02-23 12:00 PM',
        location: 'Custom Location',
        status: 'completed',
      },
    ];

    render(<TrackingTimeline milestones={customMilestones} />);

    expect(screen.getByText('Custom Milestone')).toBeInTheDocument();
    expect(screen.getByText('2026-02-23 12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Custom Location')).toBeInTheDocument();
  });
});
