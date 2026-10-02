import React, { useState } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';

// Botón de dos variantes según Figma:
//  - pad (con ícono) — Components › Frame 25 (2166:588): 24 px, surface/subtle, borde border/subtle, radius/sm.
//    Hover = coral/200 y seleccionado = coral/400, ambos con Effects/Elevation/03; el ícono se tiñe de coral.
//  - cuadrado de estado (sin ícono) — status-indicators (2166:601): 8 px, radius/xs, relieve suave.
//    Encendido = indicator/active hundido (Inset/Pressed) con un brillo leve.
const PAD_REST = '1px 1px 3px rgba(45,45,45,0.15), -1px -1px 2px #FFFFFF';
const PAD_RAISED = '6px 8px 20px rgba(45,45,45,0.22), -4px -4px 10px rgba(255,255,255,0.9)'; // Elevation/03
const STATUS_REST = '1px 1px 2px rgba(45,45,45,0.5), -1px -1px 2px #FFFFFF';
const STATUS_ON = 'inset 2px 2px 5px rgba(45,45,45,0.28), inset -1px -1px 2px rgba(255,255,255,0.55), 0 0 4px rgba(255,148,121,0.7)';
const ROUTE_RGB = { 'blue-500': '59,130,246', 'orange-500': '249,115,22' };

const LedButton = ({
  baseClass = "w-[30%] aspect-square",
  label,
  labelClass,
  initialState = false,
  icon: Icon,
  compId,
  value,
  onChange
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
    if (onChange) onChange(next ? 100 : 0);
    else if (compId) setGlobalValue(compId, next ? 100 : 0);
  };

  const handlePointerEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handlePointerLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); };

  const isPad = Boolean(Icon);
  const showHover = isHovered && !isReadOnly && !isRoutingMode;

  // Anillo de estado (ruteo / faltante) sumado a la sombra propia
  let ring = null;
  if (routeColor) ring = `0 0 0 2px rgb(${ROUTE_RGB[routeColor]}), 0 0 12px rgba(${ROUTE_RGB[routeColor]},0.6)`;
  else if (isMissing && !isOn) ring = '0 0 0 1.5px #BF6F5B';
  else if (showHover && !isPad) ring = '0 0 0 2px #39787D61';

  let surface, shadow, iconColor;
  if (isPad) {
    surface = isOn ? 'bg-coral-400' : showHover ? 'bg-coral-200' : 'bg-surface-subtle';
    shadow = isOn || showHover ? PAD_RAISED : PAD_REST;
    iconColor = isOn ? 'text-coral-800' : showHover ? 'text-coral-700' : 'text-text-muted';
  } else {
    surface = isOn ? 'bg-indicator-active' : 'bg-surface-subtle';
    shadow = isOn ? STATUS_ON : STATUS_REST;
  }

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center cursor-pointer select-none transition-[background-color,box-shadow] duration-standard ${isPad ? 'rounded-sm border border-border-subtle' : 'rounded-xs'} ${surface} ${baseClass} ${isHovered ? 'z-50' : ''}`}
      style={{ boxShadow: [shadow, ring].filter(Boolean).join(', ') }}
      onClick={toggle}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Área táctil ampliada para los cuadrados chicos */}
      {!isPad && <span className="absolute -inset-[8px]" />}
      {label && labelClass && (
        <span className={labelClass}>{label}</span>
      )}
      {Icon && (
        <Icon className={`w-[18px] h-[18px] max-w-[75%] max-h-[75%] pointer-events-none transition-colors duration-standard ${iconColor}`} />
      )}
    </div>
  );
};

export default LedButton;
