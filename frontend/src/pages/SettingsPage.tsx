import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, RefreshCw, DollarSign, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [rate, setRate] = useState<number>(30);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(`Parking rate updated to ₹${rate}/hour`);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-cyan-400" />
          SmartPark System Settings & Configuration
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage billing rates, database connection, and system parameters</p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rate Settings */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Parking Fee Tariff Rates
          </h3>
          <form onSubmit={handleSaveRate} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Standard Hourly Rate (₹ / Hour)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">Billing uses proportional calculation (e.g. 2.5 hrs × ₹30 = ₹75)</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white shadow-lg shadow-cyan-900/30 transition"
            >
              Save Rate Configuration
            </button>
          </form>
        </div>

        {/* Database Info */}
        <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            Database Engine & Connection
          </h3>
          <div className="space-y-2 font-mono text-gray-300">
            <div className="flex justify-between p-2 rounded bg-dark-surface">
              <span>Environment:</span>
              <span className="text-emerald-400 font-bold">Local Development</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-dark-surface">
              <span>Database Engine:</span>
              <span className="text-cyan-400 font-bold">SQLite (smartpark.db)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-dark-surface">
              <span>Migration Path:</span>
              <span className="text-purple-400">PostgreSQL Ready</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-dark-surface">
              <span>ORM Framework:</span>
              <span className="text-white">SQLAlchemy 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
