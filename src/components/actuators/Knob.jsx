import React, { useState, useRef, useCallback } from 'react';

const Knob = ({ 
  sizeClass = "w-full h-full", 
  initialValue = 50,
  compId
}) => {
  const [value, setValue] = useState(initialValue);
  const containerRef = useRef(null);

  const updateValue = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - (rect.left + rect.width/2);
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - (rect.top + rect.height/2);
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    
    // Normalize angle
    angle = angle + 90;
    if (angle < -180) angle += 360;
    
    // Limit to -135 to 135
    angle = Math.max(-135, Math.min(135, angle));
    
    const percent = (angle + 135) / 270;
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

  const rotation = -135 + (value / 100) * 270;

  return (
    <div 
      ref={containerRef}
      className={`relative cursor-pointer touch-none ${sizeClass}`}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      {/* BASE */}
      <div className="w-full h-full rounded-full bg-control-bg shadow-elevation-02 border border-border-subtle flex items-center justify-center">
        {/* INNER DIAL */}
        <div 
          className="w-[85%] h-[85%] rounded-full bg-control-bg shadow-inset-control flex justify-center border border-border-subtle"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
           {/* INDICATOR */}
           <div className="w-[15%] h-[15%] bg-indicator-active rounded-full mt-[10%]"></div>
        </div>
      </div>
    </div>
  );
};
export default Knob;
