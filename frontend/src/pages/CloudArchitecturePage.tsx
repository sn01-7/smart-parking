import React from 'react';
import { Cloud, Cpu, Radio, Database, Server, Wifi, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const CloudArchitecturePage: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Cloud className="w-7 h-7 text-cyan-400" />
          Cloud & IoT System Architecture
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Vibe Coding Project Demonstration: Comparing Prototype Virtual Sensor Layer vs Production AWS IoT Infrastructure
        </p>
      </div>

      {/* Prototype Architecture Section */}
      <div className="p-6 rounded-2xl bg-dark-card border border-cyan-800/60 space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border pb-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">Phase 1 (Current Prototype)</span>
            <h2 className="text-xl font-bold text-white">Virtual Sensor Simulation Architecture</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold font-mono">
            🟢 Active & Running Locally
          </span>
        </div>

        {/* Visual Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          <div className="p-4 rounded-xl bg-dark-surface border border-dark-border space-y-2">
            <div className="w-10 h-10 mx-auto rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">Virtual Sensors</h4>
            <p className="text-[11px] text-gray-400 font-mono">VirtualSensorProvider (HC-SR04 ultrasonic logic)</p>
          </div>

          <div className="flex items-center justify-center text-cyan-500 font-mono text-xs">
            <ArrowRight className="w-5 h-5 hidden md:block" />
          </div>

          <div className="p-4 rounded-xl bg-dark-surface border border-dark-border space-y-2">
            <div className="w-10 h-10 mx-auto rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">FastAPI Backend</h4>
            <p className="text-[11px] text-gray-400 font-mono">Python REST API & WebSocket Manager</p>
          </div>

          <div className="flex items-center justify-center text-cyan-500 font-mono text-xs">
            <ArrowRight className="w-5 h-5 hidden md:block" />
          </div>

          <div className="p-4 rounded-xl bg-dark-surface border border-dark-border space-y-2">
            <div className="w-10 h-10 mx-auto rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white">SQLite Database</h4>
            <p className="text-[11px] text-gray-400 font-mono">SQLAlchemy ORM (Migration-ready to PostgreSQL)</p>
          </div>
        </div>
      </div>

      {/* Production AWS IoT Architecture Section */}
      <div className="p-6 rounded-2xl bg-dark-card border border-amber-800/60 space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border pb-4">
          <div>
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">Phase 2 (Production Scale)</span>
            <h2 className="text-xl font-bold text-white">AWS Cloud IoT Core Infrastructure</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold font-mono">
            ⚡ AWS Enterprise Ready Blueprint
          </span>
        </div>

        {/* AWS Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-9 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-dark-surface border border-dark-border">
            <div className="font-bold text-amber-400 mb-1">1. Sensor</div>
            <p className="text-[10px] text-gray-400">Ultrasonic HC-SR04</p>
          </div>
          <div className="flex items-center justify-center text-gray-600">→</div>

          <div className="p-3 rounded-xl bg-dark-surface border border-dark-border">
            <div className="font-bold text-amber-400 mb-1">2. Hardware</div>
            <p className="text-[10px] text-gray-400">ESP32 Microcontroller</p>
          </div>
          <div className="flex items-center justify-center text-gray-600">→</div>

          <div className="p-3 rounded-xl bg-dark-surface border border-dark-border">
            <div className="font-bold text-amber-400 mb-1">3. Protocol</div>
            <p className="text-[10px] text-gray-400">Wi-Fi + MQTT</p>
          </div>
          <div className="flex items-center justify-center text-gray-600">→</div>

          <div className="p-3 rounded-xl bg-dark-surface border border-dark-border">
            <div className="font-bold text-amber-400 mb-1">4. AWS Core</div>
            <p className="text-[10px] text-gray-400">AWS IoT Core Broker</p>
          </div>
          <div className="flex items-center justify-center text-gray-600">→</div>

          <div className="p-3 rounded-xl bg-dark-surface border border-dark-border">
            <div className="font-bold text-amber-400 mb-1">5. Serverless</div>
            <p className="text-[10px] text-gray-400">AWS Lambda & RDS</p>
          </div>
        </div>
      </div>

      {/* Sensor Abstraction Blueprint */}
      <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-cyan-400 font-sans">Sensor Provider Abstraction Code Blueprint</h3>
        <p className="text-gray-400 font-sans text-xs">
          The system uses a clean Python `SensorProvider` abstract base class. To swap from Virtual Simulation to real ESP32 hardware, simply inject `ESP32SensorProvider` into `ParkingService` without altering any parking logic!
        </p>

        <pre className="p-4 rounded-xl bg-dark-bg border border-dark-border overflow-x-auto text-emerald-400">
{`class SensorProvider(ABC):
    @abstractmethod
    def read_distance(self, sensor_id: str, is_occupied: bool) -> float: pass

# Development / Local Simulation Provider
class VirtualSensorProvider(SensorProvider):
    def read_distance(self, sensor_id: str, is_occupied: bool) -> float:
        return random.uniform(15.0, 25.0) if is_occupied else random.uniform(70.0, 100.0)

# Future Production ESP32 Provider over MQTT / AWS IoT
class ESP32SensorProvider(SensorProvider):
    def read_distance(self, sensor_id: str, is_occupied: bool) -> float:
        return aws_iot_client.get_latest_telemetry(sensor_id)["distance_cm"]`}
        </pre>
      </div>
    </div>
  );
};
