/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        slate: {
          850: '#172033',
        },
        signal: {
          teal: '#0E7C86',
          tealDark: '#0A5F67',
          amber: '#C77B1F',
          green: '#1F8A5A',
          red: '#B4402A',
        },
        paper: '#F6F5F1',
        line: '#E3E1D9',
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 0 rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
}
