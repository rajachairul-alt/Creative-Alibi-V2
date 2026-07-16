/**
 * @fileoverview Reports page — view, share, and download Authenticity Reports.
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';

const MOCK_REPORTS = [
  {
    reportId: 'ca-2024-001',
    documentTitle: 'The Ethics of AI Writing Tools',
    issuedAt: '2024-07-12T14:32:00Z',
    status: 'ISSUED',
    compositeScore: 91,
    wordCount: 1247,
    typingCadenceScore: 88,
    copyPasteRatio: 0.04,
    aiAssistCount: 2,
    aiLikelihoodLabel: 'HUMAN',
    aiLikelihoodScore: 0.12,
    sessionDurationMinutes: 34,
  },
  {
    reportId: 'ca-2024-002',
    documentTitle: 'Chapter 3 — Research Methods',
    issuedAt: '2024-07-11T09:15:00Z',
    status: 'ISSUED',
    compositeScore: 87,
    wordCount: 2840,
    typingCadenceScore: 83,
    copyPasteRatio: 0.08,
    aiAssistCount: 0,
    aiLikelihoodLabel: 'HUMAN',
    aiLikelihoodScore: 0.08,
    sessionDurationMinutes: 82,
  },
  {
    reportId: 'ca-2024-003',
    documentTitle: 'Blog Post — AI Creativity',
    issuedAt: '2024-07-09T16:45:00Z',
    status: 'NOT_ELIGIBLE',
    compositeScore: 52,
    wordCount: 820,
    typingCadenceScore: 61,
    copyPasteRatio: 0.32,
    aiAssistCount: 5,
    aiLikelihoodLabel: 'UNCERTAIN',
    aiLikelihoodScore: 0.54,
    sessionDurationMinutes: 12,
  },
];

// ─── Report Detail Modal ──────────────────────────────────────────────────────

function ReportDetailModal({
  report,
  onClose,
}: {
  report: typeof MOCK_REPORTS[number];
  onClose: () => void;
}) {
  const isIssued = report.status === 'ISSUED';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-alibi-bg-card border border-alibi-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-deep animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 px-8 py-5 border-b border-alibi-border bg-alibi-bg-card/90 backdrop-blur-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isIssued ? (
                <span className="ca-badge-issued">✓ ISSUED</span>
              ) : (
                <span className="ca-badge-error">✗ NOT ELIGIBLE</span>
              )}
              <span className="text-xs text-alibi-text-subtle font-mono">#{report.reportId.toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-bold text-alibi-text">{report.documentTitle}</h2>
            <p className="text-sm text-alibi-text-muted mt-0.5">
              {new Date(report.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="ca-btn-ghost p-2 rounded-xl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Score */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-black font-mono text-gradient-mixed">{report.compositeScore}</div>
              <div className="text-sm text-alibi-text-muted">Composite Score</div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Typing Cadence', value: `${report.typingCadenceScore}/100`, ok: report.typingCadenceScore >= 75 },
                { label: 'Paste Ratio', value: `${(report.copyPasteRatio * 100).toFixed(1)}%`, ok: report.copyPasteRatio <= 0.20 },
                { label: 'Duration', value: `${report.sessionDurationMinutes}m`, ok: report.sessionDurationMinutes >= 2 },
                { label: 'Word Count', value: report.wordCount.toLocaleString(), ok: report.wordCount >= 50 },
              ].map(check => (
                <div key={check.label} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-alibi-bg-elevated">
                  <span className="text-alibi-text-muted">{check.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={check.ok ? 'text-alibi-emerald' : 'text-alibi-error'}>
                      {check.ok ? '✓' : '✗'}
                    </span>
                    <span className="font-mono text-alibi-text font-medium">{check.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Likelihood Signal */}
          <div className="ca-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-alibi-ai-light">🔍</span>
              <span className="font-semibold text-alibi-text text-sm">AI-Likelihood Signal</span>
              <span className="ca-badge-ai text-xs">Informational Only</span>
            </div>
            <div className="flex items-center gap-4">
              <span className={clsx('text-2xl font-bold font-mono',
                report.aiLikelihoodLabel === 'HUMAN' ? 'text-alibi-emerald' :
                report.aiLikelihoodLabel === 'AI' ? 'text-alibi-error' : 'text-alibi-warning'
              )}>
                {report.aiLikelihoodLabel}
              </span>
              <span className="text-alibi-text-muted text-sm">
                {(report.aiLikelihoodScore * 100).toFixed(0)}% AI probability
              </span>
            </div>
            <p className="text-xs text-alibi-text-subtle mt-2 leading-relaxed">
              This is a statistical estimate from desklib/ai-text-detector-v1.01 — not a verdict. 
              Eligibility is determined exclusively by the Process Ledger above.
            </p>
          </div>

          {/* AI Assist Summary */}
          {report.aiAssistCount > 0 && (
            <div className="ca-card p-4 border-alibi-ai/20 bg-alibi-ai-ghost">
              <div className="flex items-center gap-2 mb-2">
                <span>🤖</span>
                <span className="font-semibold text-sm text-alibi-ai-light">AI Creative Partner Usage</span>
              </div>
              <p className="text-sm text-alibi-text-muted">
                Writer used IBM Granite AI Creative Partner {report.aiAssistCount} time(s) in this session.
                All interactions are fully disclosed and logged.
              </p>
            </div>
          )}

          {/* Verified Badge */}
          {isIssued && (
            <div className="border-gradient rounded-2xl p-6 text-center">
              <div className="text-alibi-emerald font-bold text-lg mb-1">✓ VERIFIED CREATIVE PROCESS</div>
              <div className="text-alibi-text-muted text-sm">Creative Alibi™</div>
              <div className="font-mono text-alibi-text-subtle text-sm mt-2">
                Session #{report.reportId.toUpperCase()}
              </div>
              <div className="text-alibi-text-muted text-sm">
                {report.wordCount.toLocaleString()} words | Score: {report.compositeScore}/100
              </div>
              <div className="text-alibi-ai-light text-xs mt-1">Powered by IBM Granite</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button className="ca-btn-secondary flex-1">📋 Copy Badge Link</button>
            <button className="ca-btn-secondary flex-1">QR Code</button>
            <button className="ca-btn-primary flex-1">↓ Download PDF</button>
          </div>

          {/* Embed Code */}
          {isIssued && (
            <div>
              <div className="text-xs font-semibold text-alibi-text-muted uppercase tracking-wider mb-2">
                Embed Code
              </div>
              <pre className="bg-alibi-bg-elevated rounded-xl p-3 text-xs font-mono text-alibi-text-muted overflow-x-auto">
                {`<a href="https://creative-alibi.app/verify/${report.reportId}">
  <img src="https://creative-alibi.app/badge/${report.reportId}.svg"
       alt="Verified Creative Process" />
</a>`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reports Page ─────────────────────────────────────────────────────────────

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<typeof MOCK_REPORTS[number] | null>(null);
  const [filter, setFilter] = useState<'all' | 'ISSUED' | 'NOT_ELIGIBLE'>('all');

  const filtered = MOCK_REPORTS.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="ca-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="ca-page-title">Authenticity Reports</h2>
          <p className="text-sm text-alibi-text-muted mt-1">
            {MOCK_REPORTS.filter(r => r.status === 'ISSUED').length} of {MOCK_REPORTS.length} sessions issued reports
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'ISSUED', 'NOT_ELIGIBLE'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                filter === f
                  ? 'bg-alibi-violet/20 text-alibi-violet-light border border-alibi-violet/30'
                  : 'text-alibi-text-subtle hover:text-alibi-text hover:bg-alibi-bg-elevated border border-alibi-border'
              )}
            >
              {f === 'all' ? 'All' : f === 'ISSUED' ? '✓ Issued' : '✗ Not Eligible'}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="space-y-3">
        {filtered.map(report => (
          <div
            key={report.reportId}
            className="ca-card p-5 hover:border-alibi-border-light transition-all duration-200 cursor-pointer group"
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {report.status === 'ISSUED' ? (
                    <span className="ca-badge-issued">✓ ISSUED</span>
                  ) : (
                    <span className="ca-badge-error">✗ NOT ELIGIBLE</span>
                  )}
                  <span className="text-xs text-alibi-text-subtle font-mono">#{report.reportId.toUpperCase()}</span>
                </div>
                <h3 className="font-semibold text-alibi-text group-hover:text-alibi-violet-light transition-colors">
                  {report.documentTitle}
                </h3>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs text-alibi-text-muted">
                    {new Date(report.issuedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-alibi-text-subtle">•</span>
                  <span className="text-xs text-alibi-text-muted">{report.wordCount.toLocaleString()} words</span>
                  <span className="text-xs text-alibi-text-subtle">•</span>
                  <span className="text-xs text-alibi-text-muted">{report.sessionDurationMinutes}m session</span>
                  {report.aiAssistCount > 0 && (
                    <>
                      <span className="text-xs text-alibi-text-subtle">•</span>
                      <span className="ca-badge-ai text-[10px]">🤖 {report.aiAssistCount} AI assists</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-center">
                  <div className={clsx(
                    'text-2xl font-black font-mono',
                    report.compositeScore >= 80 ? 'text-alibi-emerald' :
                    report.compositeScore >= 70 ? 'text-alibi-warning' : 'text-alibi-error'
                  )}>
                    {report.compositeScore}
                  </div>
                  <div className="text-[10px] text-alibi-text-subtle">Score</div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="w-5 h-5 text-alibi-text-subtle group-hover:text-alibi-violet-light transition-colors">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
}
