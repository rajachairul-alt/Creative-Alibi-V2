/**
 * @fileoverview Individual chat message bubble.
 */

import React from 'react';
import { clsx } from 'clsx';
import type { ChatMessage as ChatMessageType } from '@creative-alibi/shared';

interface Props {
  message: ChatMessageType;
  onAccept?: () => void;
  onDecline?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  style_suggestion: '✍️ Style',
  brainstorm: '💡 Brainstorm',
  grammar_check: '📝 Grammar',
  general: '💬 General',
};

export function ChatMessage({ message, onAccept, onDecline }: Props) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-in">
        <div className="max-w-[85%] px-3 py-2 rounded-xl rounded-tr-sm bg-alibi-violet/20 border border-alibi-violet/20">
          {message.assistType && (
            <div className="text-[9px] text-alibi-violet-light font-medium mb-1">
              {TYPE_LABELS[message.assistType] ?? message.assistType}
            </div>
          )}
          <p className="text-xs text-alibi-text leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  if (isAssistant) {
    return (
      <div className="flex items-start gap-2 animate-slide-in">
        {/* Avatar */}
        <div className="w-6 h-6 rounded-full bg-alibi-ai/20 border border-alibi-ai/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px]">🤖</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Model info */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] text-alibi-ai-light font-medium">IBM Granite</span>
            {!message.guardianApproved && (
              <span className="text-[8px] text-alibi-warning px-1 py-0.5 rounded bg-alibi-warning/10">
                Guardian Warning
              </span>
            )}
            <span className="text-[9px] text-alibi-text-subtle">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Message content */}
          <div className="ca-card py-2">
            <p className="text-xs text-alibi-text leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>

          {/* Accept / Decline (only for pending suggestions) */}
          {message.accepted === null && onAccept && onDecline && (
            <div className="flex items-center gap-2 mt-1.5">
              <button
                onClick={onAccept}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-alibi-emerald/10 border border-alibi-emerald/20 text-alibi-emerald hover:bg-alibi-emerald/20 transition-all duration-150 text-[10px] font-medium"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .039-.046z" />
                </svg>
                Accept
              </button>
              <button
                onClick={onDecline}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-alibi-error/10 border border-alibi-error/20 text-alibi-error hover:bg-alibi-error/20 transition-all duration-150 text-[10px] font-medium"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
                Decline
              </button>
              <span className="text-[9px] text-alibi-text-subtle">Logged in report</span>
            </div>
          )}

          {/* Accepted/Declined state */}
          {message.accepted === true && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[9px] text-alibi-emerald">✓ Accepted — logged in Process Ledger</span>
            </div>
          )}
          {message.accepted === false && message.accepted !== null && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[9px] text-alibi-text-subtle">✗ Declined — still logged (rejected suggestions are disclosed)</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
