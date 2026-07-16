/**
 * @fileoverview AI Creative Partner hook for the Word plugin.
 * Manages conversation state and Granite API calls.
 */

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSessionStore } from '../store/session.store';
import { requestAISuggestion } from '../services/granite.service';
import type { AIAssistType, ChatMessage } from '@creative-alibi/shared';

export function useAIPartner() {
  const {
    session,
    chatMessages,
    isAILoading,
    addChatMessage,
    setAILoading,
    setError,
    updateLedger,
  } = useSessionStore();

  const sendMessage = useCallback(async (
    prompt: string,
    type: AIAssistType
  ) => {
    if (!session || isAILoading) return;

    // Add user message immediately
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
      assistType: type,
    };
    addChatMessage(userMsg);
    setAILoading(true);
    setError(null);

    try {
      // Get current document context (last 200 chars)
      let documentContext = '';
      try {
        await Word.run(async (context) => {
          const body = context.document.body;
          body.load('text');
          await context.sync();
          documentContext = body.text.slice(-200);
        });
      } catch {
        // Fallback to empty context
      }

      const response = await requestAISuggestion({
        prompt,
        type,
        sessionId: session.sessionId,
        documentContext,
        wordCount: session.ledger.wordCount,
      });

      // Add assistant message
      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.suggestion,
        timestamp: new Date().toISOString(),
        assistType: type,
        accepted: null, // Pending decision
        guardianApproved: response.guardianApproved,
        modelId: response.modelId,
      };
      addChatMessage(assistantMsg);

      // Log to Process Ledger (pending acceptance)
      const newEvent = {
        id: response.eventId,
        timestamp: new Date().toISOString(),
        type,
        prompt: prompt.slice(0, 100),
        suggestionPreview: response.suggestion.slice(0, 100),
        accepted: false, // Will be updated on accept/decline
        modelId: response.modelId,
        guardianApproved: response.guardianApproved,
      };

      updateLedger({
        aiAssistLog: [...(session.ledger.aiAssistLog || []), newEvent],
      });

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `I encountered an issue connecting to IBM Granite. Please check your connection and try again.`,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(errorMsg);
      setError(error instanceof Error ? error.message : 'AI request failed');
    } finally {
      setAILoading(false);
    }
  }, [session, isAILoading, addChatMessage, setAILoading, setError, updateLedger]);

  const acceptSuggestion = useCallback((messageId: string) => {
    // Update the ledger to mark the corresponding event as accepted
    if (!session) return;
    const updatedLog = session.ledger.aiAssistLog.map(event => {
      const msg = chatMessages.find(m => m.id === messageId);
      return msg ? { ...event, accepted: true } : event;
    });
    updateLedger({ aiAssistLog: updatedLog });
  }, [session, chatMessages, updateLedger]);

  const declineSuggestion = useCallback((_messageId: string) => {
    // No ledger update needed for declined suggestions (already logged as accepted: false)
  }, []);

  return {
    chatMessages,
    isAILoading,
    sendMessage,
    acceptSuggestion,
    declineSuggestion,
  };
}
