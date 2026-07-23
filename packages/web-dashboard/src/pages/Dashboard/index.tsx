/**
 * @fileoverview Dashboard overview — live stats, cadence trend, recent sessions.
 * Futuristic deep-dark design with neon glows, animated counters, and working actions.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STATS = {
  totalSessions: 24,
  reportsIssued: 21,
  averageCadenceScore: 83,
  aiAssistUsagePercent: 18,
  totalWordsWritten: 48_250,
};

const CADENCE_HISTORY = [
  { day: 'Mon', score: 78 }, { day: 'Tue', score: 85 },
  { day: 'Wed', score: 82 }, { day: 'Thu', score: 91 },
  { day: 'Fri', score: 88 }, { day: 'Sat', score: 76 },
  { day: 'Sun', score: 89 },
];

const WORD_TREND = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  words: Math.floor(2800 + Math.sin(i * 0.7) * 1400 + Math.random() * 600),
}));

const PIE_DATA = [
  { name: 'Reports Issued', value: 21, color: '#10B981' },
  { name: 'Not Eligible', value: 3, color: '#EF4444' },
];

const RECENT_SESSIONS = [
  { id: 's-001', title: 'The Ethics of AI Writing Tools', date: '2024-07-12', words: 1247, score: 91, status: 'ISSUED' },
  { id: 's-002', title: 'Chapter 3 — Research Methods', date: '2024-07-11', words: 2840, score: 87, status: 'ISSUED' },
  { id: 's-003', title: 'Email Newsletter Draft', date: '2024-07-10', words: 450, score: 94, status: 'ISSUED' },
  { id: 's-004', title: 'Blog Post — AI Creativity', date: '2024-07-09', words: 820, score: 52, status: 'NOT_ELIGIBLE' },
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

function StatCard({
  label, value, unit, icon, trend, color, onClick,
}: {
  label: React.ReactNode; value: React.ReactNode; unit?: string; icon: React.ReactNode;
  trend?: string; color: 'violet' | 'emerald' | 'ai' | 'info'; onClick?: () => void;
}) {
  const borders = { violet: '#7C3AED40', emerald: '#10B98140', ai: '#8B5CF640', info: '#3B82F640' };
  const glows = { violet: '#7C3AED', emerald: '#10B981', ai: '#8B5CF6', info: '#3B82F6' };
  const fromColors = {
    violet: 'from-[#7C3AED18] to-transparent',
    emerald: 'from-[#10B98118] to-transparent',
    ai: 'from-[#8B5CF618] to-transparent',
    info: 'from-[#3B82F618] to-transparent',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group ${onClick ? 'cursor-pointer' : ''} bg-gradient-to-br ${fromColors[color]}`}
      style={{ borderColor: borders[color], boxShadow: `0 0 0 0 ${glows[color]}` }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 20px 2px ${glows[color]}40`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20"
        style={{ background: glows[color], transform: 'translate(30%, -30%)' }} />

      <div className="relative flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${glows[color]}20`, color: glows[color] }}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ color: glows[color], background: `${glows[color]}15` }}>
            {trend}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 relative">
        <span className="text-3xl font-black text-alibi-text font-mono">{value}</span>
        {unit && <span className="text-sm text-alibi-text-muted">{unit}</span>}
      </div>
      <div className="text-sm text-alibi-text-muted mt-1 relative">{label}</div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [sessionCreated, setSessionCreated] = useState(false);

  const handleStartSession = () => {
    if (newSessionTitle.trim()) {
      setSessionCreated(true);
      setTimeout(() => {
        setShowNewSessionModal(false);
        setSessionCreated(false);
        setNewSessionTitle('');
        // In production: POST /api/sessions and open Word plugin
      }, 1800);
    }
  };

  return (
    <div className="ca-page">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#7C3AED30] p-8"
        style={{ background: 'linear-gradient(135deg, #7C3AED18 0%, #080713 50%, #10B98110 100%)' }}>
        {/* Animated rings */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ transform: 'translate(30%, -30%)' }}>
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full opacity-20">
            <circle cx="100" cy="100" r="90" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="4 8" className="animate-spin" style={{ animationDuration: '30s' }} />
            <circle cx="100" cy="100" r="65" stroke="#10B981" strokeWidth="0.5" strokeDasharray="2 4" className="animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
            <circle cx="100" cy="100" r="40" stroke="#8B5CF6" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
              style={{ background: '#10B98120', borderColor: '#10B98140', color: '#10B981' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              System Active
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
              style={{ background: '#8B5CF620', borderColor: '#8B5CF640', color: '#A78BFA' }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              IBM Granite Connected
            </span>
          </div>

          <h1 className="text-4xl font-black text-alibi-text mb-3 leading-tight">
            Your <span className="text-gradient-violet">Authenticity</span>
            <br />Command Center
          </h1>
          <p className="text-alibi-text-muted text-base leading-relaxed max-w-lg">
            Every word you write, every revision you make — captured, protected, and provable.
            Your creative process is your strongest evidence.
          </p>

          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <button
              onClick={() => setShowNewSessionModal(true)}
              className="ca-btn-primary flex items-center gap-2 px-6 py-3 text-sm font-semibold"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Start New Session
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="ca-btn-secondary flex items-center gap-2 px-6 py-3 text-sm font-semibold"
            >
              View Analytics →
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="ca-btn-ghost flex items-center gap-2 px-5 py-3 text-sm"
            >
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
          color="violet" trend="↑ 3 this week"
          onClick={() => navigate('/sessions')}
        />
        <StatCard
          label="Reports Issued"
          value={<AnimatedCounter target={MOCK_STATS.reportsIssued} />}
          unit={`/ ${MOCK_STATS.totalSessions}`}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
          color="emerald" trend="87.5% success"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          label="Avg Cadence Score"
          value={<AnimatedCounter target={MOCK_STATS.averageCadenceScore} />}
          unit="/100"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
          color="ai" trend="↑ 2.4 pts"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          label="Words Documented"
          value={<AnimatedCounter target={Math.floor(MOCK_STATS.totalWordsWritten / 1000)} suffix="K" />}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>}
          color="info" trend="~2K this week"
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cadence Trend */}
        <div className="lg:col-span-2 ca-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-alibi-text">Cadence Score — 7 Days</h3>
              <p className="text-xs text-alibi-text-muted mt-0.5">Typing rhythm authenticity quality</p>
            </div>
            <button onClick={() => navigate('/analytics')}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#7C3AED40] text-[#A78BFA] hover:bg-[#7C3AED20] transition-all">
              Full Analysis →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CADENCE_HISTORY}>
              <defs>
                <linearGradient id="cadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2A4030" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1E1B2E', border: '1px solid #7C3AED40', borderRadius: '12px', color: '#E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={2.5} fill="url(#cadGrad)"
                dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#A78BFA', stroke: '#7C3AED', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Report Status Donut */}
        <div className="ca-card p-6">
          <h3 className="font-bold text-alibi-text mb-1">Report Success Rate</h3>
          <p className="text-xs text-alibi-text-muted mb-3">Issued vs Not Eligible</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                paddingAngle={4} dataKey="value">
                {PIE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E1B2E', border: '1px solid #2D2A40', borderRadius: '12px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5 mt-2">
            {PIE_DATA.map(entry => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}80` }} />
                  <span className="text-alibi-text-muted">{entry.name}</span>
                </div>
                <span className="font-mono font-bold text-alibi-text">{entry.value}</span>
              </div>
            ))}
            <div className="pt-2 text-center text-xs text-[#10B981] font-semibold">
              {((21 / 24) * 100).toFixed(0)}% Authenticity Rate
            </div>
          </div>
        </div>
      </div>

      {/* ── Word Production Trend ────────────────────────────────────────────── */}
      <div className="ca-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-alibi-text">Word Production — Last 14 Days</h3>
            <p className="text-xs text-alibi-text-muted mt-0.5">Daily authenticated word output</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: '#10B98115', color: '#10B981' }}>
            ↑ Active
          </span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={WORD_TREND}>
            <defs>
              <linearGradient id="wordGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2A4020" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `D${v}`} />
            <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1E1B2E', border: '1px solid #10B98140', borderRadius: '10px', fontSize: 11 }} />
            <Area type="monotone" dataKey="words" stroke="#10B981" strokeWidth={2} fill="url(#wordGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent Sessions ──────────────────────────────────────────────────── */}
      <div className="ca-card overflow-hidden">
        <div className="px-6 py-4 border-b border-alibi-border flex items-center justify-between">
          <h3 className="font-bold text-alibi-text">Recent Sessions</h3>
          <button onClick={() => navigate('/sessions')}
            className="text-xs text-[#A78BFA] hover:text-[#7C3AED] transition-colors font-medium">
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
                onClick={() => navigate('/sessions')}>
                <td><span className="text-alibi-text font-medium">{session.title}</span></td>
                <td className="text-alibi-text-muted text-xs font-mono">{session.date}</td>
                <td className="font-mono text-alibi-text">{session.words.toLocaleString()}</td>
                <td>
                  <span className={`font-mono font-bold ${session.score >= 80 ? 'text-[#10B981]' : session.score >= 70 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                    {session.score}
                  </span>
                  <span className="text-alibi-text-subtle text-xs">/100</span>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-alibi-bg-card border border-[#7C3AED40] rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-alibi-text mb-2">Start New Writing Session</h2>
            <p className="text-sm text-alibi-text-muted mb-6">
              Give your document a title so we can track this session in your Process Ledger.
            </p>
            {sessionCreated ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🚀</div>
                <div className="text-[#10B981] font-bold text-lg">Session Started!</div>
                <div className="text-alibi-text-muted text-sm mt-1">Process Ledger is now recording...</div>
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
