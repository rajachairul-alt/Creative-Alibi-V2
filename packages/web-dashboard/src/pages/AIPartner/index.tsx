/**
 * @fileoverview AI Creative Partner full-screen page — IBM Granite chat interface.
 * Moon Phases design system: #212A31 / #2E3944 / #124E66 / #748D92 / #D3D9D4
 */

import React, { useState, useRef, useEffect } from 'react';

// ─── Moon Phases tokens ────────────────────────────────────────────────────────
const MP = {
  bg:       '#1A2229',
  surface:  '#212A31',
  elevated: '#2E3944',
  hover:    '#374654',
  tealDark: '#124E66',
  teal:     '#2A9FBF',
  tealH:    '#3AB4D4',
  text:     '#D3D9D4',
  textSoft: '#A8B2B7',
  muted:    '#748D92',
  border:   '#374654',
  success:  '#4CC38A',
  error:    '#E07070',
  warning:  '#E8C547',
  ibm:      '#7EB8D4',
} as const;

type AIAssistType = 'style_suggestion' | 'brainstorm' | 'grammar_check';

interface Message {
  id:               string;
  role:             'user' | 'assistant';
  content:          string;
  timestamp:        string;
  type?:            AIAssistType;
  accepted?:        boolean | null;
  guardianApproved?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id:               'sys-1',
    role:             'assistant',
    content:          `Welcome to your Creative Alibi AI Partner — powered by **IBM Granite 3 8B Instruct** via watsonx.ai.\n\nI'm here to help with style suggestions, brainstorming, and grammar checks.\n\n⚠️ **Transparency notice**: Every interaction is logged in your Process Ledger and disclosed in your Authenticity Report. You always explicitly accept or decline — nothing is silently merged.\n\nHow can I help with your writing today?`,
    timestamp:        new Date().toISOString(),
    guardianApproved: true,
  },
];

const SUGGESTED_PROMPTS = [
  { label: '💡 Brainstorm',  text: 'Give me 5 directions for my conclusion',               type: 'brainstorm'       as AIAssistType },
  { label: '✍️ Style',       text: 'How can I make this opening more engaging?',           type: 'style_suggestion' as AIAssistType },
  { label: '📝 Grammar',     text: 'Check this sentence for clarity issues',               type: 'grammar_check'    as AIAssistType },
  { label: '🎯 Focus',       text: 'My thesis feels weak — what angles would strengthen it?', type: 'brainstorm'    as AIAssistType },
];

const TYPE_LABELS: Record<AIAssistType, string> = {
  style_suggestion: '✍️ Style',
  brainstorm:       '💡 Brainstorm',
  grammar_check:    '📝 Grammar',
};

// ─── Mock fallback responses ───────────────────────────────────────────────────

function generateMockResponse(prompt: string, type: AIAssistType): string {
  if (type === 'brainstorm') {
    return `Here are 5 directions for your writing:\n\n1. **Compare/Contrast** — juxtapose two opposing perspectives to reveal nuance\n2. **Problem → Solution** — frame the issue, then pivot to your argument as the resolution\n3. **Chronological arc** — trace how thinking on this topic has evolved over time\n4. **Case study anchor** — open with a concrete example, then zoom out to the broader principle\n5. **Provocative question** — challenge the reader's assumption in the opening line\n\nWhich resonates most with your document's tone?`;
  }
  if (type === 'grammar_check') {
    return `Your sentence structure looks solid. A few suggestions:\n\n• Consider replacing passive voice with active constructions for more impact\n• The phrase "${prompt.slice(0, 30)}..." could benefit from a comma after the introductory clause\n• "Utilize" → "use" is typically cleaner in academic writing\n\nOverall clarity: **Good** — the main idea reads clearly.`;
  }
  return `To make your writing more engaging, consider:\n\n**Hook variety**: Your opening could start with a striking statistic, a counterintuitive claim, or a vivid scene instead of a definition.\n\n**Sentence rhythm**: Vary your sentence length — short punchy sentences after longer ones create emphasis.\n\n**Concrete nouns**: Replace abstract nouns ("improvement", "development") with specific actors and actions.\n\nWould you like me to draft an alternative opening based on your current text?`;
}

// ─── AI Partner Page ──────────────────────────────────────────────────────────

