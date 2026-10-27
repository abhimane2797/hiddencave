/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#04050a',
          900: '#07080f',
          850: '#0a0c15',
          800: '#0e111b',
          750: '#121623',
          700: '#1a1f30',
          600: '#232a41',
          500: '#333c56',
          400: '#4b5675',
        },
        brand: {
          50: '#eef4ff',
          200: '#c7dbff',
          300: '#8ab4ff',
          400: '#5b93ff',
          500: '#3b7dff',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#14306b',
        },
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
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
        display: [
          '"Space Grotesk"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 36px -8px rgb(var(--accent-rgb) / 0.65)',
        'glow-sm': '0 0 18px -6px rgb(var(--accent-rgb) / 0.7)',
        'glow-violet': '0 0 36px -8px rgba(139, 92, 246, 0.6)',
        card: '0 18px 40px -24px rgba(0, 0, 0, 0.9)',
        panel: '0 24px 60px -30px rgba(0, 0, 0, 0.95)',
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)',
        'radial-fade':
          'radial-gradient(ellipse at top, rgba(59,125,255,0.18), transparent 60%)',
        aurora:
          'radial-gradient(60% 60% at 20% 10%, rgba(59,125,255,0.22), transparent 60%), radial-gradient(50% 50% at 85% 20%, rgba(139,92,246,0.22), transparent 60%), radial-gradient(60% 60% at 60% 90%, rgba(34,211,238,0.12), transparent 60%)',
      },
      backgroundSize: {
        grid: '42px 42px',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--accent-rgb) / 0.5)' },
          '70%': { boxShadow: '0 0 0 12px rgb(var(--accent-rgb) / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(var(--accent-rgb) / 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'alert-flash': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        shimmer: 'shimmer 2.6s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'alert-flash': 'alert-flash 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}