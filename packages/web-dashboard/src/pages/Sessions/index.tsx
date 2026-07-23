/**
 * @fileoverview Sessions list page — search, filter, sort, and view all writing sessions.
 * Moon Phases design system: #212A31 / #2E3944 / #124E66 / #748D92 / #D3D9D4
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Moon Phases tokens ────────────────────────────────────────────────────────
const MP = {
  surface:  '#212A31',
  elevated: '#2E3944',
  hover:    '#374654',
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

interface Session {
  id:        string;
  title:     string;
  date:      string;
  duration:  number;
  words:     number;
  score:     number;
  status:    'ISSUED' | 'NOT_ELIGIBLE';
  platform:  'word-plugin' | 'web-editor';
  aiAssists: number;
}

const SESSIONS: Session[] = [
  { id: 's-001', title: 'The Ethics of AI Writing Tools',  date: '2024-07-12', duration: 34, words: 1247, score: 91, status: 'ISSUED',       platform: 'word-plugin', aiAssists: 2 },
  { id: 's-002', title: 'Chapter 3 — Research Methods',    date: '2024-07-11', duration: 82, words: 2840, score: 87, status: 'ISSUED',       platform: 'word-plugin', aiAssists: 0 },
  { id: 's-003', title: 'Email Newsletter Draft',          date: '2024-07-10', duration: 18, words: 450,  score: 94, status: 'ISSUED',       platform: 'web-editor',  aiAssists: 1 },
  { id: 's-004', title: 'Blog Post — AI Creativity',       date: '2024-07-09', duration: 12, words: 820,  score: 52, status: 'NOT_ELIGIBLE', platform: 'word-plugin', aiAssists: 5 },
  { id: 's-005', title: 'Academic Abstract — ML Study',    date: '2024-07-08', duration: 25, words: 380,  score: 89, status: 'ISSUED',       platform: 'web-editor',  aiAssists: 0 },
  { id: 's-006', title: 'Literature Review Draft',         date: '2024-07-07', duration: 95, words: 3200, score: 84, status: 'ISSUED',       platform: 'word-plugin', aiAssists: 3 },
  { id: 's-007', title: 'Conference Proposal',             date: '2024-07-06', duration: 44, words: 1580, score: 76, status: 'ISSUED',       platform: 'web-editor',  aiAssists: 1 },
];

type SortKey     = 'date' | 'words' | 'score' | 'duration';
type FilterStatus = 'all' | 'ISSUED' | 'NOT_ELIGIBLE';

// ─── Session Row Detail Modal ─────────────────────────────────────────────────

function SessionDetailModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const navigate = useNavigate();
  const scoreColor = session.score >= 80 ? MP.success : session.score >= 70 ? MP.warning : MP.error;
  const c = 2 * Math.PI * 42;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label={`Session: ${session.title}`}>
      <div className="rounded-2xl w-full max-w-lg shadow-2xl border overflow-hidden"
        style={{ background: MP.surface, borderColor: `${MP.teal}35` }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b flex items-start justify-between"
          style={{ borderColor: MP.border }}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {session.status === 'ISSUED'
                ? <span className="ca-badge-issued">✓ ISSUED</span>
                : <span className="ca-badge-error">✗ NOT ELIGIBLE</span>}
              <span className="text-xs font-mono" style={{ color: MP.muted }}>#{session.id}</span>
            </div>
            <h2 className="text-lg font-bold leading-tight" style={{ color: MP.text }}>{session.title}</h2>
          </div>
          <button onClick={onClose} className="ca-btn-ghost p-2 rounded-xl ml-4 flex-shrink-0"
            aria-label="Close dialog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Score ring + stats */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="42" fill="none" stroke={MP.elevated} strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8"
                  strokeDasharray={`${(session.score / 100) * c} ${c}`}
                  strokeLinecap="round" transform="rotate(-90 50 50)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono" style={{ color: scoreColor }}>{session.score}</span>
                <span className="text-[10px]" style={{ color: MP.muted }}>/100</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                { label: 'Duration',  value: `${session.duration}m`,                                  icon: '⏱' },
                { label: 'Words',     value: session.words.toLocaleString(),                           icon: '📝' },
                { label: 'Platform',  value: session.platform === 'word-plugin' ? 'Word' : 'Web',     icon: '💻' },
                { label: 'AI Assists',value: `${session.aiAssists}×`,                                  icon: '🤖' },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 border"
                  style={{ background: MP.elevated, borderColor: MP.border }}>
                  <div className="text-xs" style={{ color: MP.muted }}>{item.icon} {item.label}</div>
                  <div className="font-mono font-bold text-sm mt-0.5" style={{ color: MP.text }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { onClose(); navigate('/analytics'); }}
              className="ca-btn-secondary flex-1 text-sm">View Analytics</button>
            <button onClick={() => { onClose(); navigate('/reports'); }}
              className="ca-btn-primary flex-1 text-sm">View Report →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sessions Page ────────────────────────────────────────────────────────────

