import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { apiFetch } from '../utils/api';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  RefreshCw, 
  Clock,
  Terminal,
  Lock
} from 'lucide-react';

export const AuditLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/admin/audit-logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = filterAction === 'ALL'
    ? logs
    : logs.filter(l => l.action.includes(filterAction));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Security & Operation Audit Trail</h2>
              <p className="text-xs text-slate-400">
                Immutable compliance ledger recording authentication, booking transactions, IDOR checks, and admin schedule modifications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            aria-label="Filter audit logs by security action"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="BOOKING">Booking Events</option>
            <option value="IDOR">IDOR & Security Blocks</option>
            <option value="OPTIMIZATION">Optimization Runs</option>
            <option value="OVERRIDE">Slot Overrides</option>
          </select>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] text-slate-400 uppercase bg-slate-800/60 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User & IP</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3">
                  <span className="text-white font-bold">{log.username}</span>
                  <div className="text-[10px] text-slate-500">{log.ipAddress}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-indigo-400">
                  {log.action}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {log.resource}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                    log.result === 'SUCCESS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : log.result === 'BLOCKED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {log.result}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 font-sans text-xs">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
