/**
 * @fileoverview Tab navigation for the plugin sidebar.
 * Three tabs: Tracker | AI Partner | Report
 */

import React from 'react';
import { useSessionStore, type ActiveTab } from '../../store/session.store';
import { clsx } from 'clsx';

const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
  {
    id: 'tracker',
    label: 'Tracker',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'ai-partner',
    label: 'AI Partner',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
      </svg>
    ),
    badge: 'IBM',
  },
  {
    id: 'report',
    label: 'Report',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export function TabNav() {
  const { activeTab, setActiveTab } = useSessionStore();

  return (
    <nav className="flex bg-alibi-bg-card border-b border-alibi-border flex-shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={clsx(
            'flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-[11px] font-medium transition-all duration-150 relative',
            activeTab === tab.id
              ? 'text-alibi-violet-light'
              : 'text-alibi-text-subtle hover:text-alibi-text-muted'
          )}
        >
          {/* Active indicator */}
          {activeTab === tab.id && (
            <span className="absolute top-0 left-0 right-0 h-0.5 bg-alibi-violet rounded-b" />
          )}

          <span className={clsx(
            activeTab === tab.id ? 'text-alibi-violet-light' : 'text-alibi-text-subtle'
          )}>
            {tab.icon}
          </span>

          <span className="flex items-center gap-1">
            {tab.label}
            {tab.badge && (
              <span className="px-1 py-0.5 rounded bg-alibi-ai/20 text-alibi-ai-light text-[8px] leading-none">
                {tab.badge}
              </span>
            )}
          </span>
        </button>
      ))}
    </nav>
  );
}
