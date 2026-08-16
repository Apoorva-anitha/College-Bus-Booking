import React, { useState } from 'react';
import { Bus, Driver, BusStatus } from '../types';
import { 
  Bus as BusIcon, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Wrench, 
  Calendar, 
  Fuel, 
  Phone,
  AlertTriangle,
  Award
} from 'lucide-react';

interface AdminFleetManagementProps {
  buses: Bus[];
  drivers: Driver[];
  onAddBus: (bus: Partial<Bus>) => Promise<void>;
  onUpdateBusStatus: (busId: string, status: BusStatus) => Promise<void>;
  onAddDriver: (driver: Partial<Driver>) => Promise<void>;
}

export const AdminFleetManagement: React.FC<AdminFleetManagementProps> = ({
  buses,
  drivers,
  onAddBus,
  onUpdateBusStatus,
  onAddDriver
}) => {
  const [subTab, setSubTab] = useState<'buses' | 'drivers'>('buses');
  const [isAddingBus, setIsAddingBus] = useState(false);
  const [isAddingDriver, setIsAddingDriver] = useState(false);

  // New Bus form state
  const [newRegNo, setNewRegNo] = useState('');
  const [newCapacity, setNewCapacity] = useState(50);
  const [newBusType, setNewBusType] = useState<'STANDARD_50' | 'MINI_32' | 'HEAVY_60'>('STANDARD_50');

  // New Driver form state
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newLicenseNo, setNewLicenseNo] = useState('');
  const [newLicenseExpiry, setNewLicenseExpiry] = useState('2028-12-31');

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddBus({
      registrationNumber: newRegNo,
      capacity: newCapacity,
      type: newBusType,
      status: 'AVAILABLE',
      fuelLevelPct: 100,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      fitnessCertificateValidUntil: '2027-12-31'
    });
    setIsAddingBus(false);
    setNewRegNo('');
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddDriver({
      employeeId: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      name: newDriverName,
      phone: newDriverPhone,
      licenseNumber: newLicenseNo,
      licenseExpiry: newLicenseExpiry,
      isAvailable: true,
      status: 'ACTIVE',
      rating: 4.8
    });
    setIsAddingDriver(false);
    setNewDriverName('');
    setNewDriverPhone('');
    setNewLicenseNo('');
  };

  const availableBuses = buses.filter(b => b.status === 'AVAILABLE').length;
  const maintenanceBuses = buses.filter(b => b.status === 'MAINTENANCE').length;
  const activeDrivers = drivers.filter(d => d.isAvailable && d.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BusIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-semibold">Ready Fleet</p>
            <p className="text-lg font-bold text-white mt-0.5">{availableBuses} / {buses.length} Buses</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-semibold">Active Drivers</p>
            <p className="text-lg font-bold text-white mt-0.5">{activeDrivers} / {drivers.length} Certified</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400 font-semibold">In Maintenance</p>
            <p className="text-lg font-bold text-white mt-0.5">{maintenanceBuses} Vehicles</p>
          </div>
        </div>
      </div>

      {/* Tabs & Add CTA */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubTab('buses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'buses'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bus Fleet Inventory ({buses.length})
          </button>
          <button
            onClick={() => setSubTab('drivers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'drivers'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Driver Directory ({drivers.length})
          </button>
        </div>

        {subTab === 'buses' ? (
          <button
            onClick={() => setIsAddingBus(!isAddingBus)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddingDriver(!isAddingDriver)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Driver</span>
          </button>
        )}
      </div>

      {/* 1. BUS INVENTORY */}
      {subTab === 'buses' && (
        <div className="space-y-4">
          
          {isAddingBus && (
            <form onSubmit={handleCreateBus} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-md">
              <h4 className="text-xs font-bold uppercase text-white tracking-wider">Register New Bus</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Registration Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TN-09-CB-1008"
                    value={newRegNo}
                    onChange={(e) => setNewRegNo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="80"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Vehicle Class</label>
                  <select
                    value={newBusType}
                    onChange={(e: any) => setNewBusType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="STANDARD_50">Standard 50-Seater</option>
                    <option value="MINI_32">Mini 32-Seater</option>
                    <option value="HEAVY_60">Heavy 60-Seater</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingBus(false)}
                  className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-800/60 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Capacity & Type</th>
                  <th className="px-4 py-3">Fuel Level</th>
                  <th className="px-4 py-3">FC Valid Until</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3 text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      {bus.registrationNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white">{bus.capacity} Seats</span>
                      <div className="text-[10px] text-slate-400">{bus.type.replace('_', ' ')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-mono">{bus.fuelLevelPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {bus.fitnessCertificateValidUntil}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bus.status === 'AVAILABLE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : bus.status === 'ASSIGNED'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => onUpdateBusStatus(bus.id, bus.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        {bus.status === 'AVAILABLE' ? 'Send to Maintenance' : 'Set Ready'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. DRIVER DIRECTORY */}
      {subTab === 'drivers' && (
        <div className="space-y-4">
          
          {isAddingDriver && (
            <form onSubmit={handleCreateDriver} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-md">
              <h4 className="text-xs font-bold uppercase text-white tracking-wider">Register New Driver</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senthil Kumar"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98400 00000"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Commercial License No</label>
                  <input
                    type="text"
                    required
                    placeholder="TN-09-2020-009988"
                    value={newLicenseNo}
                    onChange={(e) => setNewLicenseNo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDriver(false)}
                  className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
                >
                  Save Driver
                </button>
              </div>
            </form>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-800/60 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">License Number</th>
                  <th className="px-4 py-3">License Expiry</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {drivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{drv.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{drv.employeeId}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {drv.phone}
                    </td>
                    <td className="px-4 py-3 font-mono text-indigo-400">
                      {drv.licenseNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {drv.licenseExpiry}
                    </td>
                    <td className="px-4 py-3 font-semibold text-amber-400">
                      ★ {drv.rating}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        drv.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {drv.status}
                      </span>
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
