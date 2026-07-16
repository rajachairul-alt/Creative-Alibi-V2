/**
 * @fileoverview Dashboard overview page with live stats, recent sessions, and quick actions.
 */

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// ─── Mock data (replace with real API calls) ────────────────────────────────
const MOCK_STATS = {
  totalSessions: 24,
  reportsIssued: 21,
  averageCadenceScore: 83,
  aiAssistUsagePercent: 18,
  totalWordsWritten: 48_250,
};

const MOCK_CADENCE_HISTORY = [
  { day: 'Mon', score: 78 }, { day: 'Tue', score: 85 },
  { day: 'Wed', score: 82 }, { day: 'Thu', score: 91 },
  { day: 'Fri', score: 88 }, { day: 'Sat', score: 76 },
  { day: 'Sun', score: 89 },
];

const MOCK_RECENT_SESSIONS = [
  { id: 's-001', title: 'The Ethics of AI Writing Tools', date: '2024-07-12', words: 1247, score: 91, status: 'ISSUED' },
  { id: 's-002', title: 'Chapter 3 — Research Methods', date: '2024-07-11', words: 2840, score: 87, status: 'ISSUED' },
  { id: 's-003', title: 'Email Newsletter Draft', date: '2024-07-10', words: 450, score: 94, status: 'ISSUED' },
  { id: 's-004', title: 'Blog Post — AI Creativity', date: '2024-07-09', words: 820, score: 72, status: 'NOT_ELIGIBLE' },
];

const PIE_DATA = [
  { name: 'Reports Issued', value: 21, color: '#10B981' },
  { name: 'Not Eligible', value: 3, color: '#EF4444' },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, unit, icon, trend, color
}: {
  label: string; value: string | number; unit?: string;
  icon: React.ReactNode; trend?: string; color: 'violet' | 'emerald' | 'ai' | 'info';
}) {
  const colorMap = {
    violet: 'from-alibi-violet/20 to-alibi-violet/5 border-alibi-violet/20',
    emerald: 'from-alibi-emerald/20 to-alibi-emerald/5 border-alibi-emerald/20',
    ai: 'from-alibi-ai/20 to-alibi-ai/5 border-alibi-ai/20',
    info: 'from-alibi-info/20 to-alibi-info/5 border-alibi-info/20',
  };
  const iconColorMap = {
    violet: 'bg-alibi-violet/20 text-alibi-violet-light',
    emerald: 'bg-alibi-emerald/20 text-alibi-emerald-light',
    ai: 'bg-alibi-ai/20 text-alibi-ai-light',
    info: 'bg-alibi-info/20 text-blue-400',
  };

  return (
    <div className={`ca-card p-5 bg-gradient-to-br ${colorMap[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs text-alibi-emerald font-medium">{trend}</span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-alibi-text font-mono">{value}</span>
        {unit && <span className="text-sm text-alibi-text-muted">{unit}</span>}
      </div>
      <div className="text-sm text-alibi-text-muted mt-1">{label}</div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export function DashboardPage() {
  return (
    <div className="ca-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-alibi-violet/20 via-alibi-bg-elevated to-alibi-emerald/10 border border-alibi-violet/20 p-8">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 opacity-20">
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="150" cy="50" r="120" stroke="#7C3AED" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="150" cy="50" r="80" stroke="#10B981" strokeWidth="0.5" strokeDasharray="2 2" />
          </svg>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="ca-badge-issued">
              <span className="w-1.5 h-1.5 rounded-full bg-alibi-emerald animate-pulse" />
              System Active
            </span>
            <span className="ca-badge-ibm">IBM Granite Connected</span>
          </div>
          <h2 className="text-3xl font-black text-alibi-text mb-2">
            Your <span className="text-gradient-violet">Authenticity</span> Dashboard
          </h2>
          <p className="text-alibi-text-muted max-w-xl">
            Every word you write, every revision you make — captured, protected, and provable.
            Your creative process is your strongest evidence.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <button className="ca-btn-primary">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Start New Session
            </button>
            <button className="ca-btn-secondary">
              Open Word Plugin →
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Sessions"
          value={MOCK_STATS.totalSessions}
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><polyline stroke="white" fill="none" strokeWidth="2" points="12 6 12 12 16 14" /></svg>}
          color="violet"
          trend="↑ 3 this week"
        />
        <StatCard
          label="Reports Issued"
          value={MOCK_STATS.reportsIssued}
          unit={`/ ${MOCK_STATS.totalSessions}`}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
          color="emerald"
          trend="87.5% success"
        />
        <StatCard
          label="Avg Cadence Score"
          value={MOCK_STATS.averageCadenceScore}
          unit="/100"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
          color="ai"
          trend="↑ 2.4 pts"
        />
        <StatCard
          label="Words Written"
          value={`${(MOCK_STATS.totalWordsWritten / 1000).toFixed(1)}K`}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>}
          color="info"
          trend="~2K this week"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cadence Trend */}
        <div className="lg:col-span-2 ca-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-alibi-text">Cadence Score Trend</h3>
              <p className="text-xs text-alibi-text-muted mt-0.5">7-day typing rhythm quality</p>
            </div>
            <span className="ca-badge-issued">↑ Trending Up</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MOCK_CADENCE_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2A40" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1E1B2E', border: '1px solid #2D2A40', borderRadius: '12px', color: '#E2E8F0' }}
                cursor={{ stroke: '#7C3AED', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7C3AED"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#A78BFA' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Report Status Donut */}
        <div className="ca-card p-6">
          <h3 className="font-semibold text-alibi-text mb-1">Report Success Rate</h3>
          <p className="text-xs text-alibi-text-muted mb-4">Issued vs Not Eligible</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {PIE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1E1B2E', border: '1px solid #2D2A40', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PIE_DATA.map(entry => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                  <span className="text-alibi-text-muted">{entry.name}</span>
                </div>
                <span className="font-mono text-alibi-text font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="ca-card overflow-hidden">
        <div className="px-6 py-4 border-b border-alibi-border flex items-center justify-between">
          <h3 className="font-semibold text-alibi-text">Recent Sessions</h3>
          <a href="/sessions" className="text-xs text-alibi-violet-light hover:text-alibi-violet transition-colors">
            View all →
          </a>
        </div>
        <table className="ca-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Date</th>
              <th>Words</th>
              <th>Score</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RECENT_SESSIONS.map(session => (
              <tr key={session.id} className="cursor-pointer">
                <td>
                  <span className="text-alibi-text font-medium">{session.title}</span>
                </td>
                <td className="text-alibi-text-muted text-sm font-mono">{session.date}</td>
                <td className="text-alibi-text font-mono">{session.words.toLocaleString()}</td>
                <td>
                  <span className={`font-mono font-bold ${session.score >= 80 ? 'text-alibi-emerald' : session.score >= 70 ? 'text-alibi-warning' : 'text-alibi-error'}`}>
                    {session.score}
                  </span>
                  <span className="text-alibi-text-subtle text-xs">/100</span>
                </td>
                <td>
                  {session.status === 'ISSUED' ? (
                    <span className="ca-badge-issued">✓ Issued</span>
                  ) : (
                    <span className="ca-badge-error">✗ Not Eligible</span>
                  )}
                </td>
                <td className="text-right">
                  <button className="ca-btn-ghost text-xs py-1">View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
