import React, { useMemo } from 'react';
import { useHover } from './contexts/HoverContext';

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
  const { hoveredId, setHoveredId } = useHover();
  
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
  
  const dots = useMemo(() => {
    const d = [];
    modules.forEach(mod => {
      const trackStep = (mod.endR - mod.startR) / mod.tracks;
      for (let t = 1; t < mod.tracks; t++) {
        const r = mod.startR + t * trackStep;
        const numDots = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numDots; i++) {
          const angle = startAngle + 2 + Math.random() * (endAngle - startAngle - 4);
          d.push({ r, angle });
        }
      }
    });
    return d;
  }, [startAngle, endAngle, boundaries[0], boundaries[3]]);

  return (
    <div className="w-full h-full bg-[#1a1a1a] rounded-lg border border-[#333] shadow-inner relative overflow-hidden flex items-end justify-center">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sub-tracks (thin gray lines) */}
        {modules.map((mod, i) => {
          const trackStep = (mod.endR - mod.startR) / mod.tracks;
          const modNumber = 3 - i; // i=0->3, i=1->2, i=2->1
          
          return (
            <g key={`tracks-${i}`}>
              {Array.from({length: mod.tracks - 1}).map((_, t) => {
                 const lineIndex = t + 1; // 1 to N
                 const compId = `mod${modNumber}-${lineIndex}`;
                 const r = mod.startR + lineIndex * trackStep;
                 const isHovered = hoveredId === compId;
                 
                 return (
                   <path 
                     key={t} 
                     d={describeArc(cx, cy, r, startAngle, endAngle)} 
                     fill="none" 
                     stroke={isHovered ? "#fbbf24" : "#555"} 
                     strokeWidth={isHovered ? "3" : "0.75"} 
                     filter={isHovered ? "url(#glow)" : ""}
                     style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                     onMouseEnter={() => setHoveredId(compId)}
                     onMouseLeave={() => setHoveredId(null)}
                   />
                 );
              })}
            </g>
          );
        })}

        {/* 4 Main Module Boundaries (Thick Black Lines) */}
        {boundaries.map((r, i) => (
          <path key={`bound-${i}`} d={describeArc(cx, cy, r, startAngle, endAngle)} fill="none" stroke="#000" strokeWidth="3" />
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
              <line x1={leftStart.x} y1={leftStart.y} x2={leftEnd.x} y2={leftEnd.y} stroke="#000" strokeWidth="3" />
              <line x1={rightStart.x} y1={rightStart.y} x2={rightEnd.x} y2={rightEnd.y} stroke="#000" strokeWidth="3" />
            </>
          );
        })()}

        {/* Data Dots (Yellow) */}
        {dots.map((dot, i) => {
          const pos = polarToCartesian(cx, cy, dot.r, dot.angle);
          return <circle key={`dot-${i}`} cx={pos.x} cy={pos.y} r="2.5" fill="#FFD700" />;
        })}

        {/* Labels on the left edge */}
        {modules.map((mod, i) => {
          const midR = (mod.startR + mod.endR) / 2;
          const pos = polarToCartesian(cx, cy, midR, startAngle); 
          
          // Rotation logic: startAngle is from top (0 = 12 o'clock). 
          // Left edge is at startAngle (e.g. -34). 
          // To make text parallel to this line and read outwards, we rotate by startAngle + 90
          return (
            <text 
              key={`label-${i}`}
              x={pos.x} 
              y={pos.y} 
              dy="10" // Push text DOWN in its local coords to place it OUTSIDE the left radius
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

        {/* Static Needle */}
        <g style={{ transform: `rotate(12deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - 700} stroke="#D9D9D9" strokeWidth="5" strokeLinecap="round" />
        </g>
        
        {/* Center Pivot Point Cover (Offscreen) */}
        <circle cx={cx} cy={cy} r="16" fill="#1a1a1a" stroke="#000" strokeWidth="4" />
      </svg>
    </div>
  );
}
