import React, { useState } from 'react';
import { useHover } from '../../contexts/HoverContext';

const Counter = ({ label, labelClass, compId }) => {
  const [count, setCount] = useState(0);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover;
  const glowClass = isHovered ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30' : 'shadow-inner border border-transparent';

  const increment = () => setCount((c) => Math.min(99, c + 1));
  const decrement = () => setCount((c) => Math.max(0, c - 1));

  // Formato con ceros a la izquierda (ej: "00", "07", "42")
  const displayValue = count.toString().padStart(2, '0');

  const handleMouseEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handleMouseLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); };

  return (
    <div 
      className="w-full h-full flex flex-row items-center justify-between transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pantalla Gris Oscura */}
      <div className={`w-[75%] h-full bg-[#444] rounded-md ${glowClass} relative flex items-center justify-center transition-all duration-300`}>
        {label && labelClass && (
          <span className={labelClass}>{label}</span>
        )}
        {/* Número en JetBrains Mono (font-mono) con peso thin y 1.8rem de tamaño */}
        <span className="text-[#E5E5E5] font-mono text-[1.8rem] font-thin tracking-[0.1em] select-none pointer-events-none">
          {displayValue}
        </span>
      </div>
      
      {/* Flechas Interactuables */}
      <div className="w-[20%] h-full flex flex-col justify-between items-end py-1">
        {/* Flecha Arriba */}
        <div 
          className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-transparent border-b-[#E5E5E5] cursor-pointer hover:border-b-[#FFF] active:scale-[0.85] transition-transform origin-bottom"
          onClick={increment}
          onTouchEnd={(e) => { e.preventDefault(); increment(); }} // Soporte táctil extra rápido
        ></div>
        
        {/* Flecha Abajo */}
        <div 
          className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-transparent border-t-[#E5E5E5] cursor-pointer hover:border-t-[#FFF] active:scale-[0.85] transition-transform origin-top"
          onClick={decrement}
          onTouchEnd={(e) => { e.preventDefault(); decrement(); }}
        ></div>
      </div>
    </div>
  );
};

export default Counter;
