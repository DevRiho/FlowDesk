/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // High-end enterprise slate & brand palette
        brand: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c5dcff',
          300: '#99c3ff',
          400: '#649fff',
          500: '#3b7aff',
          600: '#1d57f3',
          700: '#1541e0',
          800: '#1736b5',
          900: '#19318f',
          950: '#131e57',
        },
        surface: {
          50: '#f8fafc',
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
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

