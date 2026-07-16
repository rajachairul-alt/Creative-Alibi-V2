/**
 * @fileoverview Top navigation bar.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your authenticity overview' },
  '/analytics': { title: 'Analytics', subtitle: 'Deep dive into your writing behavior' },
  '/sessions': { title: 'Sessions', subtitle: 'All writing sessions' },
  '/reports': { title: 'Reports', subtitle: 'Authenticity Reports' },
  '/ai-partner': { title: 'AI Creative Partner', subtitle: 'Powered by IBM Granite' },
  '/settings': { title: 'Settings', subtitle: 'Privacy and integrations' },
};

interface Props {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: Props) {
  const { pathname } = useLocation();
  const pageInfo = PAGE_TITLES[pathname] ?? { title: 'Creative Alibi', subtitle: '' };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-alibi-border bg-alibi-bg-card/60 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-alibi-text-subtle hover:text-alibi-text hover:bg-alibi-bg-elevated transition-all duration-150"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div>
          <h1 className="text-lg font-bold text-alibi-text leading-none">{pageInfo.title}</h1>
          <p className="text-xs text-alibi-text-subtle mt-0.5">{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-alibi-bg-elevated border border-alibi-border text-xs text-alibi-text-muted">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alibi-emerald opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-alibi-emerald" />
          </span>
          <span>System Online</span>
        </div>

        {/* Quick action: New Session */}
        <button className="ca-btn-primary text-sm py-1.5 px-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Session
        </button>
      </div>
    </header>
  );
}
