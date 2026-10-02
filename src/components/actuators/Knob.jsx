import React, { useState, useRef } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';
import KnobFace, { KnobTick, knobRing, u } from './KnobFace';

// Perilla continua (0–100). Visual: KnobFace (Figma main-knob); se gira arrastrando en vertical.
const MARKER_RADIUS = 46; // u desde el centro (grilla de 64)
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
  const isReadOnly = mode === 'colectivo';
  const isMissing = !isReadOnly && missingFields?.includes(compId);

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

      <KnobFace rotation={rotation} ring={knobRing({ routeColor, isHovered, isMissing })} />

      {/* Marcas con etiqueta Typography/Micro en text/muted, ubicadas en polar como en Figma (Component 18) */}
      {markers.map((marker, i) => {
        const rad = (marker.angle * Math.PI) / 180;
        return (
          <React.Fragment key={`marker-${i}`}>
            <KnobTick angle={marker.angle} />
            {marker.label && (
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 type-micro text-text-muted whitespace-nowrap pointer-events-none"
                style={{
                  left: `calc(50% + ${u(Math.sin(rad) * MARKER_RADIUS)})`,
                  top: `calc(50% - ${u(Math.cos(rad) * MARKER_RADIUS)})`,
                }}
              >
                {marker.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Knob;
