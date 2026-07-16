/**
 * @fileoverview Analytics page — deep-dive writing behavior visualizations.
 */

import React from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

// ─── Mock Session Data ────────────────────────────────────────────────────────

const CADENCE_DATA = Array.from({ length: 60 }, (_, i) => ({
  time: i * 2,
  wpm: Math.max(15, Math.min(85, 45 + (Math.sin(i * 0.3) * 20) + (Math.random() * 10 - 5))),
  hasAI: i === 15 || i === 32 || i === 47,
  hasPaste: i === 8,
}));

const PAUSE_DATA = [
  { label: 'Micro (<0.5s)', count: 142, fill: '#7C3AED' },
  { label: 'Short (0.5–2s)', count: 67, fill: '#8B5CF6' },
  { label: 'Thinking (2–30s)', count: 23, fill: '#A78BFA' },
  { label: 'Breaks (>30s)', count: 4, fill: '#64748B' },
];

const RADAR_DATA = [
  { metric: 'Cadence', score: 91 },
  { metric: 'Paste Ratio', score: 95 },
  { metric: 'Revisions', score: 82 },
  { metric: 'Duration', score: 78 },
  { metric: 'WPM Consistency', score: 88 },
];

const REVISION_DATA = Array.from({ length: 20 }, (_, i) => ({
  segment: i + 1,
  deletions: Math.floor(Math.random() * 30 + 5),
  insertions: Math.floor(Math.random() * 50 + 10),
}));

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-alibi-bg-card border border-alibi-border rounded-xl p-3 shadow-elevated">
      <div className="text-xs text-alibi-text-muted mb-1">{label}s</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-alibi-text-muted">{p.name}:</span>
          <span className="font-mono font-bold text-alibi-text">{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Metrics Summary Bar ──────────────────────────────────────────────────────

function MetricsBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-alibi-text-muted">{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 bg-alibi-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Analytics Page ────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [selectedSession] = useState('s-001');

  return (
    <div className="ca-page">
      {/* Session Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="ca-page-title">Writing Analytics</h2>
          <p className="text-sm text-alibi-text-muted mt-1">Deep analysis of your writing behavior patterns</p>
        </div>
        <select className="ca-input w-auto text-sm">
          <option>The Ethics of AI Writing Tools — Jul 12</option>
          <option>Chapter 3 — Research Methods — Jul 11</option>
          <option>Email Newsletter Draft — Jul 10</option>
        </select>
      </div>

      {/* Authenticity Score Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="ca-card p-6 border-gradient">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-alibi-text-subtle mb-4">
              Composite Authenticity Score
            </div>
            <div className="relative inline-flex items-center justify-center w-36 h-36 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#2D2A40" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#scoreGrad)" strokeWidth="8"
                  strokeDasharray={`${(91 / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gradient-mixed">91</span>
                <span className="text-xs text-alibi-text-muted">/100</span>
              </div>
            </div>
            <span className="ca-badge-issued mt-3 mx-auto">✓ ISSUED</span>
          </div>
        </div>

        <div className="lg:col-span-2 ca-card p-6">
          <h3 className="font-semibold text-alibi-text mb-5">Score Breakdown</h3>
          <div className="space-y-4">
            <MetricsBar label="Typing Cadence" value={91} max={100} color="#7C3AED" />
            <MetricsBar label="Paste Control (inverse)" value={95} max={100} color="#10B981" />
            <MetricsBar label="Revision Depth" value={82} max={100} color="#8B5CF6" />
            <MetricsBar label="Session Duration" value={78} max={100} color="#3B82F6" />
            <MetricsBar label="WPM Consistency" value={88} max={100} color="#F59E0B" />
          </div>
        </div>
      </div>

      {/* Cadence Chart — Full Width */}
      <div className="ca-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-alibi-text">Writing Speed Over Time (WPM)</h3>
            <p className="text-xs text-alibi-text-muted mt-0.5">
              Natural variance in typing speed — the fingerprint of human authorship
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 rounded bg-alibi-violet" />
              <span className="text-alibi-text-muted">WPM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-alibi-ai" />
              <span className="text-alibi-text-muted">AI Assist</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-alibi-warning" />
              <span className="text-alibi-text-muted">Paste Event</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={CADENCE_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2A4040" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}s`} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}`} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="wpm" stroke="#7C3AED" strokeWidth={2} fill="url(#wpmGrad)"
              dot={(props) => {
                if (props.payload.hasAI) {
                  return <circle cx={props.cx} cy={props.cy} r={5} fill="#8B5CF6" stroke="#C4B5FD" strokeWidth={1.5} key={props.key} />;
                }
                if (props.payload.hasPaste) {
                  return <circle cx={props.cx} cy={props.cy} r={5} fill="#F59E0B" stroke="#FCD34D" strokeWidth={1.5} key={props.key} />;
                }
                return <g key={props.key} />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row — Pause Distribution + Revision Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pause Distribution */}
        <div className="ca-card p-6">
          <h3 className="font-semibold text-alibi-text mb-1">Pause Distribution</h3>
          <p className="text-xs text-alibi-text-muted mb-4">
            Natural writers have many micro and short pauses — thinking gaps are normal
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PAUSE_DATA} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip
                contentStyle={{ background: '#1E1B2E', border: '1px solid #2D2A40', borderRadius: '12px', color: '#E2E8F0' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {PAUSE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar — Authorship Profile */}
        <div className="ca-card p-6">
          <h3 className="font-semibold text-alibi-text mb-1">Authorship Profile</h3>
          <p className="text-xs text-alibi-text-muted mb-4">
            Multi-dimensional view of all authenticity metrics
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#2D2A40" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Radar name="Score" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip
                contentStyle={{ background: '#1E1B2E', border: '1px solid #2D2A40', borderRadius: '12px', color: '#E2E8F0' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
