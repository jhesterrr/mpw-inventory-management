import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        royal: {
          bg: '#FAFAFA',
          card: '#FFFFFF',
          primary: '#500B18',
          highlight: '#800020',
          gold: '#D4AF37',
          text: '#121212',
          border: '#EFECE6',
        },
        crimson: {
          bg: '#0D0D0D',
          card: '#18181A',
          primary: '#801B2C',
          alert: '#B22234',
          muted: '#8E8E93',
          text: '#F5F5F7',
          border: '#2A2A2E',
        },
        status: {
          green: '#16A34A',
          yellow: '#D97706',
          red: '#DC2626',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        serif: [
          'Playfair Display',
          'Georgia',
          'ui-serif',
          'serif',
        ],
        display: [
          'Playfair Display',
          'Georgia',
          'serif',
        ],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(80, 11, 24, 0.06), 0 2px 4px -2px rgba(80, 11, 24, 0.04)',
        'card-lg': '0 20px 25px -5px rgba(80, 11, 24, 0.1), 0 8px 10px -6px rgba(80, 11, 24, 0.06)',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-highlight': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.6)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212, 175, 55, 0)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'pulse-highlight': 'pulse-highlight 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [forms],
};
