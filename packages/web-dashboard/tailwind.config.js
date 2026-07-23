/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map to CSS custom properties for easy overriding
        'color': {
          'bg':             'var(--color-bg)',
          'surface':        'var(--color-surface)',
          'surface-2':      'var(--color-surface-2)',
          'surface-3':      'var(--color-surface-3)',
          'text':           'var(--color-text)',
          'text-soft':      'var(--color-text-soft)',
          'text-muted':     'var(--color-text-muted)',
          'border':         'var(--color-border)',
          'accent':         'var(--color-accent)',
          'success':        'var(--color-success)',
          'error':          'var(--color-error)',
          'warning':        'var(--color-warning)',
          'info':           'var(--color-info)',
          'ibm':            'var(--color-ibm)',
        },
        // Keep alibi-* aliases so pages that still use them don't break
        'alibi': {
          'violet':         '#8B74FF',
          'violet-light':   '#A090FF',
          'violet-dark':    '#6B54DF',
          'violet-ghost':   'rgba(139,116,255,0.14)',
          'emerald':        '#3DD68C',
          'emerald-light':  '#5EEBB0',
          'emerald-ghost':  'rgba(61,214,140,0.12)',
          'ai':             '#8B74FF',
          'ai-light':       '#A090FF',
          'ai-ghost':       'rgba(139,116,255,0.12)',
          'warning':        '#FFC947',
          'error':          '#FF6B6B',
          'info':           '#60AAFF',
          'bg':             '#0D0D1A',
          'bg-card':        '#16162A',
          'bg-elevated':    '#1E1E35',
          'bg-hover':       '#252540',
          'text':           '#F0F0FF',
          'text-muted':     '#B8B8D0',
          'text-subtle':    '#8888A8',
          'border':         '#2E2E50',
          'border-light':   'rgba(139,116,255,0.35)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Ensure no size below 13px is used
        'xs':   ['0.8125rem', { lineHeight: '1.4' }],  // 13px
        'sm':   ['0.9375rem', { lineHeight: '1.5' }],  // 15px
        'base': ['1rem',      { lineHeight: '1.6' }],  // 16px
        'lg':   ['1.125rem',  { lineHeight: '1.5' }],  // 18px
        'xl':   ['1.25rem',   { lineHeight: '1.4' }],  // 20px
        '2xl':  ['1.5rem',    { lineHeight: '1.3' }],  // 24px
        '3xl':  ['1.875rem',  { lineHeight: '1.2' }],  // 30px
        '4xl':  ['2.25rem',   { lineHeight: '1.1' }],  // 36px
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'fadeSlideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      boxShadow: {
        'card':     '0 2px 12px rgba(0,0,0,0.35)',
        'elevated': '0 4px 24px rgba(0,0,0,0.5)',
      },
      spacing: {
        '4.5': '1.125rem',
      },
    },
  },
  plugins: [],
};
