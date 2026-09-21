import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';

const Fader = ({ 
  orientation = 'vertical',
  trackClass = '',
  thumbClass = '',
  label = '',
  labelClass = '',
  initialValue = 50, // 0 to 100
  compId,
  markers = [],
  value,
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
  const trackRef = useRef(null);

  // Sync with global store based on mode
  let displayValue = localValue;
  if (value !== undefined) {
    displayValue = value;
  } else if (mode === 'colectivo' && compId) {
    displayValue = averages[compId] ?? initialValue;
  } else if (compId) {
    displayValue = values[compId] ?? initialValue;
  }

  const isReadOnly = mode === 'colectivo';

  const [isDragging, setIsDragging] = useState(false);
  
  const handleMove = useCallback((clientX, clientY) => {
    if (mode === 'colectivo') return; // Disabled in colectivo mode
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let newVal = 0;

    if (orientation === 'vertical') {
      const trackHeight = rect.height;
      const y = clientY - rect.top;
      // Invert Y so bottom is 0, top is 100
      newVal = 100 - (y / trackHeight) * 100;
    } else {
      const trackWidth = rect.width;
      const x = clientX - rect.left;
      newVal = (x / trackWidth) * 100;
    }

    newVal = Math.max(0, Math.min(100, newVal));
    setLocalValue(newVal);
    if (onChange) {
      onChange(newVal);
    } else if (compId) {
      setGlobalValue(compId, newVal);
    }
  }, [orientation, mode, compId, setGlobalValue, onChange]);

  const onMouseDown = (e) => {
    if (isRoutingMode && compId) { e.preventDefault(); toggleRoutingSource(compId); return; }
    e.preventDefault(); // Previene selección de texto
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
    
    const onMouseMove = (moveEvent) => handleMove(moveEvent.clientX, moveEvent.clientY);
    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX, e.touches[0].clientY);

    const onTouchMove = (moveEvent) => {
      handleMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
    };
    const onTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover || isDragging;
  const isMissing = useAppContext().missingFields?.includes(compId);
  
  let thumbGlowClass = 'shadow-md border border-transparent';
  let trackGlowClass = '';
  
  if (routeColor) {
    thumbGlowClass = `ring-4 ring-${routeColor} shadow-[0_0_30px_rgba(${routeColor === 'blue-500' ? '59,130,246' : '249,115,22'},1)] bg-${routeColor}/80`;
    trackGlowClass = `ring-2 ring-${routeColor} shadow-[0_0_20px_rgba(${routeColor === 'blue-500' ? '59,130,246' : '249,115,22'},0.6)]`;
  } else if (isReadOnly) {
    thumbGlowClass = isHovered ? 'shadow-[0_0_15px_rgba(255,255,255,0.6)] border border-white bg-gray-100' : 'shadow-[0_0_8px_rgba(255,255,255,0.2)] border border-transparent';
  } else {
    thumbGlowClass = isHovered 
      ? 'shadow-[0_0_15px_rgba(251,191,36,0.8)] border border-yellow-400 bg-yellow-100' 
      : (isMissing ? 'shadow-[0_0_15px_rgba(239,68,68,0.8)] border border-red-500 bg-red-100' : 'shadow-md border border-transparent');
    trackGlowClass = isHovered 
      ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
      : (isMissing ? 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : '');
  }

  const thumbStyle = orientation === 'vertical' 
    ? { bottom: `${displayValue}%`, transform: 'translateY(50%)' }
    : { left: `${displayValue}%`, transform: 'translateX(-50%)' };

  const handleMouseEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handleMouseLeave = () => { setLocalHover(false); if (compId && !isDragging) setHoveredId(null); };

  return (
    <div 
      ref={trackRef}
      className={`${trackClass} ${trackGlowClass} cursor-pointer touch-none transition-all duration-300`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label && labelClass && (
        orientation === 'vertical' ? (
          <div className="absolute right-[100%] top-1/2 -translate-y-1/2 mr-[6px] w-0 h-0 flex items-center justify-center pointer-events-none z-20">
            <span className="-rotate-90 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap">
              {label}
            </span>
          </div>
        ) : (
          <span className={labelClass}>{label}</span>
        )
      )}
      
      {/* Markers (Optional) */}
      {markers && (
        <div className="absolute w-full h-full pointer-events-none">
          {markers.map((m, i) => {
            if (orientation === 'vertical') {
              const pos = (i / (markers.length - 1)) * 100;
              return (
                <span 
                  key={i} 
                  className="absolute left-[150%] text-[6px] text-[#777] font-bold"
                  style={{ bottom: `${pos}%`, transform: 'translateY(50%)' }}
                >
                  {m}
                </span>
              );
            } else {
              // Horizontal markers: empujados un poco hacia adentro (del 4% al 96%) para que no se salgan de la barra
              const pos = 4 + (i / (markers.length - 1)) * 92;
              return (
                <span 
                  key={i} 
                  className="absolute top-1/2 -translate-y-1/2 text-[6.5px] uppercase tracking-[0.1em] text-[#999] font-mono font-bold whitespace-nowrap drop-shadow-md"
                  style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {m}
                </span>
              );
            }
          })}
        </div>
      )}

      <div 
        className={`${thumbClass} ${thumbGlowClass} pointer-events-none transition-all duration-300`}
        style={thumbStyle}
      ></div>
    </div>
  );
};

export default Fader;
