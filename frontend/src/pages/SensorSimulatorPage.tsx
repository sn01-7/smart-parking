import React, { useState, useEffect } from "react";
import {
  Cpu,
  Play,
  Square,
  RefreshCw,
  Zap,
  ArrowRightLeft,
  Radio,
  AlertTriangle,
} from "lucide-react";
import { api } from "../services/api";
import { wsService } from "../services/websocket";
import type { ParkingSlot } from "../types";

export const SensorSimulatorPage: React.FC = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [customReg, setCustomReg] = useState("KA-05-EV-9999");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      const data = await api.getSlots();
      setSlots(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSensors = async () => {
    try {
      const data = await api.getSensors();
      // map sensors back onto slots array via slot_id
      setSlots((prev) => {
        const byId = new Map(prev.map((s) => [s.id, s]));
        data.forEach((sensor: any) => {
          const slot = byId.get(sensor.slot_id);
          if (slot) slot.sensor = sensor;
        });
        return [...byId.values()];
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchSensors();
    const unsub = wsService.subscribe((msg) => {
      // on any websocket update, refresh slots and sensors
      fetchSlots();
      fetchSensors();
    });
    return () => unsub();
  }, []);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];

  const handleSimulateEntry = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.simulateVehicleEntry(selectedSlot.id, customReg);
      setMessage(
        `Entry Simulated! Sensor distance: ${res.sensor_distance} cm (<30cm -> OCCUPIED)`,
      );
      fetchSlots();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateExit = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.simulateVehicleExit(selectedSlot.id);
      setMessage(
        `Exit Simulated! Fee calculated: ₹${res.amount} (${res.duration_hours} hrs). Sensor distance: ${res.sensor_distance} cm (>=30cm -> AVAILABLE)`,
      );
      fetchSlots();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOffline = async () => {
    if (!selectedSlot || !selectedSlot.sensor_id) return;
    setLoading(true);
    try {
      if (selectedSlot.status === "OFFLINE") {
        await api.restoreSensor(selectedSlot.sensor_id);
        setMessage(`Sensor ${selectedSlot.sensor_id} restored ONLINE`);
      } else {
        await api.toggleSensorOffline(selectedSlot.sensor_id);
        setMessage(`Sensor ${selectedSlot.sensor_id} set OFFLINE`);
      }
      fetchSlots();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchRandomTraffic = async () => {
    setLoading(true);
    setMessage("Simulating random traffic burst across 5 random sensors...");
    try {
      const availSlots = slots.filter((s) => s.status === "AVAILABLE");
      const occSlots = slots.filter((s) => s.status === "OCCUPIED");

      if (availSlots.length > 0) {
        const target =
          availSlots[Math.floor(Math.random() * availSlots.length)];
        await api.simulateVehicleEntry(
          target.id,
          `KA-0${Math.floor(Math.random() * 9 + 1)}-XX-${Math.floor(Math.random() * 8999 + 1000)}`,
        );
      }
      if (occSlots.length > 0) {
        const target = occSlots[Math.floor(Math.random() * occSlots.length)];
        await api.simulateVehicleExit(target.id);
      }
      setMessage(
        "Random traffic burst event triggered via VirtualSensorProvider",
      );
      fetchSlots();
    } catch (err: any) {
      setMessage(`Traffic simulation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-7 h-7 text-cyan-400" />
          Virtual Sensor Hardware Testing Workbench
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Simulate Ultrasonic sensor pulse triggers, distance thresholds
          (&lt;30cm vs &gt;=30cm), and hardware faults
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-cyan-950/70 border border-cyan-700 text-cyan-200 font-mono text-xs flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Single Sensor Controller */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            Sensor & Space Selection
          </h2>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Target Parking Slot
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
            >
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  Slot #{s.slot_number} - Status: {s.status} (Sensor:{" "}
                  {s.sensor_id})
                </option>
              ))}
            </select>
          </div>
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-green-400" /> Live Simulator
              Controls
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  await api.startSimulation();
                  await fetchSlots();
                  setLoading(false);
                }}
                className="px-4 py-2 rounded bg-green-600"
              >
                Start
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  await api.pauseSimulation();
                  await fetchSlots();
                  setLoading(false);
                }}
                className="px-4 py-2 rounded bg-yellow-600"
              >
                Pause
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  await api.resumeSimulation();
                  await fetchSlots();
                  setLoading(false);
                }}
                className="px-4 py-2 rounded bg-cyan-600"
              >
                Resume
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  await api.stopSimulation();
                  await fetchSlots();
                  setLoading(false);
                }}
                className="px-4 py-2 rounded bg-rose-600"
              >
                Stop
              </button>
            </div>
          </div>

          {selectedSlot && (
            <div className="p-4 rounded-xl bg-dark-surface/60 border border-dark-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Selected Sensor:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {selectedSlot.sensor_id ||
                    `SENSOR_${selectedSlot.slot_number}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Slot Status:</span>
                <span className="font-mono font-bold text-white">
                  {selectedSlot.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ultrasonic Distance:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedSlot.sensor?.distance_cm ?? 85.0} cm
                </span>
              </div>
              {selectedSlot.sensor && (
                <div className="mt-3 pt-3 border-t border-dark-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Battery Level:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {selectedSlot.sensor.battery_level}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Signal Strength:</span>
                    <span className="font-mono font-bold text-purple-400">
                      {selectedSlot.sensor.signal_strength} dBm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sensor Status:</span>
                    <span
                      className={`font-mono font-bold ${selectedSlot.sensor.status === "ONLINE" ? "text-green-400" : "text-red-400"}`}
                    >
                      {selectedSlot.sensor.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Vehicle Registration No. for Entry
            </label>
            <input
              type="text"
              value={customReg}
              onChange={(e) => setCustomReg(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleSimulateEntry}
              disabled={loading || selectedSlot?.status === "OCCUPIED"}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-white text-xs shadow-lg shadow-emerald-900/30 transition disabled:opacity-40"
            >
              🟢 Simulate Park Vehicle (Entry ~18cm)
            </button>

            <button
              onClick={handleSimulateExit}
              disabled={loading || selectedSlot?.status !== "OCCUPIED"}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 font-bold text-white text-xs shadow-lg shadow-rose-900/30 transition disabled:opacity-40"
            >
              🔴 Simulate Vehicle Depart (Exit ~85cm)
            </button>

            <button
              onClick={handleToggleOffline}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-dark-surface hover:bg-dark-border text-gray-300 font-semibold text-xs border border-dark-border transition"
            >
              {selectedSlot?.status === "OFFLINE"
                ? "⚡ Restore Sensor Online"
                : "⚠️ Simulate Hardware Offline"}
            </button>
          </div>
        </div>

        {/* Sensor Logic Explanation & Batch Simulator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Batch Traffic Burst Simulator
            </h2>
            <p className="text-xs text-gray-400">
              Inject automated real-time vehicle arrivals and departures to test
              WebSocket broadcast latency and dashboard state synchronization.
            </p>

            <button
              onClick={handleBatchRandomTraffic}
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold text-white text-xs shadow-lg shadow-cyan-900/30 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Trigger Random Parking Event Burst
            </button>
          </div>

          {/* Logic rules box */}
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-3 font-mono text-xs">
            <h3 className="font-bold text-cyan-400 uppercase tracking-wider font-sans">
              Ultrasonic Sensor Logic Rules
            </h3>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              <li>
                Distance &lt; 30.0 cm → Sensor flags{" "}
                <span className="text-rose-400 font-bold">OCCUPIED</span>
              </li>
              <li>
                Distance &gt;= 30.0 cm → Sensor flags{" "}
                <span className="text-emerald-400 font-bold">AVAILABLE</span>
              </li>
              <li>
                Occupied simulation distance range:{" "}
                <span className="text-white">15.0 cm to 25.0 cm</span>
              </li>
              <li>
                Available simulation distance range:{" "}
                <span className="text-white">70.0 cm to 100.0 cm</span>
              </li>
              <li>
                Billing rate:{" "}
                <span className="text-emerald-400 font-bold">
                  ₹30/hour proportional
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Sensors Overview */}
      <div className="mt-6 p-6 rounded-2xl bg-dark-card border border-dark-border">
        <h3 className="text-sm font-bold text-white mb-3">Sensors Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {slots.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-xl bg-dark-surface/60 border border-dark-border text-xs"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-mono text-cyan-300">
                    {s.sensor_id || `SENSOR_${s.slot_number}`}
                  </div>
                  <div className="text-gray-400">Slot {s.slot_number}</div>
                </div>
                <div className="text-right">
                  <div
                    className={
                      s.status === "OCCUPIED"
                        ? "text-rose-400"
                        : s.status === "RESERVED"
                          ? "text-yellow-400"
                          : "text-emerald-400"
                    }
                  >
                    {s.status}
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    {s.sensor?.distance_cm ?? "--"} cm
                  </div>
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={async () => {
                    setLoading(true);
                    await api.simulateVehicleEntry(
                      s.id,
                      `KA-${Math.floor(Math.random() * 90 + 10)}-EV-${Math.floor(Math.random() * 9000 + 1000)}`,
                    );
                    await fetchSlots();
                    setLoading(false);
                  }}
                  className="flex-1 py-1 rounded bg-emerald-600 text-white text-xs"
                >
                  Entry
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    await api.simulateVehicleExit(s.id);
                    await fetchSlots();
                    setLoading(false);
                  }}
                  className="flex-1 py-1 rounded bg-rose-600 text-white text-xs"
                >
                  Exit
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={async () => {
                    setLoading(true);
                    await api.toggleSensorOffline(s.sensor_id || "");
                    await fetchSlots();
                    setLoading(false);
                  }}
                  className="flex-1 py-1 rounded bg-gray-600 text-white text-xs"
                >
                  Toggle Offline
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    await api.restoreSensor(s.sensor_id || "");
                    await fetchSlots();
                    setLoading(false);
                  }}
                  className="flex-1 py-1 rounded bg-cyan-600 text-white text-xs"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
