import React, { useEffect, useState } from 'react';
import { Key, Trash2, X, Info } from 'lucide-react';
import { apiClient } from '@services/api/client';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import CopyToClipboard from '@components/ui/CopyToClipboard';
import Tooltip from '@components/ui/Tooltip';
import SettingsSection from '@components/settings/SettingsSection';

interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
  scopes: string[];
}

const ApiKeysSection: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data: ApiKey[] }>('/api/company/api-keys')
      .then((r) => setKeys(r.data.data))
      .catch(() => setKeys([]))
      .finally(() => setIsLoading(false));
  }, []);

  const generate = async () => {
    if (!newKeyName.trim()) return;
    setGenerating(true);
    try {
      const res = await apiClient.post<{ data: { key: ApiKey; secret: string } }>('/api/company/api-keys', { name: newKeyName });
      setKeys((prev) => [res.data.data.key, ...prev]);
      setNewKeySecret(res.data.data.secret);
      setNewKeyName('');
    } finally {
      setGenerating(false);
    }
  };

  const confirmRevoke = async () => {
    if (!pendingRevokeId) return;
    setRevoking(pendingRevokeId);
    try {
      await apiClient.delete(`/api/company/api-keys/${pendingRevokeId}`);
      setKeys((prev) => prev.filter((k) => k.id !== pendingRevokeId));
    } finally {
      setRevoking(null);
      setPendingRevokeId(null);
    }
  };

  return (
    <SettingsSection title="API Keys" description="Manage API keys for programmatic access.">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-[#62ffff]" />
          <h2 className="text-lg font-semibold">API Keys</h2>
          <Tooltip content="API keys let external services authenticate as you. Treat them like passwords — anyone with a key can act on your account.">
            <Info size={14} className="text-slate-400 hover:text-slate-300 cursor-help" aria-label="What are API keys?" />
          </Tooltip>
        </div>

        {/* One-time secret modal */}
        {newKeySecret && (
          <div className="bg-[rgba(19,186,186,0.08)] border border-[#62ffff]/40 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#62ffff]">New API Key — copy it now, it won't be shown again</p>
              <button onClick={() => setNewKeySecret(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs bg-black/30 px-3 py-2 rounded-lg break-all">{newKeySecret}</code>
              <CopyToClipboard value={newKeySecret} label="Copy secret" size="sm" className="border-[#62ffff]/20 bg-black/20 text-[#62ffff] hover:text-white" />
            </div>
          </div>
        )}

        {/* Generate form */}
        <div className="flex items-center gap-2">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. CI/CD Pipeline)"
            aria-label="Key name"
            className="flex-1 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#62ffff]"
          />
          <Tooltip content="Use a name that identifies where this key will be used, so you can recognize and revoke it later.">
            <Info size={14} className="text-slate-400 hover:text-slate-300 cursor-help" aria-label="Key naming help" />
          </Tooltip>
          <button
            onClick={generate}
            disabled={generating || !newKeyName.trim()}
            className="px-4 py-2 bg-[#62ffff] text-black font-semibold text-sm rounded-lg disabled:opacity-50"
          >
            {generating ? 'Generating…' : 'Generate Key'}
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-400">Loading keys…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-slate-400">No API keys yet.</p>
        ) : (
          <ul className="space-y-2">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center justify-between bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.1)] rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{k.name}</p>
                  <p className="text-xs text-slate-400">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                    {k.lastUsed && ` · Last used ${new Date(k.lastUsed).toLocaleDateString()}`}
                    {k.scopes.length > 0 && ` · ${k.scopes.join(', ')}`}
                  </p>
                </div>
                <button
                  onClick={() => setPendingRevokeId(k.id)}
                  disabled={revoking === k.id}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  aria-label="Revoke key"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <ConfirmDialog
          isOpen={pendingRevokeId !== null}
          onClose={() => setPendingRevokeId(null)}
          onConfirm={() => { void confirmRevoke(); }}
          title="Revoke API key?"
          message="This action cannot be undone and the key will stop working immediately."
          confirmLabel="Revoke Key"
          variant="danger"
          isLoading={revoking !== null}
        />
      </div>
    </SettingsSection>
  );
};

export default ApiKeysSection;
