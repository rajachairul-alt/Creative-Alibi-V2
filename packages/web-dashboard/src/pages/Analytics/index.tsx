/**
 * @fileoverview Analytics page — deep-dive writing behavior visualizations.
 * Futuristic design with full-width charts, session selector, and export.
 */

import React, { useState } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, BarChart, Bar, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

// ─── Mock data ────────────────────────────────────────────────────────────────

const SESSIONS_LIST = [
  { id: 's-001', label: 'The Ethics of AI Writing Tools — Jul 12', score: 91 },
  { id: 's-002', label: 'Chapter 3 — Research Methods — Jul 11', score: 87 },
  { id: 's-003', label: 'Email Newsletter Draft — Jul 10', score: 94 },
];

const buildCadenceData = (seed: number) =>
  Array.from({ length: 60 }, (_, i) => ({
    time: i * 2,
    wpm: Math.max(10, Math.min(95, 42 + seed + (Math.sin((i + seed) * 0.3) * 18) + (Math.cos(i * 0.12) * 8))),
    hasAI: i === 15 || i === 32 || i === 47,
    hasPaste: i === 8,
  }));

const PAUSE_DATA = [
  { label: 'Micro (<0.5s)', count: 142, fill: '#7C3AED' },
  { label: 'Short (0.5–2s)', count: 67, fill: '#8B5CF6' },
  { label: 'Thinking (2–30s)', count: 23, fill: '#A78BFA' },
  { label: 'Breaks (>30s)', count: 4, fill: '#4B5563' },
];

const RADAR_DATA = [
  { metric: 'Cadence', score: 91 },
  { metric: 'Paste Control', score: 95 },
  { metric: 'Revisions', score: 82 },
  { metric: 'Duration', score: 78 },
  { metric: 'WPM Consistency', score: 88 },
];

const REVISION_DATA = Array.from({ length: 20 }, (_, i) => ({
  seg: i + 1,
  deletions: Math.floor(Math.sin(i * 0.8) * 12 + 16),
  insertions: Math.floor(Math.cos(i * 0.6) * 18 + 28),
}));

const WPM_DISTRIBUTION = [
  { wpm: '0-20', count: 2 },
  { wpm: '20-30', count: 8 },
  { wpm: '30-40', count: 19 },
  { wpm: '40-50', count: 28 },
  { wpm: '50-60', count: 22 },
  { wpm: '60-70', count: 13 },
  { wpm: '70-80', count: 6 },
  { wpm: '80+', count: 2 },
];

// ─── Components ───────────────────────────────────────────────────────────────

