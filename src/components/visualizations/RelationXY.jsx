import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';

const RelationXY = ({ out1Id, out2Id, out1Meta, out2Meta }) => {
  const { allSetups, values, averages, mode } = useAppContext();

  // 1. Extraer pares de valores X / Y
  const rawPairs = useMemo(() => {
    const pts = [];
    if (mode === 'colectivo' && allSetups && allSetups.length > 0) {
      allSetups.forEach(setup => {
        const v1 = setup[out1Id];
        const v2 = setup[out2Id];
        if (v1 !== undefined && v2 !== undefined) {
          pts.push({ x: v1, y: v2 });
        }
      });
    } else if (mode === 'individual' && values[out1Id] !== undefined && values[out2Id] !== undefined) {
      pts.push({ x: values[out1Id], y: values[out2Id] });
    } else if (averages[out1Id] !== undefined && averages[out2Id] !== undefined) {
      pts.push({ x: averages[out1Id], y: averages[out2Id] });
    }
    return pts;
  }, [allSetups, values, averages, mode, out1Id, out2Id]);

  // 2. Determinar rangos de normalización
  const { minX, maxX, minY, maxY } = useMemo(() => {
    let minX = 0, maxX = 100;
    let minY = 0, maxY = 100;

    if (out1Meta.dataType === 'numeric' && rawPairs.length > 0) {
      minX = Math.min(...rawPairs.map(p => p.x));
      maxX = Math.max(...rawPairs.map(p => p.x));
      if (minX === maxX) { minX -= 1; maxX += 1; }
    }

    if (out2Meta.dataType === 'numeric' && rawPairs.length > 0) {
      minY = Math.min(...rawPairs.map(p => p.y));
      maxY = Math.max(...rawPairs.map(p => p.y));
      if (minY === maxY) { minY -= 1; maxY += 1; }
    }

    return { minX, maxX, minY, maxY };
  }, [rawPairs, out1Meta.dataType, out2Meta.dataType]);

  // 3. Normalizar puntos (0 a 1)
  const normalizedPairs = useMemo(() => {
    return rawPairs.map(p => ({
      x: (p.x - minX) / (maxX - minX),
      y: (p.y - minY) / (maxY - minY)
    }));
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
      
      {/* Indicadores de Ejes */}
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
              className="fill-white mix-blend-screen opacity-80"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default RelationXY;
