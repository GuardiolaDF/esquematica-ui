import React, { useState, useRef, useCallback } from 'react';

const Fader = ({ 
  orientation = 'vertical', 
  trackClass = "", 
  thumbClass = "", 
  initialValue = 50,
  compId
}) => {
  const [value, setValue] = useState(initialValue);
  const containerRef = useRef(null);

  const updateValue = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let percent = 0;
    
    if (orientation === 'vertical') {
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      percent = 1 - (y - rect.top) / rect.height;
    } else {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      percent = (x - rect.left) / rect.width;
    }
    
    percent = Math.max(0, Math.min(1, percent));
    setValue(percent * 100);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    updateValue(e);
    
    const handlePointerMove = (e) => updateValue(e);
    const handlePointerUp = () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  };

  const thumbPos = orientation === 'vertical' ? { bottom: `${value}%` } : { left: `${value}%` };

  return (
    <div 
      ref={containerRef}
      className={`relative cursor-pointer touch-none ${orientation === 'vertical' ? 'w-full h-full' : 'w-full h-full'}`}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      {/* TRACK */}
      <div className={`absolute bg-control-track shadow-inset-control border border-border-subtle rounded-pill ${orientation === 'vertical' ? 'w-[40%] h-full left-1/2 -translate-x-1/2' : 'h-[40%] w-full top-1/2 -translate-y-1/2'} ${trackClass}`}></div>

      {/* THUMB */}
      <div 
        className={`absolute bg-control-bg shadow-elevation-02 border border-border-subtle rounded-pill flex items-center justify-center ${orientation === 'vertical' ? 'w-[140%] h-[30px] left-1/2 -translate-x-1/2 translate-y-1/2' : 'h-[140%] w-[30px] top-1/2 -translate-y-1/2 -translate-x-1/2'} ${thumbClass}`}
        style={thumbPos}
      >
        <div className="w-[8px] h-[8px] bg-indicator-active rounded-full"></div>
      </div>
    </div>
  );
};
export default Fader;
