/**
 * @fileoverview Prompt input with type selector for the AI Creative Partner.
 */

import React, { useState, useRef } from 'react';
import { clsx } from 'clsx';
import type { AIAssistType } from '@creative-alibi/shared';

const TYPES: Array<{ id: AIAssistType; label: string; placeholder: string }> = [
  {
    id: 'style_suggestion',
    label: '✍️ Style',
    placeholder: 'How can I improve the flow of this section?',
  },
  {
    id: 'brainstorm',
    label: '💡 Ideas',
    placeholder: 'I need directions for my conclusion...',
  },
  {
    id: 'grammar_check',
    label: '📝 Grammar',
    placeholder: 'Check the last paragraph for issues',
  },
];

interface Props {
  onSend: (prompt: string, type: AIAssistType) => void;
  disabled?: boolean;
}

export function PromptInput({ onSend, disabled }: Props) {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<AIAssistType>('style_suggestion');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentType = TYPES.find(t => t.id === selectedType) ?? TYPES[0];

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, selectedType);
    setPrompt('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 space-y-2">
      {/* Type selector */}
      <div className="flex gap-1">
        {TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={clsx(
              'flex-1 py-1 px-1 rounded text-[10px] font-medium transition-all duration-150',
              selectedType === type.id
                ? 'bg-alibi-violet/20 text-alibi-violet-light border border-alibi-violet/30'
                : 'bg-alibi-bg-elevated text-alibi-text-subtle hover:text-alibi-text-muted border border-alibi-border'
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Text input + send */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentType.placeholder}
          disabled={disabled}
          rows={2}
          className={clsx(
            'ca-input resize-none text-[11px] leading-relaxed flex-1',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !prompt.trim()}
          className="ca-button-primary p-2 flex-shrink-0 h-full"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>

      <div className="text-[9px] text-alibi-text-subtle text-center">
        Enter ↵ to send • Shift+Enter for new line • Logged in Authenticity Report
      </div>
    </div>
  );
}
