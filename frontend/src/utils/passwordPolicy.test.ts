import { describe, it, expect } from 'vitest';
import {
  PASSWORD_MIN_LENGTH,
  validatePassword,
  getPasswordStrengthLevel,
} from './passwordPolicy';

describe('passwordPolicy', () => {
  it('enforces a minimum length of 8', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
  });

  describe('validatePassword', () => {
    it('fails validation for passwords shorter than 8 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.meetsMinLength).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('passes minimum length for passwords with 8 or more characters', () => {
      const result = validatePassword('eightchars');
      expect(result.isValid).toBe(true);
      expect(result.meetsMinLength).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accurately identifies character categories', () => {
      const result = validatePassword('Pass123!');
      expect(result.hasUppercase).toBe(true);
      expect(result.hasLowercase).toBe(true);
      expect(result.hasNumber).toBe(true);
      expect(result.hasSpecial).toBe(true);
      expect(result.score).toBe(4);
      expect(result.strength).toBe('strong');
    });

    it('calculates intermediate strength levels', () => {
      const weak = validatePassword('short');
      expect(weak.strength).toBe('weak');

      const fair = validatePassword('password'); // minLength: true, others: false -> wait, metCount = 1
      expect(fair.strength).toBe('weak');

      const fair2 = validatePassword('Password'); // minLength + uppercase -> metCount = 2
      expect(fair2.strength).toBe('fair');

      const good = validatePassword('Password1'); // minLength + uppercase + number -> metCount = 3
      expect(good.strength).toBe('good');
    });
  });

  describe('getPasswordStrengthLevel', () => {
    it('returns appropriate UI colors and labels', () => {
      expect(getPasswordStrengthLevel(0).label).toBe('Weak');
      expect(getPasswordStrengthLevel(1).label).toBe('Weak');
      expect(getPasswordStrengthLevel(2).label).toBe('Fair');
      expect(getPasswordStrengthLevel(3).label).toBe('Good');
      expect(getPasswordStrengthLevel(4).label).toBe('Strong');
    });
  });
});
