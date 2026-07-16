/**
 * @fileoverview IBM Granite API client for the Word plugin.
 * Calls the backend /api/ai/suggest endpoint.
 */

import axios from 'axios';
import type { AIPartnerRequest, AIPartnerResponse } from '@creative-alibi/shared';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Requests an AI Creative Partner suggestion from IBM Granite via the backend.
 */
export async function requestAISuggestion(
  request: AIPartnerRequest
): Promise<AIPartnerResponse> {
  const response = await apiClient.post<{ success: boolean; data: AIPartnerResponse }>(
    '/api/ai/suggest',
    request
  );

  if (!response.data.success) {
    throw new Error('AI suggestion request failed');
  }

  return response.data.data;
}

/**
 * Starts a new writing session via the backend.
 */
export async function startBackendSession(
  documentTitle: string,
  deviceFingerprint: string
): Promise<{ sessionId: string; startedAt: string }> {
  const response = await apiClient.post('/api/session/start', {
    documentTitle,
    platform: 'word-plugin',
    deviceFingerprint,
  });
  return response.data.data;
}

/**
 * Generates the Authenticity Report for the completed session.
 */
export async function generateReport(
  sessionId: string,
  documentText: string
): Promise<import('@creative-alibi/shared').AuthenticityReport> {
  const response = await apiClient.post('/api/report/generate', {
    sessionId,
    documentText,
  });
  return response.data.data;
}