const TooltipBox = ({ active, payload, label, unit }: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string | number;
  unit?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E1B2E] border border-[#7C3AED30] rounded-xl p-3 shadow-xl text-xs">
      <div className="text-alibi-text-muted mb-1">{label}{unit}</div>
      {payload.map((p: { color: string; name: string; value: number }, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-alibi-text-muted capitalize">{p.name}:</span>
          <span className="font-mono font-bold text-alibi-text">{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

function MetricsBar({ label, value, max, color, sublabel }: {
  label: string; value: number; max: number; color: string; sublabel?: string;
}) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <div>
          <span className="text-sm text-alibi-text-muted">{label}</span>
          {sublabel && <span className="text-xs text-alibi-text-subtle ml-2">{sublabel}</span>}
        </div>
        <span className="font-mono font-bold text-sm" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 bg-alibi-bg-elevated rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
      </div>
    </div>
  );
}

// ─── Analytics Page ────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const session = SESSIONS_LIST[selectedIdx];
  const cadenceData = buildCadenceData(selectedIdx * 5);

  const avgWpm = Math.round(cadenceData.reduce((a, d) => a + d.wpm, 0) / cadenceData.length);
  const maxWpm = Math.round(Math.max(...cadenceData.map(d => d.wpm)));

  return (
    <div className="ca-page">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="ca-page-title">Writing Analytics</h2>
          <p className="text-sm text-alibi-text-muted mt-1">Deep behavioral analysis — the fingerprint of human authorship</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedIdx}
            onChange={e => setSelectedIdx(Number(e.target.value))}
            className="ca-input text-sm w-72"
          >
            {SESSIONS_LIST.map((s, i) => (
              <option key={s.id} value={i}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="ca-btn-secondary text-sm flex items-center gap-2 px-4 py-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* ── Score + Breakdown ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score ring */}
        <div className="ca-card p-6 flex flex-col items-center justify-center text-center border-gradient">
          <div className="text-xs font-semibold uppercase tracking-widest text-alibi-text-subtle mb-4">
            Composite Authenticity Score
          </div>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#2D2A40" strokeWidth="7" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="7"
                strokeDasharray={`${(session.score / 100) * 2 * Math.PI * 42} 999`}
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
              <span className="text-5xl font-black text-gradient-mixed">{session.score}</span>
              <span className="text-xs text-alibi-text-muted">/100</span>
            </div>
          </div>
          <span className="ca-badge-issued mt-4">✓ ISSUED</span>
          <div className="mt-3 grid grid-cols-2 gap-3 w-full text-xs">
            <div className="bg-alibi-bg-elevated rounded-xl p-2">
              <div className="text-alibi-text-muted">Avg WPM</div>
              <div className="font-mono font-bold text-[#7C3AED] text-lg">{avgWpm}</div>
            </div>
            <div className="bg-alibi-bg-elevated rounded-xl p-2">
              <div className="text-alibi-text-muted">Peak WPM</div>
              <div className="font-mono font-bold text-[#8B5CF6] text-lg">{maxWpm}</div>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="lg:col-span-2 ca-card p-6">
          <h3 className="font-bold text-alibi-text mb-5">Score Breakdown</h3>
          <div className="space-y-4">
            <MetricsBar label="Typing Cadence" value={91} max={100} color="#7C3AED" sublabel="Human-like rhythm variance" />
            <MetricsBar label="Paste Control" value={96} max={100} color="#10B981" sublabel="4% paste ratio (excellent)" />
            <MetricsBar label="Revision Depth" value={82} max={100} color="#8B5CF6" sublabel="Active rethinking pattern" />
            <MetricsBar label="Session Duration" value={78} max={100} color="#3B82F6" sublabel="34m — meets minimum" />
            <MetricsBar label="WPM Consistency" value={88} max={100} color="#F59E0B" sublabel="Natural speed variance" />
          </div>
        </div>
      </div>

      {/* ── Writing Speed Timeline ────────────────────────────────────────── */}
      <div className="ca-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-alibi-text">Writing Speed Over Time (WPM)</h3>
            <p className="text-xs text-alibi-text-muted mt-0.5">
              Natural variance is the fingerprint of human authorship — uniform speed is suspicious
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 rounded-full bg-[#7C3AED]" />
              <span className="text-alibi-text-muted">WPM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              <span className="text-alibi-text-muted">AI Assist point</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-alibi-text-muted">Paste event</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={cadenceData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2A4025" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}s`} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={(props) => <TooltipBox {...props} unit="s" />} />
            <ReferenceLine y={avgWpm} stroke="#7C3AED" strokeDasharray="4 4" strokeOpacity={0.5}
              label={{ value: `Avg ${avgWpm}`, fill: '#A78BFA', fontSize: 11 }} />
            <Area type="monotone" dataKey="wpm" stroke="#7C3AED" strokeWidth={2} fill="url(#wpmGrad)"
              dot={(props) => {
                if (props.payload.hasAI)
                  return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill="#8B5CF6" stroke="#C4B5FD" strokeWidth={1.5} />;
                if (props.payload.hasPaste)
                  return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill="#F59E0B" stroke="#FCD34D" strokeWidth={1.5} />;
                return <g key={props.key} />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pause Distribution */}
        <div className="ca-card p-6">
          <h3 className="font-bold text-alibi-text mb-1">Pause Distribution</h3>
          <p className="text-xs text-alibi-text-muted mb-4">
            Natural writers have many micro-pauses — thinking gaps prove active cognition
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PAUSE_DATA} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={105} />
              <Tooltip contentStyle={{ background: '#1E1B2E', border: '1px solid #2D2A40', borderRadius: '10px', fontSize: 11 }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {PAUSE_DATA.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Authorship Radar */}
        <div className="ca-card p-6">
          <h3 className="font-bold text-alibi-text mb-1">Authorship Profile</h3>
          <p className="text-xs text-alibi-text-muted mb-4">Multi-dimensional authenticity view</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#2D2A40" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Radar name="Score" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={{ background: '#1E1B2E', border: '1px solid #2D2A40', borderRadius: '10px', fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* WPM Distribution */}
        <div className="ca-card p-6">
          <h3 className="font-bold text-alibi-text mb-1">WPM Distribution</h3>
          <p className="text-xs text-alibi-text-muted mb-4">Frequency of typing speeds — bell curve = natural</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WPM_DISTRIBUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2A4020" />
              <XAxis dataKey="wpm" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1E1B2E', border: '1px solid #2D2A40', borderRadius: '10px', fontSize: 11 }} />
              <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]}>
                {WPM_DISTRIBUTION.map((_, i) => (
                  <Cell key={i}
                    fill={`hsl(${260 + i * 5}, 70%, ${45 + i * 2}%)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Revision Heatmap ──────────────────────────────────────────────── */}
      <div className="ca-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-alibi-text">Revision Activity by Document Segment</h3>
            <p className="text-xs text-alibi-text-muted mt-0.5">Heavy revision = active thinking, not copy-paste</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-[#EF4444]" /><span className="text-alibi-text-muted">Deletions</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm bg-[#10B981]" /><span className="text-alibi-text-muted">Insertions</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={REVISION_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2A4020" />
            <XAxis dataKey="seg" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false}
              tickFormatter={v => `§${v}`} />
            <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1E1B2E', border: '1px solid #2D2A40', borderRadius: '10px', fontSize: 11 }} />
            <Bar dataKey="deletions" fill="#EF4444" radius={[2, 2, 0, 0]} fillOpacity={0.75} />
            <Bar dataKey="insertions" fill="#10B981" radius={[2, 2, 0, 0]} fillOpacity={0.75} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
