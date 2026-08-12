import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/Dashboard';
import { ParkingMapPage } from './pages/ParkingMapPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { SensorsPage } from './pages/SensorsPage';
import { SensorSimulatorPage } from './pages/SensorSimulatorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LiveEventsPage } from './pages/LiveEventsPage';
import { CloudArchitecturePage } from './pages/CloudArchitecturePage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="map" element={<ParkingMapPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="sensors" element={<SensorsPage />} />
          <Route path="simulator" element={<SensorSimulatorPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="events" element={<LiveEventsPage />} />
          <Route path="architecture" element={<CloudArchitecturePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
