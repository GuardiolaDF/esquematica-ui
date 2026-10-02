import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { dbMap } from '../../dbMap';
import { getVisualizableData } from '../../dataTransforms';
import LissajousCanvas from './LissajousCanvas';
import { CHANNEL_1, CHANNEL_2 } from '../../design/channels';

const PADDING_X = 50;
const PADDING_Y = 40;

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

  // 1. Extraer pares de valores X / Y reales
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

  // 2. Determinar rangos estrictos basados en metadata (min y max) y evitar negativos
  const { minX, maxX, minY, maxY } = useMemo(() => {
    // Valores por defecto
    let minX = 0, maxX = 100;
    let minY = 0, maxY = 100;

    if (!out1Meta || !out2Meta) return { minX, maxX, minY, maxY };

    let v1Sample = getVisualizableData(out1Id, 50, out1Meta.dataType);
    let v2Sample = getVisualizableData(out2Id, 50, out2Meta.dataType);
    
    // Siempre asumimos que el límite inferior es al menos 0 (NO valores negativos)
    minX = Math.max(0, v1Sample.min || 0);
    maxX = v1Sample.max || 100;
    minY = Math.max(0, v2Sample.min || 0);
    maxY = v2Sample.max || 100;

    // Si los datos sobrepasan el máximo esperado, lo extendemos
    if (out1Meta.dataType === 'numeric' && rawPairs.length > 0) {
      const pMaxX = Math.max(...rawPairs.map(p => p.x));
      if (pMaxX > maxX) maxX = pMaxX;
    }

    if (out2Meta.dataType === 'numeric' && rawPairs.length > 0) {
      const pMaxY = Math.max(...rawPairs.map(p => p.y));
      if (pMaxY > maxY) maxY = pMaxY;
    }

    // Prevención de división por cero
    if (minX === maxX) maxX = minX + 1;
    if (minY === maxY) maxY = minY + 1;

    return { minX, maxX, minY, maxY };
  }, [rawPairs, out1Meta, out2Meta, out1Id, out2Id]);

  // 3. Normalizar puntos (0 a 1) e inyectar un JITTER orgánico, controladísimo y determinista.
  const normalizedPairs = useMemo(() => {
    return rawPairs.map((p, i) => {
      let normX = (p.x - minX) / (maxX - minX);
      let normY = (p.y - minY) / (maxY - minY);

      // Jitter determinista (depende del index i de la persona)
      // Dispersión máxima del 4% del gráfico (suficiente para esparcir sin cruzar al siguiente tick)
      const jitterAmount = 0.04;
      const jitterX = (Math.sin(i * 13.54) * jitterAmount);
      const jitterY = (Math.cos(i * 21.43) * jitterAmount);

      // Limitar para que los puntos dispersos no se salgan nunca del 0 a 1
      normX = Math.max(0, Math.min(1, normX + jitterX));
      normY = Math.max(0, Math.min(1, normY + jitterY));

      return { x: normX, y: normY };
    });
  }, [rawPairs, minX, maxX, minY, maxY]);

  // Genera pasos de ticks para la grilla (ej. 0 1 2 3 4 5)
  const getTicks = (min, max) => {
    const ticks = [];
    const span = max - min;
    let steps = span <= 10 ? span : 5; // Si el rango es pequeño (0 a 5), marcamos todos. Si es grande (0 a 100), marcamos 5.
    if (steps <= 0) steps = 1;

    for (let i = 0; i <= steps; i++) {
      const val = min + (i / steps) * span;
      ticks.push({ 
        percent: i / steps, 
        label: Number.isInteger(val) ? val.toString() : val.toFixed(1)
      });
    }
    return ticks;
  };

  // Renderiza la grilla cartesiana pura con inicio en 0,0 inferior izquierdo
  const renderCartesianGrid = () => {
    if (dimensions.width === 0 || dimensions.height === 0) return null;

    const xTicks = getTicks(minX, maxX);
    const yTicks = getTicks(minY, maxY);

    // Área útil donde dibuja LissajousCanvas
    const plotWidth = dimensions.width - (PADDING_X * 2);
    const plotHeight = dimensions.height - (PADDING_Y * 2);
    const originX = PADDING_X;
    const originY = dimensions.height - PADDING_Y;

    return (
      <svg className="w-full h-full absolute inset-0 pointer-events-none">
        {/* Fondo tenue opcional, sin cruces extrañas */}
        <defs>
          <linearGradient id="grid-fade" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#C2BCAF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C2BCAF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect 
          x={PADDING_X} 
          y={PADDING_Y} 
          width={plotWidth} 
          height={plotHeight} 
          fill="url(#grid-fade)" 
        />

        {/* Retícula: Líneas X */}
        {xTicks.map(t => {
          const xPos = originX + (t.percent * plotWidth);
          return (
            <g key={`x-${t.label}`}>
              <line 
                x1={xPos} y1={PADDING_Y} 
                x2={xPos} y2={originY} 
                stroke="#DDD9CE" strokeWidth="1" strokeDasharray="4 4" 
              />
              <line 
                x1={xPos} y1={originY} 
                x2={xPos} y2={originY + 5} 
                stroke="#A89F90" strokeWidth="2" 
              />
              <text 
                x={xPos} y={originY + 16} 
                fill="#8A8177" fontSize="9" fontFamily='"JetBrains Mono", monospace' textAnchor="middle"
              >
                {t.label}
              </text>
            </g>
          );
        })}

        {/* Retícula: Líneas Y */}
        {yTicks.map(t => {
          const yPos = originY - (t.percent * plotHeight);
          return (
            <g key={`y-${t.label}`}>
              <line 
                x1={originX} y1={yPos} 
                x2={originX + plotWidth} y2={yPos} 
                stroke="#DDD9CE" strokeWidth="1" strokeDasharray="4 4" 
              />
              <line 
                x1={originX - 5} y1={yPos} 
                x2={originX} y2={yPos} 
                stroke="#A89F90" strokeWidth="2" 
              />
              <text 
                x={originX - 10} y={yPos + 3} 
                fill="#8A8177" fontSize="9" fontFamily='"JetBrains Mono", monospace' textAnchor="end"
              >
                {t.label}
              </text>
            </g>
          );
        })}

        {/* Ejes principales (L inferior izquierda) */}
        <line x1={originX} y1={PADDING_Y} x2={originX} y2={originY} stroke="#8A8177" strokeWidth="2" />
        <line x1={originX} y1={originY} x2={originX + plotWidth} y2={originY} stroke="#8A8177" strokeWidth="2" />
      </svg>
    );
  };

  const isWaiting = !hasSource1 || !hasSource2 || !isCompatible || normalizedPairs.length === 0;

  return (
    <div className="w-full flex-1 flex flex-col relative overflow-hidden">
      
      {/* Explicación concisa secundaria (Top Right) */}
      <div className="absolute right-4 top-4 type-caption text-text-disabled z-20 pointer-events-none text-right">
        Compara dos variables para observar<br/>cómo se relacionan entre sí.
      </div>

      {/* Etiqueta EJE Y (NARANJA) */}
      <div className="absolute left-10 top-3 type-label-s uppercase tracking-widest z-20 flex items-center gap-2" style={{ color: CHANNEL_2.ink }}>
        <div className="w-2 h-2 rounded-pill" style={{ backgroundColor: CHANNEL_2.hex }}></div>
        {hasSource2 ? `OUT 2 · ${out2Meta?.label || '—'}` : 'OUT 2 · esperando'}
      </div>
      
      {/* Etiqueta EJE X (AZUL) */}
      <div className="absolute right-6 bottom-3 type-label-s uppercase tracking-widest z-20 flex items-center justify-end gap-2 text-right" style={{ color: CHANNEL_1.ink }}>
        {hasSource1 ? `OUT 1 · ${out1Meta?.label || '—'}` : 'OUT 1 · esperando'}
        <div className="w-2 h-2 rounded-pill" style={{ backgroundColor: CHANNEL_1.hex }}></div>
      </div>

      {/* Contenedor Gráfico */}
      <div ref={containerRef} className="w-full h-full relative">
        {!isWaiting && renderCartesianGrid()}

        {isWaiting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center type-label-m uppercase tracking-widest text-text-disabled pointer-events-none">
            {!isCompatible && hasSource1 && hasSource2 
              ? 'Formatos incompatibles' 
              : hasSource1 && !hasSource2 
                ? 'Esperando señal en la entrada 2 (eje Y)…'
                : !hasSource1 && hasSource2
                  ? 'Esperando señal en la entrada 1 (eje X)…'
                  : 'Esperando señal en las entradas 1 y 2…'}
          </div>
        ) : (
          dimensions.width > 0 && dimensions.height > 0 && (
            <LissajousCanvas 
              points={normalizedPairs} 
              width={dimensions.width} 
              height={dimensions.height} 
              paddingX={PADDING_X}
              paddingY={PADDING_Y}
            />
          )
        )}
      </div>
    </div>
  );
};

export default RelationXY;
