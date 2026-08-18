import React, { useState, useEffect } from 'react';
import { apiFetch, safeJson } from '../utils/api';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  KeyRound, 
  Server, 
  ExternalLink,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  authToken?: string;
  onReconnected?: () => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  authToken,
  onReconnected
}) => {
  const [connectionString, setConnectionString] = useState<string>(
    'postgresql://neondb_owner:npg_sSv3e8dunJBg@ep-wispy-wildflower-axw0tjjz-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'
  );
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    databaseUrl: string | null;
    error: string | null;
  }>({
    connected: false,
    databaseUrl: null,
    error: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    version?: string;
  } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await apiFetch('/api/admin/db-health');
      if (res.ok) {
        const data = await safeJson(res, null);
        if (data) setDbStatus(data);
      }
    } catch (err) {
      console.warn('Failed to fetch DB status', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const res = await apiFetch('/api/admin/db-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ connectionString })
      });
      const data = await safeJson<{ success: boolean; message?: string; version?: string }>(res, { success: false, message: 'Failed to test connection' });
      setTestResult({
        tested: true,
        success: data.success,
        message: data.message,
        version: data.version
      });
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err.message || 'Network request failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAndConnect = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/admin/db-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ connectionString })
      });
      const data = await safeJson<{ success: boolean; message?: string; version?: string }>(res, { success: false, message: 'Failed to connect database' });
      setTestResult({
        tested: true,
        success: data.success,
        message: data.message,
        version: data.version
      });
      await fetchStatus();
      if (data.success && onReconnected) {
        onReconnected();
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err.message || 'Failed to reconnect'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Neon PostgreSQL Database Manager</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Cloud Relational Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">Real-time live persistence & connection status diagnostic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
            dbStatus.connected 
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
          }`}>
            {dbStatus.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-semibold text-white flex items-center space-x-2">
                <span>{dbStatus.connected ? 'Connected to Neon PostgreSQL' : 'PostgreSQL Authentication Issue'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                  dbStatus.connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {dbStatus.connected ? 'ONLINE' : 'AUTH FAILED (28P01)'}
                </span>
              </div>
              <p className="text-slate-300">
                {dbStatus.connected
                  ? 'All student bookings, bus telemetry, driver manifests, and audit ledger logs are synchronizing live.'
                  : (dbStatus.error || "password authentication failed for user 'neondb_owner'. Please check your password in Neon Console.")}
              </p>
            </div>
          </div>

          {/* Diagnostic Note */}
          {!dbStatus.connected && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs text-amber-200/90 space-y-2">
              <div className="font-semibold text-amber-300 flex items-center space-x-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Why is it showing authentication failed?</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Neon database passwords are secure and secret. If the password in your connection string was rotated or has a typo, Neon rejects the login with <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">password authentication failed for user 'neondb_owner'</code>.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <a
                  href="https://console.neon.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline"
                >
                  <span>Open Neon Console & Reset/Copy Password</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Connection URI Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              PostgreSQL Connection String (URI)
            </label>
            <div className="relative">
              <input
                type="text"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Format: <code className="text-slate-300">postgresql://neondb_owner:YOUR_PASSWORD@ep-wispy-wildflower-axw0tjjz-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require</code>
            </p>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              testResult.success 
                ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-200'
                : 'bg-rose-950/30 border-rose-700/60 text-rose-200'
            }`}>
              <div className="font-semibold flex items-center space-x-1.5">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                <span>{testResult.success ? 'Connection Test Succeeded!' : 'Connection Test Failed'}</span>
              </div>
              <p className="font-mono text-[11px] break-all text-slate-300">{testResult.message}</p>
              {testResult.version && (
                <p className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-700/40">
                  {testResult.version}
                </p>
              )}
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero Data Loss Fallback</span>
              </div>
              <p className="text-[11px] text-slate-400">
                While reconnecting, TransOptima guarantees instant sub-millisecond in-memory transactional execution and seamlessly pushes state when connected.
              </p>
            </div>

            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL / TLS Secured</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Encrypted with SSL <code className="text-slate-300">sslmode=require</code> for production cloud security compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={fetchStatus}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleApplyAndConnect}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>Save & Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
