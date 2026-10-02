import React, { useEffect, useRef } from 'react';

const LissajousCanvas = React.memo(({ points, width, height, paddingX = 50, paddingY = 40 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Configuración real del canvas con devicePixelRatio para evitar borrosidad
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!points || points.length === 0) return;

    // Márgenes pasados por props

    const plotWidth = width - (paddingX * 2);
    const plotHeight = height - (paddingY * 2);

    if (plotWidth <= 0 || plotHeight <= 0) return;

    // 1. DATA -> DENSITY CALCULATION
    const CELL_SIZE = 4; // Tamaño de celda en píxeles
    const cols = Math.ceil(width / CELL_SIZE);
    const rows = Math.ceil(height / CELL_SIZE);
    
    // Grilla de densidad
    const densityGrid = new Float32Array(cols * rows);
    let maxDensity = 0;

    // Poblar grilla con coordenadas respetando márgenes
    points.forEach(p => {
      // p.x y p.y están normalizados entre 0 y 1.
      // Canvas Y está invertido (0 arriba).
      const cx = paddingX + (p.x * plotWidth);
      const cy = paddingY + ((1 - p.y) * plotHeight);

      const col = Math.floor(cx / CELL_SIZE);
      const row = Math.floor(cy / CELL_SIZE);

      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const idx = row * cols + col;
        densityGrid[idx]++;
        if (densityGrid[idx] > maxDensity) {
          maxDensity = densityGrid[idx];
        }
      }
    });

    if (maxDensity === 0) return;

    // 2. CANVAS RENDER
    // Fondo claro: halo teal (variable X) con un centro coral (variable Y) que se intensifica donde hay más densidad.
    ctx.globalCompositeOperation = 'source-over';

    const xColor = '57, 120, 125';   // OUT 1 · teal/500
    const yColor = '255, 148, 121';  // OUT 2 · coral/500

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = densityGrid[r * cols + c];
        if (val > 0) {
          const intensity = val / maxDensity;

          const x = c * CELL_SIZE + (CELL_SIZE / 2);
          const y = r * CELL_SIZE + (CELL_SIZE / 2);

          const radius = CELL_SIZE + (CELL_SIZE * 1.5 * intensity);

          // Halo (OUT 1 · teal)
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${xColor}, ${0.14 + 0.36 * intensity})`;
          ctx.fill();

          // Centro (OUT 2 · coral)
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${yColor}, ${0.3 + 0.6 * intensity})`;
          ctx.fill();
        }
      }
    }

  }, [points, width, height]);

  return (
    <canvas 
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="absolute top-0 left-0 pointer-events-none"
    />
  );
});

export default LissajousCanvas;
