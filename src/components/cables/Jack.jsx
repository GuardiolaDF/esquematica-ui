import React, { useRef, useEffect, useState } from 'react';
import { useCables } from '../../contexts/CableContext';

const Jack = ({ 
  id, 
  type = 'output', // 'output' or 'input'
  label, 
  activeColor = null, // 'blue-500', 'orange-500', or null
  className = "",
  disabled = false
}) => {
  const { registerJack, unregisterJack, startDrag } = useCables();
  const jackRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const updatePosition = () => {
    if (jackRef.current) {
      const rect = jackRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setCoords({ x, y });
      if (!disabled) {
        registerJack(id, x, y, type, activeColor);
      } else {
        unregisterJack(id);
      }
    }
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      unregisterJack(id);
    };
  }, [id, type, activeColor, disabled, registerJack, unregisterJack]);

  const handleMouseDown = (e) => {
    if (disabled) return;
    if (type === 'output' && activeColor) {
      e.preventDefault();
      updatePosition();
      startDrag(activeColor, coords.x, coords.y, id);
    }
  };

  const isBlue = activeColor === 'blue-500';
  const rgb = isBlue ? '59,130,246' : '249,115,22';
  
  let glowClass = 'bg-[#111]';
  if (disabled) {
    glowClass = 'bg-[#333] shadow-inner opacity-50';
  } else if (activeColor) {
    glowClass = `bg-${activeColor} shadow-[0_0_20px_rgba(${rgb},1)] ring-2 ring-${activeColor}`;
  }

  return (
    <div 
      className={`flex items-end justify-end z-10 ${className} ${disabled ? 'pointer-events-none opacity-50 grayscale' : ''}`} 
      onMouseDown={handleMouseDown}
      style={{ cursor: disabled ? 'not-allowed' : (type === 'output' && activeColor ? 'grab' : 'default') }}
    >
      <div className="w-[60%] aspect-square bg-[#CCC] rounded-full shadow-inner border border-[#999] flex items-center justify-center relative">
         {label && <span className="absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none">{label}</span>}
         <div 
           ref={jackRef} 
           className={`w-[45%] aspect-square rounded-full transition-all duration-300 ${glowClass}`}
         ></div>
      </div>
    </div>
  );
};

export default Jack;
