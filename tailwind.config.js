/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-orange-500/20', 'bg-orange-500/30', 'bg-orange-500/40', 'bg-orange-500/50', 'bg-orange-500/80',
    'bg-blue-500/20', 'bg-blue-500/30', 'bg-blue-500/40', 'bg-blue-500/50', 'bg-blue-500/80',
    'ring-orange-500', 'ring-blue-500',
    'border-orange-500', 'border-blue-500',
    'border-orange-500/80', 'border-blue-500/80',
    'bg-orange-500', 'bg-blue-500',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
