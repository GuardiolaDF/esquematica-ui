import React, { useState, useCallback } from 'react';
import { useHover } from '../../contexts/HoverContext';

const RotarySwitch = ({ 
  sizeClass = "w-[85%]", 
  label, 
  labelClass, 
  initialStep,
  angles = [-90, -45, 0, 45, 90],
  optionLabels = [],
  className = "",
  compId
}) => {
  const startStep = initialStep !== undefined ? initialStep : Math.floor(angles.length / 2);
  const [step, setStep] = useState(startStep);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover;
  const glowClass = isHovered ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30' : 'shadow-md border border-transparent';

  const handleInteraction = useCallback((clientX, clientY, rect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    
    let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI; 
    let cssAngle = angleDeg + 90;
    
    if (cssAngle > 180) cssAngle -= 360;
    if (cssAngle < -180) cssAngle += 360;
    
    let closestStep = 0;
    let minDiff = Infinity;
    angles.forEach((a, index) => {
      const diff = Math.abs(a - cssAngle);
      if (diff < minDiff) {
        minDiff = diff;
        closestStep = index;
      }
    });
    
    setStep(closestStep);
  }, [angles]);

  const onMouseDown = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    handleInteraction(e.clientX, e.clientY, rect);
    
    const onMouseMove = (moveEvent) => handleInteraction(moveEvent.clientX, moveEvent.clientY, rect);
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleInteraction(e.touches[0].clientX, e.touches[0].clientY, rect);
    
    const onTouchMove = (moveEvent) => handleInteraction(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY, rect);
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  // Reducimos el radio para que los puntos y textos estén pegados a la perilla original
  const dotRadius = 55; // % del centro
  const textRadius = 70; // % del centro

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
      {/* Etiqueta principal movida dinámicamente muy por encima para no tapar los textos */}
      {label && labelClass && (
         <span className={labelClass} style={{ bottom: '135%' }}>{label}</span>
      )}
      
      {/* Cuerpo de la Perilla. Exactamente w-full y h-full del contenedor definido por sizeClass */}
      <div 
        className={`w-full h-full rounded-full bg-[#E5E5E5] ${glowClass} relative pointer-events-none transition-all duration-[150ms] ease-out`}
        style={{ transform: `rotate(${angles[step]}deg)` }}
      >
        <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-1.5 h-2.5 bg-[#444] rounded-sm"></div>
      </div>

      {/* Puntos y textos */}
      {angles.map((ang, i) => {
        const rad = (ang * Math.PI) / 180;
        const dx = Math.sin(rad);
        const dy = -Math.cos(rad);
        
        const dotLeft = `calc(50% + ${dx * dotRadius}%)`;
        const dotTop = `calc(50% + ${dy * dotRadius}%)`;
        
        const textLeft = `calc(50% + ${dx * textRadius}%)`;
        const textTop = `calc(50% + ${dy * textRadius}%)`;

        const isActive = step === i;

        return (
          <React.Fragment key={i}>
            {/* Punto */}
            <div 
              className={`absolute w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-200 -translate-x-1/2 -translate-y-1/2 ${
                isActive 
                  ? 'bg-[#556b55] shadow-[0_0_6px_rgba(74,222,128,0.5)] border border-green-500/30' 
                  : 'bg-[#666] border border-transparent'
              }`}
              style={{ left: dotLeft, top: dotTop }}
            ></div>
            
            {/* Texto */}
            <div 
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ left: textLeft, top: textTop }}
            >
              <span className="text-[5.5px] uppercase tracking-[0.1em] text-[#888] font-mono font-bold whitespace-nowrap">
                {optionLabels[i] || "TXT"}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default RotarySwitch;
