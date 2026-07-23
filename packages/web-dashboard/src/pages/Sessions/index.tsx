/**
 * @fileoverview Sessions list page — search, filter, sort, and view all writing sessions.
 * Futuristic design with glow effects and functional filters.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Session {
  id: string;
  title: string;
  date: string;
  duration: number;
  words: number;
  score: number;
  status: 'ISSUED' | 'NOT_ELIGIBLE';
  platform: 'word-plugin' | 'web-editor';
  aiAssists: number;
}

const SESSIONS: Session[] = [
  { id: 's-001', title: 'The Ethics of AI Writing Tools', date: '2024-07-12', duration: 34, words: 1247, score: 91, status: 'ISSUED', platform: 'word-plugin', aiAssists: 2 },
  { id: 's-002', title: 'Chapter 3 — Research Methods', date: '2024-07-11', duration: 82, words: 2840, score: 87, status: 'ISSUED', platform: 'word-plugin', aiAssists: 0 },
  { id: 's-003', title: 'Email Newsletter Draft', date: '2024-07-10', duration: 18, words: 450, score: 94, status: 'ISSUED', platform: 'web-editor', aiAssists: 1 },
  { id: 's-004', title: 'Blog Post — AI Creativity', date: '2024-07-09', duration: 12, words: 820, score: 52, status: 'NOT_ELIGIBLE', platform: 'word-plugin', aiAssists: 5 },
  { id: 's-005', title: 'Academic Abstract — ML Study', date: '2024-07-08', duration: 25, words: 380, score: 89, status: 'ISSUED', platform: 'web-editor', aiAssists: 0 },
  { id: 's-006', title: 'Literature Review Draft', date: '2024-07-07', duration: 95, words: 3200, score: 84, status: 'ISSUED', platform: 'word-plugin', aiAssists: 3 },
  { id: 's-007', title: 'Conference Proposal', date: '2024-07-06', duration: 44, words: 1580, score: 76, status: 'ISSUED', platform: 'web-editor', aiAssists: 1 },
];

type SortKey = 'date' | 'words' | 'score' | 'duration';
type FilterStatus = 'all' | 'ISSUED' | 'NOT_ELIGIBLE';

// ─── Session Row Detail Modal ─────────────────────────────────────────────────

function SessionDetailModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-alibi-bg-card border border-[#7C3AED30] rounded-3xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-alibi-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {session.status === 'ISSUED'
                ? <span className="ca-badge-issued">✓ ISSUED</span>
                : <span className="ca-badge-error">✗ NOT ELIGIBLE</span>}
              <span className="text-xs text-alibi-text-subtle font-mono">#{session.id}</span>
            </div>
            <h2 className="text-lg font-bold text-alibi-text leading-tight">{session.title}</h2>
          </div>
          <button onClick={onClose}
            className="ca-btn-ghost p-2 rounded-xl ml-4 flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Score ring */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#2D2A40" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke={session.score >= 80 ? '#10B981' : session.score >= 70 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="8"
                  strokeDasharray={`${(session.score / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-alibi-text">{session.score}</span>
                <span className="text-[10px] text-alibi-text-muted">/100</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                { label: 'Duration', value: `${session.duration}m`, icon: '⏱' },
                { label: 'Words', value: session.words.toLocaleString(), icon: '📝' },
                { label: 'Platform', value: session.platform === 'word-plugin' ? 'Word Plugin' : 'Web Editor', icon: '💻' },
                { label: 'AI Assists', value: `${session.aiAssists}x`, icon: '🤖' },
              ].map(item => (
                <div key={item.label} className="bg-alibi-bg-elevated rounded-xl p-3">
                  <div className="text-xs text-alibi-text-muted">{item.icon} {item.label}</div>
                  <div className="font-mono font-bold text-alibi-text text-sm mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { onClose(); navigate('/analytics'); }}
              className="ca-btn-secondary flex-1 text-sm">
              View Analytics
            </button>
            <button
              onClick={() => { onClose(); navigate('/reports'); }}
              className="ca-btn-primary flex-1 text-sm">
              View Report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sessions Page ────────────────────────────────────────────────────────────

export function SessionsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'word-plugin' | 'web-editor'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    return SESSIONS
      .filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
      .filter(s => filterStatus === 'all' || s.status === filterStatus)
      .filter(s => filterPlatform === 'all' || s.platform === filterPlatform)
      .sort((a, b) => {
        const mul = sortDir === 'asc' ? 1 : -1;
        if (sortKey === 'date') return mul * a.date.localeCompare(b.date);
        return mul * (a[sortKey] - b[sortKey]);
      });
  }, [search, filterStatus, filterPlatform, sortKey, sortDir]);

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
          <h2 className="ca-page-title">Writing Sessions</h2>
          <p className="text-sm text-alibi-text-muted mt-1">
            <span className="text-[#10B981] font-semibold">{SESSIONS.filter(s => s.status === 'ISSUED').length}</span>
            <span> / {SESSIONS.length} sessions issued reports</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-alibi-text-muted">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="ca-input pl-9 w-52 text-sm" />
          </div>
          {/* Status filter */}
          <div className="flex rounded-xl overflow-hidden border border-alibi-border">
            {(['all', 'ISSUED', 'NOT_ELIGIBLE'] as FilterStatus[]).map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  filterStatus === f
                    ? 'bg-[#7C3AED30] text-[#A78BFA]'
                    : 'text-alibi-text-subtle hover:text-alibi-text hover:bg-alibi-bg-elevated'
                }`}>
                {f === 'all' ? 'All' : f === 'ISSUED' ? '✓ Issued' : '✗ Failed'}
              </button>
            ))}
          </div>
          {/* Platform filter */}
          <div className="flex rounded-xl overflow-hidden border border-alibi-border">
            {(['all', 'word-plugin', 'web-editor'] as const).map(p => (
              <button key={p} onClick={() => setFilterPlatform(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  filterPlatform === p
                    ? 'bg-[#10B98120] text-[#10B981]'
                    : 'text-alibi-text-subtle hover:text-alibi-text hover:bg-alibi-bg-elevated'
                }`}>
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
              <th className="cursor-pointer select-none hover:text-alibi-text transition-colors"
                onClick={() => toggleSort('date')}>
                Date <SortIcon col="date" />
              </th>
              <th className="cursor-pointer select-none hover:text-alibi-text transition-colors"
                onClick={() => toggleSort('duration')}>
                Duration <SortIcon col="duration" />
              </th>
              <th className="cursor-pointer select-none hover:text-alibi-text transition-colors"
                onClick={() => toggleSort('words')}>
                Words <SortIcon col="words" />
              </th>
              <th className="cursor-pointer select-none hover:text-alibi-text transition-colors"
                onClick={() => toggleSort('score')}>
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
                <td colSpan={8} className="text-center py-12 text-alibi-text-muted">
                  No sessions match your filters
                </td>
              </tr>
            ) : filtered.map(session => (
              <tr key={session.id} className="cursor-pointer group"
                onClick={() => setSelectedSession(session)}>
                <td>
                  <div className="font-medium text-alibi-text group-hover:text-[#A78BFA] transition-colors">
                    {session.title}
                  </div>
                  {session.aiAssists > 0 && (
                    <div className="text-xs text-alibi-text-subtle mt-0.5">
                      🤖 {session.aiAssists} AI assist{session.aiAssists > 1 ? 's' : ''}
                    </div>
                  )}
                </td>
                <td className="text-alibi-text-muted text-xs font-mono">{session.date}</td>
                <td className="text-alibi-text-muted text-sm">{session.duration}m</td>
                <td className="font-mono text-alibi-text font-medium">{session.words.toLocaleString()}</td>
                <td>
                  {/* Score bar */}
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold text-sm ${
                      session.score >= 80 ? 'text-[#10B981]'
                      : session.score >= 70 ? 'text-[#F59E0B]'
                      : 'text-[#EF4444]'
                    }`}>
                      {session.score}
                    </span>
                    <div className="w-14 h-1.5 bg-alibi-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${session.score}%`,
                          background: session.score >= 80 ? '#10B981' : session.score >= 70 ? '#F59E0B' : '#EF4444',
                        }} />
                    </div>
                  </div>
                </td>
                <td>
                  <span className="text-xs font-medium px-2 py-1 rounded-lg font-mono"
                    style={{ background: '#ffffff08', color: '#94A3B8' }}>
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
          { label: 'Total Words', value: SESSIONS.reduce((a, s) => a + s.words, 0).toLocaleString(), color: '#7C3AED' },
          { label: 'Total Time', value: `${SESSIONS.reduce((a, s) => a + s.duration, 0)}m`, color: '#10B981' },
          { label: 'Avg Score', value: `${Math.round(SESSIONS.reduce((a, s) => a + s.score, 0) / SESSIONS.length)}/100`, color: '#8B5CF6' },
        ].map(stat => (
          <div key={stat.label} className="ca-card p-4 text-center">
            <div className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-alibi-text-muted mt-1">{stat.label}</div>
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
