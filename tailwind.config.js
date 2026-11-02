/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aqua: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        wellness: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          subtle: '#F1F5F9',
          muted: '#64748B',
          text: '#0F172A',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'walk-bob': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'leg-left': {
          '0%, 100%': { transform: 'rotate(-16deg)' },
          '50%': { transform: 'rotate(16deg)' },
        },
        'leg-right': {
          '0%, 100%': { transform: 'rotate(16deg)' },
          '50%': { transform: 'rotate(-16deg)' },
        },
        'arm-swing': {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.9' },
        },
      },
      animation: {
        'walk-bob': 'walk-bob 0.4s ease-in-out infinite',
        'leg-left': 'leg-left 0.4s ease-in-out infinite',
        'leg-right': 'leg-right 0.4s ease-in-out infinite',
        'arm-swing': 'arm-swing 0.4s ease-in-out infinite',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-gentle': 'float-gentle 2.5s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(14, 165, 233, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-float': '0 12px 32px -4px rgba(14, 165, 233, 0.16), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'inner-light': 'inset 0 2px 4px rgba(255, 255, 255, 0.6)',
      },
    },
  },
  plugins: [],
};
