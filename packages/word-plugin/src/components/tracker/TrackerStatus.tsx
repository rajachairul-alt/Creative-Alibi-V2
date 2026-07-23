/**
 * @fileoverview Tracker status panel — shows live behavioral metrics and Creative Timeline.
 * Moon Phases design system: #212A31 / #2E3944 / #124E66 / #748D92 / #D3D9D4
 */

import { useSessionStore } from '../../store/session.store';
import { useTracker } from '../../hooks/useTracker';
import { CreativeTimeline } from './CreativeTimeline';

// ─── Moon Phases tokens (inline for plugin context) ───────────────────────────
const MP = {
  surface:  '#212A31',
  elevated: '#2E3944',
  teal:     '#2A9FBF',
  tealDark: '#124E66',
  text:     '#D3D9D4',
  textSoft: '#A8B2B7',
  muted:    '#748D92',
  border:   '#374654',
  success:  '#4CC38A',
  error:    '#E07070',
  warning:  '#E8C547',
  ibm:      '#7EB8D4',
} as const;

type MetricStatus = 'good' | 'warn' | 'bad' | 'neutral';

function MetricItem({
  label, value, unit, status = 'neutral', description,
}: {
  label: string; value: string | number; unit?: string;
  status?: MetricStatus; description?: string;
}) {
  const statusColor: Record<MetricStatus, string> = {
    good:    MP.success,
    warn:    MP.warning,
    bad:     MP.error,
    neutral: MP.text,
  };

  return (
    <div className="rounded-xl p-3 flex flex-col gap-1 border"
      style={{ background: MP.elevated, borderColor: MP.border }}>
      <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: MP.muted }}>{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold font-mono" style={{ color: statusColor[status] }}>{value}</span>
        {unit && <span className="text-xs" style={{ color: MP.muted }}>{unit}</span>}
      </div>
      {description && (
        <div className="text-[10px] leading-relaxed" style={{ color: MP.muted }}>{description}</div>
      )}
    </div>
  );
}

// ─── Live WPM Sparkline ────────────────────────────────────────────────────────

