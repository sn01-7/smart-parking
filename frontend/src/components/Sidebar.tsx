import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, Calendar, Car, Radio, Cpu,
  BarChart3, Activity, Cloud, Settings, ParkingCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Parking Map', path: '/map', icon: Map },
  { name: 'Reservations', path: '/reservations', icon: Calendar },
  { name: 'Vehicles', path: '/vehicles', icon: Car },
  { name: 'Sensors', path: '/sensors', icon: Radio },
  { name: 'Sensor Simulator', path: '/simulator', icon: Cpu },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Live Events', path: '/events', icon: Activity },
  { name: 'Cloud Architecture', path: '/architecture', icon: Cloud },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-dark-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/30">
          <ParkingCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide">SmartPark</h1>
          <p className="text-xs text-cyan-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Virtual IoT Active
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 font-semibold shadow-inner'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-surface/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Architecture Footnote */}
      <div className="p-4 border-t border-dark-border bg-dark-bg/40 text-xs text-gray-500">
        <p className="font-medium text-gray-400">SmartPark v1.0 IoT Prototype</p>
        <p className="mt-0.5">UltraSensor → FastAPI → SQLite → WS</p>
      </div>
    </aside>
  );
};
