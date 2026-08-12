import React, { useState, useEffect } from 'react';
import {
  ParkingCircle, CheckCircle2, Car, Clock, AlertCircle,
  IndianRupee, Activity, Radio, ArrowUpRight, TrendingUp, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import type { AnalyticsSummary, ParkingSlot, SensorEvent, Reservation } from '../types';
import { SlotModal } from '../components/SlotModal';

export const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [events, setEvents] = useState<SensorEvent[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [analyticsData, slotsData, eventsData, resData] = await Promise.all([
        api.getAnalytics(),
        api.getSlots(),
        api.getEvents(8),
        api.getReservations(),
      ]);
      setAnalytics(analyticsData);
      setSlots(slotsData);
      setEvents(eventsData);
      setReservations(resData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Subscribe to real-time WebSocket updates
    const unsubscribe = wsService.subscribe((msg) => {
      console.log('Dashboard received WS message:', msg);
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30';
      case 'OCCUPIED': return 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30';
      case 'RESERVED': return 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30';
      default: return 'bg-gray-700/40 text-gray-400 border-gray-600/40 hover:bg-gray-700/60';
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-mono text-gray-400">Loading SmartPark IoT Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">SmartPark Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">Real-Time Cloud IoT Parking Telemetry & Analytics</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-dark-card border border-dark-border text-xs font-semibold text-gray-300 hover:text-white hover:bg-dark-surface transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Slots */}
        <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Total Slots</span>
            <ParkingCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{analytics?.total_slots ?? 40}</p>
          <span className="text-[10px] text-gray-500">Zone A Capacity</span>
        </div>

        {/* Available */}
        <div className="p-4 rounded-xl bg-dark-card border border-emerald-900/50 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>Available</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">{analytics?.available_slots ?? 27}</p>
          <span className="text-[10px] text-emerald-600 font-medium">🟢 Open Spaces</span>
        </div>

        {/* Occupied */}
        <div className="p-4 rounded-xl bg-dark-card border border-rose-900/50 bg-rose-950/10">
          <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
            <span>Occupied</span>
            <Car className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">{analytics?.occupied_slots ?? 10}</p>
          <span className="text-[10px] text-rose-600 font-medium">🔴 Parked Cars</span>
        </div>

        {/* Reserved */}
        <div className="p-4 rounded-xl bg-dark-card border border-amber-900/50 bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span>Reserved</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{analytics?.reserved_slots ?? 3}</p>
          <span className="text-[10px] text-amber-600 font-medium">🟡 Booked</span>
        </div>

        {/* Occupancy % */}
        <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Occupancy</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{analytics?.occupancy_percentage ?? 25.0}%</p>
          <span className="text-[10px] text-cyan-500 font-medium">Utilization Rate</span>
        </div>

        {/* Revenue Today */}
        <div className="p-4 rounded-xl bg-dark-card border border-emerald-900/40">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Revenue Today</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 font-mono">₹{analytics?.revenue_today ?? 0}</p>
          <span className="text-[10px] text-gray-500">₹30/hr Rate</span>
        </div>

        {/* Active Sessions */}
        <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Active Sessions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{analytics?.active_sessions ?? 10}</p>
          <span className="text-[10px] text-gray-500">Ongoing Parking</span>
        </div>

        {/* Online Sensors */}
        <div className="p-4 rounded-xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Sensors Online</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{analytics?.online_sensors ?? 40}/40</p>
          <span className="text-[10px] text-emerald-500 font-medium">100% Operational</span>
        </div>
      </div>

      {/* Main Section: Interactive Map + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Parking Map Preview (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ParkingCircle className="w-5 h-5 text-cyan-400" />
                Live Visual Parking Grid (40 Slots)
              </h2>
              <p className="text-xs text-gray-400">Click any slot card to open sensor details & entry/exit control</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Occupied</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Reserved</span>
            </div>
          </div>

          {/* 40 Slot Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5 pt-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className={`p-2.5 rounded-xl border text-center font-mono font-bold text-xs transition-all transform hover:scale-105 ${getStatusColor(
                  slot.status
                )}`}
              >
                <div>#{slot.slot_number}</div>
                <div className="text-[9px] font-sans opacity-80 mt-0.5">
                  {slot.status === 'AVAILABLE' ? '🟢 OPEN' : slot.status === 'OCCUPIED' ? '🔴 PARKED' : slot.status === 'RESERVED' ? '🟡 BOOKED' : '⚫ OFFLINE'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Activity Stream (1 col) */}
        <div className="p-5 rounded-2xl bg-dark-card border border-dark-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Recent Sensor Events
              </h2>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {events.map((event) => (
                <div key={event.id} className="p-2.5 rounded-xl bg-dark-surface/60 border border-dark-border text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${
                      event.event_type === 'VEHICLE_DETECTED' ? 'bg-rose-500 animate-ping' :
                      event.event_type === 'VEHICLE_DEPARTED' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <p className="font-semibold text-white">
                        {event.sensor_id} → {event.event_type.replace('_', ' ')}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        Reading: {event.distance_cm} cm | Slot #{event.slot_number}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trend Chart */}
        <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Today's Hourly Occupancy Rate (%)
          </h3>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.occupancy_trend || []}>
                <defs>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="occupancy_rate" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorOcc)" name="Occupancy %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown Chart */}
        <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            7-Day Historical Revenue Breakdown (₹)
          </h3>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.revenue_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} unit="₹" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Slot Detail Modal */}
      {selectedSlot && (
        <SlotModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onRefresh={loadData}
        />
      )}
    </div>
  );
};
