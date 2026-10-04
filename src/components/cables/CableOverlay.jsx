import React, { useEffect, useRef, useState } from 'react';
import { useCables } from '../../contexts/CableContext';
import { useAppContext } from '../../contexts/AppContext';
import { channelById } from '../../design/channels';

// ─── Cable con peso ─────────────────────────────────────────────────────
// Un cable de largo fijo (más largo que la distancia entre jacks) que cuelga por gravedad. La forma es una curva
// cúbica cuyos puntos de control cuelgan debajo de cada extremo; la panza sale del largo sobrante (aprox. de
// parábola: largo ≈ d + 8·s² / 3d). Los puntos de control siguen a su posición de reposo con un resorte amortiguado:
// al arrastrar, el cable se atrasa, se balancea y se asienta, como un cable real.
const SLACK = 1.22;     // largo = distancia × SLACK + EXTRA
const EXTRA = 170;      // px de cable sobrante (hace que cuelgue aun con los jacks cerca)
const STIFFNESS = 90;   // resorte (1/s²)
const DAMPING = 9;      // amortiguación (1/s): menor = más balanceo

const restControls = (x1, y1, x2, y2) => {
  const d = Math.hypot(x2 - x1, y2 - y1);
  const L = d * SLACK + EXTRA;
  const sag = d > 1 ? Math.min(Math.sqrt((3 * d * (L - d)) / 8), L / 2) : L / 2;
  const drop = sag * 1.33; // cúbica: la panza baja ≈ 0.75 × drop
  return [
    { x: x1 + (x2 - x1) * 0.12, y: y1 + drop },
    { x: x2 - (x2 - x1) * 0.12, y: y2 + drop },
  ];
};

const Cable = ({ x1, y1, x2, y2, color }) => {
  const target = useRef(restControls(x1, y1, x2, y2));
  target.current = restControls(x1, y1, x2, y2);
  const state = useRef(null);
  const [pts, setPts] = useState(() => target.current.map(p => ({ ...p })));

  useEffect(() => {
    if (!state.current) {
      // Al conectarse cae desde una posición más alta y se asienta
      state.current = target.current.map(p => ({ x: p.x, y: p.y - 60, vx: 0, vy: 0 }));
    }
    let raf; let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      let moving = false;
      state.current.forEach((p, i) => {
        const t = target.current[i];
        const ax = STIFFNESS * (t.x - p.x) - DAMPING * p.vx;
        const ay = STIFFNESS * (t.y - p.y) - DAMPING * p.vy;
        p.vx += ax * dt; p.vy += ay * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (Math.abs(t.x - p.x) + Math.abs(t.y - p.y) > 0.3 || Math.abs(p.vx) + Math.abs(p.vy) > 0.3) moving = true;
      });
      setPts(state.current.map(p => ({ x: p.x, y: p.y })));
      if (moving) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x1, y1, x2, y2]);

  const d = `M ${x1} ${y1} C ${pts[0].x} ${pts[0].y} ${pts[1].x} ${pts[1].y} ${x2} ${y2}`;
  return (
    <g>
      {/* Cuerpo del cable: borde oscuro + color + brillo, para que tenga volumen */}
      <path d={d} fill="none" stroke="rgba(45,45,45,0.35)" strokeWidth="8" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color.hex} strokeWidth="6" strokeLinecap="round" />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" transform="translate(-1 -1.5)" />
      {/* Fichas en los extremos */}
      {[[x1, y1], [x2, y2]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill={color.hex} stroke="rgba(45,45,45,0.55)" strokeWidth="1.5" />
      ))}
    </g>
  );
};

const CableOverlay = () => {
  const { dragging, updateDrag, endDrag, connections, jackRefs } = useCables();
  const { routingOutputs } = useAppContext();

  // Arrastre global con pointer events (mouse, touch y lápiz)
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => updateDrag(e.clientX, e.clientY);
    const handleMouseUp = () => endDrag();

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);
    window.addEventListener('pointercancel', handleMouseUp);
    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
      window.removeEventListener('pointercancel', handleMouseUp);
    };
  }, [dragging, updateDrag, endDrag]);

  // Handle external disconnections (e.g. clicking a component to deselect)
  const { disconnectCable } = useCables();
  useEffect(() => {
    if (!routingOutputs.out1 && connections.out1) disconnectCable('out1');
    if (!routingOutputs.out2 && connections.out2) disconnectCable('out2');
  }, [routingOutputs.out1, routingOutputs.out2, connections.out1, connections.out2, disconnectCable]);

  const renderCable = (x1, y1, x2, y2, colorStr, key) => (
    <Cable key={key} x1={x1} y1={y1} x2={x2} y2={y2} color={channelById(colorStr)} />
  );

  // Find where the active output jacks are
  // We don't store exactly which module is out1/out2, but we can infer from the jacks that are registered
  // and have the activeColor.
  let out1Jack = null;
  let out2Jack = null;
  
  for (const jack of Object.values(jackRefs)) {
    if (jack.type === 'output') {
      if (jack.color === 'blue-500' && routingOutputs.out1) out1Jack = jack;
      if (jack.color === 'orange-500' && routingOutputs.out2) out2Jack = jack;
    }
  }

  const in1Jack = jackRefs['vis-in-1'];
  const in2Jack = jackRefs['vis-in-2'];

  return (
    <svg 
      className="fixed inset-0 w-full h-full pointer-events-none z-[100]" 
      style={{ filter: 'drop-shadow(0 3px 4px rgba(45,45,45,0.3))' }}
    >
      {/* Established Connections */}
      {connections.out1 && out1Jack && in1Jack && renderCable(out1Jack.x, out1Jack.y, in1Jack.x, in1Jack.y, 'blue-500', 'c1')}
      {connections.out2 && out2Jack && in2Jack && renderCable(out2Jack.x, out2Jack.y, in2Jack.x, in2Jack.y, 'orange-500', 'c2')}

      {/* Dragging Connection */}
      {dragging && renderCable(dragging.startX, dragging.startY, dragging.currentX, dragging.currentY, dragging.color, 'drag')}
    </svg>
  );
};

export default CableOverlay;
