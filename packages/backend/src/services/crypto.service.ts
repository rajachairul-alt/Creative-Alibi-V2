/**
 * @fileoverview Cryptographic utilities for report integrity and badge generation.
 * Uses Node.js built-in crypto for SHA-256 hashing.
 */

import crypto from 'crypto';
import type { ProcessLedger, VerificationBadge } from '../types';
import { BADGE_BASE_URL } from '../constants';

/**
 * Generates a SHA-256 hash of the Process Ledger data.
 * Used as tamper-evidence: if the ledger data is altered, the hash will not match.
 * The hash is computed over a deterministic JSON serialization of key fields.
 */
export async function hashLedger(ledger: ProcessLedger): Promise<string> {
  const canonicalData = {
    sessionId: ledger.sessionId,
    sessionStartedAt: ledger.sessionStartedAt,
    sessionEndedAt: ledger.sessionEndedAt,
    typingCadenceScore: ledger.typingCadenceScore,
    copyPasteRatio: ledger.copyPasteRatio,
    revisionCount: ledger.revisionCount,
    timeSpentSeconds: ledger.timeSpentSeconds,
    wordCount: ledger.wordCount,
    aiAssistEventCount: ledger.aiAssistLog.length,
    pasteEventCount: ledger.pasteEvents.length,
    deviceFingerprint: ledger.deviceFingerprint,
  };

  const json = JSON.stringify(canonicalData, Object.keys(canonicalData).sort());
  return crypto.createHash('sha256').update(json, 'utf8').digest('hex');
}

/**
 * Generates verification badge data for a report.
 * Includes the public badge URL and QR code data.
 */
export async function generateBadgeData(
  reportId: string,
  ledger: ProcessLedger,
  compositeScore: number
): Promise<VerificationBadge> {
  const badgeUrl = `${BADGE_BASE_URL}/${reportId}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  // QR code data (URL-encoded for QR generation on frontend)
  const qrCodeData = badgeUrl;

  // HTML embed code for verified badge
  const embedCode = `<a href="${badgeUrl}" target="_blank" rel="noopener">
  <img src="${BADGE_BASE_URL}/badge/${reportId}.svg" 
       alt="Verified Creative Process — Creative Alibi" 
       title="Score: ${compositeScore}/100 | Session: ${ledger.sessionId.slice(0, 8)}" />
</a>`;

  return {
    badgeId: reportId,
    badgeUrl,
    qrCodeData,
    embedCode,
    expiresAt: expiresAt.toISOString(),
  };
}
