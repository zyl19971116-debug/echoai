import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          900: '#03060B',
          800: '#050914',
          700: '#070C18',
          600: '#0A1120',
          500: '#0E172B',
        },
        echo: {
          blue: '#4C8DFF',
          'blue-dim': '#2B5FC7',
          violet: '#9B6BFF',
          'violet-dim': '#6C42D6',
          cyan: '#3BE8FF',
          text: '#EAF0FF',
          muted: 'rgba(214,226,255,0.68)',
          faint: 'rgba(160,182,225,0.42)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'JetBrains Mono',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      letterSpacing: {
        tightest: '-0.045em',
        widest2: '0.28em',
      },
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        '8xl': ['6rem', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        '9xl': ['7.5rem', { lineHeight: '0.9', letterSpacing: '-0.045em' }],
      },
      maxWidth: {
        shell: '1440px',
        wide: '1680px',
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(76,141,255,0.55)',
        'glow-lg': '0 0 90px -20px rgba(120,110,255,0.65)',
        'glow-cyan': '0 0 50px -14px rgba(59,232,255,0.55)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'echo-gradient': 'linear-gradient(96deg, #4C8DFF 0%, #7A6BFF 48%, #9B6BFF 100%)',
        'echo-gradient-soft':
          'linear-gradient(96deg, rgba(76,141,255,0.16) 0%, rgba(155,107,255,0.16) 100%)',
        'cyan-violet': 'linear-gradient(96deg, #3BE8FF 0%, #9B6BFF 100%)',
        'radial-fade':
          'radial-gradient(circle at 50% 50%, rgba(76,141,255,0.20) 0%, rgba(76,141,255,0) 70%)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '35%': { opacity: '0.9' },
          '100%': { transform: 'translateY(900%)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'dash-flow': {
          from: { strokeDashoffset: '240' },
          to: { strokeDashoffset: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 4.5s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        scanline: 'scanline 5.5s linear infinite',
        shimmer: 'shimmer 2.6s linear infinite',
        'spin-slow': 'spin-slow 22s linear infinite',
        'dash-flow': 'dash-flow 6s linear infinite',
        marquee: 'marquee 38s linear infinite',
      },
      transitionTimingFunction: {
        echo: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
