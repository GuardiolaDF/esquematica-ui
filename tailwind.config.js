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
        display: ['"Satori TRIAL"', '"Satori"', 'sans-serif']
      },
      colors: {
        synth: {
          // Fondos principales
          surface: '#eeebe1',    // Fondo general del sintetizador
          panel: '#fdfaf2',      // Fondo de los módulos (filters-panel, etc)
          module: '#ffffff',     // Fondo interno de componentes
          track: '#efebe2',      // Fondo de los faders
          
          // Acentos (LEDs, indicadores)
          accent: '#ff9479',
          'accent-light': '#ffab96',
          
          // Bordes y metales (Cables, jacks, strokes)
          border: {
            light: '#ddd9ce',
            base: '#898176',
            dark: '#716962'
          },
          
          // Tintas (Textos, líneas divisorias, etiquetas)
          ink: {
            light: '#a89f90',
            base: '#5c5451',
            dark: '#423e3d',
            darker: '#2d2d2d',
            black: '#000000'
          }
        }
      }
    },
  },
  plugins: [],
}
