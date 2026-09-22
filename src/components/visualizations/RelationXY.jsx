import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { dbMap, dbMetadata } from '../../dbMap';
import { getVisualizableData } from '../../dataTransforms';

const RelationXY = ({ out1Id, out2Id, out1Meta, out2Meta }) => {
  const { allSetups, values, averages, mode } = useAppContext();

  // 1. Extraer pares de valores X / Y
  const rawPairs = useMemo(() => {
    const pts = [];
    if (mode === 'colectivo' && allSetups && allSetups.length > 0) {
      allSetups.forEach(setup => {
        const vals = setup.values || setup;
        let v1 = vals[dbMap[out1Id]];
        let v2 = vals[dbMap[out2Id]];
        if (v1 !== undefined && v2 !== undefined) {
          let vis1 = getVisualizableData(out1Id, v1, out1Meta.dataType);
          let vis2 = getVisualizableData(out2Id, v2, out2Meta.dataType);
          pts.push({ x: vis1.value, y: vis2.value });
        }
      });
    } else if (mode === 'individual' && values[out1Id] !== undefined && values[out2Id] !== undefined) {
      let vis1 = getVisualizableData(out1Id, values[out1Id], out1Meta.dataType);
      let vis2 = getVisualizableData(out2Id, values[out2Id], out2Meta.dataType);
      pts.push({ x: vis1.value, y: vis2.value });
    } else if (averages[out1Id] !== undefined && averages[out2Id] !== undefined) {
      let vis1 = getVisualizableData(out1Id, averages[out1Id], out1Meta.dataType);
      let vis2 = getVisualizableData(out2Id, averages[out2Id], out2Meta.dataType);
      pts.push({ x: vis1.value, y: vis2.value });
    }
    return pts;
  }, [allSetups, values, averages, mode, out1Id, out2Id]);

  // 2. Determinar rangos de normalización
  const { minX, maxX, minY, maxY } = useMemo(() => {
    let minX = 0, maxX = 100;
    let minY = 0, maxY = 100;

    // Get semantic domains
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
  }, [rawPairs, out1Meta.dataType, out2Meta.dataType]);

  // 3. Normalizar puntos (0 a 1) y agregar Jitter
  const normalizedPairs = useMemo(() => {
    return rawPairs.map((p, i) => {
      // Jitter pseudo-aleatorio basado en el índice para separar puntos idénticos
      // Rango de -0.015 a +0.015 (aprox 1.5% de la pantalla)
      const jitterX = (Math.sin(i * 13.54) * 0.03) - 0.015;
      const jitterY = (Math.cos(i * 21.43) * 0.03) - 0.015;

      let normX = (p.x - minX) / (maxX - minX);
      let normY = (p.y - minY) / (maxY - minY);

      // Prevenir que el jitter los empuje fuera del SVG
      normX = Math.max(0, Math.min(1, normX + jitterX));
      normY = Math.max(0, Math.min(1, normY + jitterY));

      return { x: normX, y: normY };
    });
  }, [rawPairs, minX, maxX, minY, maxY]);

  // Si no hay datos compatibles
  if (normalizedPairs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#333] rounded-xl">
        <span className="text-[#555] uppercase tracking-widest font-bold text-sm">SIN DATOS PARA GRAFICAR</span>
      </div>
    );
  }

  // 4. Dibujar SVG
  return (
    <div className="w-full flex-1 flex flex-col relative bg-[#0a0a0a] rounded-xl border border-[#222] p-8 overflow-hidden">
      
      <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[#f97316] text-xs font-bold uppercase tracking-widest whitespace-nowrap">
        EJE Y: {out2Meta.label}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#3b82f6] text-xs font-bold uppercase tracking-widest whitespace-nowrap">
        EJE X: {out1Meta.label}
      </div>

      <div className="w-full h-full relative pl-8 pb-8">
        <svg className="w-full h-full overflow-visible">
          {/* Grilla / Ejes de referencia */}
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.3" />
          <line x1="0" y1="0" x2="0" y2="100%" stroke="#f97316" strokeWidth="2" strokeOpacity="0.3" />

          {/* Puntos (X va de 0 a 100%, Y va de 100% a 0 para que 0 esté abajo) */}
          {normalizedPairs.map((p, i) => (
            <circle
              key={i}
              cx={`${p.x * 100}%`}
              cy={`${(1 - p.y) * 100}%`}
              r="4"
              className="fill-white mix-blend-screen opacity-40"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))'
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default RelationXY;
