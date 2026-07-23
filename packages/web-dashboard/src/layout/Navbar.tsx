/**
 * @fileoverview Futuristic top navigation bar with live indicators.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGE_META: Record<string, { title: string; subtitle: string; icon: string }> = {
  '/dashboard':  { title: 'Dashboard',          subtitle: 'Live authenticity overview',         icon: '⬡' },
  '/analytics':  { title: 'Analytics',          subtitle: 'Deep behavioral analysis',           icon: '∿' },
  '/sessions':   { title: 'Sessions',           subtitle: 'All writing sessions',               icon: '◷' },
  '/reports':    { title: 'Reports',            subtitle: 'Authenticity Reports & PDF export',  icon: '◈' },
  '/ai-partner': { title: 'AI Creative Partner', subtitle: 'Powered by IBM Granite',            icon: '◎' },
  '/settings':   { title: 'Settings',           subtitle: 'Privacy & integrations',             icon: '⚙' },
};

interface Props { onMenuClick: () => void; }

export function Navbar({ onMenuClick }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const meta = PAGE_META[pathname] ?? { title: 'Creative Alibi', subtitle: '', icon: '◈' };
  const [time, setTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="flex items-center justify-between px-5 py-3 flex-shrink-0 relative" style={{
      background: 'linear-gradient(90deg, rgba(8,7,19,0.95) 0%, rgba(17,15,32,0.9) 100%)',
      borderBottom: '1px solid rgba(124,58,237,0.15)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Bottom neon line */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(6,182,212,0.3), transparent)',
      }} />

      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-xl transition-all duration-150 hover:bg-alibi-bg-elevated" style={{ color: 'rgba(148,163,184,0.6)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-lg font-mono" style={{ color: 'rgba(124,58,237,0.5)' }}>{meta.icon}</span>
          <div>
            <h1 className="text-base font-bold leading-none" style={{
              background: 'linear-gradient(135deg, #F1F5F9, #A78BFA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{meta.title}</h1>
            <p className="text-[11px] mt-0.5 leading-none" style={{ color: 'rgba(148,163,184,0.5)' }}>{meta.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Right: search, time, status, CTA */}
      <div className="flex items-center gap-3">

        {/* Search */}
        {searchOpen ? (
          <div className="flex items-center gap-2 animate-slide-in">
            <input
              autoFocus
              placeholder="Search sessions, reports..."
              onBlur={() => setSearchOpen(false)}
              className="ca-input w-52 py-1.5 text-xs"
            />
            <button onClick={() => setSearchOpen(false)} className="ca-btn-ghost p-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="p-2 rounded-xl transition-all hover:bg-alibi-bg-elevated" style={{ color: 'rgba(148,163,184,0.5)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        )}

        {/* Live clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono" style={{
          background: 'rgba(26,23,48,0.8)',
          border: '1px solid rgba(124,58,237,0.2)',
          color: 'rgba(167,139,250,0.8)',
        }}>
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* System status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          color: '#34D399',
        }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alibi-emerald opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-alibi-emerald" />
          </span>
          <span className="hidden sm:inline font-medium">System Online</span>
        </div>

        {/* New Session CTA */}
        <button
          onClick={() => navigate('/sessions')}
          className="ca-btn-primary text-xs py-2 px-4"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          New Session
        </button>
      </div>
    </header>
  );
}
