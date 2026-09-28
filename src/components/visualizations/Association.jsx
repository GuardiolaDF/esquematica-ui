import React, { useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { dbMap } from '../../dbMap';

// Hook para Canvas que simula la Constelación (Force-Directed Graph)
const useConstellationCanvas = (nodes, edges, colorHex) => {
  const canvasRef = useRef(null);
  
  // Estado interno para las posiciones de los nodos
  const stateRef = useRef({
    positions: [],
    velocities: [],
    width: 800,
    height: 500
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Inicializar posiciones
    const state = stateRef.current;
    if (state.positions.length !== nodes.length) {
       state.positions = nodes.map((n, i) => {
         // Disposición inicial circular, determinista
         const angle = (i / nodes.length) * Math.PI * 2;
         const r = 150;
         return {
           x: state.width / 2 + Math.cos(angle) * r,
           y: state.height / 2 + Math.sin(angle) * r
         };
       });
       state.velocities = nodes.map(() => ({ x: 0, y: 0 }));
    }

    let alpha = 1.0; // Temperatura de simulación

    const render = () => {
      // Ajuste de DPI y tamaño
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        state.width = rect.width;
        state.height = rect.height;
      }
      
      const W = state.width;
      const H = state.height;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      if (nodes.length === 0) {
        ctx.restore();
        return;
      }

      // 1. Simulación Física (Force-Directed)
      if (alpha > 0.01) {
        const k = Math.sqrt((W * H) / nodes.length); // Factor de escala
        const repulse = k * k * 0.5;
        
        // Repulsión (Todos contra todos)
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = state.positions[i].x - state.positions[j].x;
            const dy = state.positions[i].y - state.positions[j].y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist === 0) dist = 0.01;
            
            const force = repulse / dist;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            state.velocities[i].x += fx * alpha;
            state.velocities[i].y += fy * alpha;
            state.velocities[j].x -= fx * alpha;
            state.velocities[j].y -= fy * alpha;
          }
        }
        
        // Atracción (Conexiones)
        edges.forEach(edge => {
          const s = edge.sourceIndex;
          const t = edge.targetIndex;
          const dx = state.positions[s].x - state.positions[t].x;
          const dy = state.positions[s].y - state.positions[t].y;
          let dist = Math.sqrt(dx*dx + dy*dy);
          if (dist === 0) dist = 0.01;
          
          // La fuerza atractiva depende del peso (frecuencia)
          const attract = (dist * dist) / k;
          const weight = edge.weight * 0.1; 
          const fx = (dx / dist) * attract * weight;
          const fy = (dy / dist) * attract * weight;
          
          state.velocities[s].x -= fx * alpha;
          state.velocities[s].y -= fy * alpha;
          state.velocities[t].x += fx * alpha;
          state.velocities[t].y += fy * alpha;
        });
        
        // Gravedad (Hacia el centro)
        for (let i = 0; i < nodes.length; i++) {
           const dx = state.positions[i].x - (W / 2);
           const dy = state.positions[i].y - (H / 2);
           let dist = Math.sqrt(dx*dx + dy*dy);
           if (dist > 0) {
             const force = dist * 0.05;
             state.velocities[i].x -= (dx / dist) * force * alpha;
             state.velocities[i].y -= (dy / dist) * force * alpha;
           }
        }
        
        // Aplicar velocidades y Damping
        const maxV = 20;
        for (let i = 0; i < nodes.length; i++) {
          const vx = Math.max(-maxV, Math.min(maxV, state.velocities[i].x));
          const vy = Math.max(-maxV, Math.min(maxV, state.velocities[i].y));
          
          state.positions[i].x += vx;
          state.positions[i].y += vy;
          
          // Fricción
          state.velocities[i].x *= 0.8;
          state.velocities[i].y *= 0.8;
        }
        
        alpha *= 0.95; // Enfriamiento rápido para estabilizar
      }

      // Convert hex to rgb
      const hex = colorHex.replace('#', '');
      const r = parseInt(hex.substring(0,2), 16);
      const g = parseInt(hex.substring(2,4), 16);
      const b = parseInt(hex.substring(4,6), 16);

      ctx.globalCompositeOperation = 'screen';

      // 2. Dibujar Conexiones (Edges)
      edges.forEach(edge => {
        const s = state.positions[edge.sourceIndex];
        const t = state.positions[edge.targetIndex];
        const opacity = Math.min(1, 0.1 + (edge.weight * 0.1));
        const thickness = 0.5 + (edge.weight * 0.3);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = thickness;
        ctx.stroke();
      });

      // 3. Dibujar Nodos (Items)
      nodes.forEach((node, i) => {
        const pos = state.positions[i];
        
        // Tamaño proporcional a la frecuencia absoluta, capado
        const radius = Math.min(15, 2 + (node.count * 0.8));
        
        // Halo
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 2, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
        ctx.fill();

        // Núcleo
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `#fff`;
        ctx.fill();

        // Etiqueta
        ctx.font = '10px monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        // Despejar el texto del nodo
        ctx.fillText(node.label, pos.x, pos.y + radius + 10);
      });

      ctx.restore();

      // Seguir simulando hasta que enfríe
      if (alpha > 0.01) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, edges, colorHex]);

  return canvasRef;
};

