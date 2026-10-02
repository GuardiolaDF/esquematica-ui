import React from 'react';

// Interruptor on/off. Figma: Components › on-off-switch-1 (2166:598) — 32×16.
// Grilla de 32 p que escala con el ancho (container query units):
//  - canal: surface/subtle, borde 1 p border/subtle, sombras interiores; encendido = tinte teal/100 (decisión de sistema)
//  - thumb 12 p blanco con Effects/Inset/Control, a la izquierda (off) o derecha (on)
const p = (n) => `calc(${n} * 100cqw / 32)`;

const TRACK_SHADOW = [
  `inset ${p(1)} ${p(1)} ${p(1)} rgba(0,0,0,0.25)`,
  `inset ${p(-1)} ${p(-1)} ${p(1)} rgba(239,235,226,0.5)`,
  `inset ${p(2)} ${p(2)} ${p(2)} rgba(0,0,0,0.25)`,
].join(', ');
const THUMB_SHADOW = `inset ${p(-1)} ${p(-1)} ${p(2)} #FFFFFFC7, inset ${p(1)} ${p(2)} ${p(4)} #2D2D2D38, ${p(0.5)} ${p(1)} ${p(2)} rgba(45,45,45,0.18)`;

const PillSwitch = ({
  label,
  checked = false,
  onChange,
  sizeClass = 'w-[32px]',
  className = '',
}) => (
  <div className={`inline-flex flex-col items-center gap-space-4 ${className}`}>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange && onChange(!checked)}
      className={`relative aspect-[2/1] [container-type:inline-size] rounded-pill border-border-subtle cursor-pointer transition-colors duration-standard focus-visible:outline-none focus-visible:shadow-focus-soft ${checked ? 'bg-teal-100' : 'bg-surface-subtle'} ${sizeClass}`}
      style={{ borderWidth: p(1), boxShadow: TRACK_SHADOW }}
    >
      {/* Área táctil ampliada (mín. 44 px de ancho en tablet) */}
      <span className="absolute -inset-y-[14px] -inset-x-[6px]" />
      <span
        className="absolute rounded-pill bg-neutral-0 transition-[left] duration-standard ease-out"
        style={{ width: p(12), height: p(12), top: p(1), left: checked ? p(17) : p(1), boxShadow: THUMB_SHADOW }}
      />
    </button>
    {label && <span className="type-micro-label text-text-muted text-center">{label}</span>}
  </div>
);

export default PillSwitch;
