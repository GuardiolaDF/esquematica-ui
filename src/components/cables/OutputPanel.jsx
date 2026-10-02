import React from 'react';
import Jack from './Jack';

// Figma: Components › Frame 29 "Salidas" (2283:756) — 74×44, surface/subtle, radius/md, Effects/Elevation/02 Raised.
// Barra de título 16 px en neutral/800 con Satori Bold 12/14; dos jacks de 20 px separados por space/12.
const OutputPanel = ({ jacks, title = 'Salidas', className = '' }) => (
  <div className={`w-[74px] h-[44px] shrink-0 flex flex-col bg-surface-subtle rounded-md shadow-elevation-02 overflow-clip ${className}`}>
    <div className="h-[16px] bg-neutral-800 flex items-center justify-center">
      <span className="font-heading font-bold text-[12px] leading-[14px] text-neutral-0">{title}</span>
    </div>
    <div className="flex justify-center gap-space-12 pt-[3px]">
      {jacks.map(j => <Jack key={j.id} {...j} />)}
    </div>
  </div>
);

// Jacks de salida de un módulo: el 1 (azul) y el 2 (naranja) se activan cuando su salida está ruteada a ese módulo.
export const moduleOutputJacks = (modulePrefix, routingOutputs) => [
  { id: `out-${modulePrefix}-0`, type: 'output', activeColor: routingOutputs?.out1?.startsWith(`${modulePrefix}-`) ? 'blue-500' : null },
  { id: `out-${modulePrefix}-1`, type: 'output', activeColor: routingOutputs?.out2?.startsWith(`${modulePrefix}-`) ? 'orange-500' : null },
];

export default OutputPanel;
