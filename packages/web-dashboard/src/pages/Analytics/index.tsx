/**
 * @fileoverview Analytics page — deep-dive writing behavior visualizations.
 * Moon Phases design system: #212A31 / #2E3944 / #124E66 / #748D92 / #D3D9D4
 */

import React, { useState } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, BarChart, Bar, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

// ─── Moon Phases tokens ────────────────────────────────────────────────────────
const MP = {
  bg:       '#1A2229',
  surface:  '#212A31',
  elevated: '#2E3944',
  hover:    '#374654',
  tealDark: '#124E66',
  teal:     '#2A9FBF',
  tealH:    '#3AB4D4',
  text:     '#D3D9D4',
  textSoft: '#A8B2B7',
  muted:    '#748D92',
  border:   '#374654',
  success:  '#4CC38A',
  error:    '#E07070',
  warning:  '#E8C547',
  ibm:      '#7EB8D4',
} as const;

// ─── Mock data ────────────────────────────────────────────────────────────────

const SESSIONS_LIST = [
  { id: 's-001', label: 'The Ethics of AI Writing Tools — Jul 12', score: 91 },
  { id: 's-002', label: 'Chapter 3 — Research Methods — Jul 11',   score: 87 },
  { id: 's-003', label: 'Email Newsletter Draft — Jul 10',          score: 94 },
];

const buildCadenceData = (seed: number) =>
  Array.from({ length: 60 }, (_, i) => ({
    time:   i * 2,
    wpm:    Math.max(10, Math.min(95, 42 + seed + (Math.sin((i + seed) * 0.3) * 18) + (Math.cos(i * 0.12) * 8))),
    hasAI:  i === 15 || i === 32 || i === 47,
    hasPaste: i === 8,
  }));

const PAUSE_DATA = [
  { label: 'Micro (<0.5s)',    count: 142, fill: MP.teal    },
  { label: 'Short (0.5–2s)',   count: 67,  fill: MP.ibm     },
  { label: 'Thinking (2–30s)', count: 23,  fill: MP.muted   },
  { label: 'Breaks (>30s)',    count: 4,   fill: MP.elevated },
];

const RADAR_DATA = [
  { metric: 'Cadence',          score: 91 },
  { metric: 'Paste Control',    score: 95 },
  { metric: 'Revisions',        score: 82 },
  { metric: 'Duration',         score: 78 },
  { metric: 'WPM Consistency',  score: 88 },
];

const REVISION_DATA = Array.from({ length: 20 }, (_, i) => ({
  seg:        i + 1,
  deletions:  Math.floor(Math.sin(i * 0.8)  * 12 + 16),
  insertions: Math.floor(Math.cos(i * 0.6)  * 18 + 28),
}));

const WPM_DIST = [
  { bucket: '0–20',  freq: 3 },
  { bucket: '20–35', freq: 12 },
  { bucket: '35–50', freq: 28 },
  { bucket: '50–65', freq: 34 },
  { bucket: '65–80', freq: 18 },
  { bucket: '80+',   freq: 5 },
];

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

