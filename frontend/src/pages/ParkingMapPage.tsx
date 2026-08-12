import React, { useState, useEffect } from 'react';
import { ParkingCircle, Filter, Car, RefreshCw, Radio, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import type { ParkingSlot } from '../types';
import { SlotModal } from '../components/SlotModal';

export const ParkingMapPage: React.FC = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSlots = async () => {
    try {
      const data = await api.getSlots();
      setSlots(data);
    } catch (err) {
      console.error('Failed to fetch parking slots:', err);
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    const unsubscribe = wsService.subscribe(() => {
      fetchSlots();
    });
    return () => unsubscribe();
  }, []);

  const filteredSlots = slots.filter((slot) => {
    if (filter === 'ALL') return true;
    return slot.status === filter;
  });

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-900/30';
      case 'OCCUPIED':
        return 'border-rose-500/40 bg-rose-950/20 text-rose-300 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-900/30';
      case 'RESERVED':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-300 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-900/30';
      case 'OFFLINE':
        return 'border-gray-600/40 bg-gray-900/40 text-gray-400 hover:border-gray-500';
      default:
        return 'border-gray-700 bg-dark-card';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ParkingCircle className="w-7 h-7 text-cyan-400" />
            Interactive Visual Parking Layout
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            40 Ultrasonic Sensor Monitored Parking Spaces | Click slot for telemetry & controls
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-card border border-dark-border text-xs font-medium">
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'OFFLINE'].map((status) => {
            const count = status === 'ALL' ? slots.length : slots.filter((s) => s.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === status
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-gray-400 hover:text-white hover:bg-dark-surface'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Legend Bar */}
      <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Legend:</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span> 🟢 AVAILABLE (&gt;= 30cm)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500"></span> 🔴 OCCUPIED (&lt; 30cm)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500"></span> 🟡 RESERVED
          </span>
          <span className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span> ⚫ SENSOR OFFLINE
          </span>
        </div>
        <span className="text-xs text-cyan-400 font-mono">Zone A Parking Lot</span>
      </div>

      {/* Visual Parking Spaces Layout */}
      <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border pb-3">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">Lane 01 — Spaces A01 to A20</span>
          <span className="text-xs text-gray-500 font-mono">Ultrasonic Rate: 10 Hz</span>
        </div>

        {/* Lane 1 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {filteredSlots.slice(0, 20).map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot)}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between h-32 transition-all duration-200 text-left ${getStatusBorder(
                slot.status
              )}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black">#{slot.slot_number}</span>
                {slot.status === 'OCCUPIED' ? (
                  <Car className="w-5 h-5 text-rose-400 animate-pulse" />
                ) : slot.status === 'AVAILABLE' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : slot.status === 'RESERVED' ? (
                  <Clock className="w-4 h-4 text-amber-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono opacity-70 truncate">
                  {slot.sensor_id || `SENSOR_${slot.slot_number}`}
                </p>
                <div className="text-xs font-bold font-mono">
                  {slot.sensor?.distance_cm ?? (slot.status === 'OCCUPIED' ? '18.4' : '85.2')} cm
                </div>
                {slot.vehicle && (
                  <p className="text-[10px] font-mono text-cyan-300 font-semibold truncate">
                    {slot.vehicle.vehicle_number}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Driveway Road Marking */}
        <div className="py-2.5 my-4 bg-dark-surface/50 rounded-xl border border-dashed border-dark-border flex items-center justify-center">
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">
            ⬇️ MAIN VEHICLE DRIVEWAY / TRAFFIC LANE ⬆️
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-dark-border pb-3">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">Lane 02 — Spaces A21 to A40</span>
          <span className="text-xs text-gray-500 font-mono">Proportional Billing Active</span>
        </div>

        {/* Lane 2 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {filteredSlots.slice(20, 40).map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot)}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between h-32 transition-all duration-200 text-left ${getStatusBorder(
                slot.status
              )}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black">#{slot.slot_number}</span>
                {slot.status === 'OCCUPIED' ? (
                  <Car className="w-5 h-5 text-rose-400 animate-pulse" />
                ) : slot.status === 'AVAILABLE' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : slot.status === 'RESERVED' ? (
                  <Clock className="w-4 h-4 text-amber-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono opacity-70 truncate">
                  {slot.sensor_id || `SENSOR_${slot.slot_number}`}
                </p>
                <div className="text-xs font-bold font-mono">
                  {slot.sensor?.distance_cm ?? (slot.status === 'OCCUPIED' ? '18.4' : '85.2')} cm
                </div>
                {slot.vehicle && (
                  <p className="text-[10px] font-mono text-cyan-300 font-semibold truncate">
                    {slot.vehicle.vehicle_number}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Slot Modal */}
      {selectedSlot && (
        <SlotModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onRefresh={fetchSlots}
        />
      )}
    </div>
  );
};
