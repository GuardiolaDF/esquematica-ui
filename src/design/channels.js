// Canales de cable del visualizador. Los identificadores 'blue-500' / 'orange-500' son históricos (se usan como id de canal
// en la lógica de cables y ruteo); su aspecto sale de acá y pertenece a la paleta RAMS:
//   OUT 1 → teal  (primitivo teal/500, texto teal/700)
//   OUT 2 → coral (primitivo coral/500, texto coral/700)
import { primitives } from './tokens.js';

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
};

export const CHANNELS = {
  'blue-500': { key: 'out1', name: 'OUT 1', hex: primitives.teal[500], rgb: hexToRgb(primitives.teal[500]), ink: primitives.teal[700] },
  'orange-500': { key: 'out2', name: 'OUT 2', hex: primitives.coral[500], rgb: hexToRgb(primitives.coral[500]), ink: primitives.coral[700] },
};

// 'r,g,b' por id de canal (para armar rgba(...) en sombras y canvas)
export const ROUTE_RGB = Object.fromEntries(Object.entries(CHANNELS).map(([id, c]) => [id, c.rgb]));

export const channelById = (id) => CHANNELS[id] || CHANNELS['blue-500'];
export const CHANNEL_1 = CHANNELS['blue-500'];
export const CHANNEL_2 = CHANNELS['orange-500'];
