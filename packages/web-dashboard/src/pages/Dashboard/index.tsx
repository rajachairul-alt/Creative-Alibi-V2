/**
 * @fileoverview Dashboard overview — live stats, cadence trend, recent sessions.
 * Moon Phases design system: #212A31 / #2E3944 / #124E66 / #748D92 / #D3D9D4
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ─── Moon Phases tokens ────────────────────────────────────────────────────────
const MP = {
  bg:        '#1A2229',
  surface:   '#212A31',
  elevated:  '#2E3944',
  hover:     '#374654',
  tealDark:  '#124E66',
  teal:      '#2A9FBF',
  tealHover: '#3AB4D4',
  text:      '#D3D9D4',
  textSoft:  '#A8B2B7',
  muted:     '#748D92',
  border:    '#374654',
  success:   '#4CC38A',
  error:     '#E07070',
  warning:   '#E8C547',
  ibm:       '#7EB8D4',
} as const;

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STATS = {
  totalSessions:         24,
  reportsIssued:         21,
  averageCadenceScore:   83,
  aiAssistUsagePercent:  18,
  totalWordsWritten:     48_250,
};

const CADENCE_HISTORY = [
  { day: 'Mon', score: 78 }, { day: 'Tue', score: 85 },
  { day: 'Wed', score: 82 }, { day: 'Thu', score: 91 },
  { day: 'Fri', score: 88 }, { day: 'Sat', score: 76 },
  { day: 'Sun', score: 89 },
];

const WORD_TREND = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  words: Math.floor(2800 + Math.sin(i * 0.7) * 1400 + (i * 37 % 600)),
}));

const PIE_DATA = [
  { name: 'Reports Issued',  value: 21, color: MP.success },
  { name: 'Not Eligible',    value: 3,  color: MP.error   },
];

const RECENT_SESSIONS = [
  { id: 's-001', title: 'The Ethics of AI Writing Tools',  date: '2024-07-12', words: 1247, score: 91, status: 'ISSUED'       },
  { id: 's-002', title: 'Chapter 3 — Research Methods',    date: '2024-07-11', words: 2840, score: 87, status: 'ISSUED'       },
  { id: 's-003', title: 'Email Newsletter Draft',          date: '2024-07-10', words: 450,  score: 94, status: 'ISSUED'       },
  { id: 's-004', title: 'Blog Post — AI Creativity',       date: '2024-07-09', words: 820,  score: 52, status: 'NOT_ELIGIBLE' },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = target / 40;
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      setCount(Math.floor(cur));
      if (cur >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}{suffix}</>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

type CardAccent = 'teal' | 'success' | 'ibm' | 'warning';

function StatCard({
  label, value, unit, icon, trend, accent, onClick,
}: {
  label: React.ReactNode; value: React.ReactNode; unit?: string; icon: React.ReactNode;
  trend?: string; accent: CardAccent; onClick?: () => void;
}) {
  const accentMap: Record<CardAccent, string> = {
    teal:    MP.teal,
    success: MP.success,
    ibm:     MP.ibm,
    warning: MP.warning,
  };
  const col = accentMap[accent];

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 group ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{
        background:   MP.surface,
        borderColor:  `${col}40`,
        outline:      'none',
      }}
      onFocus={e  => { e.currentTarget.style.boxShadow = `0 0 0 3px ${MP.teal}80`; }}
      onBlur={e   => { e.currentTarget.style.boxShadow = 'none'; }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${col}25`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* subtle top-right tint */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ background: col, transform: 'translate(40%, -40%)' }} />

      <div className="relative flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${col}18`, color: col }}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ color: col, background: `${col}15` }}>
            {trend}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 relative">
        <span className="text-3xl font-black font-mono" style={{ color: MP.text }}>{value}</span>
        {unit && <span className="text-sm" style={{ color: MP.muted }}>{unit}</span>}
      </div>
      <div className="text-sm mt-1 relative" style={{ color: MP.muted }}>{label}</div>
    </div>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs border shadow-lg"
      style={{ background: MP.elevated, borderColor: MP.border, color: MP.text }}>
      <div style={{ color: MP.muted }}>{label}</div>
      <div className="font-mono font-bold">{payload[0].value.toLocaleString()}</div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionTitle, setNewSessionTitle]         = useState('');
  const [sessionCreated, setSessionCreated]           = useState(false);

  const handleStartSession = () => {
    if (newSessionTitle.trim()) {
      setSessionCreated(true);
      setTimeout(() => {
        setShowNewSessionModal(false);
        setSessionCreated(false);
        setNewSessionTitle('');
      }, 1800);
    }
  };

  return (
    <div className="ca-page">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border p-8"
        style={{ background: `linear-gradient(135deg, ${MP.tealDark}30 0%, ${MP.surface} 60%, ${MP.elevated} 100%)`, borderColor: `${MP.teal}35` }}>

        {/* Animated orbit rings — subtle, respectful of reduced-motion */}
        <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none opacity-15"
          style={{ transform: 'translate(35%, -35%)' }}>
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <circle cx="100" cy="100" r="90" stroke={MP.teal}  strokeWidth="0.6" strokeDasharray="4 8"
              className="motion-safe:animate-spin" style={{ animationDuration: '40s' }} />
            <circle cx="100" cy="100" r="60" stroke={MP.ibm}   strokeWidth="0.6" strokeDasharray="2 5"
              className="motion-safe:animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
            <circle cx="100" cy="100" r="32" stroke={MP.muted} strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative max-w-2xl">
          {/* Status pills */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
              style={{ background: `${MP.success}18`, borderColor: `${MP.success}40`, color: MP.success }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: MP.success }} />
              System Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
              style={{ background: `${MP.ibm}18`, borderColor: `${MP.ibm}40`, color: MP.ibm }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              IBM Granite 3 Connected
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
              style={{ background: `${MP.teal}18`, borderColor: `${MP.teal}40`, color: MP.teal }}>
              watsonx.ai
            </span>
          </div>

          <h1 className="text-4xl font-black leading-tight mb-3" style={{ color: MP.text }}>
            Your Authenticity
            <br />
            <span style={{ color: MP.teal }}>Command Center</span>
          </h1>
          <p className="text-base leading-relaxed max-w-lg" style={{ color: MP.textSoft }}>
            Every word you write, every revision you make — captured, protected, and provable.
            Your creative process is your strongest evidence.
          </p>

          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <button
              onClick={() => setShowNewSessionModal(true)}
              className="ca-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
              aria-label="Start New Writing Session"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Start New Session
            </button>
            <button onClick={() => navigate('/analytics')}
              className="ca-btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold">
              View Analytics →
            </button>
            <button onClick={() => navigate('/reports')}
              className="ca-btn-ghost inline-flex items-center gap-2 px-5 py-3 text-sm">
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Sessions"
          value={<AnimatedCounter target={MOCK_STATS.totalSessions} />}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          accent="teal" trend="↑ 3 this week"
          onClick={() => navigate('/sessions')}
        />
        <StatCard
          label="Reports Issued"
          value={<AnimatedCounter target={MOCK_STATS.reportsIssued} />}
          unit={`/ ${MOCK_STATS.totalSessions}`}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
          accent="success" trend="87.5% success"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          label="Avg Cadence Score"
          value={<AnimatedCounter target={MOCK_STATS.averageCadenceScore} />}
          unit="/100"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
          accent="ibm" trend="↑ 2.4 pts"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          label="Words Documented"
          value={<AnimatedCounter target={Math.floor(MOCK_STATS.totalWordsWritten / 1000)} suffix="K" />}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>}
          accent="warning" trend="~2K this week"
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cadence Trend */}
        <div className="lg:col-span-2 ca-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold" style={{ color: MP.text }}>Cadence Score — 7 Days</h3>
              <p className="text-xs mt-0.5" style={{ color: MP.muted }}>Typing rhythm authenticity quality</p>
            </div>
            <button onClick={() => navigate('/analytics')}
              className="text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={{ borderColor: `${MP.teal}40`, color: MP.teal }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = `${MP.teal}18`; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}>
              Full Analysis →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CADENCE_HISTORY}>
              <defs>
                <linearGradient id="cadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={MP.teal} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={MP.teal} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={`${MP.border}60`} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: MP.muted }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: MP.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="score" stroke={MP.teal} strokeWidth={2.5} fill="url(#cadGrad)"
                dot={{ r: 4, fill: MP.teal, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: MP.tealHover, stroke: MP.teal, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Report Status Donut */}
        <div className="ca-card p-6">
          <h3 className="font-bold mb-1" style={{ color: MP.text }}>Report Success Rate</h3>
          <p className="text-xs mb-3" style={{ color: MP.muted }}>Issued vs Not Eligible</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                paddingAngle={4} dataKey="value">
                {PIE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: MP.elevated, border: `1px solid ${MP.border}`, borderRadius: '12px', fontSize: 12, color: MP.text }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5 mt-2">
            {PIE_DATA.map(entry => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                  <span style={{ color: MP.muted }}>{entry.name}</span>
                </div>
                <span className="font-mono font-bold" style={{ color: MP.text }}>{entry.value}</span>
              </div>
            ))}
            <div className="pt-2 text-center text-xs font-semibold" style={{ color: MP.success }}>
              {((21 / 24) * 100).toFixed(0)}% Authenticity Rate
            </div>
          </div>
        </div>
      </div>

      {/* ── Word Production Trend ────────────────────────────────────────────── */}
      <div className="ca-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold" style={{ color: MP.text }}>Word Production — Last 14 Days</h3>
            <p className="text-xs mt-0.5" style={{ color: MP.muted }}>Daily authenticated word output</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: `${MP.success}15`, color: MP.success }}>
            ↑ Active
          </span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={WORD_TREND}>
            <defs>
              <linearGradient id="wordGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={MP.success} stopOpacity={0.35} />
                <stop offset="95%" stopColor={MP.success} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={`${MP.border}40`} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} tickFormatter={v => `D${v}`} />
            <YAxis tick={{ fontSize: 10, fill: MP.muted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: MP.elevated, border: `1px solid ${MP.border}`, borderRadius: '10px', fontSize: 11, color: MP.text }} />
            <Area type="monotone" dataKey="words" stroke={MP.success} strokeWidth={2} fill="url(#wordGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent Sessions ──────────────────────────────────────────────────── */}
      <div className="ca-card overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: MP.border }}>
          <h3 className="font-bold" style={{ color: MP.text }}>Recent Sessions</h3>
          <button onClick={() => navigate('/sessions')}
            className="text-xs font-medium transition-colors"
            style={{ color: MP.teal }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = MP.tealHover; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = MP.teal; }}>
            View all sessions →
          </button>
        </div>
        <table className="ca-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Date</th>
              <th>Words</th>
              <th>Score</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {RECENT_SESSIONS.map(session => (
              <tr key={session.id} className="cursor-pointer"
                onClick={() => navigate('/sessions')}
                onKeyDown={e => e.key === 'Enter' && navigate('/sessions')}
                tabIndex={0}>
                <td><span className="font-medium" style={{ color: MP.text }}>{session.title}</span></td>
                <td className="text-xs font-mono" style={{ color: MP.muted }}>{session.date}</td>
                <td className="font-mono" style={{ color: MP.text }}>{session.words.toLocaleString()}</td>
                <td>
                  <span className="font-mono font-bold"
                    style={{ color: session.score >= 80 ? MP.success : session.score >= 70 ? MP.warning : MP.error }}>
                    {session.score}
                  </span>
                  <span className="text-xs" style={{ color: MP.muted }}>/100</span>
                </td>
                <td>
                  {session.status === 'ISSUED'
                    ? <span className="ca-badge-issued">✓ Issued</span>
                    : <span className="ca-badge-error">✗ Not Eligible</span>}
                </td>
                <td className="text-right">
                  <button className="ca-btn-ghost text-xs py-1">View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── New Session Modal ────────────────────────────────────────────────── */}
      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog" aria-modal="true" aria-label="Start New Writing Session">
          <div className="rounded-2xl w-full max-w-md p-8 shadow-2xl border"
            style={{ background: MP.surface, borderColor: `${MP.teal}40` }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: MP.text }}>Start New Writing Session</h2>
            <p className="text-sm mb-6" style={{ color: MP.muted }}>
              Give your document a title so we can track this session in your Process Ledger.
            </p>
            {sessionCreated ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🚀</div>
                <div className="font-bold text-lg" style={{ color: MP.success }}>Session Started!</div>
                <div className="text-sm mt-1" style={{ color: MP.muted }}>Process Ledger is now recording…</div>
              </div>
            ) : (
              <>
                <input
                  autoFocus
                  value={newSessionTitle}
                  onChange={e => setNewSessionTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStartSession()}
                  placeholder="e.g. Chapter 4 — Analysis Results"
                  className="ca-input w-full mb-4"
                />
                <div className="flex gap-3">
                  <button onClick={handleStartSession} disabled={!newSessionTitle.trim()}
                    className="ca-btn-primary flex-1">
                    🚀 Start Session
                  </button>
                  <button onClick={() => setShowNewSessionModal(false)}
                    className="ca-btn-ghost flex-1">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
