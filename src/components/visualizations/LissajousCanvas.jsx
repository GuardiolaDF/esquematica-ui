import React, { useEffect, useRef } from 'react';

const LissajousCanvas = React.memo(({ points, width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Handle device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas completely
    ctx.clearRect(0, 0, width, height);

    if (!points || points.length === 0) return;

    // Use lighter composite operation for phosphor accumulation effect
    ctx.globalCompositeOperation = 'lighter';

    // 1. Draw the "Beam Trace"
    // We connect the dots to simulate the electron beam jumping between coordinates
    ctx.beginPath();
    ctx.moveTo(points[0].x * width, (1 - points[0].y) * height);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x * width, (1 - points[i].y) * height);
    }
    
    // The beam trail is extremely faint but builds up density in clusters
    ctx.strokeStyle = '#f8fafc'; // White/cyan mix for the energized beam
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.04; // Very faint trace
    ctx.stroke();

    // 2. Draw Phosphor Core Points (The actual data hits)
    ctx.globalCompositeOperation = 'screen';
    
    points.forEach(p => {
      const px = p.x * width;
      const py = (1 - p.y) * height;
      
      // Outer glow for each point (soft phosphor)
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#bae6fd'; // Pale blue/white mix
      ctx.globalAlpha = 0.15;
      ctx.fill();

      // Bright inner core
      ctx.beginPath();
      ctx.arc(px, py, 1, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.fill();
    });

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
