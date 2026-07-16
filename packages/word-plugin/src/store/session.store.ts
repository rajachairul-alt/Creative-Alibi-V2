/**
 * @fileoverview Zustand session store for the Word Add-in.
 * Manages all session state including Process Ledger, chat messages, and UI state.
 */

import { create } from 'zustand';
import type {
  WritingSession,
  ChatMessage,
  ProcessLedger,
  AuthenticityReport,
} from '@creative-alibi/shared';

export type ActiveTab = 'tracker' | 'ai-partner' | 'report';

interface SessionStore {
  // ─── Session State ─────────────────────────────────────────────────────
  session: WritingSession | null;
  isTracking: boolean;
  isSessionActive: boolean;

  // ─── UI State ──────────────────────────────────────────────────────────
  activeTab: ActiveTab;
  isLoading: boolean;
  error: string | null;

  // ─── Chat Messages ─────────────────────────────────────────────────────
  chatMessages: ChatMessage[];
  isAILoading: boolean;

  // ─── Report ────────────────────────────────────────────────────────────
  report: AuthenticityReport | null;
  isGeneratingReport: boolean;

  // ─── Actions ───────────────────────────────────────────────────────────
  setSession: (session: WritingSession) => void;
  setActiveTab: (tab: ActiveTab) => void;
  updateLedger: (update: Partial<ProcessLedger>) => void;
  addChatMessage: (message: ChatMessage) => void;
  setAILoading: (loading: boolean) => void;
  setReport: (report: AuthenticityReport) => void;
  setGeneratingReport: (generating: boolean) => void;
  setError: (error: string | null) => void;
  setTracking: (tracking: boolean) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  isTracking: false,
  isSessionActive: false,
  activeTab: 'tracker',
  isLoading: false,
  error: null,
  chatMessages: [],
  isAILoading: false,
  report: null,
  isGeneratingReport: false,

  setSession: (session) => set({ session, isSessionActive: true }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  updateLedger: (update) =>
    set((state) => {
      if (!state.session) return {};
      return {
        session: {
          ...state.session,
          ledger: { ...state.session.ledger, ...update },
        },
      };
    }),

  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  setAILoading: (loading) => set({ isAILoading: loading }),

  setReport: (report) => set({ report }),

  setGeneratingReport: (generating) => set({ isGeneratingReport: generating }),

  setError: (error) => set({ error }),

  setTracking: (tracking) => set({ isTracking: tracking }),

  resetSession: () =>
    set({
      session: null,
      isTracking: false,
      isSessionActive: false,
      chatMessages: [],
      report: null,
      error: null,
    }),
}));
