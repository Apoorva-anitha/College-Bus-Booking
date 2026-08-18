import React, { useState } from 'react';
import { User } from '../types';
import { apiFetch, safeJson } from '../utils/api';
import { 
  Bus, 
  Shield, 
  GraduationCap, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (user: User, token?: string) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [roleTab, setRoleTab] = useState<'STUDENT' | 'DRIVER' | 'ADMIN'>('STUDENT');
  
  // Student Form State (Requires explicit entry)
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  // Driver / Admin Form State (Requires explicit entry)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        const data = await safeJson<{ success?: boolean; user?: User; token?: string; error?: string }>(res, { error: 'Authentication failed' });
        if (!res.ok || !data.user) {
          throw new Error(data.error || 'Authentication failed. Please verify your Registration Number and Password.');
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
        const data = await safeJson<{ success?: boolean; user?: User; token?: string; error?: string }>(res, { error: 'Authentication failed' });
        if (!res.ok || !data.user) {
          throw new Error(data.error || 'Invalid credentials. Please verify your username and password.');
        }
        onLoginSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please try again.');
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
            <Bus className="w-3.5 h-3.5" />
            <span>St. Joseph's College of Engineering • Transport Department</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            St. Joseph's Bus Booking
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Official portal for Student Seat Booking, Driver Trip Manifests, and Fleet Dispatch Management.
          </p>
        </div>

        {/* 3 Dashboards Overview Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Student Dashboard Card */}
          <div 
            onClick={() => {
              setRoleTab('STUDENT');
              setErrorMessage(null);
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
                <h3 className="text-xs font-bold text-white">1. Student Portal</h3>
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
              setErrorMessage(null);
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
                <h3 className="text-xs font-bold text-white">2. Driver Portal</h3>
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
              setErrorMessage(null);
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
              Demand analytics, multi-objective route optimizer, student registry, fleet tracker, and audit logs.
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
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-slate-300">
                      College Registration Number
                    </label>
                    <span className="text-[11px] text-blue-400 font-mono">Range: 312324104001 - 312324104150</span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-student-regno"
                      type="text"
                      required
                      placeholder="e.g. 312324104001 or 312324104125"
                      value={studentRegNo}
                      onChange={(e) => setStudentRegNo(e.target.value.toUpperCase())}
                      className="w-full pl-3.5 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Day Scholars (312324104001–312324104120) are eligible to book seats; Hostellers (312324104121–312324104150) reside on campus.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    <span className="text-[11px] text-slate-400 font-mono">Initial: Registration Number itself</span>
                  </div>
                  <div className="relative">
                    <input
                      id="input-student-password"
                      type="password"
                      required
                      placeholder="Enter registration number or changed password"
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

        </div>

        {/* Technical Stack Footer */}
        <div className="text-center text-[11px] text-slate-500 space-x-4">
          <span>Node.js REST Backend</span>
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
