import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeliveryConfirmation from './DeliveryConfirmation';

const defaultProps = {
  shipmentId: '#SHP-001',
  status: 'delivered',
};

describe('DeliveryConfirmation', () => {
  it('full user flow: open form, pick rating, add feedback, submit and show success', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(<DeliveryConfirmation shipmentId="SHP-1" status="delivered" onConfirm={onConfirm} />);

    expect(screen.getByRole('button', { name: /Confirm Receipt/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Confirm Receipt/i }));

    const stars = screen.getAllByRole('radio');
    await user.click(stars[3]);

    const textarea = screen.getByPlaceholderText(/Share any comments about your delivery/i);
    await user.type(textarea, 'Great delivery');

    await user.click(screen.getByRole('button', { name: /Submit Confirmation/i }));

    await screen.findByText(/Thank you for confirming!/i);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith('SHP-1', 4, 'Great delivery');
  });

  describe('render conditions', () => {
    it('renders when status is delivered', () => {
      render(<DeliveryConfirmation {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /confirm delivery/i })).toBeInTheDocument();
    });

    it('renders nothing when status is not delivered', () => {
      const { container } = render(<DeliveryConfirmation shipmentId="#SHP-001" status="in_transit" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing for pending status', () => {
      const { container } = render(<DeliveryConfirmation shipmentId="#SHP-001" status="pending" />);
      expect(container.firstChild).toBeNull();
    });

    it('shows shipment ID in prompt', () => {
      render(<DeliveryConfirmation {...defaultProps} />);
      expect(screen.getByText(/#SHP-001/)).toBeInTheDocument();
    });
  });

  describe('interaction flow', () => {
    it('shows Confirm Receipt button initially', () => {
      render(<DeliveryConfirmation {...defaultProps} />);
      expect(screen.getByRole('button', { name: /confirm receipt/i })).toBeInTheDocument();
    });

    it('reveals form when Confirm Receipt is clicked', async () => {
      render(<DeliveryConfirmation {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getByLabelText(/feedback/i)).toBeInTheDocument();
    });

    it('does not show form before Confirm Receipt is clicked', () => {
      render(<DeliveryConfirmation {...defaultProps} />);
      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    });
  });

  describe('rating selection', () => {
    beforeEach(async () => {
      render(<DeliveryConfirmation {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
    });

    it('renders 5 star buttons', () => {
      const stars = screen.getAllByRole('radio');
      expect(stars).toHaveLength(5);
    });

    it('marks selected star as checked', async () => {
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[2]);
      expect(stars[2]).toHaveAttribute('aria-checked', 'true');
    });

    it('shows label for selected rating', async () => {
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[4]);
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('shows hover preview on mouse enter', () => {
      const stars = screen.getAllByRole('radio');
      fireEvent.mouseEnter(stars[1]);
      expect(screen.getByText('Fair')).toBeInTheDocument();
    });

    it('clears hover preview on mouse leave from group', () => {
      const group = screen.getByRole('radiogroup');
      const stars = screen.getAllByRole('radio');
      fireEvent.mouseEnter(stars[1]);
      fireEvent.mouseLeave(group);
      expect(screen.queryByText('Fair')).not.toBeInTheDocument();
    });

    it('supports keyboard selection with Enter', () => {
      const stars = screen.getAllByRole('radio');
      fireEvent.keyDown(stars[2], { key: 'Enter' });
      expect(stars[2]).toHaveAttribute('aria-checked', 'true');
    });

    it('supports keyboard selection with Space', () => {
      const stars = screen.getAllByRole('radio');
      fireEvent.keyDown(stars[0], { key: ' ' });
      expect(stars[0]).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('submission behavior', () => {
    // Each test renders its own instance to avoid pollution

    it('submit button is disabled when no rating selected', async () => {
      render(<DeliveryConfirmation {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      expect(screen.getByRole('button', { name: /submit confirmation/i })).toBeDisabled();
    });

    it('submit button is enabled after rating is selected', async () => {
      render(<DeliveryConfirmation {...defaultProps} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[3]);
      expect(screen.getByRole('button', { name: /submit confirmation/i })).not.toBeDisabled();
    });

    it('does not submit without a rating', async () => {
      const onConfirm = vi.fn();
      render(<DeliveryConfirmation {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const form = document.querySelector('form');
      if (form) fireEvent.submit(form);
      await userEvent.click(screen.getByRole('button', { name: /^submit confirmation$/i }));
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm with correct args on submit', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<DeliveryConfirmation {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[4]);
      await userEvent.type(screen.getByLabelText(/feedback/i), 'Great service');
      await userEvent.click(screen.getByRole('button', { name: /^submit confirmation$/i }));
      await waitFor(() => expect(onConfirm).toHaveBeenCalledWith('#SHP-001', 5, 'Great service'));
    });

    it('submits with empty feedback when feedback is optional', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<DeliveryConfirmation {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[2]);
      await userEvent.click(screen.getByRole('button', { name: /^submit confirmation$/i }));
      await waitFor(() => expect(onConfirm).toHaveBeenCalledWith('#SHP-001', 3, ''));
    });
  });

  describe('loading state', () => {
    it('shows loading state during submission', async () => {
      const onConfirm = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 500)));
      render(<DeliveryConfirmation {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[0]);
      await userEvent.click(screen.getByRole('button', { name: /submit confirmation/i }));
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    });

    it('prevents duplicate submissions', async () => {
      const onConfirm = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 500)));
      render(<DeliveryConfirmation {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[0]);
      const submitBtn = screen.getByRole('button', { name: /submit confirmation/i });
      await userEvent.click(submitBtn);
      await userEvent.click(submitBtn);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('post-submit state', () => {
    // Each test renders its own instance to avoid pollution
    it('shows thank-you message after successful submission', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<DeliveryConfirmation {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[3]);
      await userEvent.click(screen.getByRole('button', { name: /submit confirmation/i }));
      await waitFor(() => expect(screen.getByText(/thank you for confirming/i)).toBeInTheDocument());
    });

    it('displays submitted rating in success state', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<DeliveryConfirmation {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[3]);
      await userEvent.click(screen.getByRole('button', { name: /submit confirmation/i }));
      await waitFor(() => expect(screen.getByText('Very Good')).toBeInTheDocument());
    });

    it('shows error message when submission fails', async () => {
      const onConfirm = vi.fn().mockRejectedValue(new Error('Network error'));
      render(<DeliveryConfirmation {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[0]);
      await userEvent.click(screen.getByRole('button', { name: /submit confirmation/i }));
      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Network error'));
    });

    it('does not show form after successful submission', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<DeliveryConfirmation {...defaultProps} onConfirm={onConfirm} />);
      await userEvent.click(screen.getByRole('button', { name: /confirm receipt/i }));
      const stars = screen.getAllByRole('radio');
      await userEvent.click(stars[1]);
      await userEvent.click(screen.getByRole('button', { name: /submit confirmation/i }));
      await waitFor(() => expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument());
    });
  });
});
