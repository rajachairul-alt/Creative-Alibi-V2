/**
 * @fileoverview In-memory report store.
 */

import type { AuthenticityReport } from '../../../shared/src/types';

class ReportStoreImpl {
  private reports = new Map<string, AuthenticityReport>();
  private sessionIndex = new Map<string, string>(); // sessionId → reportId

  save(report: AuthenticityReport): void {
    this.reports.set(report.reportId, report);
    this.sessionIndex.set(report.writer.sessionId, report.reportId);
  }

  get(reportId: string): AuthenticityReport | undefined {
    return this.reports.get(reportId);
  }

  getBySessionId(sessionId: string): AuthenticityReport | undefined {
    const reportId = this.sessionIndex.get(sessionId);
    return reportId ? this.reports.get(reportId) : undefined;
  }

  getAll(): AuthenticityReport[] {
    return Array.from(this.reports.values());
  }
}

export const ReportStore = new ReportStoreImpl();
