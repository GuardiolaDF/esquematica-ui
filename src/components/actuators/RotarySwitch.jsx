import React, { useState, useCallback, useRef } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';
import KnobFace, { KnobTick, knobRing, u } from './KnobFace';

// Selector de posiciones fijas. Figma: Components › Component 18 "FORMATO" (3 posiciones) y Component 29 "BOCET A MANO" (5).
// Misma cara que el Knob (KnobFace) con una marca por posición y etiquetas Typography/Micro en text/muted.
const LABEL_RADIUS = 46; // u desde el centro (grilla de 64)

const RotarySwitch = ({
  sizeClass = "w-[85%]",
  label,
  labelClass,
  initialStep,
  angles = [-90, -45, 0, 45, 90],
  optionLabels = [],
  className = "",
  compId,
  onChange,
  value,
  stepIndex
}) => {
  const startStep = initialStep !== undefined ? initialStep : Math.floor(angles.length / 2);
  const { mode, values, setValue: setGlobalValue, averages, visualizationMode, routingOutputs, toggleRoutingSource, missingFields } = useAppContext();

  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general';
  let routeColor = null;
  if (isRoutingMode && compId) {
    if (routingOutputs.out1 === compId) routeColor = 'blue-500';
    else if (routingOutputs.out2 === compId) routeColor = 'orange-500';
  }

  const [localStep, setLocalStep] = useState(startStep);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  const dragging = useRef(false);

  const isHovered = (compId && hoveredId === compId) || localHover;
  const isReadOnly = mode === 'colectivo' && !(compId && compId.startsWith('demo-'));
  const isMissing = !isReadOnly && missingFields?.includes(compId);

  const stepToValue = (step) => 100 - (step * 25);
  const valueToStep = (val) => {
    if (val === undefined || val === null) return startStep;
    return Math.max(0, Math.min(4, 4 - Math.round(val / 25)));
  };

  let displayStep = localStep;
  if (stepIndex !== undefined) {
    displayStep = stepIndex;
  } else if (value !== undefined) {
    displayStep = valueToStep(value);
  } else if (isReadOnly && compId) {
    const avg = averages[compId];
    if (avg !== undefined) displayStep = valueToStep(avg);
  } else if (compId && values[compId] !== undefined) {
    displayStep = valueToStep(values[compId]);
  }

  // Elige la posición más cercana al ángulo del puntero respecto del centro
  const handleInteraction = useCallback((clientX, clientY, rect) => {
    if (isReadOnly && compId) return;
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    let cssAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (cssAngle > 180) cssAngle -= 360;
    if (cssAngle < -180) cssAngle += 360;

    let closestStep = 0;
    let minDiff = Infinity;
    angles.forEach((a, index) => {
      const diff = Math.abs(a - cssAngle);
      if (diff < minDiff) { minDiff = diff; closestStep = index; }
    });

    setLocalStep(closestStep);
    if (compId) setGlobalValue(compId, stepToValue(closestStep));
    if (onChange) onChange(closestStep, angles[closestStep]);
  }, [angles, isReadOnly, compId, setGlobalValue, onChange]);

  const onPointerDown = (e) => {
    if (isRoutingMode && compId) { e.preventDefault(); toggleRoutingSource(compId); return; }
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    handleInteraction(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };
  const onPointerMove = (e) => {
    if (dragging.current) handleInteraction(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };
  const endDrag = () => { dragging.current = false; };

  const handlePointerEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handlePointerLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); };

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
         <span className={labelClass} style={{ bottom: '135%' }}>{label}</span>
      )}

      <KnobFace rotation={angles[displayStep] ?? 0} ring={knobRing({ routeColor, isHovered, isMissing })} animate />

      {angles.map((ang, i) => {
        const rad = (ang * Math.PI) / 180;
        return (
          <React.Fragment key={i}>
            <KnobTick angle={ang} />
            {optionLabels[i] && (
              <span
                className={`absolute -translate-x-1/2 -translate-y-1/2 type-micro whitespace-nowrap pointer-events-none transition-colors duration-standard ${displayStep === i ? 'text-text-primary' : 'text-text-muted'}`}
                style={{
                  left: `calc(50% + ${u(Math.sin(rad) * LABEL_RADIUS)})`,
                  top: `calc(50% - ${u(Math.cos(rad) * LABEL_RADIUS)})`,
                }}
              >
                {optionLabels[i]}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default RotarySwitch;
