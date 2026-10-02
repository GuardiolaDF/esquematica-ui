import React from 'react';
import indicatorWedge from '../../assets/figma/knob-indicator-wedge.svg';

// Figma: Components › main-knob (2166:594 / 2185:1036). Cara visual compartida por Knob y RotarySwitch.
// Diseñada en una grilla de 64 u que escala con el ancho del contenedor (container query units):
//  - base: background/sunken, border/default border/subtle, Effects/Inset/Control
//  - cap 52 u (inset 5): surface/subtle, borde 0.4 u neutral/600 al 75 %, brillo radial y sombras fijas (no rotan)
//  - indicator-wedge (SVG de Figma) con el punto coral: es lo único que rota
//  - marcas de posición: trazo de 3 u en border/strong a 2 u por fuera del anillo
// El contenedor que la usa debe declarar `[container-type:inline-size]`.
export const u = (n) => `calc(${n} * 100cqw / 64)`;

const CAP_SHADOW = [
  `${u(3)} ${u(4)} ${u(8)} rgba(0,0,0,0.22)`,
  `${u(1)} ${u(2)} ${u(3)} rgba(0,0,0,0.10)`,
  `inset ${u(-2)} ${u(-2)} ${u(4)} rgba(255,255,255,0.90)`,
  `inset ${u(2)} ${u(3)} ${u(6)} rgba(0,0,0,0.12)`,
].join(', ');
const BASE_SHADOW = `inset ${u(-1)} ${u(-1)} ${u(2)} #FFFFFFC7, inset ${u(1)} ${u(2)} ${u(4)} #2D2D2D38`;
const CAP_HIGHLIGHT = `radial-gradient(${u(22)} ${u(18)} at ${u(12)} ${u(4)}, rgba(255,255,255,0.72), rgba(255,255,255,0))`;

const ROUTE_RGB = { 'blue-500': '59,130,246', 'orange-500': '249,115,22' };

// Anillo de estado alrededor de la base (tokens: Focus/Soft, action/destructive; ruteo con el color del cable)
export const knobRing = ({ routeColor, isHovered, isMissing }) => {
  if (routeColor) return `0 0 0 ${u(3)} rgb(${ROUTE_RGB[routeColor]}), 0 0 ${u(24)} rgba(${ROUTE_RGB[routeColor]},0.9)`;
  if (isHovered) return `0 0 0 ${u(2)} #39787D61`;
  if (isMissing) return `0 0 0 ${u(2)} #BF6F5B`;
  return null;
};

export const KnobTick = ({ angle }) => (
  <div className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${angle}deg)` }}>
    <div className="absolute left-1/2 -translate-x-1/2 rounded-pill bg-border-strong" style={{ top: u(-5), width: u(1), height: u(3) }} />
  </div>
);

const KnobFace = ({ rotation, ring, animate = false }) => (
  <>
    {/* Área táctil ampliada para perillas chicas (mín. ~44 px en tablet) */}
    <div className="absolute rounded-pill" style={{ inset: `min(0px, calc(50cqw - 22px))` }} />

    <div
      className="absolute inset-0 rounded-pill bg-background-sunken border-border-subtle transition-shadow duration-standard"
      style={{ borderWidth: u(1), boxShadow: [BASE_SHADOW, ring].filter(Boolean).join(', ') }}
    />

    <div
      className="absolute rounded-pill bg-surface-subtle overflow-hidden"
      style={{
        left: u(5), top: u(5), width: u(52), height: u(52),
        border: `${u(0.4)} solid rgba(113,105,99,0.75)`,
        boxShadow: CAP_SHADOW,
        backgroundImage: CAP_HIGHLIGHT,
      }}
    >
      <div
        className={`absolute inset-0 ${animate ? 'transition-transform duration-standard ease-out' : ''}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <img
          src={indicatorWedge}
          alt=""
          draggable={false}
          className="absolute block max-w-none pointer-events-none"
          style={{ left: u(20.8), top: u(1.8), width: u(13.9), height: u(51.9) }}
        />
      </div>
    </div>
  </>
);

export default KnobFace;
