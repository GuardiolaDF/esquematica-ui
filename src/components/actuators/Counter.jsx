import React, { useState, useEffect, useRef } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';

const Counter = ({ label, labelClass, compId }) => {
  const { mode, values, setValue: setGlobalValue, averages , visualizationMode, routingOutputs, toggleRoutingSource } = useAppContext();

  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general';
  let routeColor = null;
  if (isRoutingMode && compId) {
    if (routingOutputs.out1 === compId) routeColor = 'blue-500';
    else if (routingOutputs.out2 === compId) routeColor = 'orange-500';
  }

  const [localValue, setLocalValue] = useState(0);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isReadOnly = mode === 'colectivo';
  
  const isHovered = (compId && hoveredId === compId) || localHover;
  const isMissing = useAppContext().missingFields?.includes(compId);
  const glowClass = isHovered 
    ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30' 
    : (isMissing ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500/50' : 'shadow-inner border border-transparent');

  useEffect(() => {
    if (compId) {
      if (isReadOnly && averages[compId] !== undefined) {
        setLocalValue(Math.round(averages[compId]));
      } else if (!isReadOnly && values[compId] !== undefined) {
        setLocalValue(Math.round(values[compId]));
      }
    }
  }, [compId, isReadOnly, values, averages]);

  const displayValue = localValue;

  const increment = () => {
    if (mode === 'colectivo') return;
    setLocalValue(prev => {
      const newVal = Math.min(99, prev + 1);
      if (compId) setGlobalValue(compId, newVal);
      return newVal;
    });
  };
  
  const decrement = () => {
    if (mode === 'colectivo') return;
    setLocalValue(prev => {
      const newVal = Math.max(0, prev - 1);
      if (compId) setGlobalValue(compId, newVal);
      return newVal;
    });
  };

  const displayString = displayValue.toString().padStart(2, '0');
  
  const intervalRef = useRef(null);
  
  const startIncrement = () => {
    increment();
    intervalRef.current = setInterval(increment, 150);
  };
  
  const startDecrement = () => {
    decrement();
    intervalRef.current = setInterval(decrement, 150);
  };
  
  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopInterval();
  }, []);

  const handleMouseEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handleMouseLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); stopInterval(); };

  return (
    <div 
      className="w-full h-full flex flex-row items-start justify-between transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Pantalla Gris Oscura (Reducida 25% desde abajo) */}
      <div className={`w-[75%] h-[75%] bg-[#444] rounded-md ${glowClass} relative flex items-center justify-center transition-all duration-300`}>
        {label && labelClass && (
          <span className={labelClass}>{label}</span>
        )}
        <span className="text-[#E5E5E5] font-mono text-[1.8rem] font-thin tracking-[0.1em] select-none pointer-events-none mt-1">
          {displayString}
        </span>
      </div>
      
      {/* Flechas Interactuables (Reducidas 25% y redondeadas, SVG) */}
      <div className="w-[20%] h-[75%] flex flex-col justify-between items-end py-1">
        {/* Flecha Arriba */}
        <div 
          className="w-[12px] h-[9px] text-[#E5E5E5] cursor-pointer hover:text-[#FFF] active:scale-[0.85] transition-transform origin-bottom flex items-center justify-center select-none"
          onMouseDown={startIncrement}
          onMouseUp={stopInterval}
          onMouseLeave={stopInterval}
          onTouchStart={(e) => { e.preventDefault(); startIncrement(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopInterval(); }}
        >
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 6 2 L 10 7 L 2 7 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Flecha Abajo */}
        <div 
          className="w-[12px] h-[9px] text-[#E5E5E5] cursor-pointer hover:text-[#FFF] active:scale-[0.85] transition-transform origin-top flex items-center justify-center select-none"
          onMouseDown={startDecrement}
          onMouseUp={stopInterval}
          onMouseLeave={stopInterval}
          onTouchStart={(e) => { e.preventDefault(); startDecrement(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopInterval(); }}
        >
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 6 7 L 2 2 L 10 2 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Counter;
