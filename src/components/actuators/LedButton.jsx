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
  const { mode, values, setValue: setGlobalValue, averages } = useAppContext();
  const [localIsOn, setLocalIsOn] = useState(initialState);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover;

  let isOn = localIsOn;
  let intensity = 1;

  if (value !== undefined) {
    isOn = value === 100 || value === true;
  } else if (compId && values[compId] !== undefined) {
    isOn = values[compId] === 100 || values[compId] === true;
  }

  const toggle = () => {
    if (mode === 'colectivo' && compId) return;
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
  let bgClass = 'bg-[#444] shadow-sm border border-transparent';
  
  if (isOn) {
    if (ledColor === 'yellow') {
      bgClass = `bg-[#6b6b47] shadow-[inset_0_0_6px_rgba(250,204,21,0.2),0_0_12px_rgba(250,204,21,${0.5 * intensity})] border border-yellow-500/${Math.round(30 * intensity)}`;
    } else {
      bgClass = `bg-[#556b55] shadow-[inset_0_0_6px_rgba(74,222,128,0.2),0_0_12px_rgba(74,222,128,${0.5 * intensity})] border border-green-500/${Math.round(30 * intensity)}`;
    }
  }

  // Hover Override/Addition
  const isMissing = useAppContext().missingFields?.includes(compId);
  
  if (isHovered && mode !== 'colectivo') {
    if (isOn) {
      bgClass = bgClass.replace(/shadow-\[.*\]/, 'shadow-[inset_0_0_6px_rgba(0,0,0,0.2),0_0_15px_rgba(251,191,36,0.6)] border-amber-400/50');
    } else {
      bgClass = 'bg-[#4a4a4a] shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30';
    }
  } else if (isMissing && !isOn) {
    bgClass = 'bg-[#4a4a4a] shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500/50';
  }

  return (
    <div 
      className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 ${baseClass} ${bgClass} ${isHovered ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] z-50' : ''}`}
      onClick={toggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label && labelClass && (
        <span className={labelClass}>{label}</span>
      )}
      {Icon && (
        <div className="absolute inset-0 p-[22%] flex items-center justify-center pointer-events-none">
          <Icon className={`w-full h-full ${isOn ? 'text-[#FFF] drop-shadow-[0_0_4px_currentColor]' : 'text-[#777]'}`} />
        </div>
      )}
    </div>
  );
};

export default LedButton;
