import React, { useState, useRef } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';
import sliderDot from '../../assets/figma/slider-dot.svg';
import { ROUTE_RGB } from '../../design/channels';

// Figma: Components › Component 3 / fader-2 (2166:599) — canal de 16 px de ancho con sombras interiores y una barra elevada
// de 10 px (indicator-wedge) con el punto coral en su extremo. La barra crece desde el inicio del canal según el valor
// y el punto marca el nivel. En horizontal la misma pieza se acuesta (crece hacia la derecha).
const SLOT = 16;   // ancho del canal
const BAR = 10;    // ancho de la barra
const PAD = 3;     // separación barra–canal
const MIN_BAR = 10; // largo mínimo de la barra (solo el punto)

const SLOT_SHADOW = 'inset -1px -1px 1px rgba(255,255,255,0.75), inset 1px 1px 1px rgba(0,0,0,0.25)';
const BAR_SHADOW = '2px 2px 3.4px rgba(0,0,0,0.25), 0.5px 0.5px 1.4px rgba(0,0,0,0.75), inset -0.5px -0.5px 1.4px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.75)';
const DOT_SHADOW = 'inset 1px 1px 1.9px rgba(0,0,0,0.5), inset -0.5px -0.5px 0.5px rgba(255,255,255,0.5), inset 0.2px 0.2px 0.5px #000';
// Horizontal (Component 14): canal de 22 px, barra a 6.5 / 4 px del borde; el valor recorre de 15.5 px a 15.5 px de cada extremo
const H_SLOT = 22;
const H_INSET_X = 6.5;
const H_INSET_Y = 4;
const H_EDGE = 15.5;
const H_BAR_SHADOW = '0.5px 0.5px 0.7px rgba(0,0,0,0.75), 2px 2px 1.7px rgba(0,0,0,0.25), inset 1px 1px 1px rgba(255,255,255,0.75), inset -0.5px -0.5px 0.7px rgba(0,0,0,0.5)';
const hPos = (v) => `calc(${H_EDGE}px + (100% - ${2 * H_EDGE}px) * ${v / 100})`;

