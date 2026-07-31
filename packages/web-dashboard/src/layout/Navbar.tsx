/**
 * @fileoverview Navbar — Porcelain #FEFFFF Light Aesthetic.
 * White surface · slate borders · ocean teal accent · Plus Jakarta Sans font
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
      className="flex items-center justify-between px-5 flex-shrink-0"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
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
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            width: '38px',
            height: '38px',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Page title */}
        <div className="min-w-0">
          <h1
            className="text-base font-extrabold leading-tight truncate"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#0F172A',
            }}
          >
            {meta.title}
          </h1>
          <p
            className="text-xs leading-tight hidden sm:block truncate"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#64748B',
            }}
          >
            {meta.description}
          </p>
        </div>
      </div>

      {/* Right — clock, status, CTA */}
      <div className="flex items-center gap-3 flex-shrink-0">

        {/* Clock */}
        <div
          className="hidden md:flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-medium"
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#475569',
          }}
          aria-hidden="true"
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Online status */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
          }}
          role="status"
          aria-live="polite"
          aria-label="System status: online"
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 pulse-ring"
            style={{ background: '#10B981' }}
            aria-hidden="true"
          />
          <span
            className="text-xs font-bold hidden sm:inline"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#047857',
            }}
          >
            Online
          </span>
        </div>

        {/* New Session CTA — ocean teal solid */}
        <button
          onClick={() => navigate('/sessions')}
          className="ca-btn-primary"
          aria-label="Start a new writing session"
          style={{ fontSize: '0.85rem' }}
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
