/**
 * @fileoverview Plugin header with branding and session status indicator.
 */

import React from 'react';
import { useSessionStore } from '../../store/session.store';

export function Header() {
  const { isTracking, session } = useSessionStore();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-alibi-bg-card border-b border-alibi-border flex-shrink-0">
      {/* Logo + Branding */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-alibi-violet/20 border border-alibi-violet/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path
              d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"
              stroke="#A78BFA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="text-xs font-bold text-gradient-violet leading-none">
            Creative Alibi
          </div>
          <div className="text-[10px] text-alibi-text-subtle leading-none mt-0.5">
            Authenticity Companion
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        {session && (
          <div className="flex items-center gap-1.5">
            {isTracking ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alibi-emerald opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-alibi-emerald" />
                </span>
                <span className="text-[10px] text-alibi-emerald font-medium">TRACKING</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-alibi-text-subtle" />
                <span className="text-[10px] text-alibi-text-subtle">IDLE</span>
              </>
            )}
          </div>
        )}

        {/* IBM Granite badge */}
        <div className="px-1.5 py-0.5 bg-alibi-ai/10 border border-alibi-ai/20 rounded text-[9px] text-alibi-ai-light font-medium">
          IBM Granite
        </div>
      </div>
    </header>
  );
}
