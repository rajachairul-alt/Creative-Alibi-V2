/**
 * @fileoverview Accessible top navigation bar.
 * - role="banner", aria-label on all icon buttons
 * - Plain language page titles and descriptions
 * - 44px min-height throughout
 * - No colour-only information
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/dashboard':  { title: 'Dashboard',         description: 'Overview of your writing activity' },
  '/analytics':  { title: 'Analytics',         description: 'Detailed charts of your writing behaviour' },
  '/sessions':   { title: 'Writing Sessions',  description: 'All recorded writing sessions' },
  '/reports':    { title: 'Reports',           description: 'Download and share your Authenticity Reports' },
  '/ai-partner': { title: 'AI Writing Partner', description: 'Get writing help from IBM Granite AI' },
  '/settings':   { title: 'Settings',          description: 'Privacy controls and configuration' },
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
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        minHeight: '60px',
      }}
    >
      {/* Left — menu toggle + page title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — labelled for screen readers */}
        <button
          onClick={onMenuClick}
          className="ca-btn-icon"
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Page title */}
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-tight truncate" style={{ color: 'var(--color-text)' }}>
            {meta.title}
          </h1>
          <p className="text-xs leading-tight hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
            {meta.description}
          </p>
        </div>
      </div>

      {/* Right — status + time + CTA */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Live clock — decorative, hidden from screen readers */}
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-soft)' }}
          aria-hidden="true"
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* System status pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}
          role="status"
          aria-live="polite"
          aria-label="System status: online"
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'var(--color-success)' }}
            aria-hidden="true"
          />
          <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--color-success)' }}>
            Online
          </span>
        </div>

        {/* New Session CTA */}
        <button
          onClick={() => navigate('/sessions')}
          className="ca-btn-primary text-sm"
          aria-label="Start a new writing session"
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
