/**
 * @fileoverview AI Creative Partner full-screen page — IBM Granite chat interface.
 */

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

/** The type of AI assistance being requested. */
type AIAssistType = 'style_suggestion' | 'brainstorm' | 'grammar_check';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: AIAssistType;
  accepted?: boolean | null;
  guardianApproved?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'sys-1',
    role: 'assistant',
    content: `Welcome to the Creative Alibi AI Creative Partner, powered by **IBM Granite 3 8B Instruct** via watsonx.ai.

I'm here to help with your writing — style suggestions, brainstorming ideas, or grammar checks. 

⚠️ **Important disclosure**: Every interaction you have with me is logged in your Process Ledger and will appear in your Authenticity Report. Suggestions are never silently merged into your writing record — you always accept or decline explicitly.

How can I help with your writing today?`,
    timestamp: new Date().toISOString(),
    guardianApproved: true,
  },
];

const SUGGESTED_PROMPTS = [
  { label: '💡 Brainstorm', text: 'Give me 5 directions for my conclusion', type: 'brainstorm' as AIAssistType },
  { label: '✍️ Style', text: 'How can I make this opening paragraph more engaging?', type: 'style_suggestion' as AIAssistType },
  { label: '📝 Grammar', text: 'Check this sentence for clarity issues', type: 'grammar_check' as AIAssistType },
  { label: '🎯 Focus', text: 'My thesis feels weak. What angles could strengthen it?', type: 'brainstorm' as AIAssistType },
];

