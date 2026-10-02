import React from 'react';
import ToggleSwitch from './actuators/ToggleSwitch';

// Figma: Frame 27 / Variante 2 con su nombre arriba (columna de 40 px). `align` controla el texto: 'left' | 'center'.
const LabeledToggle = ({ label, compId, align = 'center' }) => (
  <div className="w-[40px] flex flex-col shrink-0">
    <span className={`type-micro font-light text-text-muted whitespace-nowrap ${align === 'left' ? 'text-left' : 'text-center'}`}>{label}</span>
    <ToggleSwitch sizeClass="w-[30px]" compId={compId} />
  </div>
);

export default LabeledToggle;
