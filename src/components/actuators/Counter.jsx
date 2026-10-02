import React, { useState, useEffect, useRef } from 'react';
import { useHover } from '../../contexts/HoverContext';
import { useAppContext } from '../../contexts/AppContext';
import stepperUp from '../../assets/figma/stepper-up.svg';
import stepperDown from '../../assets/figma/stepper-down.svg';

// Figma: Components › Component 2 / stepper-1 (2166:593) — 48×62.
// Pantalla de 40×48 (background/sunken, radius/md, border/subtle, sombras interiores) con el número en JetBrains Mono 20 px
// text/muted y las flechas ▲▼ a la derecha. La etiqueta va arriba (Micro light, text/secondary).
const SCREEN_SHADOW = 'inset -2px -2px 1px rgba(250,248,248,0.5), inset 2px 2px 1px rgba(0,0,0,0.25)';

const Counter = ({ label, compId, className = '' }) => {
  const { mode, values, setValue: setGlobalValue, averages, missingFields } = useAppContext();

  const [localValue, setLocalValue] = useState(0);
  const { hoveredId, setHoveredId } = useHover();
  const [localHover, setLocalHover] = useState(false);

  const isReadOnly = mode === 'colectivo';
  const isHovered = (compId && hoveredId === compId) || localHover;
  const isMissing = !isReadOnly && missingFields?.includes(compId);

  let ring = null;
  if (isHovered) ring = '0 0 0 2px #39787D61'; // Effects/Focus/Soft
  else if (isMissing) ring = '0 0 0 1.5px #BF6F5B'; // action/destructive/default

  useEffect(() => {
    if (compId) {
      if (isReadOnly && averages[compId] !== undefined) {
        setLocalValue(Math.round(averages[compId]));
      } else if (!isReadOnly && values[compId] !== undefined) {
        setLocalValue(Math.round(values[compId]));
      }
    }
  }, [compId, isReadOnly, values, averages]);

  const step = (delta) => {
    if (isReadOnly) return;
    setLocalValue(prev => {
      const newVal = Math.max(0, Math.min(99, prev + delta));
      if (compId) setGlobalValue(compId, newVal);
      return newVal;
    });
  };

  // Mantener presionado repite el paso
  const intervalRef = useRef(null);
  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  const startStep = (delta) => (e) => {
    e.preventDefault();
    stopInterval();
    step(delta);
    intervalRef.current = setInterval(() => step(delta), 150);
  };
  useEffect(() => stopInterval, []);

  const handlePointerEnter = () => { setLocalHover(true); if (compId) setHoveredId(compId); };
  const handlePointerLeave = () => { setLocalHover(false); if (compId) setHoveredId(null); stopInterval(); };

  const arrowClass = `absolute left-[38px] w-[16px] h-[22px] flex items-center justify-center touch-none select-none transition-opacity duration-fast ${isReadOnly ? 'opacity-50' : 'cursor-pointer opacity-100 hover:opacity-70 active:opacity-100'}`;

  return (
    <div
      className={`relative w-[48px] h-[62px] shrink-0 select-none ${isHovered ? 'z-50' : ''} ${className}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {label && (
        <span className="absolute left-0 top-0 type-micro font-light text-text-secondary whitespace-nowrap pointer-events-none">{label}</span>
      )}

      <div
        className="absolute left-0 top-[14px] w-[40px] h-[48px] rounded-md bg-background-sunken border border-border-subtle flex items-center justify-center transition-shadow duration-standard"
        style={{ boxShadow: [SCREEN_SHADOW, ring].filter(Boolean).join(', ') }}
      >
        <span className="font-body text-[20px] leading-none text-text-muted pointer-events-none">
          {localValue.toString().padStart(2, '0')}
        </span>
      </div>

      <button
        type="button"
        aria-label="Aumentar"
        className={arrowClass}
        style={{ top: 15 }}
        onPointerDown={startStep(1)}
        onPointerUp={stopInterval}
        onPointerCancel={stopInterval}
      >
        <img src={stepperUp} alt="" className="w-[5.2px] h-[4.5px] pointer-events-none" draggable={false} />
      </button>
      <button
        type="button"
        aria-label="Disminuir"
        className={arrowClass}
        style={{ top: 39 }}
        onPointerDown={startStep(-1)}
        onPointerUp={stopInterval}
        onPointerCancel={stopInterval}
      >
        <img src={stepperDown} alt="" className="w-[5.2px] h-[4.5px] rotate-180 pointer-events-none" draggable={false} />
      </button>
    </div>
  );
};

export default Counter;
