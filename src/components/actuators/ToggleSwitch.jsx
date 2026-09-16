import React, { useState } from 'react';
import { useHover } from '../../contexts/HoverContext';

const ToggleSwitch = ({ 
  initialState = true, // Asumimos que UP (-rotate-45) es ON
  sizeClass = "w-[45%]", 
  label, 
  labelClass, 
  className = "",
  compId 
}) => {
  const [isOn, setIsOn] = useState(initialState);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover;
  const glowClass = isHovered ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30' : 'shadow-md border border-transparent';

  const toggle = () => setIsOn((prev) => !prev);
  
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
      
      {/* Palanca (Lever) */}
      {/* Usamos transition-transform para que el cambio de ángulo sea fluido y mecánico */}
      <div 
        className={`absolute top-1/2 left-1/2 w-[110%] h-[35%] bg-[#888] rounded-full -translate-y-1/2 origin-left shadow-sm transition-transform duration-[150ms] ease-in-out ${
          isOn ? '-rotate-45' : 'rotate-45'
        }`}
      ></div>
    </div>
  );
};

export default ToggleSwitch;
