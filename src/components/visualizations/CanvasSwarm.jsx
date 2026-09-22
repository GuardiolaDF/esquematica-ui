import React, { useEffect, useRef, useState } from 'react';

const CanvasSwarm = ({ dots, cx, cy, hoveredId, mode, startAngle }) => {
  const canvasRef = useRef(null);
  const [animProgress, setAnimProgress] = useState(0);

  // Animation loop whenever dots update
  useEffect(() => {
    let start = performance.now();
    let frameId;
    
    const animate = (time) => {
      let p = (time - start) / 600; // 600ms duration
      if (p > 1) p = 1;
      
      // easeOutExpo
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setAnimProgress(ease);
      
      if (p < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [dots]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    
    // We assume canvas is 800x800 to match SVG viewBox
    ctx.clearRect(0, 0, 800, 800);
    
    // Performance optimization: screen blend mode gives the glowing overlapping effect
    ctx.globalCompositeOperation = 'screen';

    dots.forEach(dot => {
      const isHovered = hoveredId === dot.compId;
      
      // Determine opacity
      if (hoveredId && !isHovered) {
        ctx.globalAlpha = 0.08;
      } else {
        ctx.globalAlpha = dot.opacity || 1;
      }

      // Interpolate angle for entrance animation
      // Assuming dots emerge from the base startAngle
      const baseStart = startAngle + 1.5;
      const currentAngle = baseStart + (dot.angle - baseStart) * animProgress;

      // Polar to Cartesian
      const rad = (currentAngle - 90) * (Math.PI / 180);
      const x = cx + dot.r * Math.cos(rad);
      const y = cy + dot.r * Math.sin(rad);
      
      const size = isHovered ? 3.5 : (dot.size || (mode === 'colectivo' ? 2 : 3));

      // Draw dot
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#FFF' : (dot.color || '#FFC800');
      ctx.fill();

      // Draw hovered glow/stroke
      if (isHovered) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset for next
      }
    });

  }, [dots, cx, cy, hoveredId, mode, animProgress, startAngle]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={800} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
      style={{ mixBlendMode: 'screen', objectFit: 'contain', objectPosition: 'center bottom' }}
    />
  );
};

export default CanvasSwarm;
