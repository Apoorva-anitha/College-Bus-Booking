import React from 'react';
import { User, UserRole, DepartureSlot } from '../types';
import { 
  Bus, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  Activity, 
  Clock, 
  Code2, 
  FlaskConical, 
  FileText,
  Radio,
  Users,
  LogOut,
  GraduationCap,
  Shield,
  Layers
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  users: User[];
  slots: DepartureSlot[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSwitchUser: (user: User) => void;
  onLogout: () => void;
  slotDemand3pm?: number;
  slotDemand5pm?: number;
  isLiveConnected?: boolean;
  onOpenDatabaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  activeTab,
  onSelectTab,
  onSwitchUser,
  onLogout,
  slotDemand3pm = 0,
  slotDemand5pm = 0,
  isLiveConnected = true,
  onOpenDatabaseModal
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab(currentUser.role === 'STUDENT' ? 'student-book' : currentUser.role === 'DRIVER' ? 'driver-trip' : 'admin-demand')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base tracking-tight">TransOptima</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                  {currentUser.role} DASHBOARD
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Smart Dynamic Bus Route & Multi-Corridor Transit</p>
            </div>
          </div>

          {/* Center Navigation Tabs according to role & features */}
          <nav className="hidden lg:flex items-center space-x-1">
            {currentUser.role === 'STUDENT' && (
              <>
                <button
                  id="tab-student-book"
                  onClick={() => onSelectTab('student-book')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'student-book'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Book Seat
                </button>
                <button
                  id="tab-student-pass"
                  onClick={() => onSelectTab('student-pass')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'student-pass'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  My Boarding Pass
                </button>
              </>
            )}

            {currentUser.role === 'ADMIN' && (
              <>
                <button
                  id="tab-admin-demand"
                  onClick={() => onSelectTab('admin-demand')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-demand'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Demand Analytics
                </button>
                <button
                  id="tab-admin-optimizer"
                  onClick={() => onSelectTab('admin-optimizer')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    activeTab === 'admin-optimizer'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Route Optimizer</span>
                </button>
                <button
                  id="tab-admin-fleet"
                  onClick={() => onSelectTab('admin-fleet')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-fleet'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Fleet & Drivers
                </button>
                <button
                  id="tab-admin-students"
                  onClick={() => onSelectTab('admin-students')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    activeTab === 'admin-students'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Student Registry</span>
                </button>
                <button
                  id="tab-admin-audit"
                  onClick={() => onSelectTab('admin-audit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'admin-audit'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Audit Logs
                </button>
              </>
            )}

            {currentUser.role === 'DRIVER' && (
              <button
                id="tab-driver-trip"
                onClick={() => onSelectTab('driver-trip')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'driver-trip'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Today's Trip & Manifest
              </button>
            )}

            {/* Global Tools available in all views */}
            <button
              id="tab-map"
              onClick={() => onSelectTab('map-view')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                activeTab === 'map-view'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Adyar Road Graph</span>
            </button>

            <button
              id="tab-concurrency"
              onClick={() => onSelectTab('concurrency-test')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                activeTab === 'concurrency-test'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Concurrency Lab</span>
            </button>

            <button
              id="tab-artifacts"
              onClick={() => onSelectTab('spring-boot-code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                activeTab === 'spring-boot-code'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spring Boot 3 / Postgres</span>
            </button>
          </nav>

          {/* Right Section: Live Slot Tickers, Role Switcher, & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live SSE replication badge & Database status */}
            <button
              onClick={onOpenDatabaseModal}
              title="Click to view Neon PostgreSQL connection & status"
              className="flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-700/90 px-2.5 py-1 rounded-lg border border-slate-700/60 text-xs transition-colors cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[10px] font-semibold text-slate-300 hidden md:inline">
                {isLiveConnected ? 'LIVE SYNC' : 'RECONNECTING'}
              </span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.2 rounded font-mono font-bold">
                POSTGRES
              </span>
            </button>

            {/* Real-time slot demand pill */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="text-slate-300">3 PM:</span>
                <span className="font-bold text-emerald-400">{slotDemand3pm}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300">5 PM:</span>
                <span className="font-bold text-indigo-400">{slotDemand5pm}</span>
              </div>
            </div>

            {/* Quick Role Switcher Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${
                currentUser.role === 'ADMIN' ? 'bg-purple-400' :
                currentUser.role === 'DRIVER' ? 'bg-emerald-400' : 'bg-blue-400'
              }`} />
              <select
                id="role-switcher-select"
                aria-label="Switch active test user or role"
                value={currentUser.id}
                onChange={(e) => {
                  const u = users.find(x => x.id === e.target.value);
                  if (u) onSwitchUser(u);
                }}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Sign Out / Exit button */}
            <button
              id="btn-navbar-logout"
              onClick={onLogout}
              className="p-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-xl border border-slate-700 transition-all flex items-center space-x-1"
              title="Sign Out to Login Screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs font-semibold">Exit</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
