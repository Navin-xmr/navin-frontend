import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { validatePassword, getPasswordStrengthLevel } from '@utils/passwordPolicy';

const LEVEL_LABELS: Record<string, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

const REPRESENTATIVE_PASSWORDS: Record<string, string> = {
  weak: 'abc',
  fair: 'abcdefgh',
  good: 'Abcdefgh1',
  strong: 'Abcdefgh1!@#',
};

describe('PasswordStrengthMeter', () => {
  it('renders nothing for an empty password', () => {
    const { container } = render(<PasswordStrengthMeter password="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(Object.entries(REPRESENTATIVE_PASSWORDS))(
    'renders the %s strength band correctly',
    (band, password) => {
      const result = validatePassword(password);
      const level = getPasswordStrengthLevel(result.score);
      const expectedLabel = LEVEL_LABELS[level];

      render(<PasswordStrengthMeter password={password} />);

      expect(screen.getByText(expectedLabel)).toBeInTheDocument();

      const segments = screen.getAllByTestId('password-strength-segment');
      const filledSegments = segments.filter(
        (segment) => segment.getAttribute('data-filled') === 'true',
      );
      expect(filledSegments).toHaveLength(level === 'weak' ? 1 : level === 'fair' ? 2 : level === 'good' ? 3 : 4);

      const unmetCriteria = result.criteria.filter((criterion) => !criterion.met);
      for (const criterion of unmetCriteria) {
        expect(
          screen.getByText(new RegExp(`^Add .*${criterion.label}`, 'i')),
        ).toBeInTheDocument();
      }
    },
  );

  it('renders unmet criteria items with the "Add ..." prefix', () => {
    const password = 'abc';
    const result = validatePassword(password);
    const unmetCriteria = result.criteria.filter((criterion) => !criterion.met);

    expect(unmetCriteria.length).toBeGreaterThan(0);

    render(<PasswordStrengthMeter password={password} />);

    for (const criterion of unmetCriteria) {
      const item = screen.getByText(new RegExp(criterion.label, 'i'));
      expect(item.textContent).toMatch(/^Add /);
    }
  });
});