export function SessionsPage() {
  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState<FilterStatus>('all');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'word-plugin' | 'web-editor'>('all');
  const [sortKey, setSortKey]             = useState<SortKey>('date');
  const [sortDir, setSortDir]             = useState<'asc' | 'desc'>('desc');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => SESSIONS
    .filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    .filter(s => filterStatus === 'all' || s.status === filterStatus)
    .filter(s => filterPlatform === 'all' || s.platform === filterPlatform)
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'date') return mul * a.date.localeCompare(b.date);
      return mul * (a[sortKey] - b[sortKey]);
    }), [search, filterStatus, filterPlatform, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className={`ml-1 text-xs transition-all ${sortKey === col ? 'opacity-100' : 'opacity-30'}`}>
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="ca-page">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black" style={{ color: MP.text }}>Writing Sessions</h1>
          <p className="text-sm mt-1" style={{ color: MP.muted }}>
            <span className="font-semibold" style={{ color: MP.success }}>
              {SESSIONS.filter(s => s.status === 'ISSUED').length}
            </span>
            <span> / {SESSIONS.length} sessions issued reports</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: MP.muted }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search sessions…"
              className="ca-input pl-9 w-52 text-sm" aria-label="Search sessions" />
          </div>

          {/* Status filter */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: MP.border }}>
            {(['all', 'ISSUED', 'NOT_ELIGIBLE'] as FilterStatus[]).map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={filterStatus === f
                  ? { background: `${MP.teal}28`, color: MP.teal }
                  : { color: MP.muted }}>
                {f === 'all' ? 'All' : f === 'ISSUED' ? '✓ Issued' : '✗ Failed'}
              </button>
            ))}
          </div>

          {/* Platform filter */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: MP.border }}>
            {(['all', 'word-plugin', 'web-editor'] as const).map(p => (
              <button key={p} onClick={() => setFilterPlatform(p)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={filterPlatform === p
                  ? { background: `${MP.success}20`, color: MP.success }
                  : { color: MP.muted }}>
                {p === 'all' ? 'All' : p === 'word-plugin' ? '📝 Word' : '🌐 Web'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="ca-card overflow-hidden">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Document</th>
              <th className="cursor-pointer select-none" onClick={() => toggleSort('date')}
                style={{ color: sortKey === 'date' ? MP.teal : MP.muted }}>
                Date <SortIcon col="date" />
              </th>
              <th className="cursor-pointer select-none" onClick={() => toggleSort('duration')}
                style={{ color: sortKey === 'duration' ? MP.teal : MP.muted }}>
                Duration <SortIcon col="duration" />
              </th>
              <th className="cursor-pointer select-none" onClick={() => toggleSort('words')}
                style={{ color: sortKey === 'words' ? MP.teal : MP.muted }}>
                Words <SortIcon col="words" />
              </th>
              <th className="cursor-pointer select-none" onClick={() => toggleSort('score')}
                style={{ color: sortKey === 'score' ? MP.teal : MP.muted }}>
                Score <SortIcon col="score" />
              </th>
              <th>Platform</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12" style={{ color: MP.muted }}>
                  No sessions match your filters
                </td>
              </tr>
            ) : filtered.map(session => (
              <tr key={session.id} className="cursor-pointer group"
                onClick={() => setSelectedSession(session)}
                onKeyDown={e => e.key === 'Enter' && setSelectedSession(session)}
                tabIndex={0}>
                <td>
                  <div className="font-medium transition-colors group-hover:opacity-90" style={{ color: MP.text }}>
                    {session.title}
                  </div>
                  {session.aiAssists > 0 && (
                    <div className="text-xs mt-0.5" style={{ color: MP.muted }}>
                      🤖 {session.aiAssists} AI assist{session.aiAssists > 1 ? 's' : ''}
                    </div>
                  )}
                </td>
                <td className="text-xs font-mono" style={{ color: MP.muted }}>{session.date}</td>
                <td className="text-sm" style={{ color: MP.muted }}>{session.duration}m</td>
                <td className="font-mono font-medium" style={{ color: MP.text }}>{session.words.toLocaleString()}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm"
                      style={{ color: session.score >= 80 ? MP.success : session.score >= 70 ? MP.warning : MP.error }}>
                      {session.score}
                    </span>
                    <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: MP.elevated }}>
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width:      `${session.score}%`,
                          background: session.score >= 80 ? MP.success : session.score >= 70 ? MP.warning : MP.error,
                        }} />
                    </div>
                  </div>
                </td>
                <td>
                  <span className="text-xs font-medium px-2 py-1 rounded-lg font-mono"
                    style={{ background: `${MP.teal}12`, color: MP.textSoft }}>
                    {session.platform === 'word-plugin' ? '📝 Word' : '🌐 Web'}
                  </span>
                </td>
                <td>
                  {session.status === 'ISSUED'
                    ? <span className="ca-badge-issued">✓ Issued</span>
                    : <span className="ca-badge-error">✗ Not Eligible</span>}
                </td>
                <td className="text-right">
                  <button className="ca-btn-ghost text-xs py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Summary Footer ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Words', value: SESSIONS.reduce((a, s) => a + s.words, 0).toLocaleString(), color: MP.teal    },
          { label: 'Total Time',  value: `${SESSIONS.reduce((a, s) => a + s.duration, 0)}m`,         color: MP.success },
          { label: 'Avg Score',   value: `${Math.round(SESSIONS.reduce((a, s) => a + s.score, 0) / SESSIONS.length)}/100`, color: MP.ibm },
        ].map(stat => (
          <div key={stat.label} className="ca-card p-4 text-center">
            <div className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: MP.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Session Detail Modal ─────────────────────────────────────────── */}
      {selectedSession && (
        <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
}
