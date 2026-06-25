import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import PasswordStrengthMeter from '../../../../components/ui/PasswordStrengthMeter';

const inputCls = 'w-full bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff] pr-10';

interface FieldProps {
  label: string;
  name: string;
  value: string;
  showValue: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
}

const PasswordField: React.FC<FieldProps> = ({ label, name, value, showValue, onChange, onToggle }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
    <div className="relative">
      <input
        name={name}
        type={showValue ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className={inputCls}
        placeholder="••••••••••••"
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        aria-label={showValue ? 'Hide' : 'Show'}
      >
        {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const ChangePasswordForm: React.FC = () => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const { isLoading, error, success, save } = useSettings();

  const mismatch = form.confirm !== '' && form.next !== form.confirm;
  const tooShort = form.next.length > 0 && form.next.length < 12;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggle = (field: keyof typeof show) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch || tooShort) return;
    void save({ url: '/api/auth/password', payload: { currentPassword: form.current as string, newPassword: form.next as string } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={18} className="text-[#62ffff]" />
        <h3 className="font-semibold">Change Password</h3>
      </div>
      <PasswordField label="Current Password" name="current" value={form.current} showValue={show.current} onChange={handleChange} onToggle={() => toggle('current')} />
      <PasswordField label="New Password (min 12 chars)" name="next" value={form.next} showValue={show.next} onChange={handleChange} onToggle={() => toggle('next')} />
      <PasswordStrengthMeter password={form.next} />
      <PasswordField label="Confirm New Password" name="confirm" value={form.confirm} showValue={show.confirm} onChange={handleChange} onToggle={() => toggle('confirm')} />
      {mismatch && <p className="text-xs text-red-400">Passwords do not match</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}
      <button
        type="submit"
        disabled={isLoading || mismatch || tooShort || !form.current || !form.next}
        className="px-5 py-2.5 bg-[#62ffff] text-black font-semibold text-sm rounded-lg hover:bg-[#4ae8e8] disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
