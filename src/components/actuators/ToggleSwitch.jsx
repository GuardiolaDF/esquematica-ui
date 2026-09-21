import React, { useState } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';

const ToggleSwitch = ({ 
  initialState = true, 
  sizeClass = "w-[45%]", 
  label, 
  labelClass, 
  className = "",
  compId,
  value,
  onChange,
  onLabel = "SI",
  offLabel = "NO"
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
  const isMissing = useAppContext().missingFields?.includes(compId);
  
  const isReadOnly = mode === 'colectivo';
  
  let glowClass = 'shadow-md border border-transparent';
  if (routeColor) {
    const isBlue = routeColor === 'orange-500';
    const cColor = isBlue ? '249,115,22' : '59,130,246';
    glowClass = `ring-4 ring-${routeColor} shadow-[0_0_30px_rgba(${cColor},1)] bg-${routeColor}/40 border border-${routeColor}`;
  } else if (isReadOnly) {
    glowClass = isHovered ? 'shadow-[0_0_15px_rgba(255,255,255,0.4)] border border-white' : 'shadow-md border border-[#333]';
  } else {
    glowClass = isHovered 
      ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30' 
      : (isMissing ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500/50' : 'shadow-md border border-transparent');
  }

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
  
  const handleMouseEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handleMouseLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); };

  return (
    <div 
      className={`${sizeClass} aspect-square rounded-full bg-[#E5E5E5] ${glowClass} relative cursor-pointer transition-shadow duration-300 ${className}`}
      onClick={toggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label && labelClass && (
        <span className={labelClass}>{label}</span>
      )}
      
      {/* SI / NO Labels (Alineados con la perilla a -45 y +45 grados) */}
      {onLabel && <span className="absolute text-[4.5px] uppercase font-bold text-[#888] pointer-events-none" style={{ top: '-15%', right: '-40%' }}>{onLabel}</span>}
      {offLabel && <span className="absolute text-[4.5px] uppercase font-bold text-[#888] pointer-events-none" style={{ bottom: '-15%', right: '-40%' }}>{offLabel}</span>}
      
      {/* Palanca (Lever) */}
      <div 
        className={`absolute top-1/2 left-1/2 w-[110%] h-[35%] bg-[#888] rounded-full -translate-y-1/2 origin-left shadow-sm transition-transform duration-[150ms] ease-in-out ${
          isOn ? '-rotate-45' : 'rotate-45'
        }`}
      ></div>
    </div>
  );
};

export default ToggleSwitch;