function WPMSparkline({ wpm }: { wpm: number }) {
  // Simulate a recent 20-point history using current WPM
  const points = Array.from({ length: 20 }, (_, i) =>
    Math.max(5, Math.min(95, wpm + (Math.sin(i * 0.8) * 12) + (i * 0.3)))
  );
  const max  = Math.max(...points, 1);
  const w    = 180;
  const h    = 30;
  const xs   = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys   = points.map(v => h - (v / max) * (h - 4));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x},${ys[i]}`).join(' ');
  const area = `${path} L ${w},${h} L 0,${h} Z`;

  return (
    <svg width={w} height={h} className="overflow-visible" aria-label={`WPM sparkline: ${wpm} WPM current`}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={MP.teal} stopOpacity={0.3} />
          <stop offset="100%" stopColor={MP.teal} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke={MP.teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── TrackerStatus ────────────────────────────────────────────────────────────

export function TrackerStatus() {
  const { session, isTracking } = useSessionStore();
  const { startTracking, stopTracking } = useTracker();
  const ledger = session?.ledger;

  const cadenceStatus: MetricStatus = !ledger ? 'neutral'
    : ledger.typingCadenceScore >= 75 ? 'good'
    : ledger.typingCadenceScore >= 50 ? 'warn' : 'bad';

  const pasteStatus: MetricStatus = !ledger ? 'neutral'
    : ledger.copyPasteRatio <= 0.1 ? 'good'
    : ledger.copyPasteRatio <= 0.2 ? 'warn' : 'bad';

  const revisionStatus: MetricStatus = !ledger ? 'neutral'
    : ledger.revisionCount >= 5 ? 'good'
    : ledger.revisionCount >= 3 ? 'warn' : 'neutral';

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3 p-3">

      {/* ── Tracking Control ─────────────────────────────────────────────── */}
      <div className="rounded-xl border p-3 flex items-center justify-between"
        style={{ background: MP.elevated, borderColor: isTracking ? `${MP.success}40` : MP.border }}>
        <div>
          <div className="text-xs font-semibold" style={{ color: MP.text }}>Process Ledger</div>
          <div className="text-[10px] mt-0.5" style={{ color: MP.muted }}>
            {isTracking
              ? '● Recording your writing behavior locally'
              : 'Start tracking to build your Authenticity Report'}
          </div>
        </div>
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
          style={isTracking
            ? { background: `${MP.error}18`, color: MP.error, borderColor: `${MP.error}35` }
            : { background: MP.teal, color: '#fff', borderColor: MP.teal }
          }>
          {isTracking ? (
            <>
              <span className="w-2 h-2 rounded-sm" style={{ background: MP.error }} />
              Stop
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: '#fff' }} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Start Tracking
            </>
          )}
        </button>
      </div>

      {/* ── Live Metrics ─────────────────────────────────────────────────── */}
      {ledger && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <MetricItem
              label="Cadence Score"
              value={ledger.typingCadenceScore}
              unit="/100"
              status={cadenceStatus}
              description={cadenceStatus === 'good' ? 'Natural rhythm ✓' : cadenceStatus === 'warn' ? 'Borderline' : 'Below threshold'}
            />
            <MetricItem
              label="Paste Ratio"
              value={`${(ledger.copyPasteRatio * 100).toFixed(1)}`}
              unit="%"
              status={pasteStatus}
              description={pasteStatus === 'good' ? 'Within limit ✓' : 'Approaching limit'}
            />
            <MetricItem
              label="Revisions"
              value={ledger.revisionCount}
              unit="edits"
              status={revisionStatus}
              description={revisionStatus === 'good' ? 'Good depth ✓' : 'Keep editing naturally'}
            />
            <MetricItem
              label="Session Time"
              value={formatDuration(ledger.timeSpentSeconds)}
              status="neutral"
              description={`${ledger.wordCount} words written`}
            />
          </div>

          {/* ── WPM + Sparkline ─────────────────────────────────────────── */}
          <div className="rounded-xl border p-3" style={{ background: MP.elevated, borderColor: MP.border }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: MP.muted }}>
                  Avg Typing Speed
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold font-mono" style={{ color: MP.teal }}>
                    {ledger.averageWPM}
                  </span>
                  <span className="text-xs" style={{ color: MP.muted }}>WPM</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: MP.muted }}>
                  Pauses
                </div>
                <div className="flex items-baseline gap-1 mt-0.5 justify-end">
                  <span className="text-lg font-bold font-mono" style={{ color: MP.text }}>
                    {ledger.pauseProfile.totalPauses}
                  </span>
                  <span className="text-xs" style={{ color: MP.muted }}>detected</span>
                </div>
              </div>
            </div>
            <WPMSparkline wpm={ledger.averageWPM} />
          </div>

          {/* ── AI Assist Summary ────────────────────────────────────────── */}
          {ledger.aiAssistLog.length > 0 && (
            <div className="rounded-xl border p-3"
              style={{ background: `${MP.ibm}08`, borderColor: `${MP.ibm}25` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs">🤖</span>
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: MP.ibm }}>
                  AI Assist Log
                </div>
              </div>
              <div className="text-xs" style={{ color: MP.muted }}>
                {ledger.aiAssistLog.length} interaction{ledger.aiAssistLog.length !== 1 ? 's' : ''} with IBM Granite
                {' '}&mdash;{' '}
                {ledger.aiAssistLog.filter((e: { accepted: boolean }) => e.accepted).length} accepted
              </div>
              <div className="text-[10px] mt-1" style={{ color: MP.muted }}>
                All interactions will be disclosed in your Authenticity Report
              </div>
            </div>
          )}

          {/* ── Creative Timeline ────────────────────────────────────────── */}
          <div className="rounded-xl border p-3" style={{ background: MP.elevated, borderColor: MP.border }}>
            <div className="text-[10px] uppercase tracking-wider font-semibold mb-2"
              style={{ color: MP.muted }}>
              Creative Timeline
            </div>
            <CreativeTimeline />
          </div>
        </>
      )}

      {/* ── Privacy note ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg border"
        style={{ background: `${MP.success}08`, borderColor: `${MP.success}25` }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
          style={{ color: MP.success }}>
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
        <p className="text-[10px] leading-relaxed" style={{ color: MP.success }}>
          All data stays on your device. Nothing is sent without your explicit action.
        </p>
      </div>
    </div>
  );
}
