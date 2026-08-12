import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Car, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { Reservation, ParkingSlot } from '../types';

export const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form State
  const [slotId, setSlotId] = useState<number>(0);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resData, slotData] = await Promise.all([
        api.getReservations(),
        api.getSlots()
      ]);
      setReservations(resData);
      setSlots(slotData);
      const avail = slotData.filter(s => s.status === 'AVAILABLE');
      if (avail.length > 0) {
        setSlotId(avail[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle registration number');
      return;
    }
    setError(null);
    try {
      const now = new Date();
      const end = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
      await api.createReservation({
        slot_id: slotId,
        vehicle_number: vehicleNumber.toUpperCase().trim(),
        owner_name: ownerName.trim() || 'Reserved Driver',
        phone: phone.trim() || '9876543210',
        start_time: now.toISOString(),
        end_time: end.toISOString()
      });
      setShowModal(false);
      setVehicleNumber('');
      setOwnerName('');
      setPhone('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.cancelReservation(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7 text-amber-400" />
            Parking Space Reservations
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Pre-book parking slots in advance with automated sensor holding</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 font-bold text-white text-xs shadow-lg shadow-amber-900/30 transition"
        >
          <Plus className="w-4 h-4" />
          Book Slot Reservation
        </button>
      </div>

      {/* Reservations Table */}
      <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden">
        <div className="p-4 border-b border-dark-border bg-dark-bg/40 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Active & Upcoming Bookings ({reservations.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-dark-surface/60 text-gray-400 uppercase font-mono border-b border-dark-border">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Slot Number</th>
                <th className="p-3.5">Vehicle Number</th>
                <th className="p-3.5">Start Time</th>
                <th className="p-3.5">End Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                    No active reservations found. Click "Book Slot Reservation" to create one.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-dark-surface/40 transition">
                    <td className="p-3.5 font-mono text-cyan-400">#{res.id}</td>
                    <td className="p-3.5 font-bold font-mono text-white">{res.slot_number || `Slot #${res.slot_id}`}</td>
                    <td className="p-3.5 font-mono font-semibold text-amber-300">{res.vehicle_number}</td>
                    <td className="p-3.5 font-mono">{new Date(res.start_time).toLocaleString()}</td>
                    <td className="p-3.5 font-mono">{new Date(res.end_time).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        res.status === 'ACTIVE'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : res.status === 'CANCELLED'
                          ? 'bg-gray-800 text-gray-400 border-gray-700'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {res.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancel(res.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 transition text-[11px] flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Book Parking Space
            </h3>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Select Available Parking Slot *</label>
                <select
                  value={slotId}
                  onChange={(e) => setSlotId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white font-mono focus:outline-none"
                >
                  {slots.filter(s => s.status === 'AVAILABLE').map(s => (
                    <option key={s.id} value={s.id}>
                      Slot #{s.slot_number} (Available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Vehicle Registration Number *</label>
                <input
                  type="text"
                  placeholder="e.g. KA-01-MJ-4829"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white font-mono uppercase focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="Aarav Sharma"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-dark-surface hover:bg-dark-border text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-900/30"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
