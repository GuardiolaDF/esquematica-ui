import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { dbMap } from '../../dbMap';

const SpectrumAnalyzer = ({ outId, outMeta, colorHex = "#3b82f6" }) => {
  const { allSetups, values, averages, mode } = useAppContext();

  // 1. Extraer todos los valores válidos para esta variable
  const rawValues = useMemo(() => {
    const valsArray = [];
    if (mode === 'colectivo' && allSetups && allSetups.length > 0) {
      allSetups.forEach(setup => {
        const vals = setup.values || setup;
        let v = vals[dbMap[outId]];
        if (v !== undefined) {
          if (typeof v === 'boolean') v = v ? 100 : 0;
          valsArray.push(v);
        }
      });
    } else if (mode === 'individual' && values[outId] !== undefined) {
      valsArray.push(typeof values[outId] === 'boolean' ? (values[outId] ? 100 : 0) : values[outId]);
    } else if (averages[outId] !== undefined) {
      valsArray.push(averages[outId]);
    }
    return valsArray;
  }, [allSetups, values, averages, mode, outId]);

  // 2. Definir bandas y generar histograma
  const binsCount = 16;
  const { normalizedBins, totalValues, maxBinCount } = useMemo(() => {
    const bins = new Array(binsCount).fill(0);
    
    if (rawValues.length === 0) {
      return { normalizedBins: bins, totalValues: 0, maxBinCount: 0 };
    }

    // Determinar min y max absoluto para el rango.
    // Si es "scale" o booleano asumimos 0-100 para que el espectro sea consistente.
    // Si es numérico libre, buscamos el max y min reales.
    let minVal = 0;
    let maxVal = 100;

    if (outMeta.dataType === 'numeric') {
      minVal = Math.min(...rawValues);
      maxVal = Math.max(...rawValues);
      if (minVal === maxVal) { minVal -= 1; maxVal += 1; }
    }

    const range = maxVal - minVal;

    // Distribuir valores en los bins
    rawValues.forEach(val => {
      // Clampear valor por las dudas
      const clampedVal = Math.max(minVal, Math.min(maxVal, val));
      let index = Math.floor(((clampedVal - minVal) / range) * binsCount);
      if (index >= binsCount) index = binsCount - 1; // caso extremo == maxVal
      bins[index]++;
    });

    const maxBinCount = Math.max(...bins, 1);
    const normalized = bins.map(b => b / maxBinCount);

    return { normalizedBins: normalized, totalValues: rawValues.length, maxBinCount };
  }, [rawValues, outMeta.dataType]);

  if (totalValues === 0) {
    return (
      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#333] rounded-xl">
        <span className="text-[#555] uppercase tracking-widest font-bold text-sm">SIN DATOS PARA GRAFICAR</span>
      </div>
    );
  }

  // 3. Dibujar Espectro
  return (
    <div className="w-full flex-1 flex flex-col relative bg-[#0a0a0a] rounded-xl border border-[#222] p-8 overflow-hidden">
      
      <div className="absolute left-4 top-4 text-[#666] text-xs font-bold uppercase tracking-widest">
        SPECTRUM: <span style={{ color: colorHex }}>{outMeta.label}</span>
      </div>

      <div className="absolute right-4 top-4 text-[#444] text-[10px] font-bold uppercase tracking-widest text-right">
        N = {totalValues} <br/>
        PEAK = {maxBinCount}
      </div>

      <div className="w-full h-full relative mt-6">
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Grilla de fondo sutil */}
          <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#222" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#222" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#222" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke={colorHex} strokeWidth="2" strokeOpacity="0.4" />

          {/* Barras del Espectro */}
          {normalizedBins.map((h, i) => {
            const barWidth = 100 / binsCount; // %
            const gap = 1.5; // %
            const actualWidth = barWidth - gap;
            
            // Para darle un toque más de analizador, podemos dibujar las barras compuestas por cuadraditos o sólidas.
            // Aquí las hacemos sólidas con un gradiente/transparencia.
            return (
              <g key={i} className="transition-all duration-300">
                <rect
                  x={`${(i * barWidth) + (gap/2)}%`}
                  y={`${(1 - h) * 100}%`}
                  width={`${actualWidth}%`}
                  height={`${h * 100}%`}
                  fill={colorHex}
                  className="opacity-80 mix-blend-screen"
                  style={{
                    filter: `drop-shadow(0 0 8px ${colorHex}66)`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                {/* Un pequeño pico / peak cap arriba de la barra */}
                {h > 0 && (
                  <rect
                    x={`${(i * barWidth) + (gap/2)}%`}
                    y={`${(1 - h) * 100}%`}
                    width={`${actualWidth}%`}
                    height="3"
                    fill="#fff"
                    className="opacity-90"
                    style={{
                      transform: 'translateY(-2px)'
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default SpectrumAnalyzer;
