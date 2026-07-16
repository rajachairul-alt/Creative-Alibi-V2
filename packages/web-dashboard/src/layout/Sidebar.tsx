/**
 * @fileoverview Sidebar navigation with Creative Alibi branding.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: '/sessions',
    label: 'Sessions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    to: '/ai-partner',
    label: 'AI Partner',
    badge: 'IBM',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: Props) {
  return (
    <aside
      className={clsx(
        'flex flex-col bg-alibi-bg-card border-r border-alibi-border transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b border-alibi-border',
        collapsed ? 'justify-center' : ''
      )}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-alibi-violet/20 border border-alibi-violet/30 flex-shrink-0 shadow-glow-violet">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-gradient-violet leading-none">Creative Alibi</div>
            <div className="text-[11px] text-alibi-text-subtle mt-0.5 leading-none">Authenticity Companion</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'nav-item',
                isActive && 'nav-item-active',
                collapsed ? 'justify-center' : ''
              )
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="flex-1">{item.label}</span>
            )}
            {!collapsed && item.badge && (
              <span className="ca-badge-ai text-[9px] px-1.5 py-0.5">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* IBM Granite Badge */}
      {!collapsed && (
        <div className="p-3 border-t border-alibi-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-alibi-ai-ghost border border-alibi-ai/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0">
              <rect width="24" height="24" rx="4" fill="#0F62FE" />
              <text x="4" y="17" fontSize="13" fontWeight="bold" fill="white" fontFamily="monospace">g</text>
            </svg>
            <div>
              <div className="text-[10px] text-alibi-ai-light font-medium">IBM Granite</div>
              <div className="text-[9px] text-alibi-text-subtle">via watsonx.ai</div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="p-3 border-t border-alibi-border flex items-center justify-center text-alibi-text-subtle hover:text-alibi-text transition-colors duration-150"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={clsx('w-4 h-4 transition-transform duration-300', collapsed ? 'rotate-180' : '')}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </aside>
  );
}
