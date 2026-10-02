import React from 'react';
import Knob from './actuators/Knob';

// Figma: Component 11 / 27 — perilla de 33 px con su nombre arriba; el texto arranca 19 px a la izquierda de la perilla.
const NamedKnob = ({ label, compId }) => (
  <div className="relative w-[33px] h-[47px] shrink-0">
    <span className="absolute -left-[19px] top-0 type-micro leading-[18px] text-text-secondary whitespace-nowrap">{label}</span>
    <Knob sizeClass="w-[33px]" className="!absolute left-0 top-[14px]" initialValue={50} compId={compId} />
  </div>
);

export default NamedKnob;