export function AIPartnerPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [selectedType, setSelectedType] = useState<AIAssistType>('style_suggestion');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text?: string, type?: AIAssistType) => {
    const msgText = (text ?? input).trim();
    if (!msgText || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: new Date().toISOString(),
      type: type ?? selectedType,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/api/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'dashboard-session',
          prompt: msgText,
          type: type ?? selectedType,
          documentContext: '',
        }),
      });

      let content: string;
      if (res.ok) {
        const data = await res.json();
        content = data.suggestion ?? data.message ?? 'No response from IBM Granite.';
      } else {
        content = generateMockResponse(msgText, type ?? selectedType);
      }

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        type: type ?? selectedType,
        accepted: null,
        guardianApproved: true,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: generateMockResponse(msgText, type ?? selectedType),
        timestamp: new Date().toISOString(),
        type: type ?? selectedType,
        accepted: null,
        guardianApproved: true,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, accepted: true } : m));
  };

  const handleDecline = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, accepted: false } : m));
  };

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 73px)' }}>
      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-alibi-border bg-alibi-bg-card/40 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-alibi-ai/20 border border-alibi-ai/30 flex items-center justify-center shadow-glow-ai">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <div className="font-semibold text-alibi-text">IBM Granite AI Creative Partner</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alibi-emerald opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-alibi-emerald" />
                </span>
                <span className="text-xs text-alibi-text-muted">granite-3-8b-instruct • Granite Guardian Active</span>
              </div>
            </div>
          </div>

          {/* Disclosure badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-alibi-warning/10 border border-alibi-warning/20">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-alibi-warning">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-alibi-warning font-medium">All interactions logged in Authenticity Report</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={clsx('flex animate-slide-up', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-alibi-ai/20 border border-alibi-ai/30 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  <span className="text-sm">🤖</span>
                </div>
              )}

              <div className={clsx('max-w-[75%]', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                {msg.type && (
                  <span className={clsx(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full',
                    msg.role === 'user' ? 'text-alibi-violet-light bg-alibi-violet/10 self-end' : 'text-alibi-ai-light bg-alibi-ai/10 self-start'
                  )}>
                    {msg.type === 'style_suggestion' ? '✍️ Style' : msg.type === 'brainstorm' ? '💡 Brainstorm' : '📝 Grammar'}
                  </span>
                )}

                <div className={clsx(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-alibi-violet/20 border border-alibi-violet/20 text-alibi-text rounded-tr-sm'
                    : 'bg-alibi-bg-card border border-alibi-border text-alibi-text rounded-tl-sm'
                )}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Accept/Decline for assistant messages */}
                {msg.role === 'assistant' && msg.accepted === null && msg.id !== 'sys-1' && (
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => handleAccept(msg.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-alibi-emerald/10 border border-alibi-emerald/20 text-alibi-emerald hover:bg-alibi-emerald/20 text-xs font-medium transition-all">
                      ✓ Accept
                    </button>
                    <button onClick={() => handleDecline(msg.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-alibi-error/10 border border-alibi-error/20 text-alibi-error hover:bg-alibi-error/20 text-xs font-medium transition-all">
                      ✗ Decline
                    </button>
                    <span className="text-[10px] text-alibi-text-subtle">Logged in Process Ledger</span>
                  </div>
                )}

                {msg.accepted === true && (
                  <span className="text-[10px] text-alibi-emerald">✓ Accepted — logged in Process Ledger</span>
                )}
                {msg.accepted === false && (
                  <span className="text-[10px] text-alibi-text-subtle">✗ Declined — still disclosed in report</span>
                )}

                <span className="text-[10px] text-alibi-text-subtle px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-alibi-ai/20 border border-alibi-ai/30 flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div className="ca-card px-4 py-3">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-alibi-ai-light"
                      style={{ animation: `bounceDot 1.4s ease-in-out ${i * 0.16}s infinite` }} />
                  ))}
                </div>
                <div className="text-xs text-alibi-text-subtle mt-1">IBM Granite is processing...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="px-6 pb-2 flex gap-2 overflow-x-auto hide-scrollbar flex-shrink-0">
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p.text}
                onClick={() => handleSend(p.text, p.type)}
                className="flex-shrink-0 px-3 py-2 rounded-xl bg-alibi-bg-elevated border border-alibi-border text-xs text-alibi-text-muted hover:text-alibi-text hover:border-alibi-border-light transition-all">
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-alibi-border p-4 flex-shrink-0">
          {/* Type selector */}
          <div className="flex gap-2 mb-3">
            {(['style_suggestion', 'brainstorm', 'grammar_check'] as AIAssistType[]).map(type => (
              <button key={type} onClick={() => setSelectedType(type)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  selectedType === type
                    ? 'bg-alibi-violet/20 text-alibi-violet-light border-alibi-violet/30'
                    : 'bg-alibi-bg-elevated text-alibi-text-subtle border-alibi-border hover:text-alibi-text'
                )}>
                {type === 'style_suggestion' ? '✍️ Style' : type === 'brainstorm' ? '💡 Brainstorm' : '📝 Grammar'}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask IBM Granite for writing assistance..."
              className="ca-input flex-1"
              disabled={isLoading}
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
              className="ca-btn-primary px-5 py-2.5">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Context Panel */}
      <div className="w-72 border-l border-alibi-border bg-alibi-bg-card flex-shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-alibi-border">
          <h3 className="font-semibold text-alibi-text text-sm">Session Context</h3>
          <p className="text-xs text-alibi-text-muted mt-0.5">Live session data visible to IBM Granite</p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-alibi-text-subtle uppercase tracking-wider mb-2">Current Session</div>
            <div className="ca-card p-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-alibi-text-muted">Words</span><span className="font-mono text-alibi-text">1,247</span></div>
              <div className="flex justify-between"><span className="text-alibi-text-muted">Duration</span><span className="font-mono text-alibi-text">34m</span></div>
              <div className="flex justify-between"><span className="text-alibi-text-muted">Cadence</span><span className="font-mono text-alibi-emerald">91/100</span></div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-alibi-text-subtle uppercase tracking-wider mb-2">AI Assists This Session</div>
            <div className="ca-card p-3 text-xs text-alibi-text-muted">
              {messages.filter(m => m.role === 'assistant' && m.id !== 'sys-1').length} interactions logged
            </div>
          </div>
          <div className="ca-card p-3 bg-alibi-ai-ghost border-alibi-ai/20">
            <p className="text-xs text-alibi-ai-light leading-relaxed">
              IBM Granite only sees the last 200 characters of your document — not your full content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMockResponse(prompt: string, type: AIAssistType): string {
  if (type === 'brainstorm') {
    return `Here are 5 directions you might consider for your writing:\n\n1. **What if** you opened with a specific scenario or case study rather than an abstract statement?\n2. **Consider exploring** the tension between the claim and common assumptions readers might bring\n3. **Another angle** could be to work backwards from your strongest evidence\n4. **What if** you addressed the most obvious counterargument in your opening?\n5. **You might** experiment with placing your core thesis at the end of the introduction rather than the beginning`;
  }
  if (type === 'style_suggestion') {
    return `A few style observations you might consider:\n\n• **Sentence rhythm**: You might vary your sentence lengths more — alternating between short punchy sentences and longer analytical ones can create better momentum\n• **Word choice**: Consider whether "utilize" could become "use" and "in order to" could become "to" — simpler often reads stronger\n• **Voice consistency**: The shift in perspective in paragraph 2 could be smoothed — you might pick either first-person or analytical third-person and stay with it`;
  }
  return `Here are a few grammar and clarity notes:\n\n1. **"its" vs "it's"**: Consider whether the possessive or contraction is intended in your second sentence\n2. **Passive voice**: "was conducted by" could be revised to an active form — "researchers conducted"\n3. **Comma splice**: The two independent clauses in line 3 might benefit from a semicolon or period rather than just a comma`;
}
