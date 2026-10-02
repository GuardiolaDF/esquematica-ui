import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { primitives as P } from '../../design/tokens';

// Opacidad que conservan los puntos de los demás carriles cuando se resalta uno (100 % → 75 %)
const DIM = 0.75;

// Capa HTML sobre el SVG del vúmetro (no un foreignObject: Safari/iPad no le aplica bien el escalado del SVG ni el
// del lienzo, y el enjambre quedaba corrido). La capa copia la caja del SVG y reproduce su viewBox +
// preserveAspectRatio (meet), así los puntos usan las mismas coordenadas que el dibujo.
const parseViewBox = (vb) => vb.split(/[\s,]+/).map(Number);

const SwarmCanvas = React.memo(({ dots, cx, cy, mode, hoveredId, svgRef, viewBox, align = 'xMidYMid meet' }) => {
  const canvasRef = useRef(null);
  const [box, setBox] = useState(null);

  // Caja del SVG relativa al contenedor, en px de diseño (sin la escala del lienzo)
  useLayoutEffect(() => {
    const svg = svgRef?.current;
    const canvas = canvasRef.current;
    if (!svg || !canvas) return undefined;
    const measure = () => {
      const parent = canvas.offsetParent;
      if (!parent) return;
      const r = svg.getBoundingClientRect();
      const pr = parent.getBoundingClientRect();
      const w = svg.clientWidth || r.width;
      const ratio = w ? r.width / w : 1; // escala de pantalla del lienzo (Stage)
      const next = {
        left: (r.left - pr.left) / ratio - parent.clientLeft,
        top: (r.top - pr.top) / ratio - parent.clientTop,
        w: r.width / ratio,
        h: r.height / ratio,
        ratio,
      };
      setBox(prev => (prev && ['left', 'top', 'w', 'h', 'ratio'].every(k => Math.abs(prev[k] - next[k]) < 0.5) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [svgRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !box || !box.w || !box.h) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolución real de pantalla: px de diseño × escala del lienzo × densidad del dispositivo
    const px = box.ratio * (window.devicePixelRatio || 1);
    canvas.width = Math.round(box.w * px);
    canvas.height = Math.round(box.h * px);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // viewBox → caja del SVG (preserveAspectRatio "meet")
    const [vx, vy, vw, vh] = parseViewBox(viewBox);
    const k = Math.min(box.w / vw, box.h / vh);
    const ox = (box.w - vw * k) / 2;
    const oy = align.includes('YMax') ? box.h - vh * k : align.includes('YMin') ? 0 : (box.h - vh * k) / 2;
    ctx.scale(px, px);
    ctx.translate(ox, oy);
    ctx.scale(k, k);
    ctx.translate(-vx, -vy);

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

  }, [dots, cx, cy, mode, hoveredId, box, viewBox, align]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute pointer-events-none z-[1]"
      style={box ? { left: box.left, top: box.top, width: box.w, height: box.h } : { left: 0, top: 0, width: 0, height: 0 }}
    />
  );
});

export default SwarmCanvas;
