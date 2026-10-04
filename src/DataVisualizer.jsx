import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useHover } from './contexts/HoverContext';
import { useAppContext } from './contexts/AppContext';
import { useCables } from './contexts/CableContext';
import RelationXY from './components/visualizations/RelationXY';
import SpectrumAnalyzer from './components/visualizations/SpectrumAnalyzer';
import Association from './components/visualizations/Association';
import SwarmCanvas from './components/visualizations/SwarmCanvas';
import { dbMap, reverseDbMap, dbMetadata } from './dbMap';
import { directInvertedTracks, counterTracks, booleanTracks, getVisualizableData, stressIndex, stressPercent, trackReading } from './dataTransforms';
import VariablePanel from './components/VariablePanel';
import Logo from './components/Logo';
import OutputPanel from './components/cables/OutputPanel';
import { primitives as P } from './design/tokens';
import { CHANNEL_1, CHANNEL_2 } from './design/channels';

// Colores de los datos (paleta RAMS): enjambre en teal, promedio y selección en coral, sin dato en neutro.
const SWARM_COLORS = [P.teal[500], P.teal[600], P.teal[700]];

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

const GEOMETRY = {
  desktop: { w: 800, h: 450, cx: 400, cy: 715, start: -34, end: 34, bounds: [350, 460, 570, 680], viewBox: '0 0 800 450', align: 'xMidYMax meet' },
  compact: { w: 360, h: 470, cx: 180, cy: 700, start: -15, end: 15, bounds: [250, 393, 537, 680], viewBox: '0 20 360 440', align: 'xMidYMid meet' },
};

