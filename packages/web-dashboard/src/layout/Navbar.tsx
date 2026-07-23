/**
 * @fileoverview Navbar — Moon Phases palette.
 * #212A31 surface · #374654 border · #2A9FBF accent · #D3D9D4 text
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/dashboard':  { title: 'Dashboard',          description: 'Overview of your writing activity' },
  '/analytics':  { title: 'Analytics',          description: 'Detailed charts of your writing behaviour' },
  '/sessions':   { title: 'Writing Sessions',   description: 'All recorded writing sessions' },
  '/reports':    { title: 'Reports',            description: 'Download and share Authenticity Reports' },
  '/ai-partner': { title: 'AI Writing Partner', description: 'Get writing help from IBM Granite AI' },
  '/settings':   { title: 'Settings',           description: 'Privacy controls and configuration' },
};

interface Props {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function Navbar({ onMenuClick, sidebarOpen }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const meta = PAGE_META[pathname] ?? { title: 'Creative Alibi', description: '' };
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      role="banner"
      aria-label="Application toolbar"
      className="flex items-center justify-between px-4 flex-shrink-0"
      style={{
        background: '#212A31',           /* mp-void */
        borderBottom: '2px solid #124E66', /* teal line — distinctive brand marker */
        minHeight: '60px',
      }}
    >
      {/* Left — hamburger + page identity */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Menu toggle */}
        <button
          onClick={onMenuClick}
          className="ca-btn-icon"
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
          style={{ background: '#2E3944', border: '1px solid #374654' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Page title */}
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-tight truncate" style={{ color: '#D3D9D4' }}>
            {meta.title}
          </h1>
          <p className="text-xs leading-tight hidden sm:block" style={{ color: '#748D92' }}>
            {meta.description}
          </p>
        </div>
      </div>

      {/* Right — clock, status, CTA */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Clock — decorative only */}
        <div
          className="hidden md:flex items-center px-3 py-1.5 rounded-lg text-sm font-mono"
          style={{ background: '#2E3944', border: '1px solid #374654', color: '#748D92' }}
          aria-hidden="true"
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Online status */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(76,195,138,0.1)', border: '1px solid rgba(76,195,138,0.28)' }}
          role="status"
          aria-live="polite"
          aria-label="System status: online"
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#4CC38A' }}
            aria-hidden="true"
          />
          <span className="text-sm font-medium hidden sm:inline" style={{ color: '#4CC38A' }}>
            Online
          </span>
        </div>

        {/* New Session CTA — teal accent */}
        <button
          onClick={() => navigate('/sessions')}
          className="ca-btn-primary"
          aria-label="Start a new writing session"
          style={{ fontSize: '0.9rem' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          <span>New Session</span>
        </button>

      </div>
    </header>
  );
}
