import React from 'react';

// Figma: etiqueta de sección de Component 18 / 29 ("FORMATO", "BOCET A MANO") — caja neutral/600 de 11 px con
// Satori Regular 8 px en text/inverse y una línea de 1 px neutral/800 que sigue hacia la derecha.
const SectionTag = ({ label, className = '' }) => (
  <div className={`flex items-end ${className}`}>
    <span className="h-[11px] px-[6px] bg-neutral-600 font-heading text-[8px] leading-[11px] text-text-inverse whitespace-nowrap">
      {label}
    </span>
    <span className="flex-1 h-px bg-neutral-800" />
  </div>
);

export default SectionTag;
