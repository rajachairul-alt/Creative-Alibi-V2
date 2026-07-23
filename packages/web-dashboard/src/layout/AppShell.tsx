/**
 * @fileoverview Application shell — skip link, sidebar, main landmark.
 * Accessible: skip-to-content, role="main", role="navigation", aria-label.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>

      {/* Skip-to-content — first focusable element on the page */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
        <main
          id="main-content"
          role="main"
          aria-label="Page content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}   /* so skip-link focus works */
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