const Fader = ({
  orientation = 'vertical',
  trackClass = '',
  thumbClass = '',
  label = '',
  labelClass = '',
  initialValue = 50, // 0 to 100
  compId,
  markers = [],
  value,
  onChange
}) => {
  const { mode, values, setValue: setGlobalValue, averages, visualizationMode, routingOutputs, toggleRoutingSource, missingFields, isRouteBlocked } = useAppContext();
  // Atenuado (50 %) cuando su dato no se puede conectar en la vista actual
  const routeBlocked = isRouteBlocked(compId);
  const isVertical = orientation === 'vertical';

  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general';
  let routeColor = null;
  if (isRoutingMode && compId) {
    if (routingOutputs.out1 === compId) routeColor = 'blue-500';
    else if (routingOutputs.out2 === compId) routeColor = 'orange-500';
  }

  const [localValue, setLocalValue] = useState(initialValue);
  const slotRef = useRef(null);

  let displayValue = localValue;
  if (value !== undefined) {
    displayValue = value;
  } else if (mode === 'colectivo' && compId) {
    displayValue = averages[compId] ?? initialValue;
  } else if (compId) {
    displayValue = values[compId] ?? initialValue;
  }

  const isReadOnly = mode === 'colectivo';
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX, clientY) => {
    if (isReadOnly || !slotRef.current) return;
    const rect = slotRef.current.getBoundingClientRect();
    const newVal = isVertical
      ? 100 - ((clientY - rect.top) / rect.height) * 100
      : ((clientX - rect.left - H_EDGE) / (rect.width - 2 * H_EDGE)) * 100;
    const clamped = Math.max(0, Math.min(100, newVal));
    setLocalValue(clamped);
    if (onChange) onChange(clamped);
    else if (compId) setGlobalValue(compId, clamped);
  };

  const onPointerDown = (e) => {
    if (isRoutingMode && compId) { e.preventDefault(); toggleRoutingSource(compId); return; }
    if (isReadOnly) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
  };
  const onPointerMove = (e) => { if (isDragging) handleMove(e.clientX, e.clientY); };
  const endDrag = () => setIsDragging(false);

  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  const isHovered = (compId && hoveredId === compId) || localHover || isDragging;
  const isMissing = !isReadOnly && missingFields?.includes(compId);

  // Anillo de estado sobre el canal (tokens: Focus/Soft, action/destructive; ruteo con el color del cable)
  let ring = null;
  if (routeColor) ring = `0 0 0 2px rgb(${ROUTE_RGB[routeColor]}), 0 0 16px rgba(${ROUTE_RGB[routeColor]},0.8)`;
  else if (isHovered) ring = '0 0 0 2px #39787D61';
  else if (isMissing) ring = '0 0 0 1.5px #BF6F5B';

  const handlePointerEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handlePointerLeave = () => { setLocalHover(false); if (compId && !isDragging) setHoveredId(null); };

  // Largo de la barra: de MIN_BAR (valor 0) al largo total del canal menos el padding (valor 100)
  const barLength = `calc(${MIN_BAR}px + (100% - ${2 * PAD + MIN_BAR}px) * ${displayValue / 100})`;

  return (
    <div
      className={`${routeBlocked ? 'opacity-50 pointer-events-none ' : ''}${isMissing ? 'is-missing ' : ''}relative ${trackClass} cursor-pointer touch-none select-none`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {isVertical ? (
        <>
          {label && (
            // Texto vertical que se lee de abajo hacia arriba, alineado al pie del canal (Figma: x 1–11 del componente de 34)
            <div className="absolute right-full mr-[1px] top-[5px] bottom-[4px] w-[10px] flex items-end justify-center pointer-events-none z-20">
              <span className={`[writing-mode:vertical-rl] rotate-180 type-micro whitespace-nowrap ${labelClass || 'text-text-secondary'}`}>{label}</span>
            </div>
          )}

          {markers.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {markers.map((m, i) => (
                <span key={i} className="absolute left-[calc(50%+12px)] type-micro text-text-muted" style={{ bottom: `${(i / (markers.length - 1)) * 100}%`, transform: 'translateY(50%)' }}>{m}</span>
              ))}
            </div>
          )}

          {/* Canal */}
          <div
            ref={slotRef}
            className="absolute h-full left-1/2 -translate-x-1/2 rounded-pill bg-surface-subtle transition-shadow duration-standard"
            style={{ width: SLOT, boxShadow: [SLOT_SHADOW, ring].filter(Boolean).join(', ') }}
          >
            {/* Barra elevada con el punto en el extremo (grupo al 50 % como en Figma) */}
            <div
              className={`absolute rounded-pill bg-surface-subtle opacity-50 ${thumbClass}`}
              style={{ left: PAD, bottom: PAD, width: BAR, height: barLength, boxShadow: BAR_SHADOW }}
            >
              <div className="absolute rounded-pill bg-indicator-active" style={{ width: 7, height: 7, top: 1.5, left: 1.5, boxShadow: DOT_SHADOW }} />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Figma: Component 14 — etiqueta Micro en text/disabled sobre el canal */}
          {label && (
            labelClass
              ? <span className={labelClass}>{label}</span>
              : <span className="absolute bottom-full left-[10px] type-micro tracking-label text-text-disabled whitespace-nowrap pointer-events-none">{label}</span>
          )}

          {/* Canal de 22 px con la barra elevada a lo largo, números Caption y el punto coral sobre el valor */}
          <div
            ref={slotRef}
            className="absolute w-full top-1/2 -translate-y-1/2 rounded-pill bg-surface-subtle transition-shadow duration-standard"
            style={{ height: H_SLOT, boxShadow: [SLOT_SHADOW, ring].filter(Boolean).join(', ') }}
          >
            <div
              className="absolute rounded-pill bg-surface-subtle opacity-50"
              style={{ left: H_INSET_X, right: H_INSET_X, top: H_INSET_Y, bottom: H_INSET_Y, boxShadow: H_BAR_SHADOW }}
            />
            {markers.map((m, i) => (
              <span
                key={i}
                className="absolute top-1/2 type-caption text-text-disabled pointer-events-none"
                style={{ left: hPos((i / (markers.length - 1)) * 100), transform: 'translate(-50%, -50%)' }}
              >
                {m}
              </span>
            ))}
            <img
              src={sliderDot}
              alt=""
              draggable={false}
              className="absolute top-1/2 w-[10px] h-[10px] pointer-events-none"
              style={{ left: hPos(displayValue), transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Fader;
