import React, { useState, useRef } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';
import indicatorWedge from '../../assets/figma/knob-indicator-wedge.svg';

// Figma: Components › main-knob (2166:594 / 2185:1036). Diseñado en una grilla de 64 px que escala con el ancho del contenedor:
// todas las medidas se expresan en `u` (1/64 del ancho) mediante container query units.
//  - base: background/sunken, border/default border/subtle, Effects/Inset/Control
//  - cap 52 px (inset 5): surface/subtle, borde 0.4 px neutral/600 al 75 %, brillo radial y sombras fijas (no rotan)
//  - indicator-wedge (SVG de Figma) con el punto coral: es lo único que rota
const u = (n) => `calc(${n} * 100cqw / 64)`;

const CAP_SHADOW = [
  `${u(3)} ${u(4)} ${u(8)} rgba(0,0,0,0.22)`,
  `${u(1)} ${u(2)} ${u(3)} rgba(0,0,0,0.10)`,
  `inset ${u(-2)} ${u(-2)} ${u(4)} rgba(255,255,255,0.90)`,
  `inset ${u(2)} ${u(3)} ${u(6)} rgba(0,0,0,0.12)`,
].join(', ');
const BASE_SHADOW = `inset ${u(-1)} ${u(-1)} ${u(2)} #FFFFFFC7, inset ${u(1)} ${u(2)} ${u(4)} #2D2D2D38`;
const CAP_HIGHLIGHT = `radial-gradient(${u(22)} ${u(18)} at ${u(12)} ${u(4)}, rgba(255,255,255,0.72), rgba(255,255,255,0))`;

const ROUTE_RGB = { 'blue-500': '59,130,246', 'orange-500': '249,115,22' };

const Knob = ({
  sizeClass = "w-[80%]",
  label,
  labelClass,
  initialValue = 50,
  className = "",
  compId,
  startAngle = -120,
  endAngle = 120,
  markers = [], // Array of objects: { angle: number, label?: string }
  onChange
}) => {
  const { mode, values, setValue: setGlobalValue, averages, visualizationMode, routingOutputs, toggleRoutingSource, missingFields } = useAppContext();

  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general';
  let routeColor = null;
  if (isRoutingMode && compId) {
    if (routingOutputs.out1 === compId) routeColor = 'blue-500';
    else if (routingOutputs.out2 === compId) routeColor = 'orange-500';
  }

  const [localValue, setLocalValue] = useState(initialValue);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isHovered = (compId && hoveredId === compId) || localHover || isDragging;
  const isMissing = missingFields?.includes(compId);
  const isReadOnly = mode === 'colectivo';

  // Estado → anillo exterior (tokens: border/focus para hover, action/destructive para faltante)
  let ringStyle = {};
  if (routeColor) {
    ringStyle = { boxShadow: `0 0 0 ${u(3)} rgb(${ROUTE_RGB[routeColor]}), 0 0 ${u(24)} rgba(${ROUTE_RGB[routeColor]},0.9)` };
  } else if (isHovered) {
    ringStyle = { boxShadow: `0 0 0 ${u(2)} #39787D61` }; // Effects/Focus/Soft
  } else if (isMissing && !isReadOnly) {
    ringStyle = { boxShadow: `0 0 0 ${u(2)} #BF6F5B` }; // action/destructive/default
  }

  const displayValue = isReadOnly
    ? (averages[compId] ?? initialValue)
    : (compId ? (values[compId] ?? initialValue) : localValue);

  const startY = useRef(null);
  const startVal = useRef(null);

  const applyValue = (clientY) => {
    if (startY.current === null) return;
    const newVal = Math.max(0, Math.min(100, startVal.current + (startY.current - clientY) * 1.2));
    setLocalValue(newVal);
    if (onChange) onChange(newVal);
    else if (compId) setGlobalValue(compId, newVal);
  };

  const onPointerDown = (e) => {
    if (isRoutingMode && compId) { e.preventDefault(); toggleRoutingSource(compId); return; }
    if (isReadOnly) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    startVal.current = displayValue; // parte del valor visible para no saltar
    setIsDragging(true);
  };
  const onPointerMove = (e) => { if (isDragging) applyValue(e.clientY); };
  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);
    startY.current = null;
  };

  const rotation = startAngle + (displayValue / 100) * (endAngle - startAngle);

  const handlePointerEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handlePointerLeave = () => { setLocalHover(false); if (compId && !isDragging) setHoveredId(null); };

  return (
    <div
      className={`relative aspect-square shrink-0 [container-type:inline-size] ${sizeClass} ${className} ${isHovered ? 'z-50' : ''} cursor-pointer touch-none select-none`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {label && labelClass && (
         <span className={labelClass}>{label}</span>
      )}

      {/* Área táctil ampliada para knobs chicos (mín. ~44 px en tablet) */}
      <div className="absolute rounded-pill" style={{ inset: `min(0px, calc(50cqw - 22px))` }} />

      {/* Base (main-knob) */}
      <div
        className="absolute inset-0 rounded-pill bg-background-sunken border-border-subtle transition-shadow duration-standard"
        style={{ borderWidth: u(1), boxShadow: [BASE_SHADOW, ringStyle.boxShadow].filter(Boolean).join(', ') }}
      />

      {/* Cap: luz y sombras fijas */}
      <div
        className="absolute rounded-pill bg-surface-subtle overflow-hidden"
        style={{
          left: u(5), top: u(5), width: u(52), height: u(52),
          border: `${u(0.4)} solid rgba(113,105,99,0.75)`,
          boxShadow: CAP_SHADOW,
          backgroundImage: CAP_HIGHLIGHT,
        }}
      >
        {/* Indicador: rota alrededor del centro del cap */}
        <div className="absolute inset-0" style={{ transform: `rotate(${rotation}deg)` }}>
          <img
            src={indicatorWedge}
            alt=""
            draggable={false}
            className="absolute block max-w-none pointer-events-none"
            style={{ left: u(20.8), top: u(1.8), width: u(13.9), height: u(51.9) }}
          />
        </div>
      </div>

      {/* Marcas de posición (Variante 2): trazo de 4 px por fuera del anillo y etiqueta Typography/Caption */}
      {markers.map((marker, i) => (
        <div key={`marker-${i}`} className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${marker.angle}deg)` }}>
          <div className="absolute left-1/2 -translate-x-1/2 bg-border-strong" style={{ top: u(-6), width: u(1), height: u(4) }} />
          {marker.label && (
            <span
              className="absolute left-1/2 type-caption text-text-primary whitespace-nowrap"
              style={{ bottom: `calc(100% + ${u(6)})`, transform: `translateX(-50%) rotate(${-marker.angle}deg)` }}
            >
              {marker.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Knob;
