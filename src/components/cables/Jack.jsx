import React, { useRef, useEffect, useState } from 'react';
import { useCables } from '../../contexts/CableContext';
import jackSvg from '../../assets/figma/output-jack.svg';

// Figma: Components › output-jack-1 (2166:603) — 20×20, neutral/500 con borde neutral/200 y Effects/Inset/Control.
// El cuerpo es el SVG exportado de Figma; el estado conectado se superpone sobre el orificio (12 px).
const CABLE_GLOW = {
  'blue-500': 'rgba(59,130,246,0.9)',
  'orange-500': 'rgba(249,115,22,0.9)',
};

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

  const canDrag = type === 'output' && activeColor && !disabled;

  return (
    <div
      ref={jackRef}
      className={`relative size-[20px] shrink-0 rounded-pill z-10 touch-none ${disabled ? 'pointer-events-none opacity-disabled grayscale' : ''} ${className}`}
      onPointerDown={handleMouseDown}
      style={{ cursor: disabled ? 'not-allowed' : (canDrag ? 'grab' : 'default') }}
    >
      <img src={jackSvg} alt="" width={20} height={20} draggable={false} className="block pointer-events-none select-none" />
      {activeColor && !disabled && (
        <div
          className={`absolute inset-[4px] rounded-pill bg-${activeColor} transition-shadow duration-standard`}
          style={{ boxShadow: `0 0 10px ${CABLE_GLOW[activeColor]}` }}
        />
      )}
      {label && (
        <span className="absolute bottom-full mb-space-4 left-1/2 -translate-x-1/2 type-caption text-text-secondary whitespace-nowrap pointer-events-none">
          {label}
        </span>
      )}
    </div>
  );
};

export default Jack;
