/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#16302B',
          light: '#1F433C',
          dark: '#0E211D',
        },
        sand: {
          DEFAULT: '#F1E9D8',
          light: '#F8F3E7',
          dark: '#E4D8BC',
        },
        amber: {
          DEFAULT: '#E1A340',
          dark: '#C7862A',
        },
        sage: {
          DEFAULT: '#7C9885',
          dark: '#5F7A68',
        },
        clay: {
          DEFAULT: '#B65C42',
          dark: '#984A34',
        },
        slate: {
          DEFAULT: '#4A5568',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        ticket: '0 1px 0 rgba(22,48,43,0.06), 0 8px 20px -8px rgba(22,48,43,0.25)',
      },
    },
  },
  plugins: [],
};
