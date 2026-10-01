import React, { useState } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';

const LedButton = ({ 
  baseClass = "w-[30%] aspect-square rounded-[20%]",
  label, 
  labelClass,
  initialState = false,
  ledColor = "green", // "green" | "yellow"
  icon: Icon,
  compId,
  value,
  onChange
}) => {
  const { mode, values, setValue: setGlobalValue, averages , visualizationMode, routingOutputs, toggleRoutingSource } = useAppContext();

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

  let isOn = localIsOn;
  let intensity = 1;

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
    if (isRoutingMode && compId) { 
      toggleRoutingSource(compId); 
      return; 
    }
    if (isReadOnly && compId) return;
    const next = !isOn;
    setLocalIsOn(next);
    if (onChange) {
      onChange(next ? 100 : 0);
    } else if (compId) {
      setGlobalValue(compId, next ? 100 : 0);
    }
  };

  const handleMouseEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handleMouseLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); };

  // Base background (apagado vs encendido)
  let bgClass = 'bg-synth-module shadow-sm border border-synth-border-light text-synth-ink-base';
  
  if (routeColor) {
    const isBlue = routeColor === 'orange-500';
    const cColor = isBlue ? '249,115,22' : '59,130,246';
    bgClass = `bg-synth-module ring-2 ring-${routeColor} shadow-[0_0_15px_rgba(${cColor},0.5)] border border-${routeColor} text-synth-ink-dark`;
  } else if (isOn) {
    bgClass = `bg-synth-accent shadow-[0_0_8px_rgba(255,148,121,0.6)] border border-synth-accent text-white`;
  }

  // Hover Override/Addition
  const isMissing = useAppContext().missingFields?.includes(compId);
  
  if (isHovered && mode !== 'colectivo' && !isRoutingMode) {
    if (isOn) {
      bgClass = bgClass.replace(/shadow-\[.*\]/, 'shadow-[0_0_12px_rgba(255,148,121,1)] border-synth-accent');
    } else {
      bgClass = 'bg-synth-surface shadow-[0_0_8px_rgba(0,0,0,0.1)] border border-synth-border-base text-synth-ink-dark';
    }
  } else if (isMissing && !isOn) {
    bgClass = 'bg-red-50 shadow-[0_0_10px_rgba(239,68,68,0.3)] border border-red-500 text-red-500';
  }

  return (
    <div 
      className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 ${baseClass} ${bgClass} ${isHovered ? 'ring-1 ring-synth-accent/30 z-50' : ''}`}
      onClick={toggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label && labelClass && (
        <span className={labelClass}>{label}</span>
      )}
      {Icon && (
        <div className="absolute inset-0 p-[22%] flex items-center justify-center pointer-events-none">
          <Icon className={`w-full h-full ${isOn ? 'text-synth-module drop-shadow-[0_0_2px_currentColor]' : 'text-synth-ink-base opacity-50'}`} />
        </div>
      )}
    </div>
  );
};

export default LedButton;

