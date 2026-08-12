import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Clock, ShieldCheck } from 'lucide-react';
import { wsService } from '../services/websocket';

export const Navbar: React.FC = () => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [wsConnected, setWsConnected] = useState<boolean>(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      setWsConnected(wsService.getStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-dark-card/90 backdrop-blur border-b border-dark-border px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-300">
          Cloud Smart Parking Management Platform
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
          Rate: ₹30/hr
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        {/* WebSocket Connection Status Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
          wsConnected
            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
            : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
        }`}>
          {wsConnected ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{wsConnected ? 'WebSocket Live' : 'Reconnecting...'}</span>
        </div>

        {/* Security badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-surface border border-dark-border text-gray-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Virtual Sensor Layer</span>
        </div>

        {/* Real-time Clock */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-bg border border-dark-border text-gray-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
};
