import React, { useState, useEffect } from 'react';
import { 
  OptimizationRun, 
  CandidateSolution, 
  CandidateRoute, 
  OptimizationWeights, 
  DepartureSlot 
} from '../types';
import { apiFetch, safeJson } from '../utils/api';
import { 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Bus, 
  Clock, 
  MapPin, 
  Users, 
  ArrowRight, 
  Check, 
  RefreshCw,
  TrendingDown,
  Layers,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminOptimizerViewProps {
  initialSlotId?: string;
  slots: DepartureSlot[];
  onSolutionApproved: () => void;
}

export const AdminOptimizerView: React.FC<AdminOptimizerViewProps> = ({
  initialSlotId = 'slot-3pm',
  slots,
  onSolutionApproved
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedSlotId, setSelectedSlotId] = useState<string>(initialSlotId);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Configurable optimization weights (Section 18)
  const [weights, setWeights] = useState<OptimizationWeights>({
    busMinimization: 40,
    travelTime: 25,
    distance: 15,
    studentDetour: 15,
    unusedCapacity: 5
  });

  const [activeRun, setActiveRun] = useState<OptimizationRun | null>(null);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [historyRuns, setHistoryRuns] = useState<OptimizationRun[]>([]);
  const [activeTab, setActiveTab] = useState<'candidates' | 'weights' | 'history'>('candidates');

  const fetchHistory = async () => {
    try {
      const res = await apiFetch('/api/admin/optimization/history');
      const data = await safeJson(res, { runs: [] });
      setHistoryRuns(data.runs || []);
      if (data.runs?.length > 0 && !activeRun) {
        setActiveRun(data.runs[0]);
        setSelectedSolutionId(data.runs[0].selectedSolutionId || data.runs[0].candidateSolutions[0]?.id || '');
      }
    } catch (err) {
      console.warn('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const res = await apiFetch('/api/admin/optimization/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          slotId: selectedSlotId,
          weights
        })
      });
      const data = await safeJson(res, { run: null });
      if (data && data.run) {
        setActiveRun(data.run);
        setSelectedSolutionId(data.run.candidateSolutions[0]?.id || '');
        await fetchHistory();
      }
    } catch (err) {
      console.warn('Optimization run warning:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApproveSolution = async (solutionId: string) => {
    if (!activeRun) return;
    setIsApproving(true);
    try {
      const res = await apiFetch(`/api/admin/optimization/${activeRun.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solutionId })
      });
      if (res.ok) {
        activeRun.status = 'APPROVED';
        activeRun.selectedSolutionId = solutionId;
        onSolutionApproved();
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
        } catch (_) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const selectedSolution = activeRun?.candidateSolutions.find(s => s.id === selectedSolutionId) || activeRun?.candidateSolutions[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Action Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Route Optimization & Solution Studio</h2>
              <p className="text-xs text-slate-400">
                Multi-corridor Adyar graph solver evaluating bus capacity, travel duration, detour, and driver assignments.
              </p>
            </div>
          </div>
        </div>

        {/* Slot selector & Execute CTA */}
        <div className="flex items-center space-x-3">
          <select
            aria-label="Select departure slot for optimization"
            value={selectedSlotId}
            onChange={(e) => setSelectedSlotId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
          >
            {slots.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button
            id="btn-run-optimization-engine"
            onClick={handleRunOptimizer}
            disabled={isOptimizing}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Solving Graph...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run Optimization</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs: Candidates vs Weights vs History */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'candidates'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Candidate Solutions ({activeRun?.candidateSolutions.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('weights')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'weights'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configurable Priority Weights</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Optimization Run Audit History
        </button>
      </div>

      {/* 1. CANDIDATES COMPARISON VIEW (Section 16 & 17) */}
      {activeTab === 'candidates' && activeRun && (
        <div className="space-y-6">
          
          {/* Solution Cards Selector (Solution A, B, C) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeRun.candidateSolutions.map((sol) => {
              const isSelected = selectedSolutionId === sol.id;
              const isApproved = activeRun.status === 'APPROVED' && activeRun.selectedSolutionId === sol.id;
              return (
                <div
                  key={sol.id}
                  onClick={() => setSelectedSolutionId(sol.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isApproved && (
                    <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>APPROVED & PUBLISHED</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      {sol.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      Score: {sol.score}/100
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1">{sol.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sol.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                    <div className="bg-slate-950/40 p-1.5 rounded-lg">
                      <p className="text-[9px] uppercase text-slate-400">Buses</p>
                      <p className="text-xs font-bold text-white">{sol.totalBuses}</p>
                    </div>
                    <div className="bg-slate-950/40 p-1.5 rounded-lg">
                      <p className="text-[9px] uppercase text-slate-400">Duration</p>
                      <p className="text-xs font-bold text-white">{sol.totalDurationMin}m</p>
                    </div>
                    <div className="bg-slate-950/40 p-1.5 rounded-lg">
                      <p className="text-[9px] uppercase text-slate-400">Avg Occ.</p>
                      <p className="text-xs font-bold text-emerald-400">{sol.averageOccupancyPct}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Route Inspector for Selected Solution */}
          {selectedSolution && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{selectedSolution.name}</h3>
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                      {selectedSolution.routes.length} Active Corridors
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedSolution.description}</p>
                </div>

                {/* Approve Action */}
                <button
                  id="btn-approve-publish-schedule"
                  onClick={() => handleApproveSolution(selectedSolution.id)}
                  disabled={isApproving || activeRun.status === 'APPROVED'}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-md ${
                    activeRun.status === 'APPROVED' && activeRun.selectedSolutionId === selectedSolution.id
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 cursor-pointer'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {activeRun.status === 'APPROVED' && activeRun.selectedSolutionId === selectedSolution.id
                      ? 'Published to Daily Schedule'
                      : 'Approve & Publish Strategy'}
                  </span>
                </button>
              </div>

              {/* Route Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {selectedSolution.routes.map((route: CandidateRoute, rIdx: number) => (
                  <div
                    key={route.id}
                    className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 space-y-4 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center">
                          {route.routeCode}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{route.routeName}</h4>
                          <p className="text-[10px] text-slate-400">{route.corridor}</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                        {route.occupancyPercentage}% Occupancy
                      </span>
                    </div>

                    {/* Route Metric Pills */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
                        <p className="text-[9px] uppercase text-slate-400">Students</p>
                        <p className="font-bold text-white font-mono mt-0.5">{route.totalStudents} / {route.busCapacity}</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
                        <p className="text-[9px] uppercase text-slate-400">Distance</p>
                        <p className="font-bold text-white font-mono mt-0.5">{route.totalDistanceKm} km</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
                        <p className="text-[9px] uppercase text-slate-400">Duration</p>
                        <p className="font-bold text-white font-mono mt-0.5">{route.totalDurationMin} min</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
                        <p className="text-[9px] uppercase text-slate-400">Assigned Bus</p>
                        <p className="font-bold text-indigo-400 font-mono mt-0.5 truncate">{route.assignedBusNumber || 'TN-09-1001'}</p>
                      </div>
                    </div>

                    {/* Assigned Driver Pill */}
                    <div className="flex items-center justify-between text-xs bg-slate-900/40 px-3 py-2 rounded-xl border border-slate-800 text-slate-300">
                      <span>Assigned Driver:</span>
                      <span className="font-semibold text-white">{route.assignedDriverName || 'Murugan Sundaram'}</span>
                    </div>

                    {/* Sequence of Stops Timeline */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Optimized Stop Sequence ({route.stops.length} stops)
                      </p>
                      <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                        {route.stops.map((st, idx) => (
                          <div key={st.stopId} className="flex items-center justify-between text-xs text-slate-300">
                            <div className="flex items-center space-x-2">
                              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[10px] flex items-center justify-center font-mono">
                                {idx + 1}
                              </span>
                              <span className={idx === 0 ? 'text-blue-400 font-semibold' : 'text-slate-200'}>
                                {st.stopName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 text-[11px]">
                              {st.studentCount > 0 && (
                                <span className="text-emerald-400 font-mono font-semibold">
                                  +{st.studentCount} pax
                                </span>
                              )}
                              <span className="text-slate-500 font-mono">+{st.estimatedArrivalMin}m</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

      {/* 2. CONFIGURABLE WEIGHTS VIEW (Section 18 Requirement) */}
      {activeTab === 'weights' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Multi-Objective Scoring Weights</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust the optimization objective trade-offs according to campus priorities. Changes will affect the scoring of future optimization runs.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Bus Minimization Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Bus Minimization (Fleet Cost)</span>
                <span className="text-indigo-400 font-mono">{weights.busMinimization}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.busMinimization}
                onChange={(e) => setWeights({ ...weights, busMinimization: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Travel Time Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Travel Time Minimization (Student Speed)</span>
                <span className="text-indigo-400 font-mono">{weights.travelTime}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.travelTime}
                onChange={(e) => setWeights({ ...weights, travelTime: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Total Distance Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Route Distance Reduction</span>
                <span className="text-indigo-400 font-mono">{weights.distance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.distance}
                onChange={(e) => setWeights({ ...weights, distance: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Student Detour Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Student Detour Penalty</span>
                <span className="text-indigo-400 font-mono">{weights.studentDetour}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.studentDetour}
                onChange={(e) => setWeights({ ...weights, studentDetour: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Unused Capacity Weight */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Unused Bus Capacity Penalty</span>
                <span className="text-indigo-400 font-mono">{weights.unusedCapacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.unusedCapacity}
                onChange={(e) => setWeights({ ...weights, unusedCapacity: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleRunOptimizer}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Weights & Re-Run Optimization</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. OPTIMIZATION HISTORY VIEW (Section 45 Requirement) */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Historical Optimization Runs Log</h3>
            <span className="text-xs text-slate-400">{historyRuns.length} Total Runs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-800/60 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">Run ID</th>
                  <th className="px-3 py-2">Schedule Date & Slot</th>
                  <th className="px-3 py-2">Demand & Stops</th>
                  <th className="px-3 py-2">Candidates</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Executed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {historyRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-3 font-mono font-semibold text-indigo-400">{r.id}</td>
                    <td className="px-3 py-3">
                      <div className="text-white font-medium">{r.date}</div>
                      <div className="text-[11px] text-slate-400">{r.slotName}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-white font-bold">{r.totalDemand} Students</div>
                      <div className="text-[10px] text-slate-400">{r.totalStops} Unique Stops</div>
                    </td>
                    <td className="px-3 py-3 text-slate-300">
                      {r.candidateSolutions?.length || 3} Strategies Generated
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(r.runAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
