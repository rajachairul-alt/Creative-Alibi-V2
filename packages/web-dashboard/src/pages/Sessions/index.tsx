/**
 * @fileoverview Sessions list page.
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';

const SESSIONS = [
  { id: 's-001', title: 'The Ethics of AI Writing Tools', date: '2024-07-12', duration: 34, words: 1247, score: 91, status: 'ISSUED', platform: 'word-plugin' },
  { id: 's-002', title: 'Chapter 3 — Research Methods', date: '2024-07-11', duration: 82, words: 2840, score: 87, status: 'ISSUED', platform: 'word-plugin' },
  { id: 's-003', title: 'Email Newsletter Draft', date: '2024-07-10', duration: 18, words: 450, score: 94, status: 'ISSUED', platform: 'web-editor' },
  { id: 's-004', title: 'Blog Post — AI Creativity', date: '2024-07-09', duration: 12, words: 820, score: 52, status: 'NOT_ELIGIBLE', platform: 'word-plugin' },
  { id: 's-005', title: 'Academic Abstract — ML Study', date: '2024-07-08', duration: 25, words: 380, score: 89, status: 'ISSUED', platform: 'web-editor' },
];

export function SessionsPage() {
  const [search, setSearch] = useState('');

  const filtered = SESSIONS.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ca-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="ca-page-title">Writing Sessions</h2>
          <p className="text-sm text-alibi-text-muted mt-1">{SESSIONS.length} sessions recorded</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sessions..."
          className="ca-input w-64"
        />
      </div>

      <div className="ca-card overflow-hidden">
        <table className="ca-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Words</th>
              <th>Score</th>
              <th>Platform</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(session => (
              <tr key={session.id} className="cursor-pointer">
                <td className="font-medium text-alibi-text">{session.title}</td>
                <td className="text-alibi-text-muted font-mono text-xs">{session.date}</td>
                <td className="text-alibi-text-muted">{session.duration}m</td>
                <td className="font-mono text-alibi-text">{session.words.toLocaleString()}</td>
                <td>
                  <span className={clsx(
                    'font-mono font-bold',
                    session.score >= 80 ? 'text-alibi-emerald' :
                    session.score >= 70 ? 'text-alibi-warning' : 'text-alibi-error'
                  )}>
                    {session.score}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-alibi-text-muted bg-alibi-bg-elevated px-2 py-0.5 rounded font-mono">
                    {session.platform === 'word-plugin' ? '📝 Word' : '🌐 Web'}
                  </span>
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
