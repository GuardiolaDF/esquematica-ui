import React, { useRef, useEffect, useState } from 'react';
import { useCables } from '../../contexts/CableContext';

const Jack = ({ 
  id, 
  type = 'output', // 'output' or 'input'
  label, 
  activeColor = null, // 'blue-500', 'orange-500', or null
  className = "" 
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
      registerJack(id, x, y, type, activeColor);
    }
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    // Observe scroll or other layout changes if needed, but for now resize is enough
    return () => {
      window.removeEventListener('resize', updatePosition);
      unregisterJack(id);
    };
  }, [id, type, activeColor, registerJack, unregisterJack]);

  const handleMouseDown = (e) => {
    if (type === 'output' && activeColor) {
      e.preventDefault(); // Prevent text selection etc
      updatePosition(); // ensure latest coords
      startDrag(activeColor, coords.x, coords.y, id);
    }
  };

  const isOrange = activeColor === 'blue-500';
  const isBlue = activeColor === 'orange-500';
  const rgb = isOrange ? '59,130,246' : '249,115,22';
  const glowClass = activeColor 
    ? `bg-${activeColor} shadow-[0_0_20px_rgba(${rgb},1)] ring-2 ring-${activeColor}` 
    : 'bg-[#111]';

  return (
    <div 
      className={`flex items-end justify-end z-10 ${className}`} 
      onMouseDown={handleMouseDown}
      style={{ cursor: (type === 'output' && activeColor) ? 'grab' : 'default' }}
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
