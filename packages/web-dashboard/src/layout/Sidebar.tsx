/**
 * @fileoverview Sidebar — Porcelain #FEFFFF Light Aesthetic.
 * Pure white surface · clean borders · Ocean Teal accent · Plus Jakarta Sans font
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemDef {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    to: '/dashboard', label: 'Dashboard', description: 'Overview & stats',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>,
  },
  {
    to: '/analytics', label: 'Analytics', description: 'Writing behaviour charts',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
  {
    to: '/sessions', label: 'Sessions', description: 'All writing sessions',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  },
  {
    to: '/reports', label: 'Reports', description: 'Download & share', badge: 'NEW',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  },
  {
    to: '/ai-partner', label: 'AI Partner', description: 'Chat with IBM Granite', badge: 'IBM',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
  {
    to: '/settings', label: 'Settings', description: 'Privacy & configuration',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  },
];

interface Props { open: boolean; onToggle: () => void; }

export function Sidebar({ open, onToggle }: Props) {
  return (
    <aside
      id="sidebar"
      role="navigation"
      aria-label="Main navigation"
      style={{
        width: open ? '240px' : '0',
        minWidth: open ? '240px' : '0',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        overflow: 'hidden',
        flexShrink: 0,
        transition: 'min-width 0.22s ease, width 0.22s ease',
      }}
    >
      {/* Fixed-width inner so content doesn't reflow during animation */}
      <div style={{ width: '240px' }} className="flex flex-col h-full">

        {/* ── Logo ───────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid #E2E8F0' }}
        >
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: '#0284C7',
              boxShadow: '0 2px 8px rgba(2,132,199,0.25)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
              <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"
                stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Name */}
          <div className="min-w-0">
            <div
              className="font-extrabold text-base leading-tight truncate"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#0F172A',
              }}
            >
              Creative Alibi
            </div>
            <div
              className="text-xs mt-0.5 truncate font-medium"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#64748B',
              }}
            >
              Authenticity Companion
            </div>
          </div>
        </div>

        {/* ── Nav section label ─────────────────────────── */}
        <div className="px-5 pt-5 pb-1">
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#94A3B8',
            }}
          >
            Navigation
          </span>
        </div>

        {/* ── Nav items ─────────────────────────────────── */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto hide-scrollbar">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item-active' : ''}`}
            >
              {/* Icon */}
              <span className="flex-shrink-0 w-5 flex items-center justify-center">
                {item.icon}
              </span>

              {/* Label + description */}
              <span className="flex-1 min-w-0">
                <span
                  className="block text-sm font-semibold leading-snug"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {item.label}
                </span>
                <span
                  className="block text-xs mt-0.5 leading-snug truncate"
                  style={{ color: '#64748B' }}
                >
                  {item.description}
                </span>
              </span>

              {/* Badge */}
              {item.badge && (
                <span
                  className={item.badge === 'IBM' ? 'ca-badge-ibm' : 'ca-badge-accent'}
                  style={{ fontSize: '0.6rem', padding: '0.1rem 0.45rem' }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── IBM Granite status card ─────────────────────── */}
        <div className="p-3" style={{ borderTop: '1px solid #E2E8F0' }}>
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
            }}
          >
            {/* IBM logo square */}
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: '#0284C7' }}
              aria-hidden="true"
            >
              <span
                style={{
                  color: '#FFFFFF',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.8rem',
                }}
              >
                g
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="text-xs font-bold leading-tight truncate"
                style={{ color: '#0369A1' }}
              >
                IBM Granite
              </div>
              <div
                className="text-xs mt-0.5 leading-tight truncate font-mono"
                style={{ color: '#0284C7' }}
              >
                granite-3-8b-instruct
              </div>
            </div>
            {/* Connected dot */}
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 pulse-ring"
              style={{ background: '#10B981' }}
              role="status"
              aria-label="IBM Granite is connected"
            />
          </div>
        </div>

      </div>
    </aside>
  );
}
