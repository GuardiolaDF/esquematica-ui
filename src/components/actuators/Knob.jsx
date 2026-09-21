import React, { useState, useRef, useCallback } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';

const Knob = ({ 
  sizeClass = "w-[80%]", 
  label, 
  labelClass, 
  initialValue = 50,
  className = "",
  compId,
  startAngle = -120,
  endAngle = 120,
  markers = [], // Array of objects: { angle: number, label?: string }
  onChange
}) => {
  const { mode, values, setValue: setGlobalValue, averages , visualizationMode, routingOutputs, toggleRoutingSource } = useAppContext();

  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general';
  let routeColor = null;
  if (isRoutingMode && compId) {
    if (routingOutputs.out1 === compId) routeColor = 'orange-500';
    else if (routingOutputs.out2 === compId) routeColor = 'blue-500';
  }

  const [localValue, setLocalValue] = useState(initialValue);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover || isDragging;
  const isMissing = useAppContext().missingFields?.includes(compId);
  const isReadOnly = mode === 'colectivo';
  
  let glowClass = 'shadow-md border border-[#333]';
  if (routeColor) {
    glowClass = `ring-2 ring-${routeColor} shadow-[0_0_15px_rgba(${routeColor === 'blue-500' ? '59,130,246' : '249,115,22'},0.5)]`;
  } else if (isReadOnly) {
    glowClass = isHovered ? 'shadow-[0_0_15px_rgba(255,255,255,0.4)] border border-white' : 'shadow-md border border-[#333]';
  } else {
    glowClass = isHovered 
      ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400' 
      : (isMissing ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500' : 'shadow-md border border-[#333]');
  }
  
  const displayValue = isReadOnly 
    ? (averages[compId] ?? initialValue) 
    : (compId ? (values[compId] ?? initialValue) : localValue);

  const startY = useRef(null);
  const startVal = useRef(null);

  const handleMove = useCallback((clientY) => {
    if (isReadOnly) return;
    if (startY.current === null) return;
    const deltaY = startY.current - clientY;
    let newVal = startVal.current + (deltaY * 1.2);
    newVal = Math.max(0, Math.min(100, newVal));
    setLocalValue(newVal);
    if (onChange) {
      onChange(newVal);
    } else if (compId) {
      setGlobalValue(compId, newVal);
    }
  }, [compId, setGlobalValue, isReadOnly, onChange]);

  const onMouseDown = (e) => {
    if (isRoutingMode && compId) { e.preventDefault(); toggleRoutingSource(compId); return; }
    if (isReadOnly) return;
    e.preventDefault();
    startY.current = e.clientY;
    startVal.current = displayValue; // use displayValue so it doesn't jump
    setIsDragging(true);
    
    const onMouseMove = (moveEvent) => handleMove(moveEvent.clientY);
    const onMouseUp = () => {
      setIsDragging(false);
      startY.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e) => {
    if (isReadOnly) return;
    startY.current = e.touches[0].clientY;
    startVal.current = displayValue;
    setIsDragging(true);
    
    const onTouchMove = (moveEvent) => handleMove(moveEvent.touches[0].clientY);
    const onTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const rotation = startAngle + (displayValue / 100) * (endAngle - startAngle);

  const handleMouseEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handleMouseLeave = () => { setLocalHover(false); if (compId && !isDragging) setHoveredId(null); };

  // Generate default markers if none provided
  const renderMarkers = markers.length > 0 ? markers : [
    { angle: startAngle },
    { angle: endAngle }
  ];

  return (
    <div 
      className={`relative flex items-center justify-center ${sizeClass} ${className} ${isHovered ? 'ring-2 ring-yellow-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.3)] z-50' : ''} cursor-pointer touch-none transition-all duration-300`} 
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
        <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[#444] rounded-full"></div>
      </div>

      {/* Indicadores Externos */}
      <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none">
        {renderMarkers.map((marker, i) => (
          <div key={`marker-${i}`} className="absolute top-0 left-0 w-full h-full" style={{ transform: `rotate(${marker.angle}deg)` }}>
             <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
               <div className="w-[2.5px] h-[2.5px] bg-[#333] rounded-full drop-shadow-sm"></div>
               {marker.label && (
                 <span className="absolute bottom-full mb-[3px] text-[5px] uppercase tracking-[0.1em] text-[#777] font-mono font-bold" style={{ transform: `rotate(${-marker.angle}deg)` }}>
                   {marker.label}
                 </span>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Knob;
