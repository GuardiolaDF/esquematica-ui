import React, { useMemo, useState, useEffect } from 'react';
import { useHover } from './contexts/HoverContext';
import { useAppContext } from './contexts/AppContext';
import { useCables } from './contexts/CableContext';
import Jack from './components/cables/Jack';
import RelationXY from './components/visualizations/RelationXY';
import SpectrumAnalyzer from './components/visualizations/SpectrumAnalyzer';
import { dbMap, reverseDbMap, dbMetadata } from './dbMap';
import { directInvertedTracks, counterTracks, booleanTracks, getVisualizableData } from './dataTransforms';

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
  const { mode, values, distributions, averages, showSavedOverlay, visualizationMode, setVisualizationMode, routingOutputs } = useAppContext();
  const { connections } = useCables();
  
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
          
          let visData = getVisualizableData(compId, rawVal !== undefined ? rawVal : (counterTracks.includes(compId) ? 0 : 50), dbMetadata[compId]?.dataType);
          let processedVal = visData.value;
          
          let percent = (processedVal - visData.min) / (visData.max - visData.min);
          let targetAngle = paddedStartAngle + percent * (paddedEndAngle - paddedStartAngle);
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
          let avgData = getVisualizableData(compId, averages[compId] ?? 50, dbMetadata[compId]?.dataType);
          let visualAvg = avgData.value;
          let visMin = avgData.min;
          let visMax = avgData.max;

          if (mode === 'sandbox') {
            const rawUser = values[compId];
            if (rawUser !== undefined) {
              let usrData = getVisualizableData(compId, rawUser, dbMetadata[compId]?.dataType);
              visualShift = usrData.value - visualAvg;
            }
          }

          dist.forEach((entry, idx) => {
            let visData = getVisualizableData(compId, entry.val, dbMetadata[compId]?.dataType);
            let processedVal = visData.value;
            
            // Re-scale smear offset according to domain
            let domainSpan = visData.max - visData.min;
            
            // Ruido de Descuantización para romper bloques discretos ("Categorical Smear")
            // Apply a relative jitter of 8% of the domain span
            if (booleanTracks.includes(compId) || counterTracks.includes(compId) || visData.max === 5) {
              const smearSeed = ((idx * 17.345) % 1);
              const smearOffset = (smearSeed - 0.5) * (0.16 * domainSpan);
              processedVal += smearOffset;
            }
            
            if (mode === 'sandbox') {
              processedVal = Math.max(visData.min, Math.min(visData.max, processedVal + visualShift));
            }
            
            let percent = (processedVal - visData.min) / domainSpan;
            let baseAngle = paddedStartAngle + percent * (paddedEndAngle - paddedStartAngle);
            
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
          let visData = getVisualizableData(compId, rawVal, dbMetadata[compId]?.dataType);
          // Convert back to 0-100 percentage for the total calculation
          let percent = (visData.value - visData.min) / (visData.max - visData.min);
          total += percent * 100;
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

  const renderAlternativeVisualization = () => {
    // PREPARACIÓN DE ARQUITECTURA:
    // El DataVisualizer ahora consulta la metadata de las fuentes patcheadas 
    // para determinar qué visualizaciones son válidas.
    const source1Meta = (connections.out1 && routingOutputs.out1) ? dbMetadata[routingOutputs.out1] : null;
    const source2Meta = (connections.out2 && routingOutputs.out2) ? dbMetadata[routingOutputs.out2] : null;

    let isCompatible = true;
    if (source1Meta && !source1Meta.visualizations.includes(visualizationMode)) isCompatible = false;
    if (source2Meta && !source2Meta.visualizations.includes(visualizationMode)) isCompatible = false;

    const renderInputPanel = (title, colorClass, borderClass, shadowClass, outId, isConnected, jackId, jackColor) => (
      <div className={`flex flex-col items-center justify-center bg-[#1a1a1a] border-2 ${isConnected ? borderClass + ' ' + shadowClass : 'border-[#444]'} rounded-xl p-4 w-1/2 min-h-[100px] transition-all duration-300 relative z-10`}>
        <span className={`${isConnected ? colorClass : 'text-[#666]'} text-[10px] font-bold uppercase tracking-widest mb-2`}>{title}</span>
        <span className={`${isConnected ? 'text-white' : 'text-[#555]'} text-sm font-medium text-center`}>
          {routingOutputs[outId] ? (isConnected ? dbMetadata[routingOutputs[outId]].label : "ESPERANDO CABLE...") : "SIN SEÑAL..."}
        </span>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-10 h-10">
          <Jack id={jackId} type="input" activeColor={isConnected ? jackColor : null} />
        </div>
      </div>
    );

    const hasSource1 = connections.out1 && source1Meta;
    const hasSource2 = connections.out2 && source2Meta;
    
    // Logic for Relation XY
    const isRelation = visualizationMode === 'relation';
    const canPlotRelation = hasSource1 && hasSource2 && isCompatible;

    // Logic for Spectrum Analyzer (Distribution)
    const isSpectrum = visualizationMode === 'distribution';
    const canPlotSpectrum = hasSource1 && source1Meta.visualizations.includes('distribution');

    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-8 mt-12 bg-[#111]">
        
        {/* Gráfico o estado de espera */}
        <div className="w-full flex-1 flex flex-col items-center justify-center mb-12 relative">
          <h2 className="absolute top-0 left-0 text-white text-xl font-bold uppercase tracking-widest">
            {visualizationMode}
          </h2>

          {isRelation ? (
            canPlotRelation ? (
              <RelationXY out1Id={routingOutputs.out1} out2Id={routingOutputs.out2} out1Meta={source1Meta} out2Meta={source2Meta} />
            ) : (
              <div className="flex flex-col items-center gap-4 border-2 border-dashed border-[#444] rounded-xl p-12 text-[#666]">
                <span className="text-sm font-bold uppercase tracking-widest">
                  {(!hasSource1 || !hasSource2) ? "WAITING FOR BOTH INPUTS" : "DATOS INCOMPATIBLES PARA XY"}
                </span>
                <span className="text-xs">Por favor, conecte dos variables compatibles con modo "Relation" en los Inputs X e Y.</span>
              </div>
            )
          ) : isSpectrum ? (
            canPlotSpectrum ? (
              <SpectrumAnalyzer outId={routingOutputs.out1} outMeta={source1Meta} colorHex="#3b82f6" />
            ) : (
              <div className="flex flex-col items-center gap-4 border-2 border-dashed border-[#444] rounded-xl p-12 text-[#666]">
                <span className="text-sm font-bold uppercase tracking-widest">
                  {!hasSource1 ? "WAITING FOR INPUT X" : "DATOS INCOMPATIBLES PARA SPECTRUM"}
                </span>
                <span className="text-xs">Por favor, conecte una variable compatible en el Input X (Azul).</span>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-4 text-[#444]">
              <span className="text-xl font-bold uppercase tracking-widest">WIP</span>
              <span>{visualizationMode} visualization pending...</span>
            </div>
          )}
        </div>
        
        {/* Conectores / Inputs Físicos */}
        <div className="flex gap-8 items-center justify-center w-full max-w-xl">
          {renderInputPanel("INPUT X (AZUL)", "text-[#3b82f6]", "border-[#3b82f6]", "shadow-[0_0_30px_rgba(59,130,246,0.3)]", "out1", connections.out1, "vis-in-1", "blue-500")}
          {renderInputPanel("INPUT Y (NARANJA)", "text-[#f97316]", "border-[#f97316]", "shadow-[0_0_30px_rgba(249,115,22,0.3)]", "out2", connections.out2, "vis-in-2", "orange-500")}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex items-end justify-center">
      
      {/* 1. MODO INDICADOR Y MENÚ DE VISUALIZACIÓN */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
        <div className="text-white font-extrabold text-base uppercase tracking-widest drop-shadow-md">
          {modeLabels[mode]}
        </div>
        
        {mode === 'colectivo' && (
          <div className="flex bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#333] rounded-full p-1 gap-1">
            {['general', 'ranking', 'distribution', 'relation', 'wordcloud'].map(vMode => (
              <button
                key={vMode}
                onClick={() => setVisualizationMode(vMode)}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full transition-all ${
                  visualizationMode === vMode 
                    ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                    : 'text-[#888] hover:text-white hover:bg-[#222]'
                }`}
              >
                {vMode}
              </button>
            ))}
          </div>
        )}
      </div>

      {visualizationMode !== 'general' && mode === 'colectivo' ? (
        renderAlternativeVisualization()
      ) : (
        <>
          {/* 2. EXTREMOS DEL VÚMETRO */}
          <div className="absolute top-[35%] left-[4%] text-white font-extrabold text-sm uppercase tracking-wide z-10 drop-shadow-md pointer-events-none">
            + RELAX
          </div>
          <div className="absolute top-[35%] right-[4%] text-white font-extrabold text-sm uppercase tracking-wide z-10 drop-shadow-md pointer-events-none">
            + ESTRÉS
          </div>

          {/* 3. PANEL DE VARIABLE */}
          <div 
            className="absolute top-4 left-4 bg-[#0a0a0a]/90 border border-[#333] shadow-lg rounded-xl p-4 min-w-[280px] max-w-[320px] z-10 flex flex-col gap-1 pointer-events-none"
          >
            <span className="text-[#888] text-[9px] font-bold uppercase tracking-widest">Variable</span>
            <span className="text-[#eee] text-sm font-medium leading-snug min-h-[40px] flex items-start">
              {hoveredId && dbMap[hoveredId] ? dbMap[hoveredId] : "---"}
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
        </>
      )}
    </div>
  );
}
