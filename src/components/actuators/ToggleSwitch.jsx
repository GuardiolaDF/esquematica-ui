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
  const { mode, values, setValue: setGlobalValue, averages } = useAppContext();
  const [localIsOn, setLocalIsOn] = useState(initialState);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover;
  const isMissing = useAppContext().missingFields?.includes(compId);
  const glowClass = isHovered 
    ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30' 
    : (isMissing ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500/50' : 'shadow-md border border-transparent');

  let isOn = localIsOn;

  if (value !== undefined) {
    isOn = value === 100 || value === true;
  } else if (compId && values[compId] !== undefined) {
    isOn = values[compId] === 100 || values[compId] === true;
  }

  const toggle = () => {
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
