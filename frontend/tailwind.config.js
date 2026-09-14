/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef7ff',
          100: '#d9edff',
          200: '#bbdeff',
          300: '#8bcbff',
          400: '#54adff',
          500: '#2b8af5',
          600: '#1a6ce8',
          700: '#1556d4',
          800: '#1748ac',
          900: '#193e88',
          950: '#142754',
        },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: { DEFAULT: '#22c55e', light: '#dcfce7', dark: '#15803d' },
        warning: { DEFAULT: '#f59e0b', light: '#fef3c7', dark: '#b45309' },
        danger:  { DEFAULT: '#ef4444', light: '#fee2e2', dark: '#b91c1c' },
        info:    { DEFAULT: '#3b82f6', light: '#dbeafe', dark: '#1d4ed8' },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}
