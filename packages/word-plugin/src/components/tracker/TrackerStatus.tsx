/**
 * @fileoverview Tracker status panel — shows live behavioral metrics and Creative Timeline.
 */

import React from 'react';
import { useSessionStore } from '../../store/session.store';
import { useTracker } from '../../hooks/useTracker';
import { CreativeTimeline } from './CreativeTimeline';
import { clsx } from 'clsx';

function MetricItem({
  label,
  value,
  unit,
  status,
  description,
}: {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'good' | 'warn' | 'bad' | 'neutral';
  description?: string;
}) {
  const statusColors = {
    good: 'text-alibi-emerald',
    warn: 'text-alibi-warning',
    bad: 'text-alibi-error',
    neutral: 'text-alibi-text',
  };

  return (
    <div className="ca-card p-3 flex flex-col gap-1">
      <div className="ca-label">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={clsx('text-xl font-bold font-mono', statusColors[status ?? 'neutral'])}>
          {value}
        </span>
        {unit && <span className="text-xs text-alibi-text-muted">{unit}</span>}
      </div>
      {description && (
        <div className="text-[10px] text-alibi-text-subtle leading-relaxed">{description}</div>
      )}
    </div>
  );
}

export function TrackerStatus() {
  const { session, isTracking } = useSessionStore();
  const { startTracking, stopTracking } = useTracker();

  const ledger = session?.ledger;

  // Compute metric statuses
  const cadenceStatus = !ledger
    ? 'neutral'
    : ledger.typingCadenceScore >= 75
    ? 'good'
    : ledger.typingCadenceScore >= 50
    ? 'warn'
    : 'bad';

  const pasteStatus = !ledger
    ? 'neutral'
    : ledger.copyPasteRatio <= 0.1
    ? 'good'
    : ledger.copyPasteRatio <= 0.2
    ? 'warn'
    : 'bad';

  const revisionStatus = !ledger
    ? 'neutral'
    : ledger.revisionCount >= 5
    ? 'good'
    : ledger.revisionCount >= 3
    ? 'warn'
    : 'neutral';

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3 p-3 animate-fade-in">
      {/* Tracking Control */}
      <div className="ca-card flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-alibi-text">Process Ledger</div>
          <div className="text-[10px] text-alibi-text-muted mt-0.5">
            {isTracking
              ? 'Recording your writing behavior locally'
              : 'Start tracking to build your Authenticity Report'}
          </div>
        </div>
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
            isTracking
              ? 'bg-alibi-error/20 text-alibi-error hover:bg-alibi-error/30 border border-alibi-error/30'
              : 'ca-button-primary'
          )}
        >
          {isTracking ? (
            <>
              <span className="w-2 h-2 bg-alibi-error rounded-sm" />
              Stop
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alibi-emerald opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-alibi-emerald" />
              </span>
              Start Tracking
            </>
          )}
        </button>
      </div>

      {/* Live Metrics Grid */}
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
              unit=""
              status="neutral"
              description={`${ledger.wordCount} words written`}
            />
          </div>

          {/* WPM */}
          <div className="ca-card flex items-center justify-between">
            <div>
              <div className="ca-label">Avg Typing Speed</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-alibi-text">
                  {ledger.averageWPM}
                </span>
                <span className="text-xs text-alibi-text-muted">WPM</span>
              </div>
            </div>
            <div className="text-right">
              <div className="ca-label">Pauses</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-alibi-text">
                  {ledger.pauseProfile.totalPauses}
                </span>
                <span className="text-xs text-alibi-text-muted">detected</span>
              </div>
            </div>
          </div>

          {/* AI Assist Summary */}
          {ledger.aiAssistLog.length > 0 && (
            <div className="ca-card border-alibi-ai/20 bg-alibi-ai-ghost">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-alibi-ai-light text-xs">🤖</span>
                <div className="ca-label text-alibi-ai-light">AI Assist Log</div>
              </div>
              <div className="text-xs text-alibi-text-muted">
                {ledger.aiAssistLog.length} interaction{ledger.aiAssistLog.length !== 1 ? 's' : ''} with IBM Granite
                {' '}&mdash; {ledger.aiAssistLog.filter(e => e.accepted).length} accepted
              </div>
              <div className="text-[10px] text-alibi-text-subtle mt-1">
                All interactions will be disclosed in your Authenticity Report
              </div>
            </div>
          )}

          {/* Creative Timeline */}
          <div className="ca-card">
            <div className="ca-label mb-2">Creative Timeline</div>
            <CreativeTimeline />
          </div>
        </>
      )}

      {/* Privacy note */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-alibi-emerald-ghost border border-alibi-emerald/20">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-alibi-emerald flex-shrink-0 mt-0.5">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
        <p className="text-[10px] text-alibi-emerald leading-relaxed">
          All data stays on your device. Nothing is sent without your explicit action.
        </p>
      </div>
    </div>
  );
}
