import React, { useEffect, useRef } from 'react';

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
    ctx.globalCompositeOperation = 'screen';

    // Batch rendering
    dots.forEach(dot => {
      ctx.save();
      
      // Transform origin to cx, cy
      ctx.translate(cx, cy);
      // Rotate by dot.angle (convert degrees to radians)
      ctx.rotate(dot.angle * Math.PI / 180);
      
      // Determine if we should highlight this dot based on hover
      const isHovered = hoveredId === dot.compId;
      const isDimmed = hoveredId && !isHovered;
      
      let r = dot.size || (mode === 'colectivo' ? 2 : 3);
      if (isHovered) {
        // slightly larger radius on hover (simulating CSS scale(1.1) and r: 3.5px)
        r = 3.5;
        // In CSS we had filter: url(#glow) which is tricky in pure canvas without slowing it down.
        // We can simulate it by adding a shadow for hovered items.
        ctx.shadowColor = dot.color || "#FFC800";
        ctx.shadowBlur = 8;
      }
      
      ctx.beginPath();
      // Draw circle at (0, -dot.r) because we already translated to (cx, cy)
      ctx.arc(0, -dot.r, r, 0, Math.PI * 2);
      
      // Opacity logic
      let baseOpacity = dot.opacity !== undefined ? dot.opacity : 1;
      if (isHovered) {
        baseOpacity = 1; // Full opacity when hovered
      } else if (isDimmed) {
        baseOpacity = 0.05; // Dimmed when something else is hovered
      }
      
      ctx.globalAlpha = baseOpacity;
      
      // Fill
      ctx.fillStyle = dot.color || "#FFC800";
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