export default function DataVisualizer({ compact = false, hint = null }) {
  const visLabels = {
    general: 'COLECTIVO',
    spectrum: 'DISTRIBUCIÓN',
    relation: 'RELACIÓN',
    association: 'ASOCIACIONES'
  };

  const [isMounted, setIsMounted] = useState(false);
  const vumeterRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 150); // delay to trigger CSS transition
    return () => clearTimeout(t);
  }, []);

  const { hoveredId, setHoveredId } = useHover();
  const { mode, values, distributions, averages, showSavedOverlay, visualizationMode, filteredSetups, allSetups, setVisualizationMode, routingOutputs } = useAppContext();
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
    'sandbox': 'MODO ESPECULATIVO'
  };
  
  const geo = compact ? GEOMETRY.compact : GEOMETRY.desktop;
  const { cx, cy, bounds: boundaries } = geo;
  const startAngle = geo.start;
  const endAngle = geo.end;
  
  const modules = [
    { name: 'Módulo 3', startR: boundaries[0], endR: boundaries[1], tracks: 20 }, // mod3-1 to mod3-19
    { name: 'Módulo 2', startR: boundaries[1], endR: boundaries[2], tracks: 18 }, // mod2-1 to mod2-17
    { name: 'Módulo 1', startR: boundaries[2], endR: boundaries[3], tracks: 26 }, // mod1-1 to mod1-25
  ];

  // Preparación del enjambre colectivo:
  //  · rank: posición de cada persona en el índice de estrés de la muestra (0 = la más tranquila, 1 = la más cargada)
  //  · bins: para cada carril con respuestas acotadas, el ancho del "casillero" de cada respuesta posible.
  // Quienes dieron la misma respuesta se reparten dentro de su casillero según su índice: en vez de un bloque,
  // un degradé que va de relax a estrés. La respuesta sigue siendo legible (nadie sale de su casillero).
  const swarmPrep = useMemo(() => {
    // El ranking se calcula sobre TODA la población, no sobre la muestra filtrada: así quien tiene un índice bajo
    // cae a la izquierda de su respuesta tanto en el colectivo completo como en un recorte (si el ranking fuera
    // relativo a la muestra, cada recorte se estiraría al rango completo y desaparecería la diferencia entre grupos).
    const pop = allSetups || filteredSetups;
    const scored = pop.map((setup, idx) => ({ setup, s: stressIndex(setup) ?? 50, tie: (Math.sin(idx * 12.9898) + 1) / 2 }));
    scored.sort((a, b) => (a.s - b.s) || (a.tie - b.tie));
    const byDoc = new Map();
    scored.forEach((x, k) => byDoc.set(x.setup, scored.length > 1 ? k / (scored.length - 1) : 0.5));
    const rank = filteredSetups.map((setup) => byDoc.get(setup) ?? 0.5);

    const bins = {};
    Object.keys(dbMap).forEach((compId) => {
      if (!compId.startsWith('mod')) return;
      const seen = new Set();
      let min = 0; let max = 100;
      filteredSetups.forEach((s) => {
        const raw = s.values?.[dbMap[compId]];
        if (raw === undefined) return;
        const v = getVisualizableData(compId, raw, dbMetadata[compId]?.dataType);
        if (v.value === undefined || Number.isNaN(v.value)) return;
        seen.add(Math.round(v.value * 1000) / 1000);
        min = v.min; max = v.max;
      });
      const levels = [...seen].sort((a, b) => a - b);
      const span = (max - min) || 1;
      const widths = new Map();
      if (levels.length > 14) {
        // Respuesta casi continua: solo un leve corrimiento
        levels.forEach((lv) => widths.set(lv, [Math.max(min, lv - span * 0.015), Math.min(max, lv + span * 0.015)]));
      } else {
        levels.forEach((lv, k) => {
          const lo = k > 0 ? (lv + levels[k - 1]) / 2 : Math.max(min, lv - (levels.length > 1 ? (levels[1] - lv) / 2 : span * 0.12));
          const hi = k < levels.length - 1 ? (lv + levels[k + 1]) / 2 : Math.min(max, lv + (levels.length > 1 ? (lv - levels[k - 1]) / 2 : span * 0.12));
          // 90 % del casillero, centrado en la respuesta, para que se lea el corte entre respuestas
          const c = (lo + hi) / 2; const h = ((hi - lo) / 2) * 0.9;
          widths.set(lv, [c - h, c + h]);
        });
      }
      bins[compId] = widths;
    });
    return { rank, bins };
  }, [filteredSetups, allSetups]);

  const dots = useMemo(() => {
    const d = [];
    
    // Constraint angular para que los círculos no muerdan las líneas de límite
    // (Ej. dejamos 1.5 grados de margen en los extremos)
    const paddedStartAngle = startAngle + 1.5;
    const paddedEndAngle = endAngle - 1.5;
    // Escala de puntos según el tamaño de la muestra (1 con ~120 personas o más, hasta 2.4 con muy pocas)
    const sampleScale = Math.min(2.4, Math.max(1, Math.sqrt(120 / Math.max(1, filteredSetups.length))));

    modules.forEach((mod, i) => {
      const trackStep = (mod.endR - mod.startR) / mod.tracks;
      const modNumber = 3 - i; 
      
      for (let t = 1; t < mod.tracks; t++) {
        const r = mod.startR + t * trackStep;
        const compId = `mod${modNumber}-${t}`;
        const isInverted = directInvertedTracks.includes(compId);

        if (mode === 'individual') {
          // Solo los carriles que respondiste: una barra desde + relax hasta tu respuesta, con el punto al final
          const rawVal = values[compId];
          if (rawVal === undefined) continue;
          const visData = getVisualizableData(compId, rawVal, dbMetadata[compId]?.dataType);
          const percent = (visData.value - visData.min) / ((visData.max - visData.min) || 1);
          const targetAngle = paddedStartAngle + percent * (paddedEndAngle - paddedStartAngle);
          const isOff = booleanTracks.includes(compId) && visData.value < 50;
          d.push({
            id: `${compId}-single`, compId, r,
            angle: isMounted ? targetAngle : paddedStartAngle,
            trailFrom: paddedStartAngle,
            opacity: isOff ? 0.45 : 1,
            color: P.coral[500], size: 4, strokeColor: P.neutral[0],
          });

        } else if (mode === 'colectivo' || mode === 'sandbox') {
          
          
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

          filteredSetups.forEach((setup, idx) => {
            const rawVal = setup.values ? setup.values[dbMap[compId]] : undefined;
            if (rawVal === undefined) return;

            let visData = getVisualizableData(compId, rawVal, dbMetadata[compId]?.dataType);
            let processedVal = visData.value;
            
            let domainSpan = visData.max - visData.min;
            const answeredVal = processedVal;

            // Degradé por índice de estrés dentro del casillero de la respuesta
            const bin = swarmPrep.bins[compId]?.get(Math.round(processedVal * 1000) / 1000);
            if (bin) processedVal = bin[0] + (swarmPrep.rank[idx] ?? 0.5) * (bin[1] - bin[0]);

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
            
            const angleJitter = gaussX * 0.35 * ((endAngle - startAngle) / 68); // apenas: el orden lo da el índice
            const radialJitter = gaussY * (trackStep * 0.28); 
            
            const targetAngle = baseAngle + angleJitter;
            const currentAngle = isMounted ? targetAngle : paddedStartAngle;
            
            const rJitterScale = Math.abs(Math.sin(idx * 11.234));
            // Puntos chicos con la muestra completa; crecen cuando el panel de control la recorta
            const size = (0.4 + rJitterScale * 0.7) * sampleScale;
            
            const shade = Math.min(SWARM_COLORS.length - 1, Math.floor(((Math.sin(idx * 7.654) + 1) / 2) * SWARM_COLORS.length));
            const color = SWARM_COLORS[shade];

            const distFromCenter = Math.sqrt(gaussX*gaussX + gaussY*gaussY);
            // Opacidad ligeramente más sutil para compensar aglomeraciones
            let opacity = Math.min(0.9, Math.max(0.12, 0.55 - (distFromCenter * 0.15)) * sampleScale);

            if (answeredVal === 0 || answeredVal === 10) {
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
          d.push({ id: `${compId}-avg`, compId, r, angle: isMounted ? aAngle : paddedStartAngle, opacity: 1, color: P.coral[500], isAvg: true });
          
          if (showSavedOverlay) {
            const rawVal = values[compId];
            if (rawVal !== undefined) {
              const savedData = getVisualizableData(compId, rawVal, dbMetadata[compId]?.dataType);
              const savedPercent = (savedData.value - savedData.min) / ((savedData.max - savedData.min) || 1);
              let targetAngle = paddedStartAngle + savedPercent * (paddedEndAngle - paddedStartAngle);
              d.push({ 
                id: `${compId}-saved-overlay`, 
                compId, 
                r, 
                angle: isMounted ? targetAngle : paddedStartAngle, 
                opacity: 1, 
                size: 6,
                color: P.neutral[0], 
                strokeColor: P.coral[600],
                isSavedOverlay: true,
                isHovered: hoveredId === compId 
              });
            }
          }
        }
      }
    });
    return d;
  }, [mode, values, distributions, averages, filteredSetups, swarmPrep, isMounted, showSavedOverlay, startAngle, endAngle, boundaries]);

  // Lectura general del vúmetro (0 = + relax, 100 = + estrés): el promedio de todos sus carriles.
  //  · colectivo: promedio de cada carril sobre la muestra filtrada por el panel de control, y luego de los carriles
  //  · individual / especulativo: promedio de las respuestas cargadas en los controles
  // Es la misma escala que dibuja el abanico, así que la aguja apunta a donde caen, en promedio, los puntos.
  const meterReading = useMemo(() => {
    const trackIds = Object.keys(dbMap).filter((id) => id.startsWith('mod'));
    let total = 0; let count = 0;
    if (mode === 'colectivo') {
      trackIds.forEach((compId) => {
        const r = trackReading(compId, dbMap[compId], filteredSetups, dbMetadata[compId]?.dataType);
        if (r) { total += r.value; count += 1; }
      });
    } else {
      trackIds.forEach((compId) => {
        const p = stressPercent(compId, values[compId], dbMetadata[compId]?.dataType);
        if (p !== undefined) { total += p; count += 1; }
      });
    }
    return count ? total / count : null;
  }, [mode, filteredSetups, values]);

  const avgNeedleAngle = useMemo(() => {
    if (meterReading === null) return 0;
    const paddedStartAngle = startAngle + 1.5;
    const paddedEndAngle = endAngle - 1.5;
    return paddedStartAngle + (meterReading / 100) * (paddedEndAngle - paddedStartAngle);
  }, [meterReading, startAngle, endAngle]);

  const renderAlternativeVisualization = () => {
    // PREPARACIÓN DE ARQUITECTURA:
    // El DataVisualizer ahora consulta la metadata de las fuentes patcheadas 
    // para determinar qué visualizaciones son válidas.
    const source1Meta = (connections.out1 && routingOutputs.out1) ? dbMetadata[routingOutputs.out1] : null;
    const source2Meta = (connections.out2 && routingOutputs.out2) ? dbMetadata[routingOutputs.out2] : null;

    let isCompatible = true;
    if (source1Meta && !source1Meta.visualizations.includes(visualizationMode)) isCompatible = false;
    if (source2Meta && !source2Meta.visualizations.includes(visualizationMode)) isCompatible = false;

    const hasSource1 = connections.out1 && source1Meta;
    const hasSource2 = connections.out2 && source2Meta;
    
    // Logic for Relation XY
    const isRelation = visualizationMode === 'relation';
    const canPlotRelation = hasSource1 && hasSource2 && isCompatible;

    // Logic for Spectrum Analyzer (Distribution)
    const isSpectrum = visualizationMode === 'spectrum';
    const isAssociation = visualizationMode === 'association';
    const canPlotSpectrum = hasSource1 && source1Meta.visualizations.includes('spectrum');

    return (
      <div className="absolute inset-0 pt-[84px] px-[12px] pb-[68px]">
        <div className="relative w-full h-full rounded-lg bg-background-sunken overflow-hidden shadow-inset-control">
          <div className="absolute inset-0 flex flex-col">
            {isRelation ? (
              <RelationXY out1Id={routingOutputs.out1} out2Id={routingOutputs.out2} out1Meta={source1Meta} out2Meta={source2Meta} hasSource1={hasSource1} hasSource2={hasSource2} isCompatible={isCompatible} />
            ) : isAssociation ? (
              <Association dbMetadata={dbMetadata} dbMap={dbMap} routingOutputs={{ out1: connections.out1 ? routingOutputs.out1 : null, out2: connections.out2 ? routingOutputs.out2 : null }} filteredSetups={filteredSetups} />
            ) : isSpectrum ? (
              canPlotSpectrum ? (
                <SpectrumAnalyzer outId={routingOutputs.out1} outMeta={source1Meta} colorHex={CHANNEL_1.hex} />
              ) : (
                <div className="m-auto flex flex-col items-center gap-space-8 rounded-lg border border-dashed border-border-default px-space-48 py-space-32 text-center">
                  <span className="type-label-m uppercase tracking-widest text-text-muted">
                    {!hasSource1 ? 'Esperando señal en la entrada 1' : 'Datos incompatibles con distribución'}
                  </span>
                  <span className="type-caption text-text-disabled">Conectá un cable desde una variable compatible a la entrada 1.</span>
                </div>
              )
            ) : (
              <div className="m-auto flex flex-col items-center gap-space-8 text-text-disabled">
                <span className="type-label-m uppercase tracking-widest">En preparación</span>
                <span className="type-caption">La visualización «{visualizationMode}» todavía no está disponible.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const visTabs = [
    { id: 'general', label: 'General' },
    { id: 'spectrum', label: 'Espectro' },
    { id: 'relation', label: 'Relación' },
    { id: 'association', label: 'Asociación' },
  ];
  const inputMeta1 = (connections.out1 && routingOutputs.out1) ? dbMetadata[routingOutputs.out1] : null;
  const inputMeta2 = (connections.out2 && routingOutputs.out2) ? dbMetadata[routingOutputs.out2] : null;
  const inputRows = [
    { channel: CHANNEL_1, meta: inputMeta1 },
    { channel: CHANNEL_2, meta: inputMeta2 },
  ];

  return (
    <div className={`w-full h-full relative overflow-hidden flex justify-center ${compact ? 'items-center' : 'items-end bg-background-base rounded-xl shadow-elevation-02'}`}>

      {!compact && (
        <>
        {/* 1. MODO INDICADOR Y MENÚ DE VISUALIZACIÓN (centrado en el espacio libre a la derecha del panel de variable) */}
        <div className="absolute top-4 left-[316px] right-[104px] z-20 flex flex-col items-center gap-space-8">
          <div className="font-heading font-bold text-[14px] leading-[18px] tracking-label uppercase text-text-secondary">
            {modeLabels[mode]}
          </div>

          {mode === 'colectivo' && (
            <div role="tablist" className="flex items-center gap-space-4 rounded-pill bg-background-sunken p-[3px] shadow-inset-control">
              {visTabs.map(tab => {
                const active = visualizationMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setVisualizationMode(tab.id)}
                    className={`h-[24px] px-space-12 rounded-pill type-label-s cursor-pointer transition-[background-color,color,box-shadow] duration-standard focus-visible:outline-none focus-visible:shadow-focus-soft ${
                      active ? 'bg-coral-400 text-text-primary shadow-elevation-01' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>


          {/* LOGO (arriba a la derecha) */}
          <div className="absolute top-4 right-4 z-20">
            <Logo height={36} />
          </div>
        </>
      )}

      {!compact && visualizationMode !== 'general' && mode === 'colectivo' ? (
        renderAlternativeVisualization()
      ) : (
        <>
          {/* 2. EXTREMOS DEL VÚMETRO */}
          {compact ? (
            <div className="absolute inset-x-1 bottom-0 z-10 flex items-end justify-between font-heading font-bold text-[12px] uppercase tracking-label text-text-secondary pointer-events-none">
              <span>+ Relax</span>
              {hint && <span className="type-caption normal-case tracking-normal font-body font-normal text-text-muted text-center">{hint}</span>}
              <span>+ Estrés</span>
            </div>
          ) : (
            <>

              {/* 3. PANEL DE VARIABLE */}
              <div className="absolute left-[7px] top-[16px] z-10 pointer-events-none">
                <VariablePanel compId={hoveredId} />
              </div>
            </>
          )}

          <svg ref={vumeterRef} {...(compact ? { className: 'w-full max-h-full overflow-visible' } : { width: '100%', height: '100%', className: 'overflow-visible' })} viewBox={geo.viewBox} preserveAspectRatio={geo.align}>
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
                       stroke={isHovered ? P.coral[500] : P.neutral[300]} 
                       strokeWidth={isHovered ? "2.5" : "1"} 
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
          <path key={`bound-${i}`} d={describeArc(cx, cy, r, startAngle, endAngle)} fill="none" stroke={P.neutral[700]} strokeWidth="2.5" pointerEvents="none" />
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
              <line x1={leftStart.x} y1={leftStart.y} x2={leftEnd.x} y2={leftEnd.y} stroke={P.neutral[700]} strokeWidth="2.5" pointerEvents="none" />
              <line x1={rightStart.x} y1={rightStart.y} x2={rightEnd.x} y2={rightEnd.y} stroke={P.neutral[700]} strokeWidth="2.5" pointerEvents="none" />
            </>
          );
        })()}

        {/* Data Dots */}

        {/* CSS DINAMICO PARA HOVER SIN RE-RENDERIZAR NODOS */}
        

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
              fill={P.neutral[500]}
              fontSize="10"
              fontFamily='"JetBrains Mono", monospace'
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
          <line x1={cx} y1={compact ? cy - boundaries[0] : cy} x2={cx} y2={cy - boundaries[3]} stroke={P.neutral[600]} strokeWidth="4" strokeLinecap="round" opacity={mode === 'colectivo' ? 0.55 : 1} />
        </g>

        {/* Lectura de la aguja: índice general 0–100 de la muestra (o de tus respuestas) */}
        {meterReading !== null && (() => {
          const tip = polarToCartesian(cx, cy, boundaries[0] - (compact ? 14 : 30), avgNeedleAngle);
          const w = compact ? 34 : 44; const h = compact ? 18 : 22;
          return (
            <g style={{ transform: `translate(${tip.x}px, ${tip.y}px)` }} className="transition-transform duration-1000 ease-out pointer-events-none">
              <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={P.neutral[900]} />
              <text y={compact ? 4 : 5} textAnchor="middle" fill={P.neutral[50]} fontFamily='"JetBrains Mono", monospace' fontSize={compact ? 11 : 13} fontWeight="500">
                {Math.round(meterReading)}
              </text>
            </g>
          );
        })()}
        
        {/* Extremos del vúmetro: por encima de las esquinas del arco (en coordenadas del SVG, así nunca se superponen) */}
        {!compact && (() => {
          const L = polarToCartesian(cx, cy, boundaries[3], startAngle);
          const R = polarToCartesian(cx, cy, boundaries[3], endAngle);
          const common = { fill: P.neutral[700], fontFamily: 'Satori, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 0.4, className: 'pointer-events-none select-none' };
          return (
            <>
              <text x={L.x - 6} y={L.y - 36} textAnchor="start" {...common}>+ RELAX</text>
              <text x={R.x + 6} y={R.y - 36} textAnchor="end" {...common}>+ ESTRÉS</text>
            </>
          );
        })()}

        {/* Center Pivot Point Cover (Offscreen) */}
        {!compact && <circle cx={cx} cy={cy} r="16" fill={P.neutral[800]} stroke={P.neutral[900]} strokeWidth="4" />}
      </svg>

          {/* Puntos de datos: capa encima del SVG (sobre la aguja, así los de modo individual no quedan tapados) */}
          <SwarmCanvas dots={dots} cx={cx} cy={cy} mode={mode} hoveredId={hoveredId} svgRef={vumeterRef} viewBox={geo.viewBox} align={geo.align} />
        </>
      )}

      {!compact && (
        <>
        {/* 4. ENTRADAS DE CABLE (abajo a la izquierda) */}
        <div className="absolute left-[11px] bottom-[12px] z-30 flex items-end gap-space-12">
          <OutputPanel
            title="Entradas"
            jacks={[
              { id: 'vis-in-1', type: 'input', activeColor: connections.out1 ? 'blue-500' : null },
              // Espectro muestra una sola variable: la segunda entrada queda deshabilitada (50 %)
              { id: 'vis-in-2', type: 'input', activeColor: connections.out2 ? 'orange-500' : null, disabled: visualizationMode === 'spectrum' },
            ]}
          />
          <div className="flex flex-col gap-space-4 pb-[2px] pointer-events-none">
            {inputRows.map(({ channel, meta }, i) => (
              <div key={channel.key} className={`flex items-center gap-space-6 ${i === 1 && visualizationMode === 'spectrum' ? 'opacity-50' : ''}`}>
                <span className="w-[6px] h-[6px] rounded-pill shrink-0" style={{ backgroundColor: meta ? channel.hex : 'var(--neutral-300)' }} />
                <span className={`type-micro max-w-[170px] truncate ${meta ? 'text-text-secondary' : 'text-text-disabled'}`}>
                  {i + 1} · {meta ? meta.label : (i === 1 && visualizationMode === 'spectrum' ? 'No se usa en Espectro' : 'Vacío')}
                </span>
              </div>
            ))}
          </div>
        </div>
        </>
      )}
    </div>
  );
}



