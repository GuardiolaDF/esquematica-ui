import React, { useState } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';

// Selector Sí/No. Figma: Components › Frame 27 (2185:1086) — perilla de 30 px con palanca + etiquetas Sí/No apiladas.
// Grilla de 30 v que escala con el ancho del contenedor (container query units):
//  - cap 17 v: surface/subtle, borde 0.4 v neutral/600 al 75 %, sombra elevada suave + Effects/Inset/Control
//  - palanca: trazo de 3 v en neutral/600, desde el centro hacia arriba-derecha (Sí) o abajo-derecha (No)
//  - etiquetas: Typography/Micro label en text/muted; la opción activa en text/primary
const v = (n) => `calc(${n} * 100cqw / 30)`;
const LEVER_ANGLE = 32; // grados respecto de la horizontal (Figma: vector 15,15 → 23,10)

const CAP_SHADOW = [
  `${v(1)} ${v(2)} ${v(3)} rgba(0,0,0,0.10)`,
  `inset ${v(-2)} ${v(-2)} ${v(4)} rgba(255,255,255,0.90)`,
  `inset ${v(2)} ${v(3)} ${v(6)} rgba(0,0,0,0.12)`,
  `inset ${v(-1)} ${v(-1)} ${v(2)} #FFFFFFC7`,
  `inset ${v(1)} ${v(2)} ${v(4)} #2D2D2D38`,
].join(', ');

const ROUTE_RGB = { 'blue-500': '59,130,246', 'orange-500': '249,115,22' };

const ToggleSwitch = ({
  initialState = true,
  sizeClass = "w-[45%]",
  label,
  labelClass,
  className = "",
  compId,
  value,
  onChange,
  onLabel = "Sí",
  offLabel = "No"
}) => {
  const { mode, values, setValue: setGlobalValue, averages, visualizationMode, routingOutputs, toggleRoutingSource, missingFields } = useAppContext();

  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general';
  let routeColor = null;
  if (isRoutingMode && compId) {
    if (routingOutputs.out1 === compId) routeColor = 'blue-500';
    else if (routingOutputs.out2 === compId) routeColor = 'orange-500';
  }

  const [localIsOn, setLocalIsOn] = useState(initialState);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);

  const isHovered = (compId && hoveredId === compId) || localHover;
  const isReadOnly = mode === 'colectivo' && !(compId && compId.startsWith('demo-'));
  const isMissing = !isReadOnly && missingFields?.includes(compId);

  let ring = null;
  if (routeColor) ring = `0 0 0 ${v(2)} rgb(${ROUTE_RGB[routeColor]}), 0 0 ${v(12)} rgba(${ROUTE_RGB[routeColor]},0.9)`;
  else if (isHovered) ring = `0 0 0 ${v(2)} #39787D61`; // Effects/Focus/Soft
  else if (isMissing) ring = `0 0 0 ${v(1.5)} #BF6F5B`; // action/destructive/default

  let isOn = localIsOn;
  if (isRoutingMode) {
    isOn = false;
  } else if (value !== undefined) {
    isOn = value === 100 || value === true;
  } else if (isReadOnly && compId) {
    const avg = averages[compId];
    if (avg !== undefined) isOn = avg > 50;
  } else if (compId && values[compId] !== undefined) {
    isOn = values[compId] === 100 || values[compId] === true;
  }

  const toggle = () => {
    if (isRoutingMode && compId) { toggleRoutingSource(compId); return; }
    if (isReadOnly && compId) return;
    const next = !isOn;
    setLocalIsOn(next);
    if (compId) setGlobalValue(compId, next ? 100 : 0);
    if (onChange) onChange(next ? 100 : 0);
  };

  const handlePointerEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handlePointerLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); };

  const optionClass = (active) => `type-micro-label whitespace-nowrap transition-colors duration-standard ${active ? 'text-text-primary' : 'text-text-muted'}`;

  return (
    <div
      className={`${sizeClass} aspect-square shrink-0 relative [container-type:inline-size] cursor-pointer select-none ${isHovered ? 'z-50' : ''} ${className}`}
      onClick={toggle}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {label && labelClass && (
        <span className={labelClass}>{label}</span>
      )}

      {/* Área táctil ampliada (mín. ~44 px en tablet) */}
      <div className="absolute" style={{ inset: `min(0px, calc(50cqw - 22px))` }} />

      {/* Cap */}
      <div
        className="absolute rounded-pill bg-surface-subtle transition-shadow duration-standard"
        style={{
          left: v(7), top: v(6), width: v(17), height: v(17),
          border: `${v(0.4)} solid rgba(113,105,99,0.75)`,
          boxShadow: [CAP_SHADOW, ring].filter(Boolean).join(', '),
        }}
      />

      {/* Palanca: pivota en el centro del cap */}
      <div
        className="absolute rounded-pill bg-neutral-600 transition-transform duration-fast ease-out"
        style={{
          left: v(14), top: v(13), width: v(12.4), height: v(3),
          transformOrigin: `${v(1.5)} 50%`,
          transform: `rotate(${isOn ? -LEVER_ANGLE : LEVER_ANGLE}deg)`,
        }}
      />

      {/* Sí / No */}
      <div className="absolute top-0 bottom-0 flex flex-col justify-center pointer-events-none" style={{ left: '100%', gap: v(3) }}>
        {onLabel && <span className={optionClass(isOn)}>{onLabel}</span>}
        {offLabel && <span className={optionClass(!isOn)}>{offLabel}</span>}
      </div>
    </div>
  );
};

export default ToggleSwitch;
