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

    // Use lighter composite operation for phosphor accumulation effect (additive blending)
    ctx.globalCompositeOperation = 'lighter';
    
    points.forEach(p => {
      const px = p.x * width;
      const py = (1 - p.y) * height;
      
      // Halo exterior suave (brillo de fósforo esparcido)
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#bae6fd'; // Cyan muy claro
      ctx.globalAlpha = 0.02; // Súper sutil, solo brilla cuando hay acumulación
      ctx.fill();

      // Halo interior intermedio
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8'; // Cyan medio
      ctx.globalAlpha = 0.15;
      ctx.fill();

      // Núcleo brillante
      ctx.beginPath();
      ctx.arc(px, py, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; // Blanco puro
      ctx.globalAlpha = 0.6;
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
