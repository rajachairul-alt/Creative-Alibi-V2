/**
 * @fileoverview Accessible sidebar navigation.
 * - 48px min touch targets on all nav items
 * - Visible text labels always shown (not icon-only)
 * - ARIA: role="navigation", aria-label, aria-current="page"
 * - Keyboard: full tab and Enter support via NavLink
 * - Collapse on mobile becomes a slide-over (always visible on desktop ≥ lg)
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemDef {
  to: string;
  label: string;
  description: string;   /* shown as subtitle — helps new users */
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    description: 'Overview & stats',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    description: 'Writing behaviour charts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    to: '/sessions',
    label: 'Sessions',
    description: 'All writing sessions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    description: 'Download & share reports',
    badge: 'NEW',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    to: '/ai-partner',
    label: 'AI Partner',
    description: 'Chat with IBM Granite',
    badge: 'IBM',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    description: 'Privacy & configuration',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

interface Props { open: boolean; onToggle: () => void; }

export function Sidebar({ open, onToggle }: Props) {
  return (
    <>
      {/* Mobile overlay backdrop */}
      {!open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        role="navigation"
        aria-label="Main navigation"
        style={{
          width: open ? '240px' : '0',
          minWidth: open ? '240px' : '0',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          overflow: 'hidden',
          transition: 'min-width 0.25s ease, width 0.25s ease',
          flexShrink: 0,
        }}
      >
        <div style={{ width: '240px' }} className="flex flex-col h-full">

          {/* ── Logo / App Identity ─────────────────────────── */}
          <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            {/* Logo icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-accent-bg)', border: '1.5px solid var(--color-accent-border)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
                <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"
                  stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-base leading-tight" style={{ color: 'var(--color-text)' }}>
                Creative Alibi
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Authenticity Companion
              </div>
            </div>
          </div>

          {/* ── Nav Label ───────────────────────────────────── */}
          <div className="px-4 pt-5 pb-1">
            <span className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}>
              Menu
            </span>
          </div>

          {/* ── Nav Items ───────────────────────────────────── */}
          <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto hide-scrollbar">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : ''}`
                }
                aria-current={undefined}  /* set via className logic — NavLink handles active state */
              >
                {/* Icon */}
                <span className="flex-shrink-0 w-5 flex items-center justify-center">
                  {item.icon}
                </span>

                {/* Text labels — always visible */}
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                  <span className="block text-xs mt-0.5 leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                    {item.description}
                  </span>
                </span>

                {/* Badge */}
                {item.badge && (
                  <span className={item.badge === 'IBM' ? 'ca-badge-ibm' : 'ca-badge-accent'}
                    style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem' }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── IBM Granite Status ───────────────────────────── */}
          <div className="p-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--color-ibm-bg)', border: '1px solid rgba(116,177,255,0.2)' }}>
              {/* IBM logo */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#0F62FE' }}
                aria-hidden="true">
                <span className="text-white font-bold text-sm font-mono">g</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold leading-tight truncate" style={{ color: 'var(--color-ibm)' }}>
                  IBM Granite Connected
                </div>
                <div className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                  granite-3-8b-instruct
                </div>
              </div>
              {/* Live dot */}
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 pulse-ring"
                style={{ background: 'var(--color-success)' }}
                role="status"
                aria-label="IBM Granite is connected"
              />
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
