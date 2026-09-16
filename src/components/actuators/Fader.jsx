import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useHover } from '../../contexts/HoverContext';

const Fader = ({
  orientation = 'vertical',
  trackClass = '',
  thumbClass = '',
  label = '',
  labelClass = '',
  initialValue = 0, // 0 to 100
  compId,
  markers = []
}) => {
  const [value, setValue] = useState(initialValue);
  const trackRef = useRef(null);

  const handleMove = useCallback((clientX, clientY) => {
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
    setValue(newVal);
  }, [orientation]);

  const onMouseDown = (e) => {
    e.preventDefault(); // Previene selección de texto
    handleMove(e.clientX, e.clientY);
    
    const onMouseMove = (moveEvent) => handleMove(moveEvent.clientX, moveEvent.clientY);
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);

    const onTouchMove = (moveEvent) => {
      handleMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
    };
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);
  
  const isHovered = (compId && hoveredId === compId) || localHover;
  const glowClass = isHovered ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-400/30' : 'shadow-md border border-transparent';

  const thumbStyle = orientation === 'vertical' 
    ? { bottom: `${value}%`, transform: 'translateY(50%)' }
    : { left: `${value}%`, transform: 'translateX(-50%)' };

  const handleMouseEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handleMouseLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); };

  return (
    <div 
      ref={trackRef}
      className={`${trackClass} cursor-pointer touch-none transition-all duration-300`}
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
      
      {orientation === 'horizontal' && markers && markers.length > 0 && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-full pointer-events-none z-10">
          {markers.map((m, i) => {
            const pos = (i / (markers.length - 1)) * 100;
            return (
              <span 
                key={i} 
                className="absolute top-1/2 -translate-y-1/2 text-[6.5px] uppercase tracking-[0.1em] text-[#666] font-mono font-bold whitespace-nowrap drop-shadow-md"
                style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }}
              >
                {m}
              </span>
            );
          })}
        </div>
      )}

      <div 
        className={`${thumbClass} ${glowClass} pointer-events-none transition-shadow duration-300`}
        style={thumbStyle}
      ></div>
    </div>
  );
};

export default Fader;
