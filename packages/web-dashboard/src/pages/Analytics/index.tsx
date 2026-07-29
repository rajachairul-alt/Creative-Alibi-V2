/**
 * @fileoverview Analytics page — per-session deep-dive writing behavior visualizations.
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

type AIAssistType = 'style_suggestion' | 'brainstorm' | 'grammar_check';

interface AILogEntry {
  time:     string;
  type:     AIAssistType;
  prompt:   string;
  accepted: boolean;
}

interface SessionAnalytics {
  id:              string;
  label:           string;
  date:            string;
  overallScore:    number;
  cadenceScore:    number;
  pasteCtrl:       number;
  revisionsScore:  number;
  durationScore:   number;
  wpmConsistency:  number;
  avgWPM:          number;
  peakWPM:         number;
  totalWords:      number;
  durationMin:     number;
  copyPasteRatio:  number;
  revisionCount:   number;
  totalPauses:     number;
  aiLog:           AILogEntry[];
  cadenceSeed:     number;
  pauseCounts:     [number, number, number, number];
  wpmDist:         number[];
  aiMarkerTimes:   number[];
  pasteMarkerTime: number | null;
}

// ─── Per-session realistic data ───────────────────────────────────────────────

const SESSIONS_DATA: SessionAnalytics[] = [
  {
    id: 's-001', label: 'The Ethics of AI Writing Tools', date: '2026-07-14',
    overallScore: 91, cadenceScore: 88, pasteCtrl: 96, revisionsScore: 85, durationScore: 79, wpmConsistency: 90,
    avgWPM: 58, peakWPM: 81, totalWords: 1247, durationMin: 34, copyPasteRatio: 0.04, revisionCount: 14,
    totalPauses: 31, cadenceSeed: 11,
    pauseCounts: [138, 61, 19, 3],
    wpmDist:     [2, 11, 27, 35, 17, 4],
    aiMarkerTimes: [16, 33],
    pasteMarkerTime: null,
    aiLog: [
      { time: '00:16', type: 'style_suggestion', prompt: 'Make my opening paragraph more compelling', accepted: true  },
      { time: '00:33', type: 'brainstorm',        prompt: '3 counter-arguments to strengthen my thesis', accepted: true  },
    ],
  },
  {
    id: 's-002', label: 'Chapter 3 — Research Methods', date: '2026-07-13',
    overallScore: 87, cadenceScore: 83, pasteCtrl: 90, revisionsScore: 88, durationScore: 92, wpmConsistency: 85,
    avgWPM: 51, peakWPM: 74, totalWords: 2840, durationMin: 82, copyPasteRatio: 0.08, revisionCount: 29,
    totalPauses: 67, cadenceSeed: 7,
    pauseCounts: [189, 93, 38, 9],
    wpmDist:     [4, 14, 32, 29, 14, 3],
    aiMarkerTimes: [],
    pasteMarkerTime: null,
    aiLog: [],
  },
  {
    id: 's-003', label: 'Email Newsletter Draft', date: '2026-07-12',
    overallScore: 94, cadenceScore: 92, pasteCtrl: 97, revisionsScore: 80, durationScore: 72, wpmConsistency: 93,
    avgWPM: 64, peakWPM: 87, totalWords: 450, durationMin: 18, copyPasteRatio: 0.03, revisionCount: 6,
    totalPauses: 12, cadenceSeed: 14,
    pauseCounts: [95, 31, 8, 0],
    wpmDist:     [1, 7, 22, 38, 24, 8],
    aiMarkerTimes: [9],
    pasteMarkerTime: null,
    aiLog: [
      { time: '00:09', type: 'grammar_check', prompt: 'Check subject-verb agreement in paragraph 2', accepted: true },
    ],
  },
  {
    id: 's-004', label: 'Blog Post — AI Creativity', date: '2026-07-11',
    overallScore: 52, cadenceScore: 61, pasteCtrl: 52, revisionsScore: 48, durationScore: 45, wpmConsistency: 55,
    avgWPM: 89, peakWPM: 124, totalWords: 820, durationMin: 12, copyPasteRatio: 0.32, revisionCount: 4,
    totalPauses: 9, cadenceSeed: -20,
    pauseCounts: [41, 18, 5, 1],
    wpmDist:     [0, 3, 9, 18, 26, 24],
    aiMarkerTimes: [3, 6, 8, 10, 11],
    pasteMarkerTime: 4,
    aiLog: [
      { time: '00:03', type: 'style_suggestion', prompt: 'Rewrite my intro in a casual tone',              accepted: true  },
      { time: '00:06', type: 'brainstorm',        prompt: 'More ideas for section 2',                      accepted: true  },
      { time: '00:08', type: 'style_suggestion',  prompt: 'Make conclusion punchier',                      accepted: true  },
      { time: '00:10', type: 'grammar_check',     prompt: 'Fix grammar in paragraph 4',                    accepted: false },
      { time: '00:11', type: 'brainstorm',        prompt: 'Alternative ways to say "artificial intelligence"', accepted: true },
    ],
  },
  {
    id: 's-005', label: 'Academic Abstract — ML Study', date: '2026-07-10',
    overallScore: 89, cadenceScore: 87, pasteCtrl: 94, revisionsScore: 91, durationScore: 76, wpmConsistency: 88,
    avgWPM: 49, peakWPM: 69, totalWords: 380, durationMin: 25, copyPasteRatio: 0.05, revisionCount: 12,
    totalPauses: 18, cadenceSeed: 9,
    pauseCounts: [88, 42, 14, 1],
    wpmDist:     [1, 9, 28, 33, 19, 5],
    aiMarkerTimes: [],
    pasteMarkerTime: null,
    aiLog: [],
  },
  {
    id: 's-006', label: 'Literature Review Draft', date: '2026-07-08',
    overallScore: 84, cadenceScore: 80, pasteCtrl: 87, revisionsScore: 86, durationScore: 91, wpmConsistency: 82,
    avgWPM: 47, peakWPM: 68, totalWords: 3200, durationMin: 95, copyPasteRatio: 0.11, revisionCount: 41,
    totalPauses: 88, cadenceSeed: 4,
    pauseCounts: [211, 107, 44, 12],
    wpmDist:     [5, 16, 31, 27, 14, 4],
    aiMarkerTimes: [22, 51, 78],
    pasteMarkerTime: 15,
    aiLog: [
      { time: '00:22', type: 'brainstorm',        prompt: 'Suggest 3 more sources for section on NLP history', accepted: true  },
      { time: '00:51', type: 'style_suggestion',  prompt: 'Is this paragraph too dense? How to split it?',    accepted: false },
      { time: '01:18', type: 'grammar_check',     prompt: 'Fix passive voice in methodology paragraph',        accepted: true  },
    ],
  },
  {
    id: 's-007', label: 'Conference Proposal', date: '2026-07-07',
    overallScore: 76, cadenceScore: 74, pasteCtrl: 80, revisionsScore: 71, durationScore: 82, wpmConsistency: 75,
    avgWPM: 53, peakWPM: 77, totalWords: 1580, durationMin: 44, copyPasteRatio: 0.14, revisionCount: 19,
    totalPauses: 39, cadenceSeed: -4,
    pauseCounts: [152, 72, 26, 6],
    wpmDist:     [3, 12, 29, 31, 16, 5],
    aiMarkerTimes: [20],
    pasteMarkerTime: 30,
    aiLog: [
      { time: '00:20', type: 'style_suggestion', prompt: 'Make proposal abstract more persuasive', accepted: true },
    ],
  },
];

const PAUSE_LABELS = ['Micro (<0.5s)', 'Short (0.5–2s)', 'Thinking (2–30s)', 'Breaks (>30s)'];
const PAUSE_FILLS  = [MP.teal, MP.ibm, MP.muted, MP.elevated];
const WPM_BUCKETS  = ['0–20', '20–35', '35–50', '50–65', '65–80', '80+'];
const WPM_FILLS    = [MP.error, MP.warning, MP.teal, MP.teal, MP.ibm, MP.ibm];

function buildCadenceData(s: SessionAnalytics) {
  const pts = Math.min(s.durationMin * 2, 80);
  return Array.from({ length: pts }, (_, i) => ({
    time:  i,
    wpm:   Math.max(8, Math.min(100, s.avgWPM + s.cadenceSeed * 0.3 + (Math.sin((i + s.cadenceSeed) * 0.35) * 16) + (Math.cos(i * 0.14) * 9))),
    hasAI: s.aiMarkerTimes.includes(i),
    hasPaste: s.pasteMarkerTime === i,
  }));
}

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
        <circle cx="55" cy="55" r={r} fill="none" stroke={MP.elevated} strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={fill} strokeWidth="8"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x="55" y="50" textAnchor="middle" fontSize="22" fontWeight="700" fill={fill} fontFamily="monospace">{score}</text>
        <text x="55" y="65" textAnchor="middle" fontSize="10" fill={MP.muted} fontFamily="Inter, sans-serif">/100</text>
      </svg>
      <span className="text-xs font-medium" style={{ color: MP.textSoft }}>{label}</span>
    </div>
  );
}

// ─── Mini Stat ─────────────────────────────────────────────────────────────────

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl p-3 border text-center" style={{ background: MP.elevated, borderColor: MP.border }}>
      <div className="text-lg font-black font-mono" style={{ color: color ?? MP.text }}>{value}</div>
      <div className="text-[10px] mt-0.5 uppercase tracking-wide" style={{ color: MP.muted }}>{label}</div>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [selectedId, setSelectedId] = useState('s-001');
  const s = SESSIONS_DATA.find(x => x.id === selectedId) ?? SESSIONS_DATA[0];

  const cadenceData = buildCadenceData(s);
  const pauseData   = PAUSE_LABELS.map((label, i) => ({ label, count: s.pauseCounts[i], fill: PAUSE_FILLS[i] }));
  const wpmDistData = WPM_BUCKETS.map((bucket, i) => ({ bucket, freq: s.wpmDist[i] }));

  const radarData = [
    { metric: 'Cadence',         score: s.cadenceScore   },
    { metric: 'Paste Control',   score: s.pasteCtrl      },
    { metric: 'Revisions',       score: s.revisionsScore },
    { metric: 'Duration',        score: s.durationScore  },
    { metric: 'WPM Consistency', score: s.wpmConsistency },
  ];

  const revisionData = Array.from({ length: 20 }, (_, i) => ({
    seg:        i + 1,
    deletions:  Math.max(1, Math.floor(Math.sin(i * 0.8 + s.cadenceSeed * 0.1) * (s.revisionCount / 5) + s.revisionCount / 3)),
    insertions: Math.max(2, Math.floor(Math.cos(i * 0.6 + s.cadenceSeed * 0.1) * (s.revisionCount / 4) + s.revisionCount / 2)),
  }));

  const aiMarkers   = cadenceData.filter(d => d.hasAI);
  const pasteMarkers = cadenceData.filter(d => d.hasPaste);

  const acceptedCount = s.aiLog.filter(l => l.accepted).length;
  const declinedCount = s.aiLog.length - acceptedCount;

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
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="ca-input text-sm py-2 px-3 pr-8"
            style={{ minWidth: '280px' }}
          >
            {SESSIONS_DATA.map(x => (
              <option key={x.id} value={x.id}>{x.label} — {x.date}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Session Summary Banner ────────────────────────────────────────────── */}
      <div className="ca-card p-5 flex flex-wrap items-center gap-4 justify-between"
        style={{ borderColor: `${s.overallScore >= 80 ? MP.success : s.overallScore >= 70 ? MP.warning : MP.error}30` }}>
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: MP.muted }}>Current Session</div>
          <div className="font-bold text-lg" style={{ color: MP.text }}>{s.label}</div>
          <div className="text-sm mt-0.5" style={{ color: MP.muted }}>{s.date} · {s.durationMin}m · {s.totalWords.toLocaleString()} words</div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <MiniStat label="Avg WPM" value={`${s.avgWPM}`} color={MP.teal} />
          <MiniStat label="Peak WPM" value={`${s.peakWPM}`} color={MP.ibm} />
          <MiniStat label="Revisions" value={`${s.revisionCount}`} color={MP.warning} />
          <MiniStat label="Pauses" value={`${s.totalPauses}`} />
          <MiniStat
            label="Paste Ratio"
            value={`${(s.copyPasteRatio * 100).toFixed(0)}%`}
            color={s.copyPasteRatio <= 0.1 ? MP.success : s.copyPasteRatio <= 0.2 ? MP.warning : MP.error}
          />
          {s.aiLog.length > 0
            ? <MiniStat label="AI Assists" value={`${s.aiLog.length}`} color={MP.ibm} />
            : <MiniStat label="AI Assists" value="None" color={MP.muted} />
          }
        </div>
      </div>

      {/* ── Score Overview ────────────────────────────────────────────────────── */}
      <div className="ca-card p-6">
        <SectionTitle title="Composite Authenticity Score" sub="Weighted across cadence, paste control, revision depth, and duration" />
        <div className="flex flex-wrap items-center gap-8 justify-center">
          <ScoreRing score={s.overallScore}   label="Overall"        />
          <ScoreRing score={s.cadenceScore}   label="Cadence"        />
          <ScoreRing score={s.pasteCtrl}      label="Paste Ctrl"     />
          <ScoreRing score={s.revisionsScore} label="Revisions"      />
          <ScoreRing score={s.durationScore}  label="Duration"       />
          <ScoreRing score={s.wpmConsistency} label="WPM Consistency"/>
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
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: MP.muted }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            {aiMarkers.map(d => (
              <ReferenceLine key={`ai-${d.time}`} x={d.time} stroke={MP.ibm} strokeDasharray="3 3"
                label={{ value: '🤖', position: 'top', fontSize: 10 }} />
            ))}
            {pasteMarkers.map(d => (
              <ReferenceLine key={`paste-${d.time}`} x={d.time} stroke={MP.warning} strokeDasharray="3 3"
                label={{ value: '📋', position: 'top', fontSize: 10 }} />
            ))}
            <Area type="monotone" dataKey="wpm" stroke={MP.teal} strokeWidth={2.5} fill="url(#wpmGrad)"
              dot={false} activeDot={{ r: 5, fill: MP.tealH, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-3 text-xs" style={{ color: MP.muted }}>
          {aiMarkers.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded inline-block" style={{ background: MP.ibm }} />🤖 AI Assist ({aiMarkers.length})
            </span>
          )}
          {pasteMarkers.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded inline-block" style={{ background: MP.warning }} />📋 Paste Event
            </span>
          )}
          {aiMarkers.length === 0 && pasteMarkers.length === 0 && (
            <span style={{ color: MP.success }}>✓ Clean session — no AI assists or paste events detected</span>
          )}
        </div>
      </div>

      {/* ── Row: Pause Distribution + Radar ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pause Distribution */}
        <div className="ca-card p-6">
          <SectionTitle title="Pause Profile Distribution" sub="How often and how long you pause between keystrokes" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pauseData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${MP.border}50`} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {pauseData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="ca-card p-6">
          <SectionTitle title="Authenticity Radar" sub="5-axis composite score breakdown" />
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} outerRadius={75}>
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
            <BarChart data={wpmDistData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${MP.border}50`} vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="freq" radius={[4, 4, 0, 0]}>
                {wpmDistData.map((_, i) => <Cell key={i} fill={WPM_FILLS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revision Heatmap */}
        <div className="ca-card p-6">
          <SectionTitle title="Revision Intensity" sub="Insertions vs deletions per document segment" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revisionData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${MP.border}50`} vertical={false} />
              <XAxis dataKey="seg" tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} tickFormatter={v => `S${v}`} />
              <YAxis tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="insertions" name="Insertions" stackId="rev" fill={MP.teal}  radius={[0, 0, 0, 0]} />
              <Bar dataKey="deletions"  name="Deletions"  stackId="rev" fill={MP.error} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-2 text-xs" style={{ color: MP.muted }}>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: MP.teal }} /> Insertions</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: MP.error }} /> Deletions</span>
          </div>
        </div>
      </div>

      {/* ── AI Usage Transparency Log ─────────────────────────────────────────── */}
      <div className="ca-card p-6">
        <SectionTitle
          title="AI Usage Transparency Log"
          sub="Every IBM Granite interaction during this session — all disclosed in the Authenticity Report"
        />
        {s.aiLog.length === 0 ? (
          <div className="rounded-xl p-6 text-center border"
            style={{ background: `${MP.success}08`, borderColor: `${MP.success}25` }}>
            <div className="text-xl mb-2">✓</div>
            <div className="font-semibold text-sm" style={{ color: MP.success }}>No AI assistance used in this session</div>
            <div className="text-xs mt-1" style={{ color: MP.muted }}>This session was completed entirely without AI suggestions.</div>
          </div>
        ) : (
          <>
            {/* Summary row */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border"
                style={{ background: `${MP.ibm}10`, borderColor: `${MP.ibm}25` }}>
                <span style={{ color: MP.ibm }}>🤖</span>
                <span style={{ color: MP.ibm }}><strong>{s.aiLog.length}</strong> total interactions with IBM Granite</span>
              </div>
              <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border"
                style={{ background: `${MP.success}10`, borderColor: `${MP.success}25` }}>
                <span style={{ color: MP.success }}>✓ {acceptedCount} accepted</span>
              </div>
              <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border"
                style={{ background: `${MP.error}10`, borderColor: `${MP.error}25` }}>
                <span style={{ color: MP.error }}>✗ {declinedCount} declined</span>
              </div>
            </div>

            <div className="space-y-3">
              {s.aiLog.map((log, i) => (
                <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-xl text-sm"
                  style={{ background: MP.elevated, border: `1px solid ${MP.border}` }}>
                  <span className="font-mono text-xs flex-shrink-0 w-14" style={{ color: MP.muted }}>{log.time}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                    style={{ background: `${MP.ibm}18`, color: MP.ibm }}>
                    {log.type === 'style_suggestion' ? '✍️ Style' : log.type === 'brainstorm' ? '💡 Brainstorm' : '📝 Grammar'}
                  </span>
                  <span className="flex-1 min-w-0 truncate" style={{ color: MP.textSoft }}>"{log.prompt}"</span>
                  <span className="text-xs font-semibold flex-shrink-0 px-2 py-0.5 rounded-full"
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
              {s.aiLog.length} AI interaction{s.aiLog.length !== 1 ? 's' : ''} — transparently disclosed in the Authenticity Report per IBM Granite Guardian protocol
            </p>
          </>
        )}
      </div>
    </div>
  );
}
