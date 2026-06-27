import React, { useState } from 'react';
import { Shield, ShieldCheck, Copy, Download, RefreshCw } from 'lucide-react';
import { apiClient } from '@services/api/client';

const TwoFactorSetup: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodesAcknowledged, setBackupCodesAcknowledged] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [copied, setCopied] = useState(false);

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
      const res = await apiClient.post<{ data: { backupCodes: string[] } }>('/api/auth/2fa/verify', { code });
      setBackupCodes(res.data.data.backupCodes);
      setShowBackupCodes(true);
    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledgeBackupCodes = () => {
    setBackupCodesAcknowledged(true);
    setShowBackupCodes(false);
    setVerified(true);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'navin-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDisable = async () => {
    if (!disablePassword) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete('/api/auth/2fa', { data: { password: disablePassword } });
      setEnabled(false);
      setQrUrl(null);
      setVerified(false);
      setBackupCodes([]);
      setBackupCodesAcknowledged(false);
      setShowDisableModal(false);
      setDisablePassword('');
    } catch {
      setError('Could not disable 2FA. Check your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<{ data: { backupCodes: string[] } }>('/api/auth/2fa/backup-codes/regenerate');
      setBackupCodes(res.data.data.backupCodes);
      setShowBackupCodes(true);
    } catch {
      setError('Could not regenerate backup codes.');
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
      ) : !verified && !showBackupCodes ? (
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
      ) : showBackupCodes ? (
        <div className="space-y-4">
          <p className="text-sm text-yellow-400">Save these backup codes in a safe place. Each code can be used once.</p>
          <div className="grid grid-cols-2 gap-2 bg-slate-800/50 p-4 rounded-lg">
            {backupCodes.map((code, index) => (
              <div key={index} className="text-sm font-mono text-white bg-slate-700/50 px-3 py-2 rounded text-center">
                {code}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopyBackupCodes}
              className="px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 flex items-center gap-2"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownloadBackupCodes}
              className="px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
          </div>
          <button
            onClick={handleAcknowledgeBackupCodes}
            className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg"
          >
            I've saved my backup codes
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-green-400">2FA is active on your account.</p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleRegenerateBackupCodes}
              disabled={isLoading}
              className="px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Regenerate Backup Codes
            </button>
            <button
              onClick={() => setShowDisableModal(true)}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 disabled:opacity-50"
            >
              Disable 2FA
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {showDisableModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0a1a1a] border border-[#62ffff]/30 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-slate-400 mb-4">Enter your current password to confirm you want to disable 2FA.</p>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-[#62ffff]"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDisableModal(false)}
                className="px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable}
                disabled={isLoading || !disablePassword}
                className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Disabling…' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
