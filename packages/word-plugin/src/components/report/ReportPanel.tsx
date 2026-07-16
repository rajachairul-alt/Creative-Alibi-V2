/**
 * @fileoverview Report Panel — generate and preview the Authenticity Report.
 */

import React, { useState } from 'react';
import { useSessionStore } from '../../store/session.store';
import { generateReport } from '../../services/granite.service';
import { clsx } from 'clsx';

/* global Word */

export function ReportPanel() {
  const { session, report, setReport, isGeneratingReport, setGeneratingReport, setError } = useSessionStore();
  const [step, setStep] = useState<'idle' | 'confirming' | 'generating' | 'done' | 'error'>('idle');

  const handleGenerateReport = async () => {
    if (!session) return;
    setStep('generating');
    setGeneratingReport(true);
    setError(null);

    try {
      // Get the current document text
      let documentText = '';
      try {
        await Word.run(async (context) => {
          const body = context.document.body;
          body.load('text');
          await context.sync();
          documentText = body.text;
        });
      } catch {
        documentText = 'Document text unavailable';
      }

      const generatedReport = await generateReport(session.sessionId, documentText);
      setReport(generatedReport);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed');
      setStep('error');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (!session) {
    return (
      <div className="p-3 flex flex-col items-center justify-center text-center py-12">
        <div className="text-alibi-text-subtle text-xs">Start a session to generate a report</div>
      </div>
    );
  }

  const ledger = session.ledger;
  const isEligible = ledger.typingCadenceScore >= 75 && ledger.copyPasteRatio <= 0.20 && ledger.revisionCount >= 3;

  return (
    <div className="flex flex-col gap-3 p-3 animate-fade-in">
      {/* Eligibility Preview */}
      <div className={clsx(
        'ca-card',
        isEligible ? 'border-alibi-emerald/30 bg-alibi-emerald-ghost' : 'border-alibi-warning/30 bg-alibi-warning/5'
      )}>
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx('text-sm', isEligible ? 'text-alibi-emerald' : 'text-alibi-warning')}>
            {isEligible ? '✓' : '⚠'}
          </span>
          <span className={clsx('text-xs font-semibold', isEligible ? 'text-alibi-emerald' : 'text-alibi-warning')}>
            {isEligible ? 'Eligible for Authenticity Report' : 'Not Yet Eligible'}
          </span>
        </div>
        <div className="space-y-1">
          {[
            { label: 'Cadence Score', value: `${ledger.typingCadenceScore}/100`, passed: ledger.typingCadenceScore >= 75 },
            { label: 'Paste Ratio', value: `${(ledger.copyPasteRatio * 100).toFixed(1)}%`, passed: ledger.copyPasteRatio <= 0.20 },
            { label: 'Revisions', value: ledger.revisionCount, passed: ledger.revisionCount >= 3 },
            { label: 'Duration', value: `${Math.round(ledger.timeSpentSeconds / 60)}m`, passed: ledger.timeSpentSeconds >= 120 },
          ].map(check => (
            <div key={check.label} className="flex items-center justify-between text-[10px]">
              <span className="text-alibi-text-muted">{check.label}</span>
              <div className="flex items-center gap-1">
                <span className={check.passed ? 'text-alibi-emerald' : 'text-alibi-warning'}>
                  {check.passed ? '✓' : '✗'}
                </span>
                <span className={clsx('font-mono', check.passed ? 'text-alibi-emerald' : 'text-alibi-text-muted')}>
                  {check.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      {!report && (
        <button
          onClick={handleGenerateReport}
          disabled={isGeneratingReport || !isEligible}
          className={clsx(
            'w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2',
            isEligible
              ? 'ca-button-primary shadow-glow-violet'
              : 'bg-alibi-bg-elevated text-alibi-text-subtle border border-alibi-border cursor-not-allowed opacity-60'
          )}
        >
          {isGeneratingReport ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating with IBM Granite...
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
              </svg>
              Generate Authenticity Report
            </>
          )}
        </button>
      )}

      {/* Report Preview */}
      {report && (
        <div className="space-y-3 animate-slide-in">
          {/* Status Banner */}
          <div className={clsx(
            'rounded-xl p-3 flex items-center gap-3',
            report.status === 'ISSUED'
              ? 'bg-alibi-emerald-ghost border border-alibi-emerald/30'
              : 'bg-alibi-error/5 border border-alibi-error/20'
          )}>
            <div className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              report.status === 'ISSUED' ? 'bg-alibi-emerald/20' : 'bg-alibi-error/10'
            )}>
              <span className="text-lg">{report.status === 'ISSUED' ? '✓' : '✗'}</span>
            </div>
            <div>
              <div className={clsx('text-sm font-bold', report.status === 'ISSUED' ? 'text-alibi-emerald' : 'text-alibi-error')}>
                Report {report.status === 'ISSUED' ? 'ISSUED' : 'NOT ELIGIBLE'}
              </div>
              <div className="text-[10px] text-alibi-text-muted">
                Report ID: {report.reportId.slice(0, 12)}...
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="ca-card text-center">
            <div className="ca-label mb-1">Composite Authenticity Score</div>
            <div className="text-3xl font-black font-mono text-gradient-violet">
              {report.processMetrics.compositeScore}
            </div>
            <div className="text-[10px] text-alibi-text-subtle">out of 100</div>
          </div>

          {/* Narrative */}
          <div className="ca-card">
            <div className="ca-label mb-2 flex items-center gap-1">
              <span className="text-alibi-ai-light text-xs">🤖</span>
              Report Narrative
            </div>
            <p className="text-[10px] text-alibi-text-muted leading-relaxed line-clamp-4">
              {report.reportNarrative}
            </p>
          </div>

          {/* Badge */}
          <div className="border-gradient rounded-xl p-3 text-center">
            <div className="text-[10px] text-alibi-emerald font-medium mb-0.5">
              ✓ VERIFIED CREATIVE PROCESS
            </div>
            <div className="text-[9px] text-alibi-text-subtle">Creative Alibi™</div>
            <div className="text-[9px] text-alibi-text-muted font-mono mt-1">
              #{report.reportId.slice(0, 8).toUpperCase()}
            </div>
            <div className="text-[9px] text-alibi-text-subtle">
              {report.processMetrics.wordCount} words | Score: {report.processMetrics.compositeScore}/100
            </div>
            <div className="text-[8px] text-alibi-ai-light mt-0.5">Powered by IBM Granite</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="ca-button-secondary flex-1 text-xs py-2">
              📋 Copy Link
            </button>
            <button className="ca-button-primary flex-1 text-xs py-2">
              ↓ Download PDF
            </button>
          </div>

          <button
            onClick={() => { setReport(null as never); setStep('idle'); }}
            className="ca-button-ghost w-full text-xs"
          >
            Generate new report
          </button>
        </div>
      )}
    </div>
  );
}
