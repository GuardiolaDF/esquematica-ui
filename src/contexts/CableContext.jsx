import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const CableContext = createContext();

export const useCables = () => useContext(CableContext);

export const CableProvider = ({ children }) => {
  const [connections, setConnections] = useState({ out1: false, out2: false });
  const [dragging, setDragging] = useState(null); 
  // dragging = { color: 'blue-500', startX, startY, currentX, currentY, sourceId }

  const jackRefs = useRef({}); // { [id]: { x, y, type, color } }

  const registerJack = useCallback((id, x, y, type, color) => {
    jackRefs.current[id] = { x, y, type, color };
  }, []);

  const unregisterJack = useCallback((id) => {
    delete jackRefs.current[id];
  }, []);

  const getJackCoords = useCallback((id) => {
    return jackRefs.current[id];
  }, []);

  const startDrag = useCallback((color, x, y, sourceId) => {
    setDragging({ color, startX: x, startY: y, currentX: x, currentY: y, sourceId });
    if (color === 'blue-500' && connections.out1) {
      setConnections(prev => ({ ...prev, out1: false }));
    }
    if (color === 'orange-500' && connections.out2) {
      setConnections(prev => ({ ...prev, out2: false }));
    }
  }, [connections]);

  const updateDrag = useCallback((x, y) => {
    setDragging(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  }, []);

  const endDrag = useCallback(() => {
    if (!dragging) return;
    
    const dropRadius = 60; // magnetic radius
    let snapped = false;

    for (const [id, jack] of Object.entries(jackRefs.current)) {
      if (jack.type === 'input') {
        const expectedColor = id === 'vis-in-1' ? 'blue-500' : 'orange-500';
        if (expectedColor === dragging.color) {
          const dx = dragging.currentX - jack.x;
          const dy = dragging.currentY - jack.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < dropRadius) {
            snapped = true;
            if (expectedColor === 'blue-500') setConnections(prev => ({ ...prev, out1: true }));
            if (expectedColor === 'orange-500') setConnections(prev => ({ ...prev, out2: true }));
            break;
          }
        }
      }
    }

    setDragging(null);
  }, [dragging]);

  const disconnectCable = useCallback((channel) => { 
    setConnections(prev => ({ ...prev, [channel]: false }));
  }, []);

  return (
    <CableContext.Provider value={{
      connections,
      dragging,
      registerJack,
      unregisterJack,
      getJackCoords,
      startDrag,
      updateDrag,
      endDrag,
      disconnectCable,
      jackRefs: jackRefs.current 
    }}>
      {children}
    </CableContext.Provider>
  );
};
