import React, { useState } from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import { apiClient } from '@services/api/client';

const TwoFactorSetup: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleEnable = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<{ data: { qrCodeUrl: string } }>('/api/auth/2fa/setup');
      setQrUrl(res.data.data.qrCodeUrl);
      setEnabled(true);
    } catch {
      setError('Could not start 2FA setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/api/auth/2fa/verify', { code });
      setVerified(true);
    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      await apiClient.delete('/api/auth/2fa');
      setEnabled(false);
      setQrUrl(null);
      setVerified(false);
    } catch {
      setError('Could not disable 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {verified ? <ShieldCheck size={18} className="text-green-400" /> : <Shield size={18} className="text-[#62ffff]" />}
        <h3 className="font-semibold">Two-Factor Authentication</h3>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${verified ? 'bg-green-400/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
          {verified ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {!enabled ? (
        <div>
          <p className="text-sm text-slate-400 mb-3">Add an extra layer of security using a TOTP authenticator app.</p>
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium border border-[rgba(98,255,255,0.3)] text-[#62ffff] rounded-lg hover:bg-[rgba(98,255,255,0.1)] disabled:opacity-50"
          >
            {isLoading ? 'Setting up…' : 'Enable 2FA'}
          </button>
        </div>
      ) : !verified ? (
        <div className="space-y-4">
          {qrUrl && (
            <div className="bg-white p-3 inline-block rounded-lg">
              <img src={qrUrl} alt="2FA QR code" className="w-40 h-40" />
            </div>
          )}
          <p className="text-sm text-slate-400">Scan the QR code with your authenticator app, then enter the 6-digit code.</p>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-32 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white text-center tracking-[0.3em] focus:outline-none focus:border-[#62ffff]"
            />
            <button
              onClick={handleVerify}
              disabled={isLoading || code.length !== 6}
              className="px-4 py-2 bg-[#62ffff] text-black text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Verifying…' : 'Verify'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-green-400">2FA is active on your account.</p>
          <button
            onClick={handleDisable}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 disabled:opacity-50"
          >
            Disable 2FA
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default TwoFactorSetup;
