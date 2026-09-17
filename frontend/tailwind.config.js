/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#070A11',
          950: '#0B0F19',
        },
        gov: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0052cc',
          600: '#0747a6',
          700: '#003380',
          800: '#0c2340',
          900: '#051329',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      boxShadow: {
        'glass-dark': '0 20px 50px rgba(0, 0, 0, 0.5)',
        'glass-light': '0 20px 40px rgba(15, 23, 42, 0.06)',
        'glow-blue': '0 0 25px rgba(37, 99, 235, 0.25)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.2)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
