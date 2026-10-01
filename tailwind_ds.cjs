const fs = require('fs');
const config = `/** @type {import('tailwindcss').Config} */
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
        body: ['"JetBrains Mono"', 'monospace'],
        heading: ['"Satori"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      fontSize: {
        'caption': ['10px', '14px'],
        'label-sm': ['11px', '14px'],
        'body-sm': ['12px', '18px'],
        'body-md': ['13px', '18px'],
        'body-lg': ['14px', '20px'],
        'heading-h4': ['16px', '22px'],
        'heading-h3': ['18px', '24px'],
        'heading-h2': ['22px', '28px'],
        'heading-h1': ['28px', '36px'],
      },
      boxShadow: {
        'elevation-01': '0px 1px 2px 0px rgba(45, 45, 45, 0.12)', 
        'elevation-02': '-2px -2px 6px 0px rgba(255, 255, 255, 0.82), 3px 3px 8px 0px rgba(45, 45, 45, 0.18)',
        'elevation-03': '-4px -4px 10px 0px rgba(255, 255, 255, 0.90), 6px 8px 20px 0px rgba(45, 45, 45, 0.22)',
        'inset-control': 'inset -1px -1px 2px 0px rgba(255, 255, 255, 0.78), inset 1px 2px 4px 0px rgba(45, 45, 45, 0.22)',
        'inset-pressed': 'inset 2px 2px 5px 0px rgba(45, 45, 45, 0.28), inset -1px -1px 2px 0px rgba(255, 255, 255, 0.55)',
        'focus-soft': '0px 0px 0px 2px rgba(57, 120, 125, 0.38)',
      },
      colors: {
        neutral: {
          0: '#FFFFFF',
          50: '#FDFAF2',
          100: '#EFEBE2',
          200: '#DDD9CE',
          300: '#C2BCAF',
          400: '#A89F90',
          500: '#8A8177',
          600: '#716963',
          700: '#5C5451',
          800: '#423F3D',
          900: '#2D2D2D',
          1000: '#000000',
        },
        coral: {
          50: '#FFF6F4',
          100: '#FFEAE4',
          200: '#FFD6CC',
          300: '#FFC1B1',
          400: '#FFAC96',
          500: '#FF9479',
          600: '#E0826A',
          700: '#BF6F5B',
          800: '#995949',
          900: '#734336',
        },
        teal: {
          50: '#EDF3F3',
          100: '#D6E3E4',
          200: '#B3CBCD',
          300: '#8AAFB2',
          400: '#629497',
          500: '#39787D',
          600: '#1A6369',
          700: '#015258',
          800: '#014348',
          900: '#013539',
        },
        // Semantic aliases
        bg: {
          base: '#FDFAF2', // neutral/50
          sunken: '#EFEBE2', // neutral/100
        },
        surface: {
          base: '#FFFFFF', // neutral/0
          subtle: '#EFEBE2', // neutral/100
          raised: '#FFFFFF', // neutral/0
          inverse: '#2D2D2D', // neutral/900
        },
        text: {
          primary: '#2D2D2D', // neutral/900
          secondary: '#5C5451', // neutral/700
          muted: '#8A8177', // neutral/500
          disabled: '#A89F90', // neutral/400
          inverse: '#FDFAF2', // neutral/50
          accent: '#015258', // teal/700
        },
        border: {
          subtle: '#DDD9CE', // neutral/200
          default: '#C2BCAF', // neutral/300
          strong: '#8A8177', // neutral/500
          focus: '#39787D', // teal/500
        },
        action: {
          primary: {
            default: '#015258',
            hover: '#014348',
            pressed: '#013539',
            text: '#FDFAF2',
          },
          secondary: {
            default: '#DDD9CE',
            hover: '#C2BCAF',
            pressed: '#A89F90',
            text: '#2D2D2D',
          },
          destructive: {
            default: '#BF6F5B',
            hover: '#995949',
            pressed: '#734336',
            text: '#FDFAF2',
          }
        },
        control: {
          bg: '#FFFFFF',
          'bg-hover': '#EFEBE2',
          selected: '#015258',
          disabled: '#DDD9CE',
          track: '#C2BCAF',
          thumb: '#FFFFFF',
        },
        indicator: {
          active: '#FF9479',
          inactive: '#A89F90',
        }
      },
      spacing: {
        'space-0': '0px',
        'space-2': '2px',
        'space-4': '4px',
        'space-6': '6px',
        'space-8': '8px',
        'space-12': '12px',
        'space-16': '16px',
        'space-24': '24px',
        'space-32': '32px',
        'space-48': '48px',
        'space-64': '64px',
      },
      borderRadius: {
        'none': '0px',
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
`;
fs.writeFileSync('tailwind.config.js', config, 'utf8');
