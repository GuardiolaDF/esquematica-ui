import React from 'react';

// Figma: status-indicators / status-2 (2166:601) — cuadrado de 8 px, radius/xs, relieve suave.
// Encendido = indicator/active hundido (Inset/Pressed) con un brillo leve. Solo visual: el estado lo maneja quien lo usa.
export const STATUS_REST = '1px 1px 2px rgba(45,45,45,0.5), -1px -1px 2px #FFFFFF';
export const STATUS_ON = 'inset 2px 2px 5px rgba(45,45,45,0.28), inset -1px -1px 2px rgba(255,255,255,0.55), 0 0 4px rgba(255,148,121,0.7)';

const StatusSquare = ({ on = false, ring = null, className = '' }) => (
  <span
    className={`relative inline-block w-[8px] h-[8px] shrink-0 rounded-xs transition-[background-color,box-shadow] duration-standard ${on ? 'bg-indicator-active' : 'bg-surface-subtle'} ${className}`}
    style={{ boxShadow: [on ? STATUS_ON : STATUS_REST, ring].filter(Boolean).join(', ') }}
  />
);

export default StatusSquare;
