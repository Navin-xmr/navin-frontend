import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MilestoneTimeline, { type MilestoneDetail } from './MilestoneTimeline';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const COMPLETED: MilestoneDetail = {
  id: 'm1',
  name: 'Picked Up',
  timestamp: '2026-01-01 09:00',
  location: 'London Depot',
  blockchainAddress: 'GABC123456789012345678901234567890',
  status: 'completed',
};

const CURRENT: MilestoneDetail = {
  id: 'm2',
  name: 'In Transit',
  timestamp: '2026-01-02 12:00',
  location: 'Dover Checkpoint',
  blockchainAddress: 'GDEF123456789012345678901234567890',
  status: 'current',
};

const UPCOMING: MilestoneDetail = {
  id: 'm3',
  name: 'Delivered',
  timestamp: 'Expected 2026-01-04',
  location: 'Paris Warehouse',
  blockchainAddress: 'pending...',
  status: 'upcoming',
};

const ALL_MILESTONES: MilestoneDetail[] = [COMPLETED, CURRENT, UPCOMING];

const WITH_NOTES: MilestoneDetail = {
  ...COMPLETED,
  id: 'm4',
  notes: 'Fragile — handle with care',
};

const WITH_SENSORS: MilestoneDetail = {
  ...CURRENT,
  id: 'm5',
  sensorReadings: {
    temperature: '4°C',
    humidity: '65%',
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MilestoneTimeline', () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  describe('initial render', () => {
    it('renders the timeline list landmark', () => {
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);
      expect(
        screen.getByRole('list', { name: /detailed shipment milestone timeline/i }),
      ).toBeInTheDocument();
    });

    it('renders all milestone names', () => {
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);
      expect(screen.getByText('Picked Up')).toBeInTheDocument();
      expect(screen.getByText('In Transit')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });

    it('renders the milestone timestamp', () => {
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);
      expect(screen.getByText('2026-01-01 09:00')).toBeInTheDocument();
    });

    it('renders the milestone location', () => {
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);
      expect(screen.getByText('London Depot')).toBeInTheDocument();
    });

    it('renders a LIVE badge for the current milestone', () => {
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);
      expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('shows a blockchain link for completed milestones', () => {
      render(<MilestoneTimeline milestones={[COMPLETED]} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', expect.stringContaining('stellar.expert'));
    });

    it('does not render a blockchain link for upcoming milestones', () => {
      render(<MilestoneTimeline milestones={[UPCOMING]} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  // ── Filter pills ───────────────────────────────────────────────────────────

  describe('filter pills', () => {
    it('renders all four filter pills (All, Completed, In Progress, Upcoming)', () => {
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);
      expect(screen.getByRole('button', { name: /^All/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Completed/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^In Progress/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Upcoming/ })).toBeInTheDocument();
    });

    it('filters to only completed milestones when Completed pill is clicked', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);

      await user.click(screen.getByRole('button', { name: /^Completed/ }));

      expect(screen.getByText('Picked Up')).toBeInTheDocument();
      expect(screen.queryByText('In Transit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delivered')).not.toBeInTheDocument();
    });

    it('filters to only current milestones when In Progress pill is clicked', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);

      await user.click(screen.getByRole('button', { name: /^In Progress/ }));

      expect(screen.queryByText('Picked Up')).not.toBeInTheDocument();
      expect(screen.getByText('In Transit')).toBeInTheDocument();
      expect(screen.queryByText('Delivered')).not.toBeInTheDocument();
    });

    it('shows an empty state when no milestones match the filter', async () => {
      const user = userEvent.setup();
      // Only COMPLETED milestones — filtering by "current" should show empty state
      render(<MilestoneTimeline milestones={[COMPLETED]} />);

      await user.click(screen.getByRole('button', { name: /^In Progress/ }));

      expect(
        screen.getByText(/No milestones match the selected filter/i),
      ).toBeInTheDocument();
    });

    it('shows a "Clear filter" button in the empty state', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={[COMPLETED]} />);

      await user.click(screen.getByRole('button', { name: /^In Progress/ }));

      expect(screen.getByRole('button', { name: /clear filter/i })).toBeInTheDocument();
    });

    it('clears the filter when "Clear filter" is clicked', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={[COMPLETED]} />);

      await user.click(screen.getByRole('button', { name: /^In Progress/ }));
      await user.click(screen.getByRole('button', { name: /clear filter/i }));

      expect(screen.getByText('Picked Up')).toBeInTheDocument();
    });

    it('returns to full list when All filter is clicked after filtering', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);

      await user.click(screen.getByRole('button', { name: /^Completed/ }));
      await user.click(screen.getByRole('button', { name: /^All/ }));

      expect(screen.getByText('Picked Up')).toBeInTheDocument();
      expect(screen.getByText('In Transit')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });
  });

  // ── Zoom controls ─────────────────────────────────────────────────────────

  describe('zoom controls', () => {
    it('renders zoom in and zoom out buttons', () => {
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);
      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
    });

    it('shows "Normal" zoom level by default', () => {
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);
      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('disables zoom out when already at compact level', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);

      await user.click(screen.getByRole('button', { name: /zoom out/i }));
      // Now at Compact — zoom out should be disabled
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
    });

    it('disables zoom in when already at expanded level', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);

      await user.click(screen.getByRole('button', { name: /zoom in/i }));
      // Now at Expanded — zoom in should be disabled
      expect(screen.getByRole('button', { name: /zoom in/i })).toBeDisabled();
    });

    it('shows the reset button when zoom is changed from default', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);

      await user.click(screen.getByRole('button', { name: /zoom in/i }));
      expect(
        screen.getByRole('button', { name: /reset filters and zoom/i }),
      ).toBeInTheDocument();
    });

    it('resets zoom and filter when the reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={ALL_MILESTONES} />);

      await user.click(screen.getByRole('button', { name: /zoom in/i }));
      await user.click(screen.getByRole('button', { name: /reset filters and zoom/i }));

      expect(screen.getByText('Normal')).toBeInTheDocument();
    });
  });

  // ── Expandable details ────────────────────────────────────────────────────

  describe('expandable milestone details', () => {
    it('renders the expand button for milestones with notes', () => {
      render(<MilestoneTimeline milestones={[WITH_NOTES]} />);
      expect(
        screen.getByRole('button', { name: /expand details/i }),
      ).toBeInTheDocument();
    });

    it('does not render the expand button for milestones without notes', () => {
      render(<MilestoneTimeline milestones={[UPCOMING]} />);
      expect(
        screen.queryByRole('button', { name: /expand details/i }),
      ).not.toBeInTheDocument();
    });

    it('reveals notes content when expand button is clicked', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={[WITH_NOTES]} />);

      await user.click(screen.getByRole('button', { name: /expand details/i }));
      expect(screen.getByText('Fragile — handle with care')).toBeInTheDocument();
    });

    it('hides notes content after collapsing', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={[WITH_NOTES]} />);

      const expandBtn = screen.getByRole('button', { name: /expand details/i });
      await user.click(expandBtn);
      await user.click(screen.getByRole('button', { name: /collapse details/i }));

      expect(screen.queryByText('Fragile — handle with care')).not.toBeInTheDocument();
    });

    it('reveals sensor readings when expanded', async () => {
      const user = userEvent.setup();
      render(<MilestoneTimeline milestones={[WITH_SENSORS]} />);

      await user.click(screen.getByRole('button', { name: /expand details/i }));
      expect(screen.getByText('4°C')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });
  });

  // ── Empty props ───────────────────────────────────────────────────────────

  describe('empty milestones array', () => {
    it('renders the timeline container with no list items', () => {
      render(<MilestoneTimeline milestones={[]} />);
      const list = screen.getByRole('list', { name: /detailed shipment milestone timeline/i });
      expect(list).toBeInTheDocument();
      expect(list.children.length).toBe(0);
    });
  });
});
