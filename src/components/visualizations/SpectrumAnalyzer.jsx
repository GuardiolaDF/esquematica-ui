import React, { useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { dbMap } from '../../dbMap';
import { getVisualizableData } from '../../dataTransforms';

// Hook para Canvas que maneja la animación de Decay y Peak Hold
const useSpectrumCanvas = (bins, maxBinCount, colorHex, binsCount, binLabels) => {
  const canvasRef = useRef(null);
  
  // Estado interno para la animación
  const stateRef = useRef({
    currentVals: [],
    peakVals: [],
    peakTimers: [],
    lastFrameTime: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;

    // Inicializar estado si cambió la cantidad de bins
    if (stateRef.current.currentVals.length !== binsCount) {
      stateRef.current = {
        currentVals: new Array(binsCount).fill(0),
        peakVals: new Array(binsCount).fill(0),
        peakTimers: new Array(binsCount).fill(0),
        lastFrameTime: performance.now()
      };
    }

    const render = (time) => {
      const dt = time - stateRef.current.lastFrameTime;
      stateRef.current.lastFrameTime = time;

      // Handle Resize / DPI
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const W = rect.width;
      const H = rect.height;
      const PADDING_BOTTOM = 44; // Espacio para las etiquetas X y la nota inferior
      const PLOT_H = H - PADDING_BOTTOM;

      const state = stateRef.current;
      let needsUpdate = false;

      // Dibuja retícula sutil
      ctx.strokeStyle = '#DDD9CE'; // neutral/200
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 4; i++) {
        const y = PLOT_H - (PLOT_H * (i / 4));
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();

      // Configuración de los bloques
      const gap = Math.max(2, W * 0.01);
      const barWidth = (W / binsCount) - gap;
      const segmentHeight = 4;
      const segmentGap = 2;

      ctx.globalCompositeOperation = 'source-over';
      
      for (let i = 0; i < binsCount; i++) {
        const target = bins[i] || 0; // 0 a 1
        let current = state.currentVals[i];
        
        // Rise instantáneo, Decay lento
        if (target > current) {
          current = target;
          needsUpdate = true;
        } else if (current > target) {
          // Decay rate
          current = Math.max(target, current - (dt * 0.0015)); 
          needsUpdate = true;
        }
        state.currentVals[i] = current;

        // Peak Hold logic
        let peak = state.peakVals[i];
        if (current >= peak) {
          peak = current;
          state.peakTimers[i] = 1000; // Hold por 1 segundo
        } else {
          state.peakTimers[i] -= dt;
          if (state.peakTimers[i] <= 0) {
            peak = Math.max(current, peak - (dt * 0.0008)); // Peak decay
            needsUpdate = true;
          }
        }
        state.peakVals[i] = peak;

        const x = (i * (barWidth + gap)) + (gap / 2);
        
        // Cantidad de segmentos total
        const totalSegments = Math.floor(PLOT_H / (segmentHeight + segmentGap));
        const activeSegments = Math.floor(current * totalSegments);
        const peakSegment = Math.floor(peak * totalSegments);

        // Convert hex to rgb for glow
        const hex = colorHex.replace('#', '');
        const r = parseInt(hex.substring(0,2), 16);
        const g = parseInt(hex.substring(2,4), 16);
        const b = parseInt(hex.substring(4,6), 16);

        // Dibujar segmentos inactivos (Fondo tenue)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
        for (let s = 0; s < totalSegments; s++) {
          const sy = PLOT_H - (s * (segmentHeight + segmentGap)) - segmentHeight;
          ctx.fillRect(x, sy, barWidth, segmentHeight);
        }

        // Dibujar segmentos activos
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
        
        for (let s = 0; s < activeSegments; s++) {
          const sy = PLOT_H - (s * (segmentHeight + segmentGap)) - segmentHeight;
          
          // Color cambia ligeramente hacia el tope (más intenso/blanco)
          const intensity = s / totalSegments;
          if (intensity > 0.8) {
             ctx.fillStyle = '#FF9479'; // coral/500: el tope se enciende
          } else {
             ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
          }

          ctx.fillRect(x, sy, barWidth, segmentHeight);
        }
        ctx.shadowBlur = 0; // reset

        // Dibujar Peak Cap
        if (peakSegment > 0 && peakSegment < totalSegments) {
          const py = PLOT_H - (peakSegment * (segmentHeight + segmentGap)) - segmentHeight;
          ctx.fillStyle = '#5C5451'; // neutral/700
          ctx.fillRect(x, py, barWidth, segmentHeight);
        }

        // Dibujar Etiqueta X
        ctx.fillStyle = '#8A8177'; // neutral/500
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        const labelStr = binLabels[i] !== undefined ? binLabels[i] : '';
        ctx.fillText(labelStr, x + (barWidth / 2), H - 26);
      }
      
      ctx.restore();

      // Loop solo si hay animaciones pendientes
      if (needsUpdate || Math.random() < 0.01) { // Pequeño trigger ocasional para suavidad
         animationFrameId = requestAnimationFrame(render);
      } else {
         // Pause loop para no consumir CPU, si cambia "bins" el useEffect se reinicia
         animationFrameId = requestAnimationFrame(render); 
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [bins, colorHex, binsCount, binLabels]);

  return canvasRef;
};


const SpectrumAnalyzer = ({ outId, outMeta, colorHex = "#39787D", labelPrefix = "OUT 1" }) => {
  const { allSetups, values, averages, mode } = useAppContext();

  // 1. Extraer los datos reales y normalizarlos
  const rawData = useMemo(() => {
    const arr = [];
    if (mode === 'colectivo' && allSetups && allSetups.length > 0) {
      allSetups.forEach(setup => {
        const v = setup.values ? setup.values[dbMap[outId]] : undefined;
        if (v !== undefined && v !== null) arr.push(v);
      });
    } else if (mode === 'individual' && values[outId] !== undefined) {
      arr.push(values[outId]);
    } else if (averages[outId] !== undefined) {
      arr.push(averages[outId]);
    }
    return arr;
  }, [allSetups, values, averages, mode, outId]);

  // 2. Determinar Bins y Distribución Real
  const { bins, binLabels, maxBinCount, totalValues } = useMemo(() => {
    if (rawData.length === 0) return { bins: [], binLabels: [], maxBinCount: 0, totalValues: 0 };

    // Extraer min y max semánticos
    let sample = getVisualizableData(outId, 50, outMeta.dataType);
    let min = sample.min !== undefined ? sample.min : 0;
    let max = sample.max !== undefined ? sample.max : 100;

    // Ajustar min/max si los datos exceden
    if (outMeta.dataType === 'numeric') {
       const dMin = Math.min(...rawData);
       const dMax = Math.max(...rawData);
       if (dMin < min) min = dMin;
       if (dMax > max) max = dMax;
    }
    
    const range = max - min;
    let binsCount = 16;
    let binLabels = [];

    // Si es un dominio pequeño y discreto (ej. 0-5), usamos la cantidad exacta de bandas.
    if (range <= 10 && Number.isInteger(min) && Number.isInteger(max)) {
      binsCount = range + 1;
      for (let i = min; i <= max; i++) binLabels.push(i.toString());
    } else {
      // Para rangos numéricos continuos grandes (ej. 0-100), agrupamos en ~12 bandas
      binsCount = 12;
      for (let i = 0; i < binsCount; i++) {
         const val = min + (i / (binsCount - 1)) * range;
         binLabels.push(Number.isInteger(val) ? val.toString() : val.toFixed(0));
      }
    }

    const counts = new Array(binsCount).fill(0);

    rawData.forEach(val => {
      let visData = getVisualizableData(outId, val, outMeta.dataType);
      let pVal = Math.max(min, Math.min(max, visData.value));
      
      let index = 0;
      if (range === 0) {
        index = 0;
      } else {
        index = Math.round(((pVal - min) / range) * (binsCount - 1));
      }
      
      if (index >= binsCount) index = binsCount - 1;
      if (index < 0) index = 0;
      counts[index]++;
    });

    const maxCount = Math.max(...counts, 1);
    const normalized = counts.map(c => c / maxCount);

    return { bins: normalized, binLabels, maxBinCount: maxCount, totalValues: rawData.length };
  }, [rawData, outId, outMeta]);

  const canvasRef = useSpectrumCanvas(bins, maxBinCount, colorHex, bins.length, binLabels);

  if (totalValues === 0) {
    return (
      <div className="w-full flex-1 flex flex-col relative overflow-hidden items-center justify-center">
        <span className="type-label-m uppercase tracking-widest text-text-disabled">Esperando señal…</span>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col relative overflow-hidden p-6">
      
      {/* Etiqueta Técnica Superior Izquierda */}
      <div className="absolute left-6 top-5 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="type-caption uppercase tracking-widest text-text-disabled">Espectro</div>
        <div className="type-label-s uppercase tracking-widest flex items-center gap-2" style={{ color: colorHex }}>
          <div className="w-2 h-2 rounded-pill" style={{ backgroundColor: colorHex }}></div>
          {labelPrefix} · {outMeta?.label || 'UNKNOWN'}
        </div>
      </div>

      {/* Información Técnica Superior Derecha */}
      <div className="absolute right-6 top-5 z-20 type-label-s uppercase tracking-widest text-text-muted text-right pointer-events-none">
        N = {totalValues} <br/>
        <span className="text-text-primary">PEAK = {maxBinCount}</span>
      </div>

      {/* Leyenda Secundaria Inferior (Eje Y = Densidad) */}
      <div className="absolute left-6 bottom-14 z-20 type-caption tracking-widest uppercase text-text-muted origin-bottom-left -rotate-90 pointer-events-none">
        DENSIDAD / CONCENTRACIÓN
      </div>

      {/* Explicación Concisa Inferior Derecha */}
      <div className="absolute right-6 bottom-2 z-20 type-caption text-text-disabled pointer-events-none text-right">
        Distribución de las respuestas dentro del rango de la variable.
      </div>

      {/* Analizador de Espectro Canvas */}
      <div className="w-full h-full relative mt-8">
        <canvas 
          ref={canvasRef}
          className="w-full h-full absolute inset-0"
        />
      </div>

    </div>
  );
};

export default SpectrumAnalyzer;
