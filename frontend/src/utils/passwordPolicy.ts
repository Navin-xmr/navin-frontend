export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRule {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  meetsMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  rules: PasswordRule[];
  score: number; // 0 to 4
  strength: 'weak' | 'fair' | 'good' | 'strong';
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const meetsMinLength = password.length >= PASSWORD_MIN_LENGTH;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const rules: PasswordRule[] = [
    { id: 'minLength', label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: meetsMinLength },
    { id: 'uppercase', label: 'An uppercase letter', met: hasUppercase },
    { id: 'number', label: 'A number', met: hasNumber },
    { id: 'special', label: 'A special character', met: hasSpecial },
  ];

  const errors: string[] = [];
  if (!meetsMinLength) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  const metCount = rules.filter((r) => r.met).length;

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (metCount <= 1) strength = 'weak';
  else if (metCount === 2) strength = 'fair';
  else if (metCount === 3) strength = 'good';
  else strength = 'strong';

  return {
    isValid: meetsMinLength,
    meetsMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    rules,
    score: metCount,
    strength,
    errors,
  };
}

export function getPasswordStrengthLevel(score: number): {
  label: string;
  segments: number;
  color: string;
  textColor: string;
} {
  if (score <= 1) return { label: 'Weak', segments: 1, color: 'bg-red-500', textColor: 'text-red-400' };
  if (score === 2) return { label: 'Fair', segments: 2, color: 'bg-orange-400', textColor: 'text-orange-400' };
  if (score === 3) return { label: 'Good', segments: 3, color: 'bg-yellow-400', textColor: 'text-yellow-400' };
  return { label: 'Strong', segments: 4, color: 'bg-green-400', textColor: 'text-green-400' };
}
