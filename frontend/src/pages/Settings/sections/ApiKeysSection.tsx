import React, { useEffect, useState } from 'react';
import { Copy, Key, Trash2, X } from 'lucide-react';
import { apiClient } from '@services/api/client';

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
  const [copied, setCopied] = useState(false);

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

  const revoke = async (id: string) => {
    if (!window.confirm('Revoke this API key? This cannot be undone.')) return;
    setRevoking(id);
    try {
      await apiClient.delete(`/api/company/api-keys/${id}`);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } finally {
      setRevoking(null);
    }
  };

  const copySecret = () => {
    if (!newKeySecret) return;
    void navigator.clipboard.writeText(newKeySecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Key size={18} className="text-[#62ffff]" />
        <h2 className="text-lg font-semibold">API Keys</h2>
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
            <button onClick={copySecret} className="text-[#62ffff] hover:text-white" aria-label="Copy key">
              <Copy size={16} />
            </button>
          </div>
          {copied && <p className="text-xs text-green-400">Copied!</p>}
        </div>
      )}

      {/* Generate form */}
      <div className="flex gap-2">
        <input
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="Key name (e.g. CI/CD Pipeline)"
          className="flex-1 bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#62ffff]"
        />
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
                onClick={() => void revoke(k.id)}
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
    </div>
  );
};

export default ApiKeysSection;
