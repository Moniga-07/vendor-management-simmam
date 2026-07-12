import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        simmam: {
          bg: '#080808',
          surface: '#111111',
          elevated: '#1a1a1a',
          overlay: '#0d0d0d',
          gold: {
            DEFAULT: '#D4AF37',
            bright: '#F5C518',
            muted: '#8B7230',
            dark: '#5C4A1E',
            subtle: 'rgba(212, 175, 55, 0.08)',
            border: 'rgba(212, 175, 55, 0.15)',
          },
          red: {
            DEFAULT: '#CC0000',
            deep: '#8B0000',
            muted: 'rgba(204, 0, 0, 0.15)',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#A0A0A0',
            muted: '#606060',
            disabled: '#404040',
          },
          success: '#16a34a',
          error: '#dc2626',
          warning: '#d97706',
          info: '#2563eb',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'simmam': '8px',
        'simmam-sm': '4px',
        'simmam-lg': '12px',
        'simmam-xl': '16px',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.15)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.2)',
        'gold-sm': '0 0 10px rgba(212, 175, 55, 0.1)',
        'surface': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'surface-lg': '0 8px 48px rgba(0, 0, 0, 0.6)',
        'glow-success': '0 0 20px rgba(22, 163, 74, 0.3)',
        'glow-error': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-warning': '0 0 20px rgba(217, 119, 6, 0.3)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F5C518 50%, #D4AF37 100%)',
        'dark-gradient': 'linear-gradient(180deg, #080808 0%, #111111 100%)',
        'surface-gradient': 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.1) 50%, transparent 100%)',
      },
      animation: {
        'scan-line': 'scanLine 2s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'corner': 'corner 1.5s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0' },
          '50%': { transform: 'translateY(200px)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(212,175,55,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(212,175,55,0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212,175,55,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(212,175,55,0.7)' },
        },
        corner: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}

export default config
