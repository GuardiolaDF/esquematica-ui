// RAMS Design System — fuente única de tokens.
// Transcripto de Figma "Esquemática (Community)" › Frame 100 (node 2360:1497), actualizado 01 OCT 2026.
// Los nombres siguen las variables de Figma; `cssVar` es el "code syntax WEB" definido en cada variable.
// tailwind.config.js consume este archivo para las clases y para emitir las variables CSS en :root.

// ─── Rams / Primitives (32) ──────────────────────────────────────────────
export const primitives = {
  neutral: {
    0: '#FFFFFF', 50: '#FDFAF2', 100: '#EFEBE2', 200: '#DDD9CE', 300: '#C2BCAF', 400: '#A89F90',
    500: '#8A8177', 600: '#716963', 700: '#5C5451', 800: '#423F3D', 900: '#2D2D2D', 1000: '#000000',
  },
  coral: {
    50: '#FFF6F4', 100: '#FFEAE4', 200: '#FFD6CC', 300: '#FFC1B1', 400: '#FFAC96',
    500: '#FF9479', 600: '#E0826A', 700: '#BF6F5B', 800: '#995949', 900: '#734336',
  },
  teal: {
    50: '#EDF3F3', 100: '#D6E3E4', 200: '#B3CBCD', 300: '#8AAFB2', 400: '#629497',
    500: '#39787D', 600: '#1A6369', 700: '#015258', 800: '#014348', 900: '#013539',
  },
};

const { neutral: n, coral: c, teal: t } = primitives;

// ─── Rams / Semantic (55, modo Light) ────────────────────────────────────
// Claves = ruta de la variable en Figma; los valores son alias de primitivos.
export const semantic = {
  background: { base: n[50], sunken: n[100] },
  surface: { base: n[0], subtle: n[100], raised: n[0], inverse: n[900] },
  text: {
    primary: n[900], secondary: n[700], muted: n[500], disabled: n[400], inverse: n[50],
    accent: t[700], link: t[700], 'on-accent': n[50],
  },
  icon: { primary: n[900], secondary: n[600], muted: n[400], inverse: n[50], accent: t[700] },
  border: { subtle: n[200], default: n[300], strong: n[500], focus: t[500] },
  action: {
    primary: { default: t[700], hover: t[800], pressed: t[900], text: n[50] },
    secondary: { default: n[200], hover: n[300], pressed: n[400], text: n[900] },
    destructive: { default: c[700], hover: c[800], pressed: c[900], text: n[50] },
  },
  control: {
    background: n[0], 'background-hover': n[100], selected: t[700], disabled: n[200], track: n[300], thumb: n[0],
  },
  status: {
    info: { background: t[100], foreground: t[800] },
    success: { background: t[100], foreground: t[800] },
    warning: { background: c[100], foreground: c[800] },
    danger: { background: c[200], foreground: c[900] },
  },
  display: { background: n[900], foreground: n[50], accent: c[500] },
  indicator: { active: c[500], inactive: n[400] },
  overlay: { scrim: '#0000008C' },
};

// ─── Rams / Dimensions (40) — px salvo opacity (0–1) y motion (ms) ───────
export const dimensions = {
  space: { 0: 0, 2: 2, 4: 4, 6: 6, 8: 8, 12: 12, 16: 16, 24: 24, 32: 32, 48: 48, 64: 64 },
  radius: { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, pill: 999 },
  border: { hairline: 0.5, default: 1, strong: 1.5, focus: 2 },
  size: {
    icon: { s: 16, m: 20, l: 24 },
    control: { s: 28, m: 32, l: 40, xl: 48 },
    knob: { s: 24, m: 32, l: 48 },
  },
  opacity: { subtle: 0.08, disabled: 0.4, muted: 0.64, strong: 0.88, full: 1 },
  motion: { fast: 100, standard: 160, slow: 240 },
};

// ─── Rams / Typography (28) ──────────────────────────────────────────────
export const typography = {
  family: {
    body: '"JetBrains Mono", monospace',
    // Figma: "Satori TIAL". Localmente se sirve como 'Satori' desde /public/Satori Font Family.
    heading: '"Satori", sans-serif',
  },
  weight: { regular: 400, medium: 500, 'heading-default': 500, 'heading-strong': 700 },
  'font-size': {
    micro: 8, // extensión del sistema: etiquetas de perillas y switches en Figma
    caption: 10, 'label-sm': 11, 'body-sm': 12, 'body-md': 13, 'body-lg': 14,
    'heading-h4': 16, 'heading-h3': 18, 'heading-h2': 22, 'heading-h1': 28,
  },
  'line-height': {
    tight: 14, compact: 16, standard: 18, relaxed: 20,
    'heading-h4': 22, 'heading-h3': 24, 'heading-h2': 28, 'heading-h1': 36,
  },
  'letter-spacing': {
    normal: 0, label: 0.2, 'heading-tight': -0.4, 'heading-compact': -0.2, 'heading-normal': 0,
  },
};

