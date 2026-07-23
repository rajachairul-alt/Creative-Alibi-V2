/**
 * @fileoverview Plugin header with branding and session status indicator.
 * Moon Phases design system: #212A31 / #2E3944 / #124E66 / #748D92 / #D3D9D4
 */

import { useSessionStore } from '../../store/session.store';

export function Header() {
  const { isTracking, session } = useSessionStore();

  return (
    <header
      className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b"
      style={{ background: '#212A31', borderColor: '#124E66' }}>

      {/* Logo + Branding */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg border"
          style={{ background: 'rgba(18,78,102,0.35)', borderColor: 'rgba(42,159,191,0.4)' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"
              stroke="#2A9FBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-bold leading-none" style={{ color: '#2A9FBF' }}>
            Creative Alibi
          </div>
          <div className="text-[10px] leading-none mt-0.5" style={{ color: '#748D92' }}>
            Authenticity Companion
          </div>
        </div>
      </div>

      {/* Status Indicator + IBM badge */}
      <div className="flex items-center gap-2">
        {session && (
          <div className="flex items-center gap-1.5">
            {isTracking ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: '#4CC38A' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: '#4CC38A' }} />
                </span>
                <span className="text-[10px] font-medium" style={{ color: '#4CC38A' }}>RECORDING</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full" style={{ background: '#748D92' }} />
                <span className="text-[10px]" style={{ color: '#748D92' }}>IDLE</span>
              </>
            )}
          </div>
        )}

        {/* IBM Granite badge */}
        <div className="px-1.5 py-0.5 rounded text-[9px] font-medium border"
          style={{ background: 'rgba(126,184,212,0.1)', borderColor: 'rgba(126,184,212,0.3)', color: '#7EB8D4' }}>
          IBM Granite
        </div>
      </div>
    </header>
  );
}