const Association = ({ out1Id, out1Meta, hasSource1 }) => {
  const { allSetups, values, mode } = useAppContext();

  // 1. Extraer elementos y co-ocurrencias
  const { nodes, edges } = useMemo(() => {
    if (!hasSource1 || !out1Id) return { nodes: [], edges: [] };

    // Validar si es una variable compatible con colecciones/listas de elementos.
    // Aunque el backend no tenga actualmente strings, lo parseamos buscando Arrays o strings separados por comas.
    const itemsMap = {}; // { normKey: count }
    const pairsMap = {}; // { "normA::normB": count }
    const labelMap = {}; // { normKey: originalLabel }

    const processRecord = (val) => {
      if (!val) return;
      let rawItems = [];
      if (Array.isArray(val)) {
        rawItems = val;
      } else if (typeof val === 'string') {
        rawItems = val.split(',');
      }
      
      const items = [];
      const seen = new Set();
      
      // Normalizar, deduplicar y registrar etiqueta visual original
      rawItems.forEach(s => {
        const raw = typeof s === 'string' ? s.trim() : String(s).trim();
        if (!raw) return;
        const norm = raw.toLowerCase();
        
        if (!seen.has(norm)) {
          seen.add(norm);
          items.push(norm);
          
          if (!labelMap[norm]) {
            labelMap[norm] = raw;
          }
        }
      });

      // Contar frecuencias individuales
      items.forEach(norm => {
        itemsMap[norm] = (itemsMap[norm] || 0) + 1;
      });

      // Contar co-ocurrencias
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          // Ordenar alfabéticamente para tener una key única independientemente del orden
          const key = a < b ? `${a}::${b}` : `${b}::${a}`;
          pairsMap[key] = (pairsMap[key] || 0) + 1;
        }
      }
    };

    if (mode === 'colectivo' && allSetups && allSetups.length > 0) {
      allSetups.forEach(setup => {
        const v = setup.values ? setup.values[dbMap[out1Id]] : undefined;
        processRecord(v);
      });
    } else if (mode === 'individual' && values[out1Id] !== undefined) {
      processRecord(values[out1Id]);
    }

    // Si la DB actualmente devuelve números, itemsMap quedará vacío.
    const allItems = Object.keys(itemsMap);
    if (allItems.length === 0) return { nodes: [], edges: [] };

    // UMBRAL: Quedarse con los Top N elementos más frecuentes para evitar una sopa
    const TOP_N_NODES = 40;
    const sortedItems = allItems.sort((a, b) => itemsMap[b] - itemsMap[a]).slice(0, TOP_N_NODES);
    
    // Crear Nodos
    const graphNodes = sortedItems.map(normKey => ({
      id: normKey,
      label: labelMap[normKey] || normKey,
      count: itemsMap[normKey]
    }));

    // UMBRAL DE CONEXIONES: Quedarse solo con asociaciones entre los Top N, y con frecuencia >= 2 (si hay suficientes datos)
    const validSet = new Set(sortedItems);
    const graphEdges = [];
    
    Object.keys(pairsMap).forEach(key => {
      const weight = pairsMap[key];
      if (weight > 0) {
        const [a, b] = key.split('::');
        if (validSet.has(a) && validSet.has(b)) {
           // Encontrar índices
           const sIdx = graphNodes.findIndex(n => n.id === a);
           const tIdx = graphNodes.findIndex(n => n.id === b);
           if (sIdx !== -1 && tIdx !== -1) {
             graphEdges.push({
               sourceIndex: sIdx,
               targetIndex: tIdx,
               weight: weight
             });
           }
        }
      }
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [allSetups, values, mode, out1Id, hasSource1]);

  const colorHex = "#3b82f6"; // OUT 1 = Azul

  const canvasRef = useConstellationCanvas(nodes, edges, colorHex);

  if (!hasSource1) {
    return (
      <div className="w-full flex-1 flex flex-col relative bg-[#050505] rounded-xl border border-[#111] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] items-center justify-center">
        <span className="text-[#333] font-mono text-[10px] tracking-[0.3em] uppercase">WAITING FOR SIGNAL...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col relative bg-[#050505] rounded-xl border border-[#111] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] p-6">
      
      {/* Etiqueta Técnica Superior Izquierda */}
      <div className="absolute left-6 top-5 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="text-[#444] text-[9px] font-mono tracking-widest uppercase">ASOCIACIÓN</div>
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: colorHex }}>
          <div className="w-2 h-2 rounded-full shadow-[0_0_5px]" style={{ backgroundColor: colorHex, boxShadow: `0 0 5px ${colorHex}` }}></div>
          OUT 1 · {out1Meta?.label || 'UNKNOWN'}
        </div>
      </div>

      {/* Explicación Concisa Inferior Derecha */}
      <div className="absolute right-6 bottom-4 z-20 text-[#444] text-[9px] font-mono tracking-wider pointer-events-none text-right">
        Elementos que aparecen asociados<br/>dentro de las mismas respuestas.
      </div>

      {/* Analizador de Constelación Canvas */}
      <div className="w-full h-full relative mt-8">
        {nodes.length > 0 ? (
          <canvas 
            ref={canvasRef}
            className="w-full h-full absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-[#555] font-mono text-[10px] tracking-[0.3em] uppercase">SIN DATOS ASOCIABLES EN ESTA VARIABLE</span>
             <span className="text-[#333] font-mono text-[8px] tracking-[0.1em] uppercase mt-2">(Se esperaba una lista de elementos)</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default Association;