function Tip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string | number }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs border shadow-lg"
      style={{ background: MP.elevated, borderColor: MP.border, color: MP.text }}>
      <div className="font-medium mb-1" style={{ color: MP.muted }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-mono">{p.name ? `${p.name}: ` : ''}{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</div>
      ))}
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-base" style={{ color: MP.text }}>{title}</h3>
      {sub && <p className="text-xs mt-0.5" style={{ color: MP.muted }}>{sub}</p>}
    </div>
  );
}

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 42; const c = 2 * Math.PI * r;
  const fill = score >= 85 ? MP.success : score >= 70 ? MP.warning : MP.error;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="110" height="110" viewBox="0 0 110 110" aria-label={`${label}: ${score}/100`}>
        <circle cx="55" cy="55" r={r} fill="none" stroke={MP.elevated}   strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={fill} strokeWidth="8"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          strokeDashoffset={c * 0.25} strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x="55" y="50" textAnchor="middle" fontSize="22" fontWeight="700" fill={fill} fontFamily="monospace">{score}</text>
        <text x="55" y="65" textAnchor="middle" fontSize="10" fill={MP.muted} fontFamily="Inter, sans-serif">/100</text>
      </svg>
      <span className="text-xs font-medium" style={{ color: MP.textSoft }}>{label}</span>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [selectedSessionId, setSelectedSessionId] = useState('s-001');
  const selectedSession = SESSIONS_LIST.find(s => s.id === selectedSessionId) ?? SESSIONS_LIST[0];
  const cadenceData = buildCadenceData(selectedSession.score - 80);

  const aiMarkers   = cadenceData.filter(d => d.hasAI);
  const pasteMarkers = cadenceData.filter(d => d.hasPaste);

  return (
    <div className="ca-page">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black" style={{ color: MP.text }}>Writing Behavior Analytics</h1>
          <p className="text-sm mt-1" style={{ color: MP.muted }}>
            Deep-dive into your typing patterns, revision habits, and AI usage transparency
          </p>
        </div>

        {/* Session Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="session-select" className="text-xs font-medium" style={{ color: MP.muted }}>Session:</label>
          <select
            id="session-select"
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(e.target.value)}
            className="ca-input text-sm py-2 px-3 pr-8"
            style={{ minWidth: '240px' }}
          >
            {SESSIONS_LIST.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Score Overview ────────────────────────────────────────────────────── */}
      <div className="ca-card p-6">
        <SectionTitle title="Composite Authenticity Score" sub="Weighted across cadence, paste control, revision depth, and duration" />
        <div className="flex flex-wrap items-center gap-8 justify-center">
          <ScoreRing score={selectedSession.score} label="Overall" />
          <ScoreRing score={91} label="Cadence" />
          <ScoreRing score={95} label="Paste Ctrl" />
          <ScoreRing score={82} label="Revisions" />
          <ScoreRing score={78} label="Duration" />
          <ScoreRing score={88} label="WPM Consistency" />
        </div>
      </div>

      {/* ── WPM Cadence Timeline ─────────────────────────────────────────────── */}
      <div className="ca-card p-6">
        <SectionTitle title="WPM Cadence Timeline" sub="Words-per-minute over session duration. AI assist and paste events annotated." />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={cadenceData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={MP.teal} stopOpacity={0.35} />
                <stop offset="95%" stopColor={MP.teal} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={`${MP.border}50`} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: MP.muted }} tickFormatter={v => `${v}m`} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: MP.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
            <Tooltip content={<Tip />} />
            {/* AI assist markers */}
            {aiMarkers.map(d => (
              <ReferenceLine key={`ai-${d.time}`} x={d.time} stroke={MP.ibm} strokeDasharray="3 3" label={{ value: '🤖', position: 'top', fontSize: 10 }} />
            ))}
            {/* Paste markers */}
            {pasteMarkers.map(d => (
              <ReferenceLine key={`paste-${d.time}`} x={d.time} stroke={MP.warning} strokeDasharray="3 3" label={{ value: '📋', position: 'top', fontSize: 10 }} />
            ))}
            <Area type="monotone" dataKey="wpm" stroke={MP.teal} strokeWidth={2.5} fill="url(#wpmGrad)"
              dot={false} activeDot={{ r: 5, fill: MP.tealH, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-3 text-xs" style={{ color: MP.muted }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded inline-block" style={{ background: MP.ibm }} />🤖 AI Assist
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded inline-block" style={{ background: MP.warning }} />📋 Paste Event
          </span>
        </div>
      </div>

      {/* ── Row: Pause Distribution + Radar ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pause Distribution */}
        <div className="ca-card p-6">
          <SectionTitle title="Pause Profile Distribution" sub="How often and how long you pause between keystrokes" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PAUSE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${MP.border}50`} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {PAUSE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="ca-card p-6">
          <SectionTitle title="Authenticity Radar" sub="5-axis composite score breakdown" />
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA} outerRadius={75}>
              <PolarGrid stroke={`${MP.border}80`} />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: MP.muted }} />
              <Radar dataKey="score" stroke={MP.teal} fill={MP.teal} fillOpacity={0.2} dot={{ r: 3, fill: MP.teal }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row: WPM Distribution + Revision Heatmap ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* WPM Distribution */}
        <div className="ca-card p-6">
          <SectionTitle title="WPM Distribution" sub="How your typing speed is spread across the session" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WPM_DIST} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${MP.border}50`} vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="freq" fill={MP.ibm} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revision Heatmap */}
        <div className="ca-card p-6">
          <SectionTitle title="Revision Intensity" sub="Insertions vs deletions per document segment" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REVISION_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${MP.border}50`} vertical={false} />
              <XAxis dataKey="seg" tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} tickFormatter={v => `S${v}`} />
              <YAxis tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="insertions" name="Insertions" stackId="rev" fill={MP.teal}    radius={[0, 0, 0, 0]} />
              <Bar dataKey="deletions"  name="Deletions"  stackId="rev" fill={MP.error}   radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-2 text-xs" style={{ color: MP.muted }}>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: MP.teal }} /> Insertions</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: MP.error }} /> Deletions</span>
          </div>
        </div>
      </div>

      {/* ── AI Usage Transparency ─────────────────────────────────────────────── */}
      <div className="ca-card p-6">
        <SectionTitle title="AI Usage Transparency Log" sub="Every IBM Granite interaction during this session — all disclosed in the Authenticity Report" />
        <div className="space-y-3">
          {[
            { time: '00:15', type: 'style_suggestion', prompt: 'Make my opening paragraph more engaging', accepted: true  },
            { time: '00:32', type: 'brainstorm',        prompt: 'Give me 3 angles for my conclusion',    accepted: true  },
            { time: '00:47', type: 'grammar_check',     prompt: 'Check clarity of this sentence',        accepted: false },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-xl text-sm"
              style={{ background: MP.elevated, border: `1px solid ${MP.border}` }}>
              <span className="font-mono text-xs flex-shrink-0" style={{ color: MP.muted }}>{log.time}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                style={{ background: `${MP.ibm}18`, color: MP.ibm }}>
                {log.type === 'style_suggestion' ? '✍️ Style' : log.type === 'brainstorm' ? '💡 Brainstorm' : '📝 Grammar'}
              </span>
              <span className="flex-1 min-w-0 truncate" style={{ color: MP.textSoft }}>"{log.prompt}"</span>
              <span className={`text-xs font-semibold flex-shrink-0 px-2 py-0.5 rounded-full`}
                style={{
                  background: log.accepted ? `${MP.success}18` : `${MP.error}18`,
                  color:      log.accepted ? MP.success          : MP.error,
                }}>
                {log.accepted ? '✓ Accepted' : '✗ Declined'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4 text-center" style={{ color: MP.muted }}>
          3 AI interactions — all transparently disclosed in the Authenticity Report per IBM Granite Guardian protocol
        </p>
      </div>
    </div>
  );
}
