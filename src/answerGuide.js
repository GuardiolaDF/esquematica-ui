// Cómo se responde cada pregunta con su control (modo individual).
// El panel «Variable seleccionada» muestra, debajo de la pregunta, qué gesto hacer y qué significa cada extremo:
// así queda claro que girar la perilla a la derecha es «más perfeccionista», no una decisión arbitraria.
//
//   kind:  tipo de control → define el gesto
//   low / high: qué significa el valor mínimo (0) y el máximo (100) del control
//
// Los extremos siguen la orientación de cada control: perillas y faders horizontales de izquierda (low) a
// derecha (high), faders verticales de abajo (low) a arriba (high).

const knob = (low, high) => ({ kind: 'knob', low, high });
const fader = (low, high) => ({ kind: 'fader', low, high });
const slider = (low, high) => ({ kind: 'slider', low, high });
const toggle = () => ({ kind: 'toggle', low: 'No', high: 'Sí' });
const counter = (unit) => ({ kind: 'counter', unit });
const options = (low, high) => ({ kind: 'options', low, high });
const platform = () => ({ kind: 'platform', low: '0 h', high: 'Muchas horas' });

export const answerGuide = {
  // Módulo 1
  'mod1-1': options('Largo', 'Corto'),
  'mod1-2': toggle(),
  'mod1-3': fader('Nada', 'Mucho'),
  'mod1-4': fader('Nada', 'Mucho'),
  'mod1-5': fader('Nada', 'Mucho'),
  'mod1-6': fader('Nada', 'Mucho'),
  'mod1-7': fader('Nada', 'Mucho'),
  'mod1-8': fader('Nada', 'Mucho'),
  'mod1-9': fader('Nada', 'Mucho'),
  ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`mod1-${10 + i}`, platform()])),
  'mod1-22': slider('1 h', '6 h'),
  'mod1-23': knob('Nunca', 'Siempre'),
  'mod1-24': knob('Nada', 'Mucha'),

  // Módulo 2
  'mod2-1': options('Siempre', 'Nunca'),
  'mod2-2': knob('Nada', 'Muy perfeccionista'),
  'mod2-3': knob('Nada', 'Mucho'),
  'mod2-4': fader('Poco', 'Mucho'),
  'mod2-5': toggle(),
  'mod2-6': toggle(),
  'mod2-7': toggle(),
  'mod2-8': toggle(),
  'mod2-9': counter('programas'),
  'mod2-10': counter('pestañas'),
  'mod2-11': counter('archivos'),
  'mod2-12': toggle(),
  'mod2-13': toggle(),
  'mod2-14': toggle(),
  'mod2-15': knob('Nada', 'Mucho'),
  'mod2-16': knob('Nunca', 'Siempre'),
  'mod2-17': knob('Desordenados', 'Ordenados'),

  // Módulo 3
  'mod3-1': knob('Con tiempo', 'Bajo presión'),
  'mod3-2': knob('Poca', 'Mucha'),
  'mod3-3': knob('Planifico', 'Último momento'),
  'mod3-4': knob('Nunca', 'Siempre'),
  'mod3-5': options('Entusiasmo', 'Frustración'),
  'mod3-6': counter('horas'),
  'mod3-7': counter('horas'),
  'mod3-8': toggle(),
  'mod3-9': toggle(),
  'mod3-10': toggle(),
  'mod3-11': toggle(),
  'mod3-12': toggle(),
  'mod3-13': toggle(),
  'mod3-14': toggle(),
  'mod3-15': options('Inicio', 'Entrega'),
  'mod3-16': fader('Nada', 'Mucha'),
  'mod3-17': toggle(),
  'mod3-18': toggle(),
  'mod3-19': toggle(),
};

// Gesto que pide cada tipo de control
export const gestureText = (g) => {
  switch (g.kind) {
    case 'knob': return `Girá → ${g.high.toLowerCase()}`;
    case 'fader': return `Subí ↑ ${g.high.toLowerCase()}`;
    case 'slider': return 'Deslizá ↔';
    case 'toggle': return 'Tocá: Sí / No';
    case 'counter': return `▲▼ cantidad de ${g.unit}`;
    case 'options': return 'Elegí la opción';
    case 'platform': return 'Elegí la plataforma y subí el fader';
    default: return '';
  }
};
