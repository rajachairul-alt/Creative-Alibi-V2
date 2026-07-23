/**
 * @fileoverview Root App with React Router setup for the Creative Alibi Web Dashboard.
 * Uses HashRouter so GitHub Pages static hosting works without server-side routing.
 * Routes become /#/dashboard, /#/analytics, etc.
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { DashboardPage } from './pages/Dashboard';
import { SessionsPage } from './pages/Sessions';
import { AnalyticsPage } from './pages/Analytics';
import { ReportsPage } from './pages/Reports';
import { AIPartnerPage } from './pages/AIPartner';
import { SettingsPage } from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="ai-partner" element={<AIPartnerPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
