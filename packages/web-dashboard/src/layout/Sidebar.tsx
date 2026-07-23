/**
 * @fileoverview Futuristic sidebar navigation.
 */

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4.5 h-4.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
  },
  {
    to: '/analytics', label: 'Analytics',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4.5 h-4.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    to: '/sessions', label: 'Sessions',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4.5 h-4.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    to: '/reports', label: 'Reports',
    badge: 'NEW',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4.5 h-4.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    to: '/ai-partner', label: 'AI Partner',
    badge: 'IBM',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4.5 h-4.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    to: '/settings', label: 'Settings',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4.5 h-4.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

interface Props { collapsed: boolean; onToggle: () => void; }

export function Sidebar({ collapsed, onToggle }: Props) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className={clsx(
      'flex flex-col flex-shrink-0 transition-all duration-300 relative',
      collapsed ? 'w-16' : 'w-64',
    )} style={{
      background: 'linear-gradient(180deg, rgba(8,7,19,0.98) 0%, rgba(17,15,32,0.98) 100%)',
      borderRight: '1px solid rgba(124,58,237,0.2)',
    }}>

      {/* Decorative glow line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(6,182,212,0.4), transparent)',
      }} />

      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b',
        collapsed ? 'justify-center' : '',
      )} style={{ borderColor: 'rgba(124,58,237,0.15)' }}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(6,182,212,0.2) 100%)',
            border: '1px solid rgba(124,58,237,0.4)',
            boxShadow: '0 0 20px rgba(124,58,237,0.3)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* Live indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-alibi-emerald border-2 border-alibi-bg pulse-ring" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold leading-none" style={{
              background: 'linear-gradient(135deg, #C4B5FD, #67E8F9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Creative Alibi</div>
            <div className="text-[10px] mt-0.5 leading-none" style={{ color: 'rgba(148,163,184,0.6)' }}>v2.0 · IBM Granite</div>
          </div>
        )}
      </div>

      {/* Nav label */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-2">
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(124,58,237,0.6)' }}>
            Navigation
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto hide-scrollbar">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onMouseEnter={() => setHoveredItem(item.to)}
            onMouseLeave={() => setHoveredItem(null)}
            className={({ isActive }) => clsx(
              'nav-item relative',
              isActive && 'nav-item-active',
              collapsed && 'justify-center',
            )}
          >
            {/* Active indicator bar */}
            <NavLink to={item.to} className="hidden" aria-hidden tabIndex={-1}>
              {({ isActive }) => isActive ? (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full" style={{ background: '#A78BFA' }} />
              ) : null}
            </NavLink>

            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="flex-1 text-sm">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className={clsx(
                'text-[9px] px-1.5 py-0.5 rounded-full font-bold',
                item.badge === 'IBM' ? 'ca-badge-ibm' : 'ca-badge-violet',
              )}>{item.badge}</span>
            )}

            {/* Tooltip when collapsed */}
            {collapsed && hoveredItem === item.to && (
              <div className="absolute left-full ml-3 z-50 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none" style={{
                background: 'rgba(26,23,48,0.98)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#C4B5FD',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}>
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* IBM Granite status */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="p-3 rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.06))',
            border: '1px solid rgba(139,92,246,0.2)',
          }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#0F62FE' }}>
                <span className="text-white font-bold text-xs font-mono">g</span>
              </div>
              <div>
                <div className="text-[11px] font-semibold" style={{ color: '#C4B5FD' }}>IBM Granite Connected</div>
                <div className="text-[9px]" style={{ color: 'rgba(148,163,184,0.6)' }}>granite-3-8b-instruct</div>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-alibi-emerald animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center p-3 transition-colors duration-150"
        style={{ borderTop: '1px solid rgba(124,58,237,0.15)', color: 'rgba(148,163,184,0.5)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={clsx('w-4 h-4 transition-transform duration-300', collapsed ? 'rotate-180' : '')}>
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
    </aside>
  );
}
