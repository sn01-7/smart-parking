import React, { useState, useEffect } from 'react';
import { Car, Search, Phone, User, Calendar, Shield } from 'lucide-react';
import { api } from '../services/api';
import type { Vehicle } from '../types';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVehicles().then(setVehicles).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = vehicles.filter(
    (v) =>
      v.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
      v.owner_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Car className="w-7 h-7 text-cyan-400" />
            Registered Vehicles Registry
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Database of all authorized drivers and parking activity</p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search vehicle number or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((vehicle) => (
          <div key={vehicle.id} className="p-5 rounded-2xl bg-dark-card border border-dark-border hover:border-cyan-800 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold text-sm border border-cyan-800">
                {vehicle.vehicle_number}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">ID #{vehicle.id}</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-white">{vehicle.owner_name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+91 {vehicle.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Registered {new Date(vehicle.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
