/**
 * @fileoverview Creative Timeline — SVG visualization of the writing session.
 * Shows typing speed, pauses, AI assist events, and paste events over time.
 */

import React, { useMemo } from 'react';
import { useSessionStore } from '../../store/session.store';

const WIDTH = 280;
const HEIGHT = 60;
const PADDING = { top: 4, right: 4, bottom: 16, left: 24 };

const CHART_W = WIDTH - PADDING.left - PADDING.right;
const CHART_H = HEIGHT - PADDING.top - PADDING.bottom;

export function CreativeTimeline() {
  const { session } = useSessionStore();
  const ledger = session?.ledger;

  const { linePath, pauseRects, aiDots, pasteDots } = useMemo(() => {
    if (!ledger || ledger.wordCountHistory?.length === 0) {
      return { linePath: '', pauseRects: [], aiDots: [], pasteDots: [] };
    }

    const history = session?.wordCountHistory ?? [];
    if (history.length < 2) return { linePath: '', pauseRects: [], aiDots: [], pasteDots: [] };

    const totalMs = history[history.length - 1].timestampMs - history[0].timestampMs;
    if (totalMs === 0) return { linePath: '', pauseRects: [], aiDots: [], pasteDots: [] };

    const maxWords = Math.max(...history.map(h => h.wordCount), 1);
    const startMs = history[0].timestampMs;

    const scaleX = (ts: number) => ((ts - startMs) / totalMs) * CHART_W;
    const scaleY = (words: number) => CHART_H - (words / maxWords) * CHART_H;

    // Word count line path
    const points = history.map(h => `${scaleX(h.timestampMs).toFixed(1)},${scaleY(h.wordCount).toFixed(1)}`);
    const linePath = `M ${points.join(' L ')}`;

    // Pause rectangles
    const pauseRects = ledger.pauseEvents
      .filter(p => p.durationMs > 2000)
      .map(p => ({
        x: (p.startMs / (totalMs)) * CHART_W,
        width: Math.max(2, (p.durationMs / totalMs) * CHART_W),
        isBreak: p.durationMs > 30_000,
      }));

    // AI assist dots
    const aiDots = ledger.aiAssistLog.map(event => {
      const eventMs = new Date(event.timestamp).getTime() - startMs;
      return {
        x: Math.min(CHART_W, (eventMs / totalMs) * CHART_W),
        accepted: event.accepted,
      };
    });

    // Paste event dots
    const pasteDots = ledger.pasteEvents.map(event => ({
      x: Math.min(CHART_W, (event.timestampMs / totalMs) * CHART_W),
    }));

    return { linePath, pauseRects, aiDots, pasteDots };
  }, [ledger, session?.wordCountHistory]);

  if (!ledger || ledger.wordCount === 0) {
    return (
      <div className="flex items-center justify-center h-16 text-alibi-text-subtle text-xs">
        Timeline will appear as you write
      </div>
    );
  }

  return (
    <div>
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        style={{ maxWidth: '100%' }}
      >
        <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={0}
              x2={CHART_W}
              y1={CHART_H * t}
              y2={CHART_H * t}
              stroke="#2D2A40"
              strokeWidth={1}
            />
          ))}

          {/* Pause rectangles */}
          {pauseRects.map((p, i) => (
            <rect
              key={i}
              x={p.x}
              y={0}
              width={p.width}
              height={CHART_H}
              fill={p.isBreak ? '#64748B20' : '#64748B10'}
              rx={1}
            />
          ))}

          {/* Word count line */}
          {linePath && (
            <>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <path
                d={linePath}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* AI assist dots */}
          {aiDots.map((dot, i) => (
            <circle
              key={`ai-${i}`}
              cx={dot.x}
              cy={CHART_H / 2}
              r={3}
              fill={dot.accepted ? '#8B5CF6' : '#8B5CF660'}
              stroke="#C4B5FD"
              strokeWidth={0.5}
            />
          ))}

          {/* Paste event dots */}
          {pasteDots.map((dot, i) => (
            <circle
              key={`paste-${i}`}
              cx={dot.x}
              cy={CHART_H - 4}
              r={2.5}
              fill="#F59E0B"
              opacity={0.8}
            />
          ))}

          {/* X-axis labels */}
          <text x={0} y={CHART_H + 12} fontSize={8} fill="#64748B">0s</text>
          <text x={CHART_W} y={CHART_H + 12} fontSize={8} fill="#64748B" textAnchor="end">
            {Math.round((ledger.timeSpentSeconds) / 60)}m
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-1 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-gradient-to-r from-alibi-violet to-alibi-emerald rounded" />
          <span className="text-[9px] text-alibi-text-subtle">Words</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-alibi-ai" />
          <span className="text-[9px] text-alibi-text-subtle">AI Assist</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-alibi-warning" />
          <span className="text-[9px] text-alibi-text-subtle">Paste</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded bg-alibi-text-subtle/10" />
          <span className="text-[9px] text-alibi-text-subtle">Pause</span>
        </div>
      </div>
    </div>
  );
}
