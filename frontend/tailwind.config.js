/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        brand: {
          50: '#f0f5ff',
          100: '#d6e4ff',
          500: '#2f54eb',
          600: '#1d39c4',
          700: '#10239e',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#181a20',
        },
        muted: {
          DEFAULT: '#f3f4f6',
          dark: '#23272f',
        },
        accent: {
          500: '#f59e42',
          600: '#d97706',
        },
        'dark-bg': '#10131a',
        'dark-surface': '#181a20',
        'dark-muted': '#23272f',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'space-grotesk': ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};