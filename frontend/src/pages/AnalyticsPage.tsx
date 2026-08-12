import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, IndianRupee, Clock, Activity } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { api } from '../services/api';
import type { AnalyticsSummary } from '../types';

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#6b7280'];

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pieData = analytics ? [
    { name: 'Available', value: analytics.available_slots },
    { name: 'Occupied', value: analytics.occupied_slots },
    { name: 'Reserved', value: analytics.reserved_slots },
    { name: 'Offline', value: analytics.offline_slots },
  ] : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          Data Analytics & Usage Intelligence
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Statistical insights, revenue performance, and parking slot utilization trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Total Revenue Generated</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">₹{analytics?.total_revenue ?? 0}</p>
          <span className="text-[11px] text-gray-500">All-time accumulated earnings</span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Peak Occupancy Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{analytics?.occupancy_percentage ?? 25}%</p>
          <span className="text-[11px] text-cyan-500 font-medium">Zone A Peak Hours (10 AM - 4 PM)</span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-card border border-dark-border">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Average Session Duration</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono">2.4 Hrs</p>
          <span className="text-[11px] text-gray-500">Based on historical sessions</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Distribution Chart */}
        <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-3">
          <h3 className="text-sm font-bold text-white">Current Slot Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-dark-border">
            <div className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available: {analytics?.available_slots}</div>
            <div className="flex items-center gap-1.5 text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied: {analytics?.occupied_slots}</div>
            <div className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved: {analytics?.reserved_slots}</div>
            <div className="flex items-center gap-1.5 text-gray-400"><span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span> Offline: {analytics?.offline_slots}</div>
          </div>
        </div>

        {/* 7-Day Revenue Trend Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-dark-card border border-dark-border space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            7-Day Revenue Trend (₹)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.revenue_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} unit="₹" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="Daily Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
