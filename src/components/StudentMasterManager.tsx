import React, { useState, useEffect } from 'react';
import { StudentRecord, User } from '../types';
import { apiFetch } from '../utils/api';
import { 
  Users, 
  Search, 
  Plus, 
  Upload, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Building, 
  ShieldAlert, 
  ShieldCheck, 
  KeyRound, 
  Edit3, 
  LogIn, 
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

interface StudentMasterManagerProps {
  onSwitchUser?: (u: User) => void;
}

export const StudentMasterManager: React.FC<StudentMasterManagerProps> = ({ onSwitchUser }) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DAY_SCHOLAR' | 'HOSTELLER'>('ALL');
  const [filterActive, setFilterActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [newRegNo, setNewRegNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Computer Science & Engineering');
  const [newYear, setNewYear] = useState<number>(2);
  const [newSection, setNewSection] = useState('A');
  const [newIsHosteller, setNewIsHosteller] = useState(false);
  const [newHostelName, setNewHostelName] = useState('Brahmaputra Boys Hostel');
  const [newPhone, setNewPhone] = useState('+91 98400 99999');

  // CSV Import State
  const [csvText, setCsvText] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/students');
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      const res = await apiFetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registrationNumber: newRegNo.trim(),
          name: newName.trim(),
          email: newEmail.trim(),
          department: newDept,
          year: newYear,
          section: newSection,
          isHosteller: newIsHosteller,
          hostelName: newIsHosteller ? newHostelName : undefined,
          phone: newPhone.trim(),
          initialPassword: 'password'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create student');
      }

      setStatusMessage({ text: `Successfully registered student ${data.student.registrationNumber}`, type: 'success' });
      setShowAddModal(false);
      // Reset form
      setNewRegNo('');
      setNewName('');
      setNewEmail('');
      fetchStudents();
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setStatusMessage(null);

    try {
      const res = await apiFetch(`/api/admin/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingStudent)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student');

      setStatusMessage({ text: `Updated record for ${data.student.registrationNumber}`, type: 'success' });
      setEditingStudent(null);
      fetchStudents();
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
    }
  };

  const handleToggleStatus = async (studentId: string) => {
    try {
      const res = await apiFetch(`/api/admin/students/${studentId}/toggle-status`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ text: `Status updated for ${data.student.registrationNumber}`, type: 'success' });
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (studentId: string, regNo: string) => {
    try {
      const res = await apiFetch(`/api/admin/students/${studentId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: 'password' })
      });
      if (res.ok) {
        setStatusMessage({ text: `Password for ${regNo} reset to default ("password")`, type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportCSV = async () => {
    if (!csvText.trim()) return;
    setStatusMessage(null);
    try {
      const res = await apiFetch('/api/admin/students/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData: csvText })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setStatusMessage({
        text: `CSV Import completed: ${data.importedCount} new students imported, ${data.skippedCount} existing records updated.`,
        type: 'success'
      });
      setShowImportModal(false);
      setCsvText('');
      fetchStudents();
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/admin/students/export';
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = 
      filterType === 'ALL' ? true :
      filterType === 'HOSTELLER' ? s.isHosteller : !s.isHosteller;

    const matchesActive = 
      filterActive === 'ALL' ? true :
      filterActive === 'ACTIVE' ? s.active : !s.active;

    return matchesSearch && matchesType && matchesActive;
  });

  const dayScholarCount = students.filter(s => !s.isHosteller).length;
  const hostellerCount = students.filter(s => s.isHosteller).length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Authoritative Student Master Registry</h2>
              <p className="text-xs text-slate-400">
                PostgreSQL Master Database with unique registration numbers and strict hostel eligibility verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            id="btn-import-csv"
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Master CSV</span>
          </button>

          <button
            id="btn-add-student"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>Total Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{students.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Authoritative College Database</p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex justify-between items-center text-emerald-400 text-xs font-medium">
            <span>Day Scholars (Bus Eligible)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{dayScholarCount}</p>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">Authorized for Dynamic Route Booking</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-4">
          <div className="flex justify-between items-center text-amber-400 text-xs font-medium">
            <span>Hostellers (Not Eligible)</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300 mt-1">{hostellerCount}</p>
          <p className="text-[11px] text-amber-500/80 mt-0.5">Campus residents; bus booking blocked</p>
        </div>
      </div>

      {/* Controls & Search Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            id="student-search-input"
            type="text"
            placeholder="Search by Reg No, Name, Dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end flex-wrap">
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterType === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setFilterType('DAY_SCHOLAR')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterType === 'DAY_SCHOLAR' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Day Scholars ({dayScholarCount})
            </button>
            <button
              onClick={() => setFilterType('HOSTELLER')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterType === 'HOSTELLER' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hostellers ({hostellerCount})
            </button>
          </div>

          <button
            onClick={fetchStudents}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Student Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Reg Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department & Year</th>
                <th className="py-3 px-4">Residency Status</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {student.registrationNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{student.name}</div>
                    <div className="text-[11px] text-slate-400">{student.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200">{student.department}</div>
                    <div className="text-[11px] text-slate-400">Year {student.year} • Sec {student.section}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {student.isHosteller ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                        <Building className="w-3 h-3" />
                        <span>Hostel ({student.hostelName || 'Campus'})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Day Scholar (Bus Eligible)</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {student.active ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/40 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/40 text-rose-400">
                        <XCircle className="w-3 h-3" />
                        <span>Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* Switch user to test this student's view */}
                      {onSwitchUser && (
                        <button
                          onClick={() => onSwitchUser({
                            id: student.id,
                            username: student.registrationNumber,
                            email: student.email,
                            name: student.name,
                            role: 'STUDENT',
                            studentProfile: {
                              studentId: student.id,
                              registrationNumber: student.registrationNumber,
                              department: student.department,
                              year: student.year,
                              areaId: 'area-adyar',
                              preferredStopId: 'stop-adyar-signal',
                              isHosteller: student.isHosteller,
                              busPassNumber: `BP-${student.registrationNumber}`
                            }
                          })}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold border border-slate-700 transition-all flex items-center space-x-1"
                          title="Simulate / Login as this student"
                        >
                          <LogIn className="w-3 h-3 text-blue-400" />
                          <span>Simulate</span>
                        </button>
                      )}

                      <button
                        onClick={() => setEditingStudent({ ...student })}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
                        title="Edit Record"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(student.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          student.active 
                            ? 'bg-slate-800 hover:bg-rose-900/30 text-rose-300 border-slate-700' 
                            : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-800/40'
                        }`}
                        title={student.active ? 'Deactivate Student' : 'Activate Student'}
                      >
                        {student.active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleResetPassword(student.id, student.registrationNumber)}
                        className="p-1.5 bg-slate-800 hover:bg-amber-900/30 text-amber-300 rounded-lg border border-slate-700 transition-all"
                        title="Reset Password to default ('password')"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No students match your query. Try clearing filters or importing records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Enroll New Student Record</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23CSE1099"
                    value={newRegNo}
                    onChange={(e) => setNewRegNo(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K. Priya"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@college.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Mechanical Engineering">Mech</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Year</label>
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Section</label>
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Hosteller residency toggle */}
              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Residency Status</div>
                    <div className="text-[11px] text-slate-400">Hostellers are blocked from bus booking</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsHosteller}
                      onChange={(e) => setNewIsHosteller(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {newIsHosteller && (
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Hostel Block Name</label>
                    <input
                      type="text"
                      value={newHostelName}
                      onChange={(e) => setNewHostelName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-md"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Student: {editingStudent.registrationNumber}</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Hosteller residency toggle */}
              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Hostel Residency Flag</div>
                    <div className="text-[11px] text-slate-400">
                      {editingStudent.isHosteller ? 'Currently HOSTELLER (Bus booking blocked)' : 'Currently DAY SCHOLAR (Bus booking enabled)'}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStudent.isHosteller}
                      onChange={(e) => setEditingStudent({ ...editingStudent, isHosteller: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {editingStudent.isHosteller && (
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Hostel Block Name</label>
                    <input
                      type="text"
                      value={editingStudent.hostelName || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, hostelName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: CSV Import */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Bulk CSV Student Import</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Paste standard CSV rows below. Required header format:
              <code className="block bg-slate-800 px-2 py-1 rounded text-blue-400 font-mono text-[11px] mt-1">
                registrationNumber,name,email,department,year,section,isHosteller,hostelName,phone,active
              </code>
            </p>

            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`registrationNumber,name,email,department,year,section,isHosteller,hostelName,phone,active\n23CSE1045,Arun Kumar,arun@college.edu,CSE,3,A,false,,+919840011111,true\n23CSE1046,Karthik Raman,karthik@college.edu,CSE,3,B,true,Brahmaputra,+919840022222,true`}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCSV}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Upload & Ingest
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
