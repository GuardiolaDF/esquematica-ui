import React, { useEffect, useRef } from 'react';
import { primitives as P } from '../../design/tokens';

// Opacidad que conservan los puntos de los demás carriles cuando se resalta uno (100 % → 75 %)
const DIM = 0.75;

const SwarmCanvas = React.memo(({ dots, cx, cy, mode, hoveredId, width = 800, height = 450 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Normalize coordinate system to use CSS pixels
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply composite operation
    // Fondo claro: mezcla normal; la densidad se lee por acumulación de transparencia
    ctx.globalCompositeOperation = 'source-over';

    const hoverTrack = hoveredId && hoveredId.startsWith('mod') ? hoveredId : null;

    // Batch rendering
    dots.forEach(dot => {
      ctx.save();
      
      // Transform origin to cx, cy
      ctx.translate(cx, cy);
      // Rotate by dot.angle (convert degrees to radians)
      ctx.rotate(dot.angle * Math.PI / 180);
      
      // Determine if we should highlight this dot based on hover
      // Solo un carril del vúmetro resalta y atenúa el resto (los filtros de la consola no son carriles)
      const isHovered = hoverTrack === dot.compId;
      const isDimmed = hoverTrack && !isHovered;
      
      let r = dot.size || (mode === 'colectivo' ? 2 : 3);
      if (isHovered) {
        // slightly larger radius on hover (simulating CSS scale(1.1) and r: 3.5px)
        r = Math.max(r, 3.5) + (dot.trailFrom !== undefined ? 1 : 0);
        // In CSS we had filter: url(#glow) which is tricky in pure canvas without slowing it down.
        // We can simulate it by adding a shadow for hovered items.
        ctx.shadowColor = P.coral[500];
        ctx.shadowBlur = 8;
      }
      
      // Barra del carril (modo individual): arco desde el inicio del abanico hasta el punto
      if (dot.trailFrom !== undefined) {
        ctx.save();
        ctx.rotate(-dot.angle * Math.PI / 180);
        ctx.beginPath();
        ctx.arc(0, 0, dot.r, (dot.trailFrom - 90) * Math.PI / 180, (dot.angle - 90) * Math.PI / 180);
        ctx.globalAlpha = 0.55 * (isDimmed ? DIM : 1) * (dot.opacity ?? 1);
        ctx.strokeStyle = dot.color || P.coral[500];
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      // Draw circle at (0, -dot.r) because we already translated to (cx, cy)
      ctx.arc(0, -dot.r, r, 0, Math.PI * 2);
      
      // Opacity logic
      let baseOpacity = dot.opacity !== undefined ? dot.opacity : 1;
      if (isHovered) {
        baseOpacity = 1; // Full opacity when hovered
      } else if (isDimmed) {
        baseOpacity *= DIM; // El resto baja apenas: el carril resaltado se distingue sin apagar el enjambre
      }
      
      ctx.globalAlpha = baseOpacity;
      
      // Fill
      ctx.fillStyle = isHovered ? P.coral[500] : (dot.color || P.teal[600]);
      ctx.fill();
      
      // Stroke
      if (dot.strokeColor) {
        ctx.strokeStyle = dot.strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      
      ctx.restore();
    });

  }, [dots, cx, cy, mode, hoveredId, width, height]);

  // The style sets the CSS size, the width/height attributes will be overwritten in useEffect
  return (
    <foreignObject x="0" y="0" width={width} height={height} className="pointer-events-none">
      <canvas 
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="pointer-events-none"
      />
    </foreignObject>
  );
});

export default SwarmCanvas;
