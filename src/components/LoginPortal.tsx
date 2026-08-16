import React, { useState } from 'react';
import { User, StudentRecord } from '../types';
import { apiFetch, safeJson } from '../utils/api';
import { 
  Bus, 
  Shield, 
  GraduationCap, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Building, 
  Compass, 
  Zap,
  Lock,
  UserCheck
} from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (user: User, token?: string) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [roleTab, setRoleTab] = useState<'STUDENT' | 'DRIVER' | 'ADMIN'>('STUDENT');
  
  // Student Form State
  const [studentRegNo, setStudentRegNo] = useState('23CSE1045');
  const [studentPassword, setStudentPassword] = useState('password');
  
  // Driver / Admin Form State
  const [username, setUsername] = useState('admin_transport');
  const [password, setPassword] = useState('password');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Demo Login Presets
  const handleQuickLogin = async (role: 'STUDENT_DAY_SCHOLAR' | 'STUDENT_HOSTELLER' | 'DRIVER' | 'ADMIN') => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (role === 'STUDENT_DAY_SCHOLAR') {
        const res = await apiFetch('/api/auth/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationNumber: '23CSE1045', password: 'password' })
        });
        const data = await safeJson(res, null);
        if (res.ok && data?.user) {
          onLoginSuccess(data.user, data.token);
          return;
        }
      } else if (role === 'STUDENT_HOSTELLER') {
        const res = await apiFetch('/api/auth/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationNumber: '23CSE1046', password: 'password' })
        });
        const data = await safeJson(res, null);
        if (res.ok && data?.user) {
          onLoginSuccess(data.user, data.token);
          return;
        }
      } else if (role === 'DRIVER') {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'driver_selvam', password: 'password' })
        });
        const data = await safeJson(res, null);
        if (res.ok && data?.user) {
          onLoginSuccess(data.user, data.token);
          return;
        }
      } else if (role === 'ADMIN') {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin_transport', password: 'password' })
        });
        const data = await safeJson(res, null);
        if (res.ok && data?.user) {
          onLoginSuccess(data.user, data.token);
          return;
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (roleTab === 'STUDENT') {
        const res = await apiFetch('/api/auth/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationNumber: studentRegNo.trim().toUpperCase(),
            password: studentPassword
          })
        });
        const data = await safeJson(res, { error: 'Authentication failed' });
        if (!res.ok || !data.user) {
          throw new Error(data.error || 'Authentication failed');
        }
        onLoginSuccess(data.user, data.token);
      } else {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password: password
          })
        });
        const data = await safeJson(res, { error: 'Authentication failed' });
        if (!res.ok || !data.user) {
          throw new Error(data.error || 'Authentication failed');
        }
        onLoginSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Smart College Transit & Multi-Corridor Fleet Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Campus Transit Portal
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Log in to access your designated dashboard: Student Seat Reservations, Driver Boarding Roster, or Fleet Dispatcher Command Hub.
          </p>
        </div>

        {/* 3 Dashboards Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Student Dashboard Card */}
          <div 
            onClick={() => {
              setRoleTab('STUDENT');
              setStudentRegNo('23CSE1045');
            }}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              roleTab === 'STUDENT'
                ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">1. Student Dashboard</h3>
                <span className="text-[10px] text-blue-400 font-medium">Day Scholar Passes & Booking</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Real-time seat reservations, stop selector, departure slot booking, digital QR pass, and live GPS tracking.
            </p>
          </div>

          {/* Driver Dashboard Card */}
          <div 
            onClick={() => {
              setRoleTab('DRIVER');
              setUsername('driver_selvam');
            }}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              roleTab === 'DRIVER'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">2. Driver Dashboard</h3>
                <span className="text-[10px] text-emerald-400 font-medium">Assigned Trips & Check-In</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Route stops timeline, stop-by-stop passenger roster, QR boarding check-in, delay reporting, and trip status controls.
            </p>
          </div>

          {/* Admin Dashboard Card */}
          <div 
            onClick={() => {
              setRoleTab('ADMIN');
              setUsername('admin_transport');
            }}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              roleTab === 'ADMIN'
                ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">3. Admin Hub</h3>
                <span className="text-[10px] text-purple-400 font-medium">Route Optimizer & Fleet Command</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Demand analytics, multi-objective route optimizer, student registry, fleet tracker, audit logs, and test lab.
            </p>
          </div>

        </div>

        {/* Auth Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Role Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              id="auth-tab-student"
              onClick={() => {
                setRoleTab('STUDENT');
                setStudentRegNo('23CSE1045');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                roleTab === 'STUDENT'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              id="auth-tab-driver"
              onClick={() => {
                setRoleTab('DRIVER');
                setUsername('driver_selvam');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                roleTab === 'DRIVER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>Driver Login</span>
            </button>

            <button
              id="auth-tab-admin"
              onClick={() => {
                setRoleTab('ADMIN');
                setUsername('admin_transport');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                roleTab === 'ADMIN'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Transport Admin</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {roleTab === 'STUDENT' ? (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    College Registration Number
                  </label>
                  <div className="relative">
                    <input
                      id="input-student-regno"
                      type="text"
                      required
                      placeholder="e.g. 23CSE1045 or 23CSE1046"
                      value={studentRegNo}
                      onChange={(e) => setStudentRegNo(e.target.value.toUpperCase())}
                      className="w-full pl-3.5 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Authoritative identity check: Day Scholar registrations are permitted for bus booking; hostellers are restricted.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    <span className="text-[11px] text-slate-500 font-mono">Default: password</span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-student-password"
                      type="password"
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full pl-3.5 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    {roleTab === 'DRIVER' ? 'Driver Account Username' : 'Administrator Username'}
                  </label>
                  <div className="relative">
                    <input
                      id="input-username"
                      type="text"
                      required
                      placeholder={roleTab === 'DRIVER' ? 'e.g. driver_selvam' : 'e.g. admin_transport'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-3.5 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    <span className="text-[11px] text-slate-500 font-mono">Default: password</span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 ${
                roleTab === 'STUDENT'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  : roleTab === 'DRIVER'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
              }`}
            >
              {isLoading ? (
                <span>Authenticating Securely...</span>
              ) : (
                <>
                  <span>Sign In to {roleTab === 'STUDENT' ? 'Student Portal' : roleTab === 'DRIVER' ? 'Driver Portal' : 'Admin Dispatcher'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Instant Presets */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300">1-Click Demo Persona Launchers:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              
              {/* Day Scholar Preset */}
              <button
                id="btn-demo-day-scholar"
                type="button"
                onClick={() => handleQuickLogin('STUDENT_DAY_SCHOLAR')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    DS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Arun Kumar (23CSE1045)
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium">Day Scholar • Bus Eligible</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              {/* Hosteller Preset */}
              <button
                id="btn-demo-hosteller"
                type="button"
                onClick={() => handleQuickLogin('STUDENT_HOSTELLER')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
                    HR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Karthik Raman (23CSE1046)
                    </div>
                    <div className="text-[10px] text-amber-400 font-medium">Hostel Resident • Booking Blocked</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              {/* Driver Preset */}
              <button
                id="btn-demo-driver"
                type="button"
                onClick={() => handleQuickLogin('DRIVER')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                    DR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      Selvam K. (Driver)
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Bus #01 • Adyar Corridor</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              {/* Admin Preset */}
              <button
                id="btn-demo-admin"
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold">
                    AD
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      Fleet Ops Director
                    </div>
                    <div className="text-[10px] text-purple-400 font-medium">Full Optimizer & Fleet Command</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </button>

            </div>
          </div>

        </div>

        {/* Technical Stack Footer */}
        <div className="text-center text-[11px] text-slate-500 space-x-4">
          <span>Spring Boot 3 REST Backend</span>
          <span>•</span>
          <span>PostgreSQL 16 Engine</span>
          <span>•</span>
          <span>JWT RBAC & Authoritative Residency</span>
          <span>•</span>
          <span>Zero Map API Key Required</span>
        </div>

      </div>
    </div>
  );
};
