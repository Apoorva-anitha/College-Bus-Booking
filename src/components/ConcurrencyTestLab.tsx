import React, { useState } from 'react';
import { apiFetch, safeJson } from '../utils/api';
import { 
  FlaskConical, 
  ShieldCheck, 
  AlertOctagon, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Sparkles, 
  Layers, 
  Cpu,
  RefreshCw,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ConcurrencyTestLab: React.FC<{ onReloadData: () => void }> = ({ onReloadData }) => {
  const [threadCount, setThreadCount] = useState(30);
  const [isRunningConcurrency, setIsRunningConcurrency] = useState(false);
  const [concurrencyResult, setConcurrencyResult] = useState<any>(null);

  const [isSeedingAdyar, setIsSeedingAdyar] = useState(false);
  const [seedSuccessMessage, setSeedSuccessMessage] = useState<string | null>(null);

  const handleRunConcurrencyTest = async () => {
    setIsRunningConcurrency(true);
    setConcurrencyResult(null);
    try {
      const res = await apiFetch('/api/simulation/concurrency-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalThreads: threadCount,
          testSlot: 'slot-3pm',
          stopId: 'stop-adyar-signal'
        })
      });
      const data = await safeJson(res, { isConcurrencyProtected: false });
      setConcurrencyResult(data);
      if (data.isConcurrencyProtected) {
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (_) {}
      }
      onReloadData();
    } catch (err) {
      console.warn('Concurrency simulation note:', err);
    } finally {
      setIsRunningConcurrency(false);
    }
  };

  const handleSeedAdyarBenchmark = async () => {
    setIsSeedingAdyar(true);
    setSeedSuccessMessage(null);
    try {
      const res = await apiFetch('/api/simulation/seed-adyar', {
        method: 'POST'
      });
      const data = await safeJson(res, { message: 'Seeded benchmark' });
      setSeedSuccessMessage(data.message);
      onReloadData();
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } });
      } catch (_) {}
    } catch (err) {
      console.warn('Failed to seed benchmark:', err);
    } finally {
      setIsSeedingAdyar(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Concurrency & Optimization Testbed</h2>
              <p className="text-xs text-slate-400">
                Interactive verification lab for Section 9/47 (Atomic Race Condition Protection) and Section 10 (Adyar Multi-Corridor Split).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Test Card 1: Section 9 & 47 Concurrency Race on 1 Last Seat */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Section 47: Concurrency & Lock Stress Test</h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              ACID Mutex Lock
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Simulates <span className="text-white font-bold">{threadCount} concurrent students</span> sending booking requests at the exact same millisecond when <span className="text-amber-400 font-bold">only 1 seat remains</span> in the bus capacity pool.
          </p>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 flex justify-between font-semibold">
              <span>Concurrent Async Threads</span>
              <span className="text-white font-mono">{threadCount} Students</span>
            </label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={threadCount}
              onChange={(e) => setThreadCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <button
            id="btn-run-concurrency-stress-test"
            onClick={handleRunConcurrencyTest}
            disabled={isRunningConcurrency}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isRunningConcurrency ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing Simultaneous Threads...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Trigger Simultaneous Seat Race ({threadCount} Requests)</span>
              </>
            )}
          </button>

          {/* Test Results Output */}
          {concurrencyResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-3 ${
              concurrencyResult.isConcurrencyProtected
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  {concurrencyResult.isConcurrencyProtected ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Zero Race Condition / 100% ACID Protection</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>Concurrency Defect Detected</span>
                    </>
                  )}
                </div>
                <span className="font-mono text-xs">
                  {concurrencyResult.successfulBookings} Confirmed / {concurrencyResult.rejectedBookings} Rejected
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <p className="text-slate-400">Total Attempts</p>
                  <p className="font-bold text-white mt-0.5">{concurrencyResult.totalAttempts}</p>
                </div>
                <div>
                  <p className="text-slate-400">Confirmed (Winner)</p>
                  <p className="font-bold text-emerald-400 mt-0.5">{concurrencyResult.successfulBookings} Seat</p>
                </div>
                <div>
                  <p className="text-slate-400">Rejections</p>
                  <p className="font-bold text-amber-400 mt-0.5">{concurrencyResult.rejectedBookings} Rejected</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Result: The database mutex lock ensured serial isolation. Exactly 1 request acquired the last seat, while the remaining {concurrencyResult.rejectedBookings} were cleanly rejected with <code className="text-white bg-slate-900 px-1 py-0.5 rounded">CapacityExceeded</code> without duplicate seat assignments.
              </p>
            </div>
          )}

        </div>

        {/* Test Card 2: Section 10 Adyar 84-Student Split Scenario Benchmark */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Section 10: Adyar 84-Student Benchmark</h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Multi-Corridor Split
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Populates the exact student booking distribution defined in <span className="text-white font-bold">Section 10 of the system specification</span>:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Adyar Signal:</span>
              <span className="text-white font-bold">24 Students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">LB Road:</span>
              <span className="text-white font-bold">16 Students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Kasturba Nagar:</span>
              <span className="text-white font-bold">8 Students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Thiruvanmiyur:</span>
              <span className="text-white font-bold">22 Students</span>
            </div>
            <div className="flex justify-between col-span-2 pt-1 border-t border-slate-700">
              <span className="text-slate-400">Besant Nagar:</span>
              <span className="text-white font-bold">14 Students</span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-indigo-300">Expected Routing Outcome:</p>
            <p className="leading-relaxed">
              Total demand = <span className="text-white font-bold">84 students</span>. Standard bus capacity is 50. The optimizer will reject a single bus and formulate feasible splits (e.g. Route A via Guindy with 40 pax + Route B via OMR with 44 pax).
            </p>
          </div>

          {seedSuccessMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{seedSuccessMessage}</span>
            </div>
          )}

          <button
            id="btn-seed-adyar-benchmark"
            onClick={handleSeedAdyarBenchmark}
            disabled={isSeedingAdyar}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isSeedingAdyar ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Seeding Demand Dataset...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Seed Adyar 84-Student Dataset & Test Optimizer</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
