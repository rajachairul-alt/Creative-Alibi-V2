/**
 * @fileoverview Authenticity Report controller.
 */

import type { Request, Response } from 'express';
import { generateAuthenticityReport } from '../services/report.service';
import { SessionStore } from '../models/session.model';
import { ReportStore } from '../models/report.model';

export async function generateReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId, documentText } = req.body;

    const session = SessionStore.get(sessionId);
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    if (session.state !== 'COMPLETED') {
      res.status(400).json({
        success: false,
        error: 'Session must be completed before generating a report. Call /api/session/:id/end first.',
      });
      return;
    }

    // Check if report already exists
    const existingReport = ReportStore.getBySessionId(sessionId);
    if (existingReport) {
      res.json({ success: true, data: existingReport, cached: true });
      return;
    }

    const report = await generateAuthenticityReport(session.ledger, documentText);
    ReportStore.save(report);

    // Update session with report
    session.report = report;
    SessionStore.update(sessionId, session);

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('[Report Controller] Generation failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Report generation failed',
    });
  }
}

export async function getReportHandler(req: Request, res: Response): Promise<void> {
  const { reportId } = req.params;
  const report = ReportStore.get(reportId);

  if (!report) {
    res.status(404).json({ success: false, error: 'Report not found' });
    return;
  }

  res.json({ success: true, data: report });
}
