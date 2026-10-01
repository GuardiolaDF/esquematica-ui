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
        sans: ['"Plus Jakarta Sans"', 'Satoshi', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Satori"', 'sans-serif']
      },
                  boxShadow: {
        'neo-out': '3px 3px 8px rgba(45, 45, 45, 0.18), -2px -2px 6px rgba(255, 255, 255, 0.82)',
        'neo-in': 'inset 1px 2px 4px rgba(45, 45, 45, 0.22), inset -1px -1px 2px rgba(255, 255, 255, 0.78)',
        'neo-knob': '3px 4px 8px rgba(45, 45, 45, 0.22), inset 1px 1px 2px rgba(255, 255, 255, 0.75)',
        'neo-panel': '6px 8px 20px rgba(45, 45, 45, 0.22), -4px -4px 10px rgba(255, 255, 255, 0.9)'
      },
      colors: {
        synth: {
          surface: '#DFDCD1',
          panel: '#FBF9F1',
          module: '#DFDCD1',
          track: '#EAE6DB',
          accent: '#F89680',
          'accent-alt': '#005E5D',
          border: {
            light: '#FFFFFF',
            base: '#AAA399',
            dark: '#66615C'
          },
          ink: {
            light: '#AAA399',
            base: '#66615C',
            dark: '#323232',
            darker: '#1A1A1A',
            black: '#000000'
          }
        }
      }
    },
  },
  plugins: [],
}

