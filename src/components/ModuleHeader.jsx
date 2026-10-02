import React from 'react';

// Figma: Component 15 / Component 1 (2280:620) — "módulo [n]" en Typography/Label/M text/muted con el número
// invertido sobre text/muted y subrayado de 1 px en border/strong; título en Satori Thin 12/16 text/disabled.
const ModuleHeader = ({ number, title }) => (
  <div className="flex items-start gap-[7px] h-[17px] shrink-0">
    <div className="relative flex items-start h-[16px]">
      <span className="type-label-m text-text-muted pr-[1px]">módulo</span>
      <span className="type-label-m text-text-inverse bg-text-muted w-[13px] h-[12px] mt-[1px] flex items-center justify-center">{number}</span>
      <span className="absolute left-0 right-0 top-[13px] h-px bg-border-strong" />
    </div>
    <span className="font-heading font-thin text-[12px] leading-[16px] tracking-label text-text-disabled whitespace-nowrap mt-[1px]">
      {title} ||||||
    </span>
  </div>
);

export default ModuleHeader;
