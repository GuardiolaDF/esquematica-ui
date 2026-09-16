import React, { useState, useRef, useCallback } from 'react';
import { useHover } from '../../contexts/HoverContext';

const Knob = ({ 
  sizeClass = "w-[80%]", 
  label, 
  labelClass, 
  initialValue = 0,
  className = "",
  compId
}) => {
  const [value, setValue] = useState(initialValue);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover;
  const glowClass = isHovered ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30' : 'shadow-md border border-transparent';

  const startY = useRef(null);
  const startVal = useRef(null);

  const handleMove = useCallback((clientY) => {
    if (startY.current === null) return;
    const deltaY = startY.current - clientY;
    // Sensibilidad: 1 pixel de movimiento = 1.2 unidades
    let newVal = startVal.current + (deltaY * 1.2);
    newVal = Math.max(0, Math.min(100, newVal));
    setValue(newVal);
  }, []);

  const onMouseDown = (e) => {
    e.preventDefault();
    startY.current = e.clientY;
    startVal.current = value;
    
    const onMouseMove = (moveEvent) => handleMove(moveEvent.clientY);
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    startVal.current = value;
    
    const onTouchMove = (moveEvent) => handleMove(moveEvent.touches[0].clientY);
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  // Mapeo: 0 = -120deg (8 o'clock), 100 = +120deg (4 o'clock)
  const rotation = -120 + (value / 100) * 240;

  const handleMouseEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handleMouseLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); };

  return (
    <div 
      className={`relative flex items-center justify-center ${sizeClass} ${className} cursor-pointer touch-none transition-all duration-300`} 
      onMouseDown={onMouseDown} 
      onTouchStart={onTouchStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label && labelClass && (
         <span className={labelClass}>{label}</span>
      )}
      
      {/* Cuerpo de la Perilla */}
      <div 
        className={`w-full aspect-square rounded-full bg-[#E5E5E5] ${glowClass} flex items-start justify-center pt-[2px] pointer-events-none transition-all duration-300`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Indicador (circulito estandarizado, giratorio) */}
        <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[#444] rounded-full"></div>
      </div>

      {/* Indicadores Externos de Límite (8 o'clock y 4 o'clock) */}
      <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none">
        {/* Límite Izquierdo (-120deg) */}
        <div className="absolute top-0 left-0 w-full h-full" style={{ transform: 'rotate(-120deg)' }}>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2.5px] h-[2.5px] bg-[#333] rounded-full drop-shadow-sm"></div>
        </div>
        {/* Límite Derecho (+120deg) */}
        <div className="absolute top-0 left-0 w-full h-full" style={{ transform: 'rotate(120deg)' }}>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2.5px] h-[2.5px] bg-[#333] rounded-full drop-shadow-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default Knob;
