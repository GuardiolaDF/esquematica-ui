import React, { useMemo, useState, useEffect } from 'react';
import { useHover } from './contexts/HoverContext';
import { useAppContext } from './contexts/AppContext';
import { dbMap } from './dbMap';

// Math helpers for SVG arcs
function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(angleInRadians)),
    y: cy + (r * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

export default function DataVisualizer() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 150); // delay to trigger CSS transition
    return () => clearTimeout(t);
  }, []);

  const { hoveredId, setHoveredId } = useHover();
  const { mode, values, distributions, averages, showSavedOverlay } = useAppContext();
  
  const [lastHoveredText, setLastHoveredText] = useState("");
  useEffect(() => {
    if (hoveredId && dbMap[hoveredId]) {
      setLastHoveredText(dbMap[hoveredId]);
    }
  }, [hoveredId]);

  const modeLabels = {
    'colectivo': 'MODO COLECTIVO',
    'individual': 'MODO INDIVIDUAL',
    'sandbox': 'MODO Y SI...?'
  };
  
  const width = 800;
  const height = 600;
  
  const cx = width / 2;
  const cy = 715; 
  
  const startAngle = -34;
  const endAngle = 34;
  
  const boundaries = [350, 460, 570, 680];
  
  const modules = [
    { name: 'Módulo 3', startR: boundaries[0], endR: boundaries[1], tracks: 20 }, // mod3-1 to mod3-19
    { name: 'Módulo 2', startR: boundaries[1], endR: boundaries[2], tracks: 18 }, // mod2-1 to mod2-17
    { name: 'Módulo 1', startR: boundaries[2], endR: boundaries[3], tracks: 26 }, // mod1-1 to mod1-25
  ];

  const directInvertedTracks = [
    'mod2-1', 'mod2-5', 'mod2-6', 'mod2-8', 'mod2-12', 'mod2-17',
    'mod3-5', 'mod3-18'
  ];
  
  const counterTracks = ['mod2-9', 'mod2-10', 'mod2-11', 'mod3-6', 'mod3-7'];
  const zonedTracks = ['mod2-1', 'mod3-5'];
  const booleanTracks = ['mod2-5', 'mod2-6', 'mod2-7', 'mod2-8', 'mod2-12', 'mod2-13', 'mod2-14', 'mod3-8', 'mod3-9', 'mod3-10', 'mod3-11', 'mod3-12', 'mod3-13', 'mod3-14', 'mod3-17', 'mod3-18', 'mod3-19'];
  
  const getRelativeValue = (compId, val) => {
    if (counterTracks.includes(compId)) {
      if (compId === 'mod3-6' || compId === 'mod3-7') {
        if (val >= 9) return 10;
        if (val === 8) return 20;
        if (val === 7) return 30;
        if (val === 6) return 45;
        if (val === 5) return 60;
        if (val === 4) return 75;
        if (val === 3) return 85;
        if (val === 2) return 90;
        if (val === 1) return 95;
        if (val === 0) return 98;
      }
      
      if (val === 0) return 2;
      
      let maxRelax = 2, maxInter = 4;
      if (compId === 'mod2-9') { // Programas
        maxRelax = 2; maxInter = 4;
      } else if (compId === 'mod2-10') { // Pestañas
        maxRelax = 4; maxInter = 10;
      } else if (compId === 'mod2-11') { // Archivos
        maxRelax = 5; maxInter = 15;
      }
      
      if (val <= maxRelax) {
        if (maxRelax === 1) return 20;
        return 10 + ((val - 1) / (maxRelax - 1)) * 23; 
      }
      
      if (val <= maxInter) {
        if (maxInter - maxRelax === 1) return 50;
        return 35 + ((val - maxRelax - 1) / (maxInter - maxRelax - 1)) * 31;
      }
      
      // Asintótico de 67 a 98
      const over = val - maxInter; 
      const k = 0.2; // Controla qué tan rápido se acerca a 98
      return 67 + (31 * (1 - Math.exp(-k * over)));
    }
    return val;
  };

  const getZonedValue = (compId, val) => {
    if (zonedTracks.includes(compId)) {
      // Convierte 0..100 en 5 zonas: 0->10, 25->30, 50->50, 75->70, 100->90
      return 10 + (val / 100) * 80;
    }
    if (booleanTracks.includes(compId)) {
      // Divide en dos mitades (SI/NO): 0 se va al 25% (mitad izquierda) y 100 se va al 75% (mitad derecha)
      return val < 50 ? 25 : 75;
    }
    return val;
  };

  const dots = useMemo(() => {
    const d = [];
    
    // Constraint angular para que los círculos no muerdan las líneas de límite
    // (Ej. dejamos 1.5 grados de margen en los extremos)
    const paddedStartAngle = startAngle + 1.5;
    const paddedEndAngle = endAngle - 1.5;

    modules.forEach((mod, i) => {
      const trackStep = (mod.endR - mod.startR) / mod.tracks;
      const modNumber = 3 - i; 
      
      for (let t = 1; t < mod.tracks; t++) {
        const r = mod.startR + t * trackStep;
        const compId = `mod${modNumber}-${t}`;
        const isInverted = directInvertedTracks.includes(compId);

        if (mode === 'individual') {
          const rawVal = values[compId];
          
          let processedVal = rawVal !== undefined ? getRelativeValue(compId, rawVal) : (counterTracks.includes(compId) ? getRelativeValue(compId, 0) : 50);
          
          if (rawVal !== undefined && isInverted) processedVal = 100 - processedVal;
          processedVal = getZonedValue(compId, processedVal);
          
          let targetAngle = paddedStartAngle + (processedVal / 100) * (paddedEndAngle - paddedStartAngle);
          if (rawVal === undefined && !counterTracks.includes(compId)) targetAngle = paddedStartAngle + 0.5 * (paddedEndAngle - paddedStartAngle);

          let currentAngle = isMounted ? targetAngle : paddedStartAngle;
          
          let opacity = 1;
          let color = "#FFC800";
          if (rawVal === undefined) {
            color = "#666666"; // Solid gray for untouched
            opacity = 1;
          } else {
            const isBooleanLike = (processedVal === 0 || processedVal === 100);
            if (isBooleanLike && processedVal === 0) opacity = 0.05;
          }
          
          d.push({ id: `${compId}-single`, compId, r, angle: currentAngle, opacity, color, isHovered: hoveredId === compId });
          
        } else if (mode === 'colectivo' || mode === 'sandbox') {
          const dist = distributions[compId] || [];
          
          let visualShift = 0;
          let visualAvg = getRelativeValue(compId, averages[compId] ?? 50);
          if (isInverted) visualAvg = 100 - visualAvg;
          visualAvg = getZonedValue(compId, visualAvg);

          if (mode === 'sandbox') {
            const rawUser = values[compId];
            if (rawUser !== undefined) {
              let visualUser = getRelativeValue(compId, rawUser);
              if (isInverted) visualUser = 100 - visualUser;
              visualUser = getZonedValue(compId, visualUser);
              visualShift = visualUser - visualAvg;
            }
          }

          dist.forEach((entry, idx) => {
            let processedVal = getRelativeValue(compId, entry.val);
            if (isInverted) processedVal = 100 - processedVal;
            processedVal = getZonedValue(compId, processedVal);
            
            // Ruido de Descuantización para romper bloques discretos ("Categorical Smear")
            if (booleanTracks.includes(compId) || zonedTracks.includes(compId) || counterTracks.includes(compId)) {
              // Deterministic uniform noise between -8% and +8%
              const smearSeed = ((idx * 17.345) % 1);
              const smearOffset = (smearSeed - 0.5) * 16;
              processedVal += smearOffset;
            }
            
            if (mode === 'sandbox') {
              processedVal = Math.max(0, Math.min(100, processedVal + visualShift));
            }
            
            let baseAngle = paddedStartAngle + (processedVal / 100) * (paddedEndAngle - paddedStartAngle);
            
            // --- ENJAMBRE ORGÁNICO (Organic Swarm) ---
            const u = (Math.sin(idx * 13.456) + 1) / 2 || 0.001;
            const v = (Math.cos(idx * 8.765) + 1) / 2 || 0.001;
            const gaussX = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            const gaussY = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
            
            const angleJitter = gaussX * 1.4; // Ligeramente más esparcidos en el eje
            const radialJitter = gaussY * (trackStep * 0.28); 
            
            const targetAngle = baseAngle + angleJitter;
            const currentAngle = isMounted ? targetAngle : paddedStartAngle;
            
            const rJitterScale = Math.abs(Math.sin(idx * 11.234));
            // Puntos más pequeños como pidió el usuario
            const size = 0.4 + rJitterScale * 0.7; 
            
            const hue = 45 + (Math.sin(idx * 7.654) * 12); 
            const color = `hsl(${hue}, 100%, 55%)`;

            const distFromCenter = Math.sqrt(gaussX*gaussX + gaussY*gaussY);
            // Opacidad ligeramente más sutil para compensar aglomeraciones
            let opacity = Math.max(0.1, 0.5 - (distFromCenter * 0.15));

            if (processedVal === 0 || processedVal === 10) {
              opacity = 0.03; 
            }

            d.push({ 
              id: `${compId}-${idx}`,
              compId,
              r: r + radialJitter, 
              angle: currentAngle, 
              opacity,
              size,
              color,
              isHovered: hoveredId === compId 
            });
          });

          // Average indicator
          let aVal = visualAvg;
          if (mode === 'sandbox') aVal = Math.max(0, Math.min(100, aVal + visualShift));
          const aAngle = paddedStartAngle + (aVal / 100) * (paddedEndAngle - paddedStartAngle);
          d.push({ id: `${compId}-avg`, compId, r, angle: isMounted ? aAngle : paddedStartAngle, opacity: 1, color: "#FFFFFF", isAvg: true, isHovered: hoveredId === compId });
          
          if (showSavedOverlay) {
            const rawVal = values[compId];
            if (rawVal !== undefined) {
              let processedVal = getRelativeValue(compId, rawVal);
              const isInverted = directInvertedTracks.includes(compId);
              if (isInverted) processedVal = 100 - processedVal;
              processedVal = getZonedValue(compId, processedVal);
              let targetAngle = paddedStartAngle + (processedVal / 100) * (paddedEndAngle - paddedStartAngle);
              d.push({ 
                id: `${compId}-saved-overlay`, 
                compId, 
                r, 
                angle: isMounted ? targetAngle : paddedStartAngle, 
                opacity: 1, 
                size: 6,
                color: "#FFFFFF", 
                strokeColor: "#00E5FF", // Cyan brillante
                isSavedOverlay: true,
                isHovered: hoveredId === compId 
              });
            }
          }
        }
      }
    });
    return d;
  }, [mode, values, distributions, hoveredId, startAngle, endAngle, boundaries, directInvertedTracks]);

  const avgNeedleAngle = useMemo(() => {
    let sourceData = mode === 'colectivo' ? averages : values;
    
    let total = 0;
    let count = 0;

    Object.keys(sourceData).forEach(compId => {
      if (compId.startsWith('mod')) {
        let rawVal = sourceData[compId];
        if (typeof rawVal === 'number') {
          let val = getRelativeValue(compId, rawVal);
          if (directInvertedTracks.includes(compId)) val = 100 - val;
          val = getZonedValue(compId, val);
          total += val;
          count++;
        }
      }
    });

    if (count > 0) {
      const paddedStartAngle = startAngle + 1.5;
      const paddedEndAngle = endAngle - 1.5;
      const globalAvg = total / count;
      return paddedStartAngle + (globalAvg / 100) * (paddedEndAngle - paddedStartAngle);
    }

    return 0;
  }, [mode, averages, values, startAngle, endAngle, directInvertedTracks, distributions]);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-end justify-center">
      
      {/* 1. MODO INDICADOR */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white font-extrabold text-base uppercase tracking-widest z-10 drop-shadow-md">
        {modeLabels[mode]}
      </div>

      {/* 2. EXTREMOS DEL VÚMETRO */}
      <div className="absolute top-[35%] left-[4%] text-white font-extrabold text-sm uppercase tracking-wide z-10 drop-shadow-md">
        + RELAX
      </div>
      <div className="absolute top-[35%] right-[4%] text-white font-extrabold text-sm uppercase tracking-wide z-10 drop-shadow-md">
        + ESTRÉS
      </div>

      {/* 3. PANEL DE VARIABLE */}
      <div 
        className={`absolute top-4 left-4 bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#222] rounded-xl p-4 min-w-[280px] max-w-[320px] transition-opacity duration-500 z-10 flex flex-col gap-1 pointer-events-none ${hoveredId ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="text-[#888] text-[9px] font-bold uppercase tracking-widest">Variable</span>
        <span className="text-[#eee] text-sm font-medium leading-snug">
          {lastHoveredText}
        </span>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 800 450" preserveAspectRatio="xMidYMax meet">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sub-tracks (thin gray lines & invisible hitboxes) */}
        {modules.map((mod, i) => {
          const trackStep = (mod.endR - mod.startR) / mod.tracks;
          const modNumber = 3 - i; 
          
          return (
            <g key={`tracks-${i}`}>
              {Array.from({length: mod.tracks - 1}).map((_, t) => {
                 const lineIndex = t + 1; 
                 const compId = `mod${modNumber}-${lineIndex}`;
                 const r = mod.startR + lineIndex * trackStep;
                 const isHovered = hoveredId === compId;
                 
                 return (
                   <g key={t}>
                     {/* Visible Line */}
                     <path 
                       d={describeArc(cx, cy, r, startAngle, endAngle)} 
                       fill="none" 
                       stroke={isHovered ? "#FFF" : "#555"} 
                       strokeWidth={isHovered ? "2.5" : "0.75"} 
                       filter={isHovered ? "url(#glow)" : ""}
                       pointerEvents="none"
                     />
                     {/* Invisible Hitbox (Ancho igual a trackStep para llenar todo el espacio de hover) */}
                     <path 
                       d={describeArc(cx, cy, r, startAngle, endAngle)} 
                       fill="none" 
                       stroke="transparent" 
                       strokeWidth={trackStep} 
                       style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                       onMouseEnter={() => setHoveredId(compId)}
                       onMouseLeave={() => setHoveredId(null)}
                     />
                   </g>
                 );
              })}
            </g>
          );
        })}

        {/* 4 Main Module Boundaries (Thick Black Lines) */}
        {boundaries.map((r, i) => (
          <path key={`bound-${i}`} d={describeArc(cx, cy, r, startAngle, endAngle)} fill="none" stroke="#000" strokeWidth="3" pointerEvents="none" />
        ))}

        {/* Side boundary lines */}
        {(() => {
          const outerR = boundaries[3];
          const innerR = boundaries[0];
          const leftStart = polarToCartesian(cx, cy, innerR, startAngle);
          const leftEnd = polarToCartesian(cx, cy, outerR, startAngle);
          const rightStart = polarToCartesian(cx, cy, innerR, endAngle);
          const rightEnd = polarToCartesian(cx, cy, outerR, endAngle);
          
          return (
            <>
              <line x1={leftStart.x} y1={leftStart.y} x2={leftEnd.x} y2={leftEnd.y} stroke="#000" strokeWidth="3" pointerEvents="none" />
              <line x1={rightStart.x} y1={rightStart.y} x2={rightEnd.x} y2={rightEnd.y} stroke="#000" strokeWidth="3" pointerEvents="none" />
            </>
          );
        })()}

        {/* Data Dots */}
        {dots.map((dot) => {
          // Ya no animamos x e y directamente con transition-all porque hace una línea recta.
          // En vez de eso, ubicamos el punto a las 12 en punto y rotamos el grupo. 
          // CSS interpolará la rotación circularmente.
          return (
            <g 
              key={dot.id}
              className="transition-transform duration-500 ease-out pointer-events-none"
              style={{ 
                transform: `rotate(${dot.angle}deg)`, 
                transformOrigin: `${cx}px ${cy}px`,
                mixBlendMode: dot.isHovered ? 'normal' : 'screen' 
              }}
            >
              <circle 
                cx={cx} 
                cy={cy - dot.r} 
                r={dot.isHovered ? "3.5" : (dot.size || (mode === 'colectivo' ? 2 : 3))} 
                fill={dot.isHovered ? "#FFF" : (dot.color || "#FFC800")} 
                opacity={dot.isHovered ? 1 : dot.opacity}
                filter={dot.isHovered ? "url(#glow)" : ""}
                stroke={dot.strokeColor || "transparent"}
                strokeWidth={dot.strokeColor ? 1.5 : 0}
                className="transition-all duration-500 ease-out"
              />
            </g>
          );
        })}

        {/* Labels on the left edge */}
        {modules.map((mod, i) => {
          const midR = (mod.startR + mod.endR) / 2;
          const pos = polarToCartesian(cx, cy, midR, startAngle); 
          
          return (
            <text 
              key={`label-${i}`}
              x={pos.x} 
              y={pos.y} 
              dy="10" 
              fill="#888" 
              fontSize="10" 
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              transform={`rotate(${startAngle + 90}, ${pos.x}, ${pos.y})`}
            >
              {mod.name}
            </text>
          );
        })}

        {/* Static Needle (or Average in Colectivo) */}
        <g style={{ transform: `rotate(${avgNeedleAngle}deg)`, transformOrigin: `${cx}px ${cy}px` }} className="transition-all duration-1000 ease-out">
          <line x1={cx} y1={cy} x2={cx} y2={cy - boundaries[3]} stroke="#D9D9D9" strokeWidth="5" strokeLinecap="round" opacity={mode === 'colectivo' ? 0.5 : 1} />
        </g>
        
        {/* Center Pivot Point Cover (Offscreen) */}
        <circle cx={cx} cy={cy} r="16" fill="#1a1a1a" stroke="#000" strokeWidth="4" />
      </svg>
    </div>
  );
}
