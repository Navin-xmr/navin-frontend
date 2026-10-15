import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressStepper from './ProgressStepper';

const steps = [
  { label: 'Account', description: 'Create your account' },
  { label: 'Profile', description: 'Set up your profile' },
  { label: 'Confirm', description: 'Confirm your details' },
];

describe('ProgressStepper', () => {
  it('renders the active step with number, aria-current, active label class, and description', () => {
    const { container } = render(<ProgressStepper steps={steps} currentStep={1} />);

    const nav = screen.getByRole('navigation', { name: 'Progress steps' });
    expect(nav).toBeInTheDocument();

    const circles = container.querySelectorAll('[data-testid="progress-stepper-circle"]');
    expect(circles).toHaveLength(steps.length);

    const activeCircle = circles[1];
    expect(activeCircle).toHaveAttribute('aria-current', 'step');
    expect(activeCircle.textContent).toBe('2');

    const activeLabel = screen.getByText('Profile');
    expect(activeLabel).toHaveClass('text-[#00DAC1]');

    expect(screen.getByText('Set up your profile')).toBeInTheDocument();
    expect(screen.queryByText('Create your account')).not.toBeInTheDocument();
    expect(screen.queryByText('Confirm your details')).not.toBeInTheDocument();
  });

  it('renders a completed step with a check icon, no aria-current, and completed label class', () => {
    const { container } = render(<ProgressStepper steps={steps} currentStep={2} />);

    const circles = container.querySelectorAll('[data-testid="progress-stepper-circle"]');
    const completedCircle = circles[0];

    expect(completedCircle).not.toHaveAttribute('aria-current');
    expect(completedCircle.querySelector('svg')).toBeInTheDocument();
    expect(completedCircle.textContent).not.toBe('1');

    const completedLabel = screen.getByText('Account');
    expect(completedLabel).toHaveClass('text-[#00DAC1]/70');
  });

  it('renders an upcoming step with number, no aria-current, and upcoming label class', () => {
    const { container } = render(<ProgressStepper steps={steps} currentStep={0} />);

    const circles = container.querySelectorAll('[data-testid="progress-stepper-circle"]');
    const upcomingCircle = circles[2];

    expect(upcomingCircle).not.toHaveAttribute('aria-current');
    expect(upcomingCircle.textContent).toBe('3');

    const upcomingLabel = screen.getByText('Confirm');
    expect(upcomingLabel).toHaveClass('text-[rgba(255,255,255,0.3)]');
  });

  it('renders the correct number of connector lines and applies completed background class', () => {
    const { container } = render(<ProgressStepper steps={steps} currentStep={1} />);

    const connectors = container.querySelectorAll('[aria-hidden="true"][data-testid="progress-stepper-connector"]');
    expect(connectors).toHaveLength(steps.length - 1);

    expect(connectors[0]).toHaveClass('bg-[#00DAC1]');
    expect(connectors[1]).not.toHaveClass('bg-[#00DAC1]');
  });

  it('renders a nav landmark with the correct aria-label', () => {
    render(<ProgressStepper steps={steps} currentStep={0} />);
    expect(screen.getByRole('navigation', { name: 'Progress steps' })).toBeInTheDocument();
  });

  it('applies a custom className to the nav', () => {
    render(<ProgressStepper steps={steps} currentStep={0} className="custom-class" />);
    const nav = screen.getByRole('navigation', { name: 'Progress steps' });
    expect(nav).toHaveClass('custom-class');
  });

  it('renders no connector for a single step', () => {
    const { container } = render(
      <ProgressStepper steps={[{ label: 'Only', description: 'Only step' }]} currentStep={0} />,
    );
    const connectors = container.querySelectorAll('[aria-hidden="true"][data-testid="progress-stepper-connector"]');
    expect(connectors).toHaveLength(0);
  });

  it('marks all steps completed when currentStep is beyond the last step', () => {
    const { container } = render(<ProgressStepper steps={steps} currentStep={steps.length} />);

    const circles = container.querySelectorAll('[data-testid="progress-stepper-circle"]');
    circles.forEach((circle) => {
      expect(circle).not.toHaveAttribute('aria-current');
      expect(circle.querySelector('svg')).toBeInTheDocument();
    });

    const connectors = container.querySelectorAll('[aria-hidden="true"][data-testid="progress-stepper-connector"]');
    connectors.forEach((connector) => {
      expect(connector).toHaveClass('bg-[#00DAC1]');
    });
  });
});