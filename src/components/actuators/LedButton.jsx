import React, { useState } from 'react';
import { useHover } from '../../contexts/HoverContext';

const LedButton = ({ 
  baseClass = "w-[30%] aspect-square rounded-[20%]",
  label, 
  labelClass,
  initialState = false,
  ledColor = "green", // "green" | "yellow"
  icon: Icon,
  compId
}) => {
  const [isOn, setIsOn] = useState(initialState);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover;

  const toggle = () => setIsOn(prev => !prev);

  const handleMouseEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handleMouseLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); };

  // OFF state
  let bgClass = 'bg-[#444] shadow-sm border border-transparent';
  
  // ON state
  if (isOn) {
    if (ledColor === 'yellow') {
      bgClass = 'bg-[#6b6b47] shadow-[inset_0_0_6px_rgba(250,204,21,0.2),0_0_12px_rgba(250,204,21,0.5)] border border-yellow-500/30';
    } else {
      bgClass = 'bg-[#556b55] shadow-[inset_0_0_6px_rgba(74,222,128,0.2),0_0_12px_rgba(74,222,128,0.5)] border border-green-500/30';
    }
  }

  // Hover Override/Addition
  if (isHovered) {
    if (isOn) {
      // Append warm outer glow to existing on-state shadow
      bgClass = bgClass.replace(/shadow-\[.*\]/, 'shadow-[inset_0_0_6px_rgba(0,0,0,0.2),0_0_15px_rgba(251,191,36,0.6)] border-amber-400/50');
    } else {
      bgClass = 'bg-[#4a4a4a] shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30';
    }
  }

  return (
    <div 
      className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 ${baseClass} ${bgClass}`}
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
