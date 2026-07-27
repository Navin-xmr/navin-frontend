import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { invitationsApi } from '@services/api';
import type { UserRole } from '@services/api';
import PasswordStrengthMeter from '../../../components/ui/PasswordStrengthMeter';

interface InviteInfo {
  companyName: string;
  role: UserRole;
  email: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Admin — Full access',
  Manager: 'Manager — Edit & View',
  Viewer: 'Viewer — Read only',
  Driver: 'Driver — Assigned Routes',
};

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      Promise.resolve().then(() => {
        setInfoError('Invalid or missing invitation token.');
        setInfoLoading(false);
      });
      return;
    }
    invitationsApi.getInfo(token)
      .then((data) => setInviteInfo(data))
      .catch(() => setInfoError('This invitation link is invalid or has expired.'))
      .finally(() => setInfoLoading(false));
  }, [token]);

  const passwordStrong = password.length >= 8;
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordStrong || !passwordsMatch || !name.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { token: authToken } = await invitationsApi.accept({ token, password, name: name.trim() });
      localStorage.setItem('authToken', authToken);
      setDone(true);
    } catch {
      setSubmitError('Failed to complete registration. The token may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full bg-[#0b0e14] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3b82f6] transition-colors';

  if (infoLoading) {
    return (
      <div className="min-h-screen bg-[#07090d] flex items-center justify-center">
        <Loader2 size={32} className="text-[#62ffff] animate-spin" />
      </div>
    );
  }

  if (infoError) {
    return (
      <div className="min-h-screen bg-[#07090d] flex items-center justify-center px-4">
        <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl p-8 max-w-sm w-full text-center">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Invalid Invitation</h2>
          <p className="text-sm text-slate-400 mb-6">{infoError}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-[#3b82f6] text-white font-semibold rounded-lg text-sm hover:bg-[#2563eb] transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#07090d] flex items-center justify-center px-4">
        <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl p-8 max-w-sm w-full text-center">
          <CheckCircle2 size={40} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Welcome to Navin!</h2>
          <p className="text-sm text-slate-400 mb-6">
            Your account has been created. You've joined <strong className="text-white">{inviteInfo?.companyName}</strong> as{' '}
            <strong className="text-white">{inviteInfo?.role}</strong>.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 bg-gradient-to-br from-[#13baba] to-[#0d9488] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090d] flex items-center justify-center px-4">
      <div className="bg-[#14171e] border border-[#1e293b] rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/logo.svg" alt="Navin Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-[#62ffff]">NAVIN</span>
        </div>

        <h1 className="text-xl font-semibold text-white mb-1">You're invited!</h1>
        <p className="text-sm text-slate-400 mb-6">
          You've been invited to join <strong className="text-white">{inviteInfo?.companyName}</strong> as{' '}
          <span className="inline-block bg-[#1e293b] text-slate-300 text-xs px-2 py-0.5 rounded font-medium">
            {inviteInfo ? ROLE_LABELS[inviteInfo.role] : ''}
          </span>
        </p>

        {/* Pre-filled email */}
        <div className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.15)] rounded-lg px-4 py-2.5 text-sm text-slate-400 mb-6">
          Signing up as: <span className="text-white font-medium">{inviteInfo?.email}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Create Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
            {password && !passwordStrong && (
              <p className="text-xs text-red-400 mt-1">Password must be at least 8 characters.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              className={inputCls}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match.</p>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !passwordStrong || !passwordsMatch || !name.trim()}
            className="w-full py-2.5 bg-gradient-to-br from-[#13baba] to-[#0d9488] text-white font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account…
              </>
            ) : (
              'Create Account & Join'
            )}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-[#62ffff] hover:underline bg-transparent border-none cursor-pointer text-xs">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default AcceptInvitation;
