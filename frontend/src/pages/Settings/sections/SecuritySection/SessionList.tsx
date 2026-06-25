import React, { useEffect, useState } from 'react';
import { Monitor, Trash2 } from 'lucide-react';
import { apiClient } from '@services/api/client';

interface Session {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  current?: boolean;
}

const SessionList: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data: Session[] }>('/api/auth/sessions')
      .then((r) => setSessions(r.data.data))
      .catch(() => setSessions([]))
      .finally(() => setIsLoading(false));
  }, []);

  const revoke = async (id: string) => {
    setRevoking(id);
    try {
      await apiClient.delete(`/api/auth/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Monitor size={18} className="text-[#62ffff]" />
        <h3 className="font-semibold">Active Sessions</h3>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-slate-400">No active sessions found.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.1)] rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium">{s.device} {s.current && <span className="text-xs text-[#62ffff] ml-1">(this session)</span>}</p>
                <p className="text-xs text-slate-400">{s.ip} · {s.lastActive}</p>
              </div>
              {!s.current && (
                <button
                  onClick={() => void revoke(s.id)}
                  disabled={revoking === s.id}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  aria-label="Revoke session"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SessionList;
