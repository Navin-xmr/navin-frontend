import React, { useState } from 'react';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { apiClient } from '@services/api/client';

interface DangerZoneProps {
  userEmail: string;
}

const DangerZone: React.FC<DangerZoneProps> = ({ userEmail }) => {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [exporting, setExporting] = useState(false);
  const { isLoading, error, save } = useSettings();

  const handleDelete = async () => {
    if (confirmEmail !== userEmail) return;
    const ok = await save({ url: '/api/users/me', method: 'delete' });
    if (ok) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await apiClient.get('/api/users/me/export', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'navin-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const inputCls =
    'w-full bg-[rgba(239,68,68,0.05)] border border-red-500/30 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-red-400';

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} className="text-red-400" />
        <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
      </div>

      {/* Export */}
      <div className="border border-[rgba(98,255,255,0.1)] rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Download size={16} className="text-[#62ffff]" />
          <h3 className="font-medium">Export Data</h3>
        </div>
        <p className="text-sm text-slate-400">Download a JSON archive of all your shipments and settlements.</p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 text-sm border border-[rgba(98,255,255,0.3)] text-[#62ffff] rounded-lg hover:bg-[rgba(98,255,255,0.1)] disabled:opacity-50"
        >
          {exporting ? 'Exporting…' : 'Export My Data'}
        </button>
      </div>

      {/* Delete account */}
      <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-red-400" />
          <h3 className="font-medium text-red-300">Delete Account</h3>
        </div>
        <p className="text-sm text-slate-400">
          This action is permanent and cannot be undone. All your data will be erased.
        </p>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Type <span className="text-white font-mono">{userEmail}</span> to confirm
          </label>
          <input
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={userEmail}
            className={inputCls}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={handleDelete}
          disabled={isLoading || confirmEmail !== userEmail}
          className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-40"
        >
          {isLoading ? 'Deleting…' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
};

export default DangerZone;
