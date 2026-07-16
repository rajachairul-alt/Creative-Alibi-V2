/**
 * @fileoverview Root App component for the Creative Alibi Word Add-in.
 * Manages session initialization and tab-based navigation.
 */

import React, { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { TabNav } from './components/layout/TabNav';
import { TrackerStatus } from './components/tracker/TrackerStatus';
import { AIPartnerChat } from './components/ai-partner/AIPartnerChat';
import { ReportPanel } from './components/report/ReportPanel';
import { useSessionStore } from './store/session.store';
import { startBackendSession } from './services/granite.service';
import { v4 as uuidv4 } from 'uuid';

/* global Office */

export default function App() {
  const { activeTab, setSession, session } = useSessionStore();

  // Initialize session on first load
  useEffect(() => {
    const init = async () => {
      try {
        let docTitle = 'Untitled Document';
        try {
          docTitle = await new Promise<string>((resolve) => {
            Office.context.document.getFilePropertiesAsync({}, (result) => {
              resolve(result.value?.url?.split('/').pop() ?? 'Untitled Document');
            });
          });
        } catch {
          // Use default title
        }

        const deviceFingerprint = generateDeviceFingerprint();
        const { sessionId, startedAt } = await startBackendSession(docTitle, deviceFingerprint);

        setSession({
          sessionId,
          state: 'ACTIVE',
          startedAt,
          endedAt: null,
          ledger: {
            sessionId,
            sessionStartedAt: startedAt,
            sessionEndedAt: null,
            typingCadenceScore: 0,
            pauseProfile: {
              averageDurationMs: 0,
              medianDurationMs: 0,
              microPauses: 0,
              shortPauses: 0,
              thinkingPauses: 0,
              longBreaks: 0,
              totalPauses: 0,
            },
            copyPasteRatio: 0,
            revisionCount: 0,
            timeSpentSeconds: 0,
            activeTypingSeconds: 0,
            wordCount: 0,
            averageWPM: 0,
            pasteEvents: [],
            pauseEvents: [],
            aiAssistLog: [],
            integrityHash: '',
            deviceFingerprint,
            platform: 'word-plugin',
          },
          report: null,
          documentTitle: docTitle,
          wordCountHistory: [],
        });
      } catch (error) {
        console.error('[Creative Alibi] Session init failed:', error);
      }
    };

    if (!session) {
      init();
    }
  }, [session, setSession]);

  return (
    <div className="flex flex-col h-screen bg-alibi-bg overflow-hidden">
      <Header />
      <TabNav />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'tracker' && <TrackerStatus />}
        {activeTab === 'ai-partner' && <AIPartnerChat />}
        {activeTab === 'report' && <ReportPanel />}
      </main>
    </div>
  );
}

function generateDeviceFingerprint(): string {
  const nav = window.navigator;
  const raw = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join('|');

  // Simple hash for anonymized fingerprint
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return `fp-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}
