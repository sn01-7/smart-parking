import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Filter, RefreshCw, Car, Radio, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import type { SensorEvent } from '../types';

export const LiveEventsPage: React.FC = () => {
  const [events, setEvents] = useState<SensorEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents(100);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const unsub = wsService.subscribe((msg) => {
      console.log('Live Events received WS update:', msg);
      fetchEvents();
    });
    return () => unsub();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.event_type === filterType;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'VEHICLE_DETECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1"><Car className="w-3 h-3" /> VEHICLE DETECTED</span>;
      case 'VEHICLE_DEPARTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1"><Radio className="w-3 h-3" /> VEHICLE DEPARTED</span>;
      case 'RESERVATION_ACTIVATED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1"><Clock className="w-3 h-3" /> RESERVATION HELD</span>;
      case 'SENSOR_OFFLINE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> SENSOR OFFLINE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">{type}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-cyan-400" />
            Real-Time Sensor Event Stream
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Live WebSocket feed of all ultrasonic distance trigger events</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-card border border-dark-border text-xs font-medium">
          {['ALL', 'VEHICLE_DETECTED', 'VEHICLE_DEPARTED', 'RESERVATION_ACTIVATED', 'SENSOR_OFFLINE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === type
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-dark-surface'
              }`}
            >
              {type === 'ALL' ? 'All Events' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Events Log Table */}
      <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden">
        <div className="p-4 border-b border-dark-border bg-dark-bg/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400">WebSocket /ws/parking Connected</span>
          </div>
          <button onClick={fetchEvents} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-dark-surface/60 text-gray-400 uppercase font-mono border-b border-dark-border">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Sensor ID</th>
                <th className="p-3.5">Slot Number</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Distance Reading</th>
                <th className="p-3.5">Logic Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border font-mono">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-dark-surface/40 transition">
                  <td className="p-3.5 text-gray-400">{new Date(evt.timestamp).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-cyan-400">{evt.sensor_id}</td>
                  <td className="p-3.5 font-bold text-white">Slot #{evt.slot_number}</td>
                  <td className="p-3.5">{getEventBadge(evt.event_type)}</td>
                  <td className="p-3.5 font-bold text-white">{evt.distance_cm} cm</td>
                  <td className="p-3.5 text-gray-400 font-sans text-xs">
                    {evt.distance_cm < 30 ? 'Distance <30cm -> OCCUPIED' : 'Distance >=30cm -> AVAILABLE'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
