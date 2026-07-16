/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'alibi': {
          'violet':        '#7C3AED',
          'violet-light':  '#A78BFA',
          'violet-dark':   '#5B21B6',
          'violet-ghost':  '#7C3AED1A',
          'emerald':       '#10B981',
          'emerald-light': '#34D399',
          'emerald-ghost': '#10B9811A',
          'bg':            '#0F0D1A',
          'bg-card':       '#1E1B2E',
          'bg-elevated':   '#2D2A40',
          'bg-hover':      '#3D3A50',
          'text':          '#E2E8F0',
          'text-muted':    '#94A3B8',
          'text-subtle':   '#64748B',
          'warning':       '#F59E0B',
          'error':         '#EF4444',
          'info':          '#3B82F6',
          'ai':            '#8B5CF6',
          'ai-light':      '#C4B5FD',
          'ai-ghost':      '#8B5CF61A',
          'border':        '#2D2A4080',
          'border-light':  '#3D3A5080',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace'],
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in':     'slideIn 0.2s ease-out',
        'fade-in':      'fadeIn 0.15s ease-out',
        'shimmer':      'shimmer 2s infinite linear',
        'bounce-dot':   'bounceDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