// ─── Text styles (12) — Typography/… ─────────────────────────────────────
const ty = typography;
const style = (family, weight, size, lineHeight, tracking = 0) => ({ family, weight, size, lineHeight, tracking });
export const textStyles = {
  'body-l': style('body', 'regular', ty['font-size']['body-lg'], ty['line-height'].relaxed),
  'body-m': style('body', 'regular', ty['font-size']['body-md'], ty['line-height'].standard),
  'body-s': style('body', 'regular', ty['font-size']['body-sm'], ty['line-height'].compact),
  'label-m': style('body', 'medium', ty['font-size']['body-sm'], ty['line-height'].compact, ty['letter-spacing'].label),
  'label-s': style('body', 'medium', ty['font-size']['label-sm'], ty['line-height'].tight, ty['letter-spacing'].label),
  caption: style('body', 'regular', ty['font-size'].caption, ty['line-height'].tight),
  // Extensión: Figma usa 8 px en las etiquetas de posición de perillas (regular) y en Sí/No de switches (medium)
  micro: style('body', 'regular', ty['font-size'].micro, ty['line-height'].tight),
  'micro-label': style('body', 'medium', ty['font-size'].micro, ty['line-height'].tight, ty['letter-spacing'].label),
  control: style('body', 'medium', ty['font-size']['label-sm'], ty['line-height'].tight),
  data: style('body', 'medium', ty['font-size']['body-sm'], ty['line-height'].compact),
  h1: style('heading', 'heading-strong', ty['font-size']['heading-h1'], ty['line-height']['heading-h1'], ty['letter-spacing']['heading-tight']),
  h2: style('heading', 'heading-strong', ty['font-size']['heading-h2'], ty['line-height']['heading-h2'], ty['letter-spacing']['heading-compact']),
  h3: style('heading', 'heading-default', ty['font-size']['heading-h3'], ty['line-height']['heading-h3']),
  h4: style('heading', 'heading-default', ty['font-size']['heading-h4'], ty['line-height']['heading-h4']),
};

// ─── Effects (6) — Effects/… ─────────────────────────────────────────────
export const effects = {
  'elevation-01': '0px 1px 2px 0px #2D2D2D1F',
  'elevation-02': '-2px -2px 6px 0px #FFFFFFD1, 3px 3px 8px 0px #2D2D2D2E',
  'elevation-03': '-4px -4px 10px 0px #FFFFFFE5, 6px 8px 20px 0px #2D2D2D38',
  'inset-control': 'inset -1px -1px 2px 0px #FFFFFFC7, inset 1px 2px 4px 0px #2D2D2D38',
  'inset-pressed': 'inset 2px 2px 5px 0px #2D2D2D47, inset -1px -1px 2px 0px #FFFFFF8C',
  'focus-soft': '0px 0px 0px 2px #39787D61',
};

// ─── Grid/Desktop/12 Columns ─────────────────────────────────────────────
export const grid = { desktop: { columns: 12, gutter: 24, offset: 32 } };

// ─── Variables CSS con el "code syntax WEB" de Figma ─────────────────────
const px = (v) => `${v}px`;
const flatten = (obj, prefix, out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const name = prefix ? `${prefix}-${k}` : k;
    if (v && typeof v === 'object') flatten(v, name, out);
    else out[`--${name}`] = v;
  }
  return out;
};

export const cssVariables = {
  // Colores: Figma no usa prefijo (p. ej. --neutral-50, --background-base)
  ...flatten(primitives, ''),
  ...flatten(semantic, ''),
  // Dimensiones y tipografía: prefijo --rams-
  ...Object.fromEntries(Object.entries(dimensions.space).map(([k, v]) => [`--rams-space-${k}`, px(v)])),
  ...Object.fromEntries(Object.entries(dimensions.radius).map(([k, v]) => [`--rams-radius-${k}`, px(v)])),
  ...Object.fromEntries(Object.entries(dimensions.border).map(([k, v]) => [`--rams-border-${k}`, px(v)])),
  ...Object.fromEntries(Object.entries(flatten(dimensions.size, 'rams-size')).map(([k, v]) => [k, px(v)])),
  ...Object.fromEntries(Object.entries(dimensions.opacity).map(([k, v]) => [`--rams-opacity-${k}`, String(v)])),
  ...Object.fromEntries(Object.entries(dimensions.motion).map(([k, v]) => [`--rams-motion-${k}`, `${v}ms`])),
  '--rams-family-body': typography.family.body,
  '--rams-family-heading': typography.family.heading,
  ...Object.fromEntries(Object.entries(typography['font-size']).map(([k, v]) => [`--rams-font-size-${k}`, px(v)])),
  ...Object.fromEntries(Object.entries(typography['line-height']).map(([k, v]) => [`--rams-line-height-${k}`, px(v)])),
  ...Object.fromEntries(Object.entries(typography['letter-spacing']).map(([k, v]) => [`--rams-letter-spacing-${k}`, px(v)])),
  ...Object.fromEntries(Object.entries(effects).map(([k, v]) => [`--rams-effect-${k}`, v])),
};
