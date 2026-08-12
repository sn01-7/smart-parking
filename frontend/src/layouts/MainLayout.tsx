import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { wsService } from '../services/websocket';

export const MainLayout: React.FC = () => {
  useEffect(() => {
    // Connect WebSocket on main layout mount
    wsService.connect();
  }, []);

  return (
    <div className="flex min-h-screen bg-dark-bg text-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
