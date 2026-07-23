/**
 * @fileoverview Reports page — view, share, download PDF, and generate QR codes.
 * Moon Phases design system: #212A31 / #2E3944 / #124E66 / #748D92 / #D3D9D4
 */

import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { exportReportToPDF } from '../../utils';

// ─── Moon Phases tokens ────────────────────────────────────────────────────────
const MP = {
  surface:  '#212A31',
  elevated: '#2E3944',
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

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface Report {
  reportId: string;
  documentTitle: string;
  issuedAt: string;
  status: 'ISSUED' | 'NOT_ELIGIBLE';
  compositeScore: number;
  wordCount: number;
  typingCadenceScore: number;
  copyPasteRatio: number;
  aiAssistCount: number;
  aiLikelihoodLabel: 'HUMAN' | 'AI' | 'UNCERTAIN';
  aiLikelihoodScore: number;
  sessionDurationMinutes: number;
}

const MOCK_REPORTS: Report[] = [
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
  {
    reportId: 'ca-2024-004',
    documentTitle: 'Literature Review Draft',
    issuedAt: '2024-07-07T11:20:00Z',
    status: 'ISSUED',
    compositeScore: 84,
    wordCount: 3200,
    typingCadenceScore: 80,
    copyPasteRatio: 0.11,
    aiAssistCount: 3,
    aiLikelihoodLabel: 'HUMAN',
    aiLikelihoodScore: 0.19,
    sessionDurationMinutes: 95,
  },
];

const VERIFY_BASE = 'https://rajachairul-alt.github.io/Creative-Alibi-V2/verify/';

// ─── Report Detail Modal ──────────────────────────────────────────────────────

function ReportDetailModal({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  const isIssued = report.status === 'ISSUED';
  const verifyUrl = `${VERIFY_BASE}${report.reportId}`;
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const reportPrintRef = useRef<HTMLDivElement>(null);

  const handleCopyBadge = async () => {
    await navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportReportToPDF('report-print-area', `creative-alibi-${report.reportId}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const checks = [
    { label: 'Typing Cadence', value: `${report.typingCadenceScore}/100`, ok: report.typingCadenceScore >= 75 },
    { label: 'Paste Ratio', value: `${(report.copyPasteRatio * 100).toFixed(1)}%`, ok: report.copyPasteRatio <= 0.20 },
    { label: 'Duration', value: `${report.sessionDurationMinutes}m`, ok: report.sessionDurationMinutes >= 2 },
    { label: 'Word Count', value: report.wordCount.toLocaleString(), ok: report.wordCount >= 50 },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label={`Report: ${report.documentTitle}`}>
      <div className="rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border"
        style={{ background: MP.surface, borderColor: `${MP.teal}35` }}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="sticky top-0 px-7 py-5 border-b flex items-start justify-between z-10"
          style={{ borderColor: MP.border, background: `${MP.surface}f8` }}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {isIssued
                ? <span className="ca-badge-issued">✓ ISSUED</span>
                : <span className="ca-badge-error">✗ NOT ELIGIBLE</span>}
              <span className="text-xs font-mono" style={{ color: MP.muted }}>#{report.reportId.toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-bold leading-snug" style={{ color: MP.text }}>{report.documentTitle}</h2>
            <p className="text-sm mt-0.5" style={{ color: MP.muted }}>
              {new Date(report.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="ca-btn-ghost p-2 rounded-xl ml-4 flex-shrink-0"
            aria-label="Close report">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Printable Body ────────────────────────────────────────────────── */}
        <div className="p-7 space-y-6" id="report-print-area" ref={reportPrintRef}>

          {/* Score + checks */}
          <div className="flex items-start gap-6">
            <div className="text-center flex-shrink-0">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="42" fill="none" stroke={MP.elevated} strokeWidth="7" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={report.compositeScore >= 80 ? MP.success : report.compositeScore >= 70 ? MP.warning : MP.error}
                    strokeWidth="7"
                    strokeDasharray={`${(report.compositeScore / 100) * 2 * Math.PI * 42} 999`}
                    strokeLinecap="round" transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-mono"
                    style={{ color: report.compositeScore >= 80 ? MP.success : report.compositeScore >= 70 ? MP.warning : MP.error }}>
                    {report.compositeScore}
                  </span>
                  <span className="text-xs" style={{ color: MP.muted }}>/100</span>
                </div>
              </div>
              <div className="text-xs mt-1" style={{ color: MP.muted }}>Composite Score</div>
            </div>
            <div className="flex-1 space-y-2">
              {checks.map(check => (
                <div key={check.label}
                  className="flex items-center justify-between text-sm px-3 py-2 rounded-xl"
                  style={{ background: check.ok ? `${MP.success}10` : `${MP.error}10`, border: `1px solid ${check.ok ? `${MP.success}30` : `${MP.error}30`}` }}>
                  <span style={{ color: MP.muted }}>{check.label}</span>
                  <div className="flex items-center gap-2">
                    <span style={{ color: check.ok ? MP.success : MP.error, fontSize: 16 }}>
                      {check.ok ? '✓' : '✗'}
                    </span>
                    <span className="font-mono font-bold" style={{ color: MP.text }}>{check.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Likelihood */}
          <div className="rounded-2xl p-4 border"
            style={{ background: `${MP.ibm}10`, borderColor: `${MP.ibm}30` }}>
            <div className="flex items-center gap-2 mb-2">
              <span>🔍</span>
              <span className="font-semibold text-sm" style={{ color: MP.ibm }}>AI-Likelihood Signal</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${MP.ibm}20`, color: MP.ibm }}>Informational Only</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold font-mono"
                style={{ color: report.aiLikelihoodLabel === 'HUMAN' ? MP.success : report.aiLikelihoodLabel === 'AI' ? MP.error : MP.warning }}>
                {report.aiLikelihoodLabel}
              </span>
              <span className="text-sm" style={{ color: MP.muted }}>
                {(report.aiLikelihoodScore * 100).toFixed(0)}% AI probability
              </span>
            </div>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: MP.muted }}>
              Statistical estimate from desklib/ai-text-detector — not a verdict.
              Eligibility is determined exclusively by the Process Ledger above.
            </p>
          </div>

          {/* AI Assist summary */}
          {report.aiAssistCount > 0 && (
            <div className="rounded-2xl p-4 border"
              style={{ background: `${MP.ibm}08`, borderColor: `${MP.ibm}25` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span>🤖</span>
                <span className="font-semibold text-sm" style={{ color: MP.ibm }}>IBM Granite AI Partner Usage</span>
              </div>
              <p className="text-sm" style={{ color: MP.muted }}>
                Writer used IBM Granite {report.aiAssistCount} time(s) in this session.
                All interactions are fully disclosed and logged in this report.
              </p>
            </div>
          )}

          {/* Verified Badge */}
          {isIssued && (
            <div className="rounded-2xl p-6 text-center border"
              style={{ background: `linear-gradient(135deg, ${MP.tealDark}20, ${MP.success}08)`, borderColor: `${MP.success}35` }}>
              <div className="font-bold text-xl mb-1" style={{ color: MP.success }}>✓ VERIFIED CREATIVE PROCESS</div>
              <div className="text-sm font-medium" style={{ color: MP.textSoft }}>Creative Alibi™ — IBM AI Builders 2025</div>
              <div className="font-mono text-xs mt-2" style={{ color: MP.muted }}>
                {report.reportId.toUpperCase()}
              </div>
              <div className="text-sm mt-1" style={{ color: MP.muted }}>
                {report.wordCount.toLocaleString()} words · Score: {report.compositeScore}/100
              </div>
              <div className="text-xs mt-1" style={{ color: MP.ibm }}>Powered by IBM Granite via watsonx.ai</div>
            </div>
          )}

          {/* QR Code */}
          {showQR && isIssued && (
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border"
              style={{ background: `${MP.teal}05`, borderColor: `${MP.teal}30` }}>
              <div className="text-sm font-semibold mb-1" style={{ color: MP.text }}>Verification QR Code</div>
              <div className="p-3 bg-white rounded-2xl">
                <QRCode value={verifyUrl} size={160} level="H" />
              </div>
              <div className="text-xs font-mono break-all text-center max-w-xs" style={{ color: MP.muted }}>
                {verifyUrl}
              </div>
            </div>
          )}

          {/* Embed code */}
          {isIssued && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: MP.muted }}>
                Embed Code
              </div>
              <pre className="rounded-xl p-3 text-xs font-mono overflow-x-auto leading-relaxed"
                style={{ background: MP.elevated, color: MP.teal }}>
{`<a href="${verifyUrl}">
  <img src="${VERIFY_BASE}badge/${report.reportId}.svg"
       alt="Verified Creative Process — Creative Alibi" />
</a>`}
              </pre>
            </div>
          )}
        </div>

        {/* ── Action Footer ─────────────────────────────────────────────────── */}
        <div className="px-7 pb-7 flex gap-3 flex-wrap">
          <button onClick={handleCopyBadge}
            className="ca-btn-secondary flex-1 flex items-center justify-center gap-2 text-sm min-w-[120px]">
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
          {isIssued && (
            <button onClick={() => setShowQR(v => !v)}
              className="ca-btn-secondary flex-1 flex items-center justify-center gap-2 text-sm min-w-[120px]">
              📷 {showQR ? 'Hide QR' : 'QR Code'}
            </button>
          )}
          <button onClick={handleExportPDF} disabled={exporting}
            className="ca-btn-primary flex-1 flex items-center justify-center gap-2 text-sm min-w-[120px]">
            {exporting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
                  <path d="M21 12c0-4.97-4.03-9-9-9" />
                </svg>
                Exporting…
              </>
            ) : '↓ Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reports Page ─────────────────────────────────────────────────────────────

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<'all' | 'ISSUED' | 'NOT_ELIGIBLE'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_REPORTS
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => r.documentTitle.toLowerCase().includes(search.toLowerCase()));

  const issuedCount = MOCK_REPORTS.filter(r => r.status === 'ISSUED').length;

  return (
    <div className="ca-page">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black" style={{ color: MP.text }}>Authenticity Reports</h1>
          <p className="text-sm mt-1" style={{ color: MP.muted }}>
            <span className="font-semibold" style={{ color: MP.success }}>{issuedCount}</span>
            <span> of {MOCK_REPORTS.length} sessions issued verified reports</span>
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
              placeholder="Search reports…"
              className="ca-input pl-9 w-52 text-sm" />
          </div>
          {/* Filter tabs */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: MP.border }}>
            {(['all', 'ISSUED', 'NOT_ELIGIBLE'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={filter === f ? { background: `${MP.teal}28`, color: MP.teal } : { color: MP.muted }}>
                {f === 'all' ? 'All' : f === 'ISSUED' ? '✓ Issued' : '✗ Not Eligible'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reports Grid ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="ca-card p-12 text-center" style={{ color: MP.muted }}>
            No reports match your filters
          </div>
        ) : filtered.map(report => (
          <div
            key={report.reportId}
            className="ca-card p-5 cursor-pointer group transition-all duration-200"
            style={{ borderColor: report.status === 'ISSUED' ? `${MP.success}22` : `${MP.error}22` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = report.status === 'ISSUED' ? `${MP.success}45` : `${MP.error}45`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = report.status === 'ISSUED' ? `${MP.success}22` : `${MP.error}22`; }}
            onClick={() => setSelectedReport(report)}
            onKeyDown={e => e.key === 'Enter' && setSelectedReport(report)}
            tabIndex={0}
            role="button"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {report.status === 'ISSUED'
                    ? <span className="ca-badge-issued">✓ ISSUED</span>
                    : <span className="ca-badge-error">✗ NOT ELIGIBLE</span>}
                  <span className="text-xs font-mono" style={{ color: MP.muted }}>#{report.reportId.toUpperCase()}</span>
                </div>
                <h3 className="font-semibold transition-colors" style={{ color: MP.text }}>
                  {report.documentTitle}
                </h3>
                <div className="flex items-center gap-3 mt-2 flex-wrap text-xs" style={{ color: MP.muted }}>
                  <span>{new Date(report.issuedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{report.wordCount.toLocaleString()} words</span>
                  <span>•</span>
                  <span>{report.sessionDurationMinutes}m session</span>
                  {report.aiAssistCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${MP.ibm}15`, color: MP.ibm }}>
                        🤖 {report.aiAssistCount} AI assists
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5 flex-shrink-0">
                {/* Score */}
                <div className="text-center">
                  <div className="text-2xl font-black font-mono"
                    style={{ color: report.compositeScore >= 80 ? MP.success : report.compositeScore >= 70 ? MP.warning : MP.error }}>
                    {report.compositeScore}
                  </div>
                  <div className="text-[10px]" style={{ color: MP.muted }}>Score</div>
                </div>
                {/* Open button */}
                <button
                  onClick={e => { e.stopPropagation(); setSelectedReport(report); }}
                  className="p-2 rounded-xl border transition-all"
                  style={{ borderColor: MP.border }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${MP.teal}50`; (e.currentTarget as HTMLElement).style.background = `${MP.teal}10`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = MP.border; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  title="Open report" aria-label="Open report">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"
                    style={{ color: MP.muted }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stats footer ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Reports Issued',         value: issuedCount,                                                                  color: MP.success },
          { label: 'Success Rate',           value: `${((issuedCount / MOCK_REPORTS.length) * 100).toFixed(0)}%`,                color: MP.teal    },
          { label: 'Total Words Documented', value: MOCK_REPORTS.reduce((a, r) => a + r.wordCount, 0).toLocaleString(),          color: MP.ibm     },
        ].map(stat => (
          <div key={stat.label} className="ca-card p-4 text-center">
            <div className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: MP.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
}
