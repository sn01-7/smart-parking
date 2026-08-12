import React, { useState, useEffect } from 'react';
import { X, Car, Radio, Battery, Signal, Clock, DollarSign, AlertTriangle, CheckCircle, ArrowRightLeft } from 'lucide-react';
import type { ParkingSlot } from '../types';
import { api } from '../services/api';

interface SlotModalProps {
  slot: ParkingSlot | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const SlotModal: React.FC<SlotModalProps> = ({ slot, onClose, onRefresh }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [calculatedFee, setCalculatedFee] = useState<number>(0);
  const [durationMins, setDurationMins] = useState<number>(0);

  useEffect(() => {
    if (slot && slot.status === 'OCCUPIED') {
      // Fetch active session details
      api.getSessions('ACTIVE').then((sessions) => {
        const found = sessions.find((s) => s.slot_id === slot.id);
        if (found) {
          setActiveSession(found);
          // calculate live duration & fee
          const entryTime = new Date(found.entry_time).getTime();
          const now = new Date().getTime();
          const diffMinutes = Math.max(1, Math.floor((now - entryTime) / (1000 * 60)));
          setDurationMins(diffMinutes);
          const hours = diffMinutes / 60;
          setCalculatedFee(Number((hours * 30).toFixed(2)));
        }
      }).catch(console.error);
    } else {
      setActiveSession(null);
      setCalculatedFee(0);
      setDurationMins(0);
    }
  }, [slot]);

  if (!slot) return null;

  const handleEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle registration number');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.simulateVehicleEntry(
        slot.id,
        vehicleNumber.toUpperCase().trim(),
        ownerName.trim() || 'Guest Driver',
        phone.trim() || '9876543210'
      );
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to simulate entry');
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.simulateVehicleExit(slot.id);
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to simulate exit');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOffline = async () => {
    if (!slot.sensor_id) return;
    setLoading(true);
    try {
      if (slot.status === 'OFFLINE') {
        await api.restoreSensor(slot.sensor_id);
      } else {
        await api.toggleSensorOffline(slot.sensor_id);
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update sensor status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> AVAILABLE</span>;
      case 'OCCUPIED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> OCCUPIED</span>;
      case 'RESERVED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> RESERVED</span>;
      case 'OFFLINE':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> SENSOR OFFLINE</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-gray-200">
        {/* Header */}
        <div className="p-5 border-b border-dark-border flex items-center justify-between bg-dark-bg/60">
          <div>
            <span className="text-xs font-mono text-cyan-400">PARKING SPACE</span>
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              Slot #{slot.slot_number}
              {getStatusBadge(slot.status)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-dark-surface flex items-center justify-center hover:bg-dark-border text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-dark-surface/70 border border-dark-border">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sensor ID</span>
              </div>
              <p className="font-mono font-semibold text-white text-sm">{slot.sensor_id || `SENSOR_${slot.slot_number}`}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-surface/70 border border-dark-border">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ultrasonic Distance</span>
              </div>
              <p className="font-mono font-semibold text-cyan-400 text-sm">
                {slot.sensor?.distance_cm ?? (slot.status === 'OCCUPIED' ? '18.4' : '85.2')} cm
                <span className="text-xs text-gray-500 font-sans ml-1">
                  ({(slot.sensor?.distance_cm ?? 85) < 30 ? '<30cm Occupied' : '>=30cm Available'})
                </span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-surface/70 border border-dark-border">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <span>Battery Level</span>
              </div>
              <p className="font-mono font-semibold text-white text-sm">{slot.sensor?.battery_level ?? 98.5}%</p>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-surface/70 border border-dark-border">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Signal className="w-3.5 h-3.5 text-blue-400" />
                <span>Signal Strength</span>
              </div>
              <p className="font-mono font-semibold text-white text-sm">{slot.sensor?.signal_strength ?? -64.0} dBm</p>
            </div>
          </div>

          {/* Occupied Vehicle Details */}
          {slot.status === 'OCCUPIED' && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4" /> Vehicle & Session Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Vehicle Reg:</span>
                  <p className="font-mono text-sm font-bold text-white">{slot.vehicle?.vehicle_number || activeSession?.vehicle_number || 'KA-01-MJ-4829'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Owner Name:</span>
                  <p className="font-medium text-white">{slot.vehicle?.owner_name || activeSession?.owner_name || 'Guest Driver'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Entry Time:</span>
                  <p className="font-mono text-gray-300">
                    {activeSession ? new Date(activeSession.entry_time).toLocaleTimeString() : 'Recent'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Current Fee (₹30/hr):</span>
                  <p className="font-mono text-base font-bold text-emerald-400 flex items-center">
                    <DollarSign className="w-4 h-4" /> ₹{calculatedFee > 0 ? calculatedFee : '15.00'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Entry Form (If Available) */}
          {slot.status === 'AVAILABLE' && (
            <form onSubmit={handleEntry} className="p-4 rounded-xl bg-dark-surface/40 border border-dark-border space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4" /> Simulate Vehicle Parking Entry
              </h4>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Vehicle Registration No. *</label>
                <input
                  type="text"
                  placeholder="e.g. KA-05-MN-2024"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-white text-sm shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
              >
                {loading ? 'Processing Sensor Entry...' : '🟢 Simulate Park Vehicle (Entry ~18cm)'}
              </button>
            </form>
          )}

          {/* Exit Action (If Occupied) */}
          {slot.status === 'OCCUPIED' && (
            <button
              onClick={handleExit}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 font-bold text-white text-sm shadow-lg shadow-rose-900/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Exit...' : '🔴 Simulate Vehicle Exit (Depart ~85cm & Calculate Fee)'}
            </button>
          )}

          {/* Toggle Sensor Offline Action */}
          <div className="pt-2 border-t border-dark-border flex justify-between items-center text-xs">
            <span className="text-gray-400">Sensor Hardware Control:</span>
            <button
              onClick={handleToggleOffline}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-border text-gray-300 hover:text-white border border-dark-border transition"
            >
              {slot.status === 'OFFLINE' ? '⚡ Restore Sensor Online' : '⚠️ Set Sensor Offline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
