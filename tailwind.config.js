import plugin from 'tailwindcss/plugin';
import { primitives, semantic, dimensions, typography, textStyles, effects, cssVariables } from './src/design/tokens.js';

// Tokens RAMS → Tailwind. Los valores viven en src/design/tokens.js (fuente única, transcripta de Figma).
const px = (v) => `${v}px`;
const mapPx = (obj, prefix = '') => Object.fromEntries(Object.entries(obj).map(([k, v]) => [`${prefix}${k}`, px(v)]));
const ty = typography;

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
        body: [ty.family.body],
        heading: [ty.family.heading],
        // sans apunta a la familia de cuerpo: no hay otra sans en el sistema
        sans: [ty.family.body]
      },
      fontSize: {
        // Tamaños sueltos (font-size + line-height asociado)
        'caption': [px(ty['font-size'].caption), px(ty['line-height'].tight)],
        'label-sm': [px(ty['font-size']['label-sm']), px(ty['line-height'].tight)],
        'body-sm': [px(ty['font-size']['body-sm']), px(ty['line-height'].compact)],
        'body-md': [px(ty['font-size']['body-md']), px(ty['line-height'].standard)],
        'body-lg': [px(ty['font-size']['body-lg']), px(ty['line-height'].relaxed)],
        'heading-h4': [px(ty['font-size']['heading-h4']), px(ty['line-height']['heading-h4'])],
        'heading-h3': [px(ty['font-size']['heading-h3']), px(ty['line-height']['heading-h3'])],
        'heading-h2': [px(ty['font-size']['heading-h2']), px(ty['line-height']['heading-h2'])],
        'heading-h1': [px(ty['font-size']['heading-h1']), px(ty['line-height']['heading-h1'])],
      },
      letterSpacing: mapPx(ty['letter-spacing']),
      boxShadow: effects,
      colors: {
        ...primitives,
        // Semánticos (Rams / Semantic). `bg` se conserva como alias de `background` por compatibilidad.
        background: semantic.background,
        bg: semantic.background,
        surface: semantic.surface,
        text: semantic.text,
        icon: semantic.icon,
        border: semantic.border,
        action: semantic.action,
        control: {
          ...semantic.control,
          bg: semantic.control.background,
          'bg-hover': semantic.control['background-hover'],
        },
        status: semantic.status,
        display: semantic.display,
        indicator: semantic.indicator,
        overlay: semantic.overlay,
      },
      spacing: {
        ...mapPx(dimensions.space, 'space-'),
        ...mapPx(dimensions.size.icon, 'icon-'),
        ...mapPx(dimensions.size.control, 'control-'),
        ...mapPx(dimensions.size.knob, 'knob-'),
      },
      borderRadius: mapPx(dimensions.radius),
      borderWidth: mapPx(dimensions.border),
      opacity: dimensions.opacity,
      transitionDuration: Object.fromEntries(Object.entries(dimensions.motion).map(([k, v]) => [k, `${v}ms`])),
    },
  },
  plugins: [
    plugin(({ addBase, addComponents }) => {
      // Variables CSS con el code syntax WEB de Figma (--background-base, --rams-space-8, …)
      addBase({ ':root': cssVariables });
      // Estilos de texto de Figma (Typography/…) → .type-body-m, .type-label-s, .type-h1, …
      addComponents(Object.fromEntries(Object.entries(textStyles).map(([name, s]) => [`.type-${name}`, {
        fontFamily: ty.family[s.family],
        fontWeight: String(ty.weight[s.weight]),
        fontSize: px(s.size),
        lineHeight: px(s.lineHeight),
        letterSpacing: px(s.tracking),
      }])));
    }),
  ],
}
