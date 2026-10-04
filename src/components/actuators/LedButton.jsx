import React, { useState } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';
import { STATUS_REST, STATUS_ON } from './StatusSquare';
import ledOff from '../../assets/figma/group-led-off.svg';
import ledOn from '../../assets/figma/group-led-on.svg';
import { ROUTE_RGB } from '../../design/channels';

// Botón de dos variantes según Figma:
//  - pad (con ícono) — Components › Frame 25 (2166:588): 24 px, surface/subtle, borde border/subtle, radius/sm.
//    Hover = coral/200 y seleccionado = coral/400, ambos con Effects/Elevation/03; el ícono se tiñe de coral.
//  - cuadrado de estado (sin ícono) — status-indicators (2166:601): 8 px, radius/xs, relieve suave.
//    Encendido = indicator/active hundido (Inset/Pressed) con un brillo leve.
//  - LED de grupo (variant="group") — Components › group-indicator: LED de 12 px que enciende/apaga un grupo de filtros;
//    apagado = neutral/400, encendido = teal/400 con brillo. Va con el título del grupo (Satori Bold 8 px).
const PAD_REST = '1px 1px 3px rgba(45,45,45,0.15), -1px -1px 2px #FFFFFF';
const PAD_RAISED = '6px 8px 20px rgba(45,45,45,0.22), -4px -4px 10px rgba(255,255,255,0.9)'; // Elevation/03

const LedButton = ({
  baseClass = "w-[30%] aspect-square",
  label,
  labelClass,
  initialState = false,
  icon: Icon,
  variant = 'status', // 'status' | 'group'
  compId,
  value,
  onChange
}) => {
  const { mode, values, setValue: setGlobalValue, averages, visualizationMode, routingOutputs, toggleRoutingSource, missingFields, isRouteBlocked } = useAppContext();
  // Atenuado (50 %) cuando su dato no se puede conectar en la vista actual
  const routeBlocked = isRouteBlocked(compId);

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

  // Cuadrado de estado sin responder (modo individual): hueco, distinto de «No» (relleno oscuro) y de «Sí» (coral).
  // El primer toque lo pasa a Sí; después alterna Sí ↔ No.
  const isUnset = variant === 'status' && !Icon && !isReadOnly && !isRoutingMode && !!compId && value === undefined && values[compId] === undefined;
  const isAnswered = variant === 'status' && !Icon && !isReadOnly && !isRoutingMode && !!compId && !isUnset;

  const toggle = () => {
    if (isRoutingMode && compId) { toggleRoutingSource(compId); return; }
    if (isReadOnly && compId) return;
    const next = isUnset ? true : !isOn;
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
  else if (isMissing) ring = '0 0 0 1.5px #BF6F5B';
  else if (showHover && !isPad) ring = '0 0 0 2px #39787D61';

  // LED de grupo + título: el LED (SVG de Figma) queda a la izquierda y el título a 20 px
  if (variant === 'group') {
    return (
      <div
        className={`${routeBlocked ? 'opacity-50 pointer-events-none ' : ''}relative w-[60px] h-[14px] shrink-0 cursor-pointer select-none ${isHovered ? 'z-50' : ''}`}
        onClick={toggle}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <span className="absolute -inset-[6px]" />
        <span className="absolute left-0 top-[2px] w-[16px] h-[12px]">
          {isOn
            ? <img src={ledOn} alt="" draggable={false} className="absolute max-w-none pointer-events-none" style={{ left: -8, top: -6, width: 32, height: 28 }} />
            : <img src={ledOff} alt="" draggable={false} className="absolute max-w-none pointer-events-none" style={{ left: -8, top: 0, width: 32, height: 12 }} />}
          <span
            className="absolute left-[2px] top-0 w-[12px] h-[12px] rounded-pill pointer-events-none transition-shadow duration-standard"
            style={{ boxShadow: ring || (showHover ? '0 0 0 2px #39787D61' : 'none') }}
          />
        </span>
        <span className="absolute left-[20px] top-0 font-heading font-bold text-[8px] leading-[14px] text-text-secondary whitespace-nowrap pointer-events-none">{label}</span>
      </div>
    );
  }

  let surface, shadow, iconColor;
  if (isPad) {
    surface = isOn ? 'bg-coral-400' : showHover ? 'bg-coral-200' : 'bg-surface-subtle';
    shadow = isOn || showHover ? PAD_RAISED : PAD_REST;
    iconColor = isOn ? 'text-coral-800' : showHover ? 'text-coral-700' : 'text-text-muted';
  } else {
    if (isUnset) {
      surface = 'bg-transparent border border-neutral-400';
      shadow = 'none';
    } else if (isAnswered && !isOn) {
      surface = 'bg-neutral-600';
      shadow = 'none';
    } else {
      surface = isOn ? 'bg-indicator-active' : 'bg-surface-subtle';
      shadow = isOn ? STATUS_ON : STATUS_REST;
    }
  }

  return (
    <div
      className={`${routeBlocked ? 'opacity-50 pointer-events-none ' : ''}${isMissing && !isPad ? 'is-missing ' : ''}relative shrink-0 flex items-center justify-center cursor-pointer select-none transition-[background-color,box-shadow] duration-standard ${isPad ? 'rounded-sm border border-border-subtle' : 'rounded-xs'} ${surface} ${baseClass} ${isHovered ? 'z-50' : ''}`}
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
