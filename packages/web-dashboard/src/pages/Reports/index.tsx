/**
 * @fileoverview Reports page — view, share, download PDF, and generate QR codes.
 * Full PDF export via jsPDF + html2canvas. QR code via qrcode.react.
 */

import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { exportReportToPDF } from '../../utils';

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-alibi-bg-card border border-[#7C3AED30] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="sticky top-0 px-7 py-5 border-b border-alibi-border bg-alibi-bg-card/95 backdrop-blur-sm flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {isIssued
                ? <span className="ca-badge-issued">✓ ISSUED</span>
                : <span className="ca-badge-error">✗ NOT ELIGIBLE</span>}
              <span className="text-xs text-alibi-text-subtle font-mono">#{report.reportId.toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-bold text-alibi-text leading-snug">{report.documentTitle}</h2>
            <p className="text-sm text-alibi-text-muted mt-0.5">
              {new Date(report.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="ca-btn-ghost p-2 rounded-xl ml-4 flex-shrink-0">
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
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#2D2A40" strokeWidth="7" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={report.compositeScore >= 80 ? '#10B981' : report.compositeScore >= 70 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="7"
                    strokeDasharray={`${(report.compositeScore / 100) * 2 * Math.PI * 42} 999`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-mono text-gradient-mixed">{report.compositeScore}</span>
                  <span className="text-xs text-alibi-text-muted">/100</span>
                </div>
              </div>
              <div className="text-xs text-alibi-text-subtle mt-1">Composite Score</div>
            </div>
            <div className="flex-1 space-y-2">
              {checks.map(check => (
                <div key={check.label}
                  className="flex items-center justify-between text-sm px-3 py-2 rounded-xl"
                  style={{ background: check.ok ? '#10B98110' : '#EF444410', border: `1px solid ${check.ok ? '#10B98130' : '#EF444430'}` }}>
                  <span className="text-alibi-text-muted">{check.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={check.ok ? 'text-[#10B981]' : 'text-[#EF4444]'} style={{ fontSize: 16 }}>
                      {check.ok ? '✓' : '✗'}
                    </span>
                    <span className="font-mono font-bold text-alibi-text">{check.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Likelihood */}
          <div className="rounded-2xl p-4 border"
            style={{ background: '#8B5CF610', borderColor: '#8B5CF630' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#A78BFA]">🔍</span>
              <span className="font-semibold text-alibi-text text-sm">AI-Likelihood Signal</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: '#8B5CF620', color: '#A78BFA' }}>Informational Only</span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-2xl font-bold font-mono ${
                report.aiLikelihoodLabel === 'HUMAN' ? 'text-[#10B981]'
                : report.aiLikelihoodLabel === 'AI' ? 'text-[#EF4444]'
                : 'text-[#F59E0B]'
              }`}>
                {report.aiLikelihoodLabel}
              </span>
              <span className="text-alibi-text-muted text-sm">
                {(report.aiLikelihoodScore * 100).toFixed(0)}% AI probability
              </span>
            </div>
            <p className="text-xs text-alibi-text-subtle mt-2 leading-relaxed">
              Statistical estimate from desklib/ai-text-detector — not a verdict.
              Eligibility is determined exclusively by the Process Ledger above.
            </p>
          </div>

          {/* AI Assist summary */}
          {report.aiAssistCount > 0 && (
            <div className="rounded-2xl p-4 border"
              style={{ background: '#8B5CF608', borderColor: '#8B5CF625' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span>🤖</span>
                <span className="font-semibold text-sm text-[#A78BFA]">IBM Granite AI Partner Usage</span>
              </div>
              <p className="text-sm text-alibi-text-muted">
                Writer used IBM Granite {report.aiAssistCount} time(s) in this session.
                All interactions are fully disclosed and logged in this report.
              </p>
            </div>
          )}

          {/* Verified Badge */}
          {isIssued && (
            <div className="rounded-2xl p-6 text-center border"
              style={{ background: 'linear-gradient(135deg, #10B98115, #7C3AED10)', borderColor: '#10B98130' }}>
              <div className="text-[#10B981] font-bold text-xl mb-1">✓ VERIFIED CREATIVE PROCESS</div>
              <div className="text-alibi-text-muted text-sm font-medium">Creative Alibi™ — IBM AI Builders 2025</div>
              <div className="font-mono text-alibi-text-subtle text-xs mt-2">
                {report.reportId.toUpperCase()}
              </div>
              <div className="text-alibi-text-muted text-sm mt-1">
                {report.wordCount.toLocaleString()} words · Score: {report.compositeScore}/100
              </div>
              <div className="text-[#A78BFA] text-xs mt-1">Powered by IBM Granite</div>
            </div>
          )}

          {/* QR Code */}
          {showQR && isIssued && (
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border"
              style={{ background: '#ffffff05', borderColor: '#7C3AED30' }}>
              <div className="text-sm font-semibold text-alibi-text mb-1">Verification QR Code</div>
              <div className="p-3 bg-white rounded-2xl">
                <QRCode value={verifyUrl} size={160} level="H" />
              </div>
              <div className="text-xs text-alibi-text-muted font-mono break-all text-center max-w-xs">
                {verifyUrl}
              </div>
            </div>
          )}

          {/* Embed code */}
          {isIssued && (
            <div>
              <div className="text-xs font-semibold text-alibi-text-muted uppercase tracking-wider mb-2">
                Embed Code
              </div>
              <pre className="bg-alibi-bg-elevated rounded-xl p-3 text-xs font-mono text-[#A78BFA] overflow-x-auto leading-relaxed">
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
          <h2 className="ca-page-title">Authenticity Reports</h2>
          <p className="text-sm text-alibi-text-muted mt-1">
            <span className="text-[#10B981] font-semibold">{issuedCount}</span>
            <span> of {MOCK_REPORTS.length} sessions issued verified reports</span>
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
              placeholder="Search reports..."
              className="ca-input pl-9 w-52 text-sm" />
          </div>
          {/* Filter tabs */}
          <div className="flex rounded-xl overflow-hidden border border-alibi-border">
            {(['all', 'ISSUED', 'NOT_ELIGIBLE'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-[#7C3AED30] text-[#A78BFA]'
                    : 'text-alibi-text-subtle hover:text-alibi-text hover:bg-alibi-bg-elevated'
                }`}>
                {f === 'all' ? 'All' : f === 'ISSUED' ? '✓ Issued' : '✗ Not Eligible'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reports Grid ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="ca-card p-12 text-center text-alibi-text-muted">
            No reports match your filters
          </div>
        ) : filtered.map(report => (
          <div
            key={report.reportId}
            className="ca-card p-5 cursor-pointer group transition-all duration-200"
            style={{ borderColor: report.status === 'ISSUED' ? '#10B98120' : '#EF444420' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = report.status === 'ISSUED' ? '#10B98140' : '#EF444440')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = report.status === 'ISSUED' ? '#10B98120' : '#EF444420')}
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {report.status === 'ISSUED'
                    ? <span className="ca-badge-issued">✓ ISSUED</span>
                    : <span className="ca-badge-error">✗ NOT ELIGIBLE</span>}
                  <span className="text-xs text-alibi-text-subtle font-mono">#{report.reportId.toUpperCase()}</span>
                </div>
                <h3 className="font-semibold text-alibi-text group-hover:text-[#A78BFA] transition-colors">
                  {report.documentTitle}
                </h3>
                <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-alibi-text-muted">
                  <span>{new Date(report.issuedAt).toLocaleDateString()}</span>
                  <span className="text-alibi-text-subtle">•</span>
                  <span>{report.wordCount.toLocaleString()} words</span>
                  <span className="text-alibi-text-subtle">•</span>
                  <span>{report.sessionDurationMinutes}m session</span>
                  {report.aiAssistCount > 0 && (
                    <>
                      <span className="text-alibi-text-subtle">•</span>
                      <span className="px-2 py-0.5 rounded-full font-medium"
                        style={{ background: '#8B5CF615', color: '#A78BFA' }}>
                        🤖 {report.aiAssistCount} AI assists
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5 flex-shrink-0">
                {/* Score */}
                <div className="text-center">
                  <div className={`text-2xl font-black font-mono ${
                    report.compositeScore >= 80 ? 'text-[#10B981]'
                    : report.compositeScore >= 70 ? 'text-[#F59E0B]'
                    : 'text-[#EF4444]'
                  }`}>
                    {report.compositeScore}
                  </div>
                  <div className="text-[10px] text-alibi-text-subtle">Score</div>
                </div>
                {/* Quick PDF download */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    setSelectedReport(report);
                  }}
                  className="p-2 rounded-xl border border-alibi-border hover:border-[#7C3AED50] hover:bg-[#7C3AED10] transition-all"
                  title="Open report">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-alibi-text-subtle group-hover:text-[#A78BFA]">
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
          { label: 'Reports Issued', value: issuedCount, color: '#10B981' },
          { label: 'Success Rate', value: `${((issuedCount / MOCK_REPORTS.length) * 100).toFixed(0)}%`, color: '#7C3AED' },
          { label: 'Total Words Documented', value: MOCK_REPORTS.reduce((a, r) => a + r.wordCount, 0).toLocaleString(), color: '#8B5CF6' },
        ].map(stat => (
          <div key={stat.label} className="ca-card p-4 text-center">
            <div className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-alibi-text-muted mt-1">{stat.label}</div>
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