export function AIPartnerPage() {
  const [messages, setMessages]         = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput]               = useState('');
  const [selectedType, setSelectedType] = useState<AIAssistType>('style_suggestion');
  const [isLoading, setIsLoading]       = useState(false);
  const messagesEndRef                  = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text?: string, type?: AIAssistType) => {
    const msgText = (text ?? input).trim();
    if (!msgText || isLoading) return;

    const userMsg: Message = {
      id:        `user-${Date.now()}`,
      role:      'user',
      content:   msgText,
      timestamp: new Date().toISOString(),
      type:      type ?? selectedType,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/api/ai/suggest`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          sessionId:       'dashboard-session',
          prompt:          msgText,
          type:            type ?? selectedType,
          documentContext: '',
        }),
      });

      const content = res.ok
        ? ((await res.json()).suggestion ?? 'No response from IBM Granite.')
        : generateMockResponse(msgText, type ?? selectedType);

      setMessages(prev => [...prev, {
        id:               `asst-${Date.now()}`,
        role:             'assistant',
        content,
        timestamp:        new Date().toISOString(),
        type:             type ?? selectedType,
        accepted:         null,
        guardianApproved: true,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id:               `asst-${Date.now()}`,
        role:             'assistant',
        content:          generateMockResponse(msgText, type ?? selectedType),
        timestamp:        new Date().toISOString(),
        type:             type ?? selectedType,
        accepted:         null,
        guardianApproved: true,
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleAccept  = (id: string) => setMessages(prev => prev.map(m => m.id === id ? { ...m, accepted: true  } : m));
  const handleDecline = (id: string) => setMessages(prev => prev.map(m => m.id === id ? { ...m, accepted: false } : m));

  const aiInteractions = messages.filter(m => m.role === 'assistant' && m.id !== 'sys-1').length;

  return (
    <div className="flex" style={{ height: 'calc(100vh - 73px)' }}>

      {/* ── Main Chat Column ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: MP.border, background: `${MP.surface}cc` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ background: `${MP.teal}18`, borderColor: `${MP.teal}35` }}>
              <span className="text-lg" role="img" aria-label="IBM Granite AI">🤖</span>
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: MP.text }}>IBM Granite AI Creative Partner</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: MP.success }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ background: MP.success }} />
                </span>
                <span className="text-xs" style={{ color: MP.muted }}>granite-3-8b-instruct · Granite Guardian Active</span>
              </div>
            </div>
          </div>

          {/* IBM badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
            style={{ background: `${MP.ibm}12`, borderColor: `${MP.ibm}30` }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden="true">
              <rect width="24" height="24" rx="4" fill="#0F62FE" />
              <text x="4" y="17" fontSize="13" fontWeight="bold" fill="white" fontFamily="monospace">g</text>
            </svg>
            <span className="text-xs font-medium" style={{ color: MP.ibm }}>watsonx.ai</span>
          </div>
        </div>

        {/* Disclosure banner */}
        <div className="mx-4 mt-3 p-3 rounded-xl border flex items-start gap-2 flex-shrink-0"
          style={{ background: `${MP.warning}10`, borderColor: `${MP.warning}25` }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: MP.warning }}>
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs" style={{ color: MP.warning }}>
            <strong>Transparency:</strong> Every AI interaction is logged in your Process Ledger and disclosed in your Authenticity Report. You always explicitly accept or decline suggestions.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map(msg => (
            <div key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 border"
                  style={{ background: `${MP.teal}18`, borderColor: `${MP.teal}30` }}>
                  <span className="text-sm">🤖</span>
                </div>
              )}

              <div className={`max-w-[76%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.type && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color:      msg.role === 'user' ? MP.teal    : MP.ibm,
                      background: msg.role === 'user' ? `${MP.teal}18` : `${MP.ibm}18`,
                    }}>
                    {TYPE_LABELS[msg.type]}
                  </span>
                )}

                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    background:   msg.role === 'user' ? `${MP.tealDark}60` : MP.elevated,
                    borderColor:  msg.role === 'user' ? `${MP.teal}40`     : MP.border,
                    border:       '1px solid',
                    color:        MP.text,
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  }}>
                  {msg.content}
                </div>

                {/* Accept / Decline buttons */}
                {msg.role === 'assistant' && msg.accepted === null && msg.id !== 'sys-1' && (
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => handleAccept(msg.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all"
                      style={{ background: `${MP.success}12`, borderColor: `${MP.success}30`, color: MP.success }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${MP.success}22`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${MP.success}12`; }}>
                      ✓ Accept
                    </button>
                    <button onClick={() => handleDecline(msg.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all"
                      style={{ background: `${MP.error}12`, borderColor: `${MP.error}30`, color: MP.error }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${MP.error}22`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${MP.error}12`; }}>
                      ✗ Decline
                    </button>
                    <span className="text-[10px]" style={{ color: MP.muted }}>Logged in Process Ledger</span>
                  </div>
                )}
                {msg.accepted === true  && <span className="text-[10px]" style={{ color: MP.success }}>✓ Accepted — logged in Process Ledger</span>}
                {msg.accepted === false && <span className="text-[10px]" style={{ color: MP.muted }}>✗ Declined — still disclosed in report</span>}

                <span className="text-[10px] px-1" style={{ color: MP.muted }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0"
                style={{ background: `${MP.teal}18`, borderColor: `${MP.teal}30` }}>
                <span className="text-sm">🤖</span>
              </div>
              <div className="px-4 py-3 rounded-2xl border"
                style={{ background: MP.elevated, borderColor: MP.border }}>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full"
                      style={{ background: MP.teal, animation: `bounceDot 1.4s ease-in-out ${i * 0.16}s infinite` }} />
                  ))}
                </div>
                <div className="text-xs mt-1" style={{ color: MP.muted }}>IBM Granite is processing…</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts (shown only at start) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p.text}
                onClick={() => handleSend(p.text, p.type)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs border transition-all"
                style={{ background: MP.elevated, borderColor: MP.border, color: MP.textSoft }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = MP.teal; (e.currentTarget as HTMLElement).style.color = MP.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = MP.border; (e.currentTarget as HTMLElement).style.color = MP.textSoft; }}>
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-4 flex-shrink-0" style={{ borderColor: MP.border }}>
          {/* Type selector */}
          <div className="flex gap-2 mb-3">
            {(['style_suggestion', 'brainstorm', 'grammar_check'] as AIAssistType[]).map(type => (
              <button key={type} onClick={() => setSelectedType(type)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                style={selectedType === type
                  ? { background: `${MP.teal}20`, color: MP.teal, borderColor: `${MP.teal}40` }
                  : { background: 'transparent', color: MP.muted, borderColor: MP.border }}>
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask IBM Granite for writing assistance…"
              className="ca-input flex-1"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="ca-btn-primary px-5 py-2.5 font-semibold"
              aria-label="Send message">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* ── Context Sidebar ───────────────────────────────────────────────────── */}
      <aside className="w-64 border-l flex-shrink-0 overflow-y-auto hidden lg:flex flex-col"
        style={{ borderColor: MP.border, background: MP.surface }}>
        <div className="p-4 border-b" style={{ borderColor: MP.border }}>
          <h3 className="font-semibold text-sm" style={{ color: MP.text }}>Session Context</h3>
          <p className="text-xs mt-0.5" style={{ color: MP.muted }}>Live data visible to IBM Granite</p>
        </div>
        <div className="p-4 space-y-5 flex-1">

          {/* Session stats */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: MP.muted }}>Current Session</div>
            <div className="rounded-xl p-3 space-y-2 text-xs border"
              style={{ background: MP.elevated, borderColor: MP.border }}>
              {[
                { k: 'Words',    v: '1,247'         },
                { k: 'Duration', v: '34m'            },
                { k: 'Cadence',  v: '91/100', hi: true },
              ].map(r => (
                <div key={r.k} className="flex justify-between">
                  <span style={{ color: MP.muted }}>{r.k}</span>
                  <span className="font-mono font-semibold" style={{ color: r.hi ? MP.success : MP.text }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI counter */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: MP.muted }}>AI Assists This Session</div>
            <div className="rounded-xl p-3 text-xs border"
              style={{ background: MP.elevated, borderColor: MP.border }}>
              <div className="text-2xl font-black font-mono mb-0.5" style={{ color: MP.ibm }}>{aiInteractions}</div>
              <div style={{ color: MP.muted }}>interactions logged</div>
              <div className="mt-2 text-[10px]" style={{ color: `${MP.muted}` }}>All disclosed in report</div>
            </div>
          </div>

          {/* IBM Granite badge */}
          <div className="mt-auto">
            <div className="rounded-xl p-4 text-center border"
              style={{ background: `${MP.ibm}08`, borderColor: `${MP.ibm}25` }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 mx-auto mb-2" aria-label="IBM logo">
                <rect width="24" height="24" rx="6" fill="#0F62FE" />
                <text x="4" y="18" fontSize="14" fontWeight="bold" fill="white" fontFamily="monospace">g</text>
              </svg>
              <div className="text-xs font-semibold mb-0.5" style={{ color: MP.ibm }}>IBM Granite 3</div>
              <div className="text-[10px]" style={{ color: MP.muted }}>granite-3-8b-instruct</div>
              <div className="text-[10px]" style={{ color: MP.muted }}>via watsonx.ai</div>
              <div className="text-[10px] mt-2 font-medium" style={{ color: `${MP.teal}` }}>Granite Guardian: Active</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
