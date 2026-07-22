/**
 * @fileoverview AI Creative Partner chat interface for the Word plugin sidebar.
 * Full chat experience with IBM Granite suggestions, disclosure notices, and accept/decline.
 */

import { useRef, useEffect } from 'react';
import { useAIPartner } from '../../hooks/useAIPartner';
import { ChatMessage } from './ChatMessage';
import { PromptInput } from './PromptInput';
import { useSessionStore } from '../../store/session.store';
import type { AIAssistType } from '../../types';

export function AIPartnerChat() {
  const { chatMessages, isAILoading, sendMessage, acceptSuggestion, declineSuggestion } = useAIPartner();
  const { session } = useSessionStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAILoading]);

  const handleSend = (prompt: string, type: AIAssistType) => {
    sendMessage(prompt, type);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Disclosure Banner */}
      <div className="mx-3 mt-3 p-2.5 rounded-lg bg-alibi-ai-ghost border border-alibi-ai/20 flex-shrink-0">
        <div className="flex items-start gap-2">
          <span className="text-alibi-ai-light flex-shrink-0 mt-0.5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <p className="text-[10px] text-alibi-ai-light font-medium leading-relaxed">
              AI Suggestions are logged & disclosed
            </p>
            <p className="text-[9px] text-alibi-text-subtle leading-relaxed mt-0.5">
              Every interaction with IBM Granite is recorded in your Process Ledger and will appear in your Authenticity Report. Suggestions are never silently merged into your writing.
            </p>
          </div>
        </div>
      </div>

      {/* IBM Granite Badge */}
      <div className="mx-3 mt-2 flex items-center gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-alibi-bg-elevated border border-alibi-border">
          <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
            <rect width="24" height="24" rx="4" fill="#0F62FE" />
            <text x="4" y="17" fontSize="13" fontWeight="bold" fill="white" fontFamily="monospace">g</text>
          </svg>
          <span className="text-[10px] text-alibi-text-muted">
            Powered by <span className="text-alibi-ai-light font-medium">IBM Granite</span> via watsonx.ai
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {chatMessages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {chatMessages.map(msg => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onAccept={() => acceptSuggestion(msg.id)}
                onDecline={() => declineSuggestion(msg.id)}
              />
            ))}
          </>
        )}

        {/* Typing indicator */}
        {isAILoading && (
          <div className="flex items-start gap-2 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-alibi-ai/20 border border-alibi-ai/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px]">🤖</span>
            </div>
            <div className="ca-card px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <div className="text-[9px] text-alibi-text-subtle mt-1">IBM Granite is thinking...</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-alibi-border">
        <PromptInput onSend={handleSend} disabled={isAILoading || !session} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-alibi-ai/10 border border-alibi-ai/20 flex items-center justify-center mb-3">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#8B5CF6" />
        </svg>
      </div>
      <div className="text-xs font-semibold text-alibi-text mb-1">AI Creative Partner</div>
      <div className="text-[10px] text-alibi-text-subtle max-w-48 leading-relaxed">
        Ask for style suggestions, brainstorming ideas, or grammar help. All interactions are transparently logged.
      </div>
      <div className="mt-3 grid grid-cols-1 gap-1.5 w-full max-w-48">
        {[
          { label: '💡 Brainstorm ideas', type: 'brainstorm' },
          { label: '✍️ Style suggestion', type: 'style_suggestion' },
          { label: '📝 Grammar check', type: 'grammar_check' },
        ].map(s => (
          <div key={s.type} className="px-2 py-1.5 rounded bg-alibi-bg-elevated border border-alibi-border text-[10px] text-alibi-text-muted text-center">
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
