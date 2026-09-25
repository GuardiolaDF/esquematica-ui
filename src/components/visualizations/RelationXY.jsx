import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { dbMap } from '../../dbMap';
import { getVisualizableData } from '../../dataTransforms';
import LissajousCanvas from './LissajousCanvas';

const RelationXY = ({ out1Id, out2Id, out1Meta, out2Meta, hasSource1, hasSource2, isCompatible }) => {
  const { allSetups, values, averages, mode } = useAppContext();
  
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  // 1. Extraer pares de valores X / Y
  const rawPairs = useMemo(() => {
    if (!hasSource1 || !hasSource2 || !isCompatible) return [];
    
    const pts = [];
    if (mode === 'colectivo' && allSetups && allSetups.length > 0) {
      allSetups.forEach(setup => {
        const vals = setup.values || setup;
        let v1 = vals[dbMap[out1Id]];
        let v2 = vals[dbMap[out2Id]];
        if (v1 !== undefined && v2 !== undefined && v1 !== null && v2 !== null) {
          let vis1 = getVisualizableData(out1Id, v1, out1Meta?.dataType);
          let vis2 = getVisualizableData(out2Id, v2, out2Meta?.dataType);
          pts.push({ x: vis1.value, y: vis2.value });
        }
      });
    } else if (mode === 'individual' && values[out1Id] !== undefined && values[out2Id] !== undefined) {
      let vis1 = getVisualizableData(out1Id, values[out1Id], out1Meta?.dataType);
      let vis2 = getVisualizableData(out2Id, values[out2Id], out2Meta?.dataType);
      pts.push({ x: vis1.value, y: vis2.value });
    } else if (averages[out1Id] !== undefined && averages[out2Id] !== undefined) {
      let vis1 = getVisualizableData(out1Id, averages[out1Id], out1Meta?.dataType);
      let vis2 = getVisualizableData(out2Id, averages[out2Id], out2Meta?.dataType);
      pts.push({ x: vis1.value, y: vis2.value });
    }
    return pts;
  }, [allSetups, values, averages, mode, out1Id, out2Id, hasSource1, hasSource2, isCompatible, out1Meta, out2Meta]);

  // 2. Determinar rangos de normalización
  const { minX, maxX, minY, maxY } = useMemo(() => {
    let minX = 0, maxX = 100;
    let minY = 0, maxY = 100;

    if (!out1Meta || !out2Meta) return { minX, maxX, minY, maxY };

    let v1Sample = getVisualizableData(out1Id, 50, out1Meta.dataType);
    let v2Sample = getVisualizableData(out2Id, 50, out2Meta.dataType);
    
    minX = v1Sample.min;
    maxX = v1Sample.max;
    minY = v2Sample.min;
    maxY = v2Sample.max;

    if (out1Meta.dataType === 'numeric' && rawPairs.length > 0) {
      const pMinX = Math.min(...rawPairs.map(p => p.x));
      const pMaxX = Math.max(...rawPairs.map(p => p.x));
      if (pMinX < minX) minX = pMinX;
      if (pMaxX > maxX) maxX = pMaxX;
      if (minX === maxX) { minX -= 1; maxX += 1; }
    }

    if (out2Meta.dataType === 'numeric' && rawPairs.length > 0) {
      const pMinY = Math.min(...rawPairs.map(p => p.y));
      const pMaxY = Math.max(...rawPairs.map(p => p.y));
      if (pMinY < minY) minY = pMinY;
      if (pMaxY > maxY) maxY = pMaxY;
      if (minY === maxY) { minY -= 1; maxY += 1; }
    }

    return { minX, maxX, minY, maxY };
  }, [rawPairs, out1Meta, out2Meta, out1Id, out2Id]);

  // 3. Normalizar puntos (0 a 1) estrictamente
  const normalizedPairs = useMemo(() => {
    return rawPairs.map((p) => {
      let normX = (maxX - minX) === 0 ? 0.5 : (p.x - minX) / (maxX - minX);
      let normY = (maxY - minY) === 0 ? 0.5 : (p.y - minY) / (maxY - minY);

      normX = Math.max(0, Math.min(1, normX));
      normY = Math.max(0, Math.min(1, normY));

      return { x: normX, y: normY };
    });
  }, [rawPairs, minX, maxX, minY, maxY]);

  // Grilla estilo osciloscopio
  const renderOscilloscopeGrid = () => {
    // Líneas secundarias sutiles
    const ticks = [0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9];
    return (
      <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-50">
        <defs>
          <radialGradient id="screen-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Soft background glow */}
        <rect width="100%" height="100%" fill="url(#screen-glow)" />

        {/* Ejes centrales (Cruz) */}
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />

        {/* Ticks finos en los ejes centrales */}
        {ticks.map(t => (
          <React.Fragment key={t}>
            <line x1="49%" y1={`${t * 100}%`} x2="51%" y2={`${t * 100}%`} stroke="#334155" strokeWidth="1" />
            <line x1={`${t * 100}%`} y1="49%" x2={`${t * 100}%`} y2="51%" stroke="#334155" strokeWidth="1" />
          </React.Fragment>
        ))}

        {/* Círculos polares sutiles típicos de algunos instrumentos */}
        <circle cx="50%" cy="50%" r="25%" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 4" opacity="0.5"/>
        <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 4" opacity="0.5"/>
      </svg>
    );
  };

  const isWaiting = !hasSource1 || !hasSource2 || !isCompatible || normalizedPairs.length === 0;

  return (
    <div className="w-full flex-1 flex flex-col relative bg-[#050505] rounded-xl border border-[#111] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
      
      {/* Etiqueta EJE Y (NARANJA) */}
      <div className="absolute left-4 top-4 text-[#f97316] text-[10px] font-mono font-bold uppercase tracking-widest z-20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_5px_#f97316]"></div>
        {hasSource2 ? `CH2 [Y]: ${out2Meta?.label || 'UNKNOWN'}` : 'CH2 [Y]: WAITING...'}
      </div>
      
      {/* Etiqueta EJE X (AZUL) */}
      <div className="absolute right-4 bottom-4 text-[#3b82f6] text-[10px] font-mono font-bold uppercase tracking-widest z-20 flex items-center gap-2">
        {hasSource1 ? `CH1 [X]: ${out1Meta?.label || 'UNKNOWN'}` : 'CH1 [X]: WAITING...'}
        <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_5px_#3b82f6]"></div>
      </div>

      {/* Trazador central */}
      <div ref={containerRef} className="w-full h-full relative">
        {renderOscilloscopeGrid()}

        {isWaiting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#333] font-mono text-[10px] tracking-[0.3em] pointer-events-none">
            {!isCompatible && hasSource1 && hasSource2 
              ? 'NO SYNC - INCOMPATIBLE FORMATS' 
              : hasSource1 && !hasSource2 
                ? 'WAITING FOR CH2 [Y] SIGNAL...'
                : !hasSource1 && hasSource2
                  ? 'WAITING FOR CH1 [X] SIGNAL...'
                  : 'AWAITING CH1 & CH2 SIGNALS'}
          </div>
        ) : (
          dimensions.width > 0 && dimensions.height > 0 && (
            <LissajousCanvas points={normalizedPairs} width={dimensions.width} height={dimensions.height} />
          )
        )}
      </div>
    </div>
  );
};

export default RelationXY;
