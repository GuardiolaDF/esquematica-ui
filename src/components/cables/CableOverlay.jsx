import React, { useEffect, useCallback } from 'react';
import { useCables } from '../../contexts/CableContext';
import { useAppContext } from '../../contexts/AppContext';

const CableOverlay = () => {
  const { dragging, updateDrag, endDrag, connections, jackRefs } = useCables();
  const { routingOutputs } = useAppContext();

  // Handle global mouse move/up
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => updateDrag(e.clientX, e.clientY);
    const handleMouseUp = () => endDrag();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, updateDrag, endDrag]);

  // Handle external disconnections (e.g. clicking a component to deselect)
  const { disconnectCable } = useCables();
  useEffect(() => {
    if (!routingOutputs.out1 && connections.out1) disconnectCable('out1');
    if (!routingOutputs.out2 && connections.out2) disconnectCable('out2');
  }, [routingOutputs.out1, routingOutputs.out2, connections.out1, connections.out2, disconnectCable]);

  // Render a bezier curve with gravity
  const renderCable = (x1, y1, x2, y2, colorStr) => {
    const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const sag = Math.max(50, dist * 0.4); // gravity sag
    const midX = (x1 + x2) / 2;
    const midY = ((y1 + y2) / 2) + sag;
    
    const strokeColor = colorStr === 'blue-500' ? '#3b82f6' : '#f97316';
    
    return (
      <path 
        d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`} 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="6" 
        strokeLinecap="round"
        className="drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
      />
    );
  };

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
      style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}
    >
      {/* Established Connections */}
      {connections.out1 && out1Jack && in1Jack && renderCable(out1Jack.x, out1Jack.y, in1Jack.x, in1Jack.y, 'blue-500')}
      {connections.out2 && out2Jack && in2Jack && renderCable(out2Jack.x, out2Jack.y, in2Jack.x, in2Jack.y, 'orange-500')}

      {/* Dragging Connection */}
      {dragging && renderCable(dragging.startX, dragging.startY, dragging.currentX, dragging.currentY, dragging.color)}
    </svg>
  );
};

export default CableOverlay;
