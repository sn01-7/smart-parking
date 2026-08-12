import React, { useState, useEffect } from 'react';
import { Radio, Battery, Signal, ArrowRightLeft, RefreshCw, Power, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import type { Sensor } from '../types';

export const SensorsPage: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSensors = async () => {
    try {
      const data = await api.getSensors();
      setSensors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
    const unsubscribe = wsService.subscribe(() => fetchSensors());
    return () => unsubscribe();
  }, []);

  const handleToggle = async (sensor: Sensor) => {
    try {
      if (sensor.status === 'OFFLINE') {
        await api.restoreSensor(sensor.sensor_id);
      } else {
        await api.toggleSensorOffline(sensor.sensor_id);
      }
      fetchSensors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Radio className="w-7 h-7 text-cyan-400" />
            Ultrasonic IoT Sensor Telemetry & Health
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Monitoring 40 Virtual Ultrasonic Parking Sensors (HC-SR04 Nodes)</p>
        </div>

        <button
          onClick={fetchSensors}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-gray-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Sensor Health Table */}
      <div className="rounded-2xl bg-dark-card border border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-dark-surface/60 text-gray-400 uppercase font-mono border-b border-dark-border">
              <tr>
                <th className="p-3.5">Sensor ID</th>
                <th className="p-3.5">Assigned Slot</th>
                <th className="p-3.5">Distance (cm)</th>
                <th className="p-3.5">Calculated Status</th>
                <th className="p-3.5">Battery</th>
                <th className="p-3.5">Signal</th>
                <th className="p-3.5">Sensor Health</th>
                <th className="p-3.5 text-right">Hardware Power</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {sensors.map((sensor) => {
                const isOccupied = sensor.distance_cm < 30.0;
                return (
                  <tr key={sensor.id} className="hover:bg-dark-surface/40 transition">
                    <td className="p-3.5 font-mono font-bold text-cyan-400 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-500" />
                      {sensor.sensor_id}
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-white">Slot #{sensor.slot_id}</td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      <span className={isOccupied ? 'text-rose-400' : 'text-emerald-400'}>
                        {sensor.distance_cm} cm
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        sensor.status === 'OFFLINE'
                          ? 'bg-gray-800 text-gray-400'
                          : isOccupied
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {sensor.status === 'OFFLINE' ? '⚫ OFFLINE' : isOccupied ? '🔴 OCCUPIED' : '🟢 AVAILABLE'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-emerald-400" />
                        {sensor.battery_level}%
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-gray-400">
                      <span className="flex items-center gap-1">
                        <Signal className="w-3.5 h-3.5 text-blue-400" />
                        {sensor.signal_strength} dBm
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sensor.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {sensor.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggle(sensor)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1 ml-auto ${
                          sensor.status === 'OFFLINE'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                            : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {sensor.status === 'OFFLINE' ? 'Power On' : 'Simulate Offline'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
