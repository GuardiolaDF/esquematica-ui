import React, { useMemo } from 'react';

// --- MATH UTILS ---

// Pearson Correlation (-1 to 1)
const pearsonCorrelation = (x, y) => {
  const n = x.length;
  if (n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  return numerator / denominator;
};

// Cramér's V (0 to 1) for Categorical/Boolean
const cramersV = (x, y) => {
  const n = x.length;
  if (n === 0) return 0;

  // Contingency table
  const table = {};
  const xTotals = {};
  const yTotals = {};
  
  for (let i = 0; i < n; i++) {
    const xv = x[i];
    const yv = y[i];
    if (!table[xv]) table[xv] = {};
    table[xv][yv] = (table[xv][yv] || 0) + 1;
    xTotals[xv] = (xTotals[xv] || 0) + 1;
    yTotals[yv] = (yTotals[yv] || 0) + 1;
  }
  
  let chiSquare = 0;
  const xKeys = Object.keys(xTotals);
  const yKeys = Object.keys(yTotals);
  
  xKeys.forEach(xv => {
    yKeys.forEach(yv => {
      const observed = (table[xv] && table[xv][yv]) ? table[xv][yv] : 0;
      const expected = (xTotals[xv] * yTotals[yv]) / n;
      if (expected > 0) {
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    });
  });
  
  const k = Math.min(xKeys.length, yKeys.length);
  if (k <= 1) return 0;
  
  const v = Math.sqrt(chiSquare / (n * (k - 1)));
  return v;
};

// Map logical type
const getTypeGroup = (dbType) => {
  if (dbType === 'numeric' || dbType === 'scale') return 'numeric';
  if (dbType === 'categorical' || dbType === 'boolean') return 'categorical';
  return 'unknown';
};

// Normalize values to strings for categorical, numbers for numeric
const extractValue = (setup, compId, dbMap) => {
  const dbKey = Object.keys(dbMap).find(k => dbMap[k] === compId);
  if (!dbKey) return undefined;
  return setup.values[dbKey];
};


export default function Association({ dbMetadata, dbMap, routingOutputs, filteredSetups = [] }) {
  const out1 = routingOutputs?.[1];
  const out2 = routingOutputs?.[2];

  // We only run if there's at least one valid output
  const hasOut1 = out1 && dbMetadata[out1];
  const hasOut2 = out2 && dbMetadata[out2];

  const graphData = useMemo(() => {
    if (!hasOut1 && !hasOut2) return null;
    if (filteredSetups.length === 0) return null;

    const sources = [];
    if (hasOut1) sources.push({ id: out1, type: 'out1', meta: dbMetadata[out1] });
    if (hasOut2) sources.push({ id: out2, type: 'out2', meta: dbMetadata[out2] });

    const allNodesMap = {}; // store computed associations
    const links = [];

    // Valid candidates for satellites (routable and not the sources themselves)
    const candidates = Object.keys(dbMetadata).filter(id => 
      dbMetadata[id].routable && id !== out1 && id !== out2 && !id.startsWith('demo-')
    );

    sources.forEach(source => {
      const sourceType = getTypeGroup(source.meta.dataType);
      const sourceAssocs = [];

      candidates.forEach(candId => {
        const candMeta = dbMetadata[candId];
        const candType = getTypeGroup(candMeta.dataType);
        
        // Skip mixing different types
        if (sourceType !== candType) return;

        // Extract paired data
        const pairsX = [];
        const pairsY = [];
        filteredSetups.forEach(setup => {
          const vSrc = extractValue(setup, source.id, dbMap);
          const vCand = extractValue(setup, candId, dbMap);
          if (vSrc !== undefined && vCand !== undefined && vSrc !== null && vCand !== null) {
            pairsX.push(vSrc);
            pairsY.push(vCand);
          }
        });

        if (pairsX.length < 5) return; // Need minimum data points

        let coef = 0;
        if (sourceType === 'numeric') {
          coef = pearsonCorrelation(pairsX, pairsY);
        } else {
          coef = cramersV(pairsX, pairsY);
        }

        // Only keep if significant enough
        if (Math.abs(coef) >= 0.15) {
          sourceAssocs.push({
            id: candId,
            coef: coef,
            absCoef: Math.abs(coef),
            meta: candMeta
          });
        }
      });

      // Top N for this source
      sourceAssocs.sort((a, b) => b.absCoef - a.absCoef);
      const topAssocs = sourceAssocs.slice(0, 8);

      topAssocs.forEach(assoc => {
        if (!allNodesMap[assoc.id]) {
          allNodesMap[assoc.id] = { 
            id: assoc.id, 
            label: assoc.meta.label, 
            connectedTo: [], 
            totalAbs: 0 
          };
        }
        allNodesMap[assoc.id].connectedTo.push({ sourceId: source.id, coef: assoc.coef, absCoef: assoc.absCoef });
        allNodesMap[assoc.id].totalAbs += assoc.absCoef;
        
        links.push({
          source: source.id,
          target: assoc.id,
          coef: assoc.coef,
          absCoef: assoc.absCoef,
          sourceType: source.type
        });
      });
    });

    // Node layout algorithm (Simple Deterministic Force/Radial)
    const nodes = [];
    const cx = 400;
    const cy = 250;

    // Place sources
    if (sources.length === 1) {
      nodes.push({ id: sources[0].id, label: sources[0].meta.label, type: sources[0].type, x: cx, y: cy, isSource: true });
    } else if (sources.length === 2) {
      nodes.push({ id: sources[0].id, label: sources[0].meta.label, type: sources[0].type, x: cx - 180, y: cy, isSource: true });
      nodes.push({ id: sources[1].id, label: sources[1].meta.label, type: sources[1].type, x: cx + 180, y: cy, isSource: true });
    }

    const satellites = Object.values(allNodesMap);
    
    // Sort satellites by type of connection to layout them cleanly
    const shared = satellites.filter(s => s.connectedTo.length === 2);
    const only1 = satellites.filter(s => s.connectedTo.length === 1 && s.connectedTo[0].sourceId === out1);
    const only2 = satellites.filter(s => s.connectedTo.length === 1 && s.connectedTo[0].sourceId === out2);

    // Layout shared in the middle vertically
    shared.forEach((s, i) => {
      // spread them vertically between the two sources
      const yOffset = (i - (shared.length - 1) / 2) * 60;
      nodes.push({ ...s, x: cx, y: cy + yOffset, isSource: false });
    });

    // Layout only1 in a semi-circle around left source
    const rBase1 = 120;
    only1.forEach((s, i) => {
      const angle = Math.PI/2 + (Math.PI / (only1.length + 1)) * (i + 1); // 90 to 270 degrees (left side)
      // Distance inversely proportional to strength
      const dist = rBase1 + (1 - s.totalAbs) * 80;
      nodes.push({ ...s, x: (cx - (sources.length === 2 ? 180 : 0)) + dist * Math.cos(angle), y: cy + dist * Math.sin(angle), isSource: false });
    });

    // Layout only2 in a semi-circle around right source
    const rBase2 = 120;
    only2.forEach((s, i) => {
      const angle = -Math.PI/2 + (Math.PI / (only2.length + 1)) * (i + 1); // -90 to 90 degrees (right side)
      const dist = rBase2 + (1 - s.totalAbs) * 80;
      nodes.push({ ...s, x: (cx + 180) + dist * Math.cos(angle), y: cy + dist * Math.sin(angle), isSource: false });
    });

    return { nodes, links };
  }, [out1, out2, dbMetadata, filteredSetups, dbMap]);

  if (!hasOut1 && !hasOut2) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4l3 3"/>
        </svg>
        <p className="text-sm font-medium tracking-widest">CONECTA UNA VARIABLE PARA VER ASOCIACIONES</p>
      </div>
    );
  }

  if (graphData && graphData.nodes.length === (hasOut1 && hasOut2 ? 2 : 1)) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
        <p className="text-sm font-medium tracking-widest">NO SE ENCONTRARON ASOCIACIONES SIGNIFICATIVAS</p>
      </div>
    );
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      {/* Links */}
      {graphData?.links.map((link, i) => {
        const sourceNode = graphData.nodes.find(n => n.id === link.source);
        const targetNode = graphData.nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return null;

        const isNegative = link.coef < 0;
        const color = link.sourceType === 'out1' ? '#3b82f6' : '#f97316'; // blue-500, orange-500
        const strokeW = 1 + link.absCoef * 5; // thicker if stronger

        return (
          <line
            key={`link-${i}`}
            x1={sourceNode.x} y1={sourceNode.y}
            x2={targetNode.x} y2={targetNode.y}
            stroke={color}
            strokeWidth={strokeW}
            strokeOpacity={isNegative ? 0.3 : 0.7}
            strokeDasharray={isNegative ? "4 4" : "none"}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        );
      })}

      {/* Nodes */}
      {graphData?.nodes.map(node => {
        let fill = "#333";
        let stroke = "#555";
        let size = 6;
        let textY = 16;
        
        if (node.isSource) {
          fill = node.type === 'out1' ? '#3b82f6' : '#f97316';
          stroke = "#FFF";
          size = 12;
          textY = 24;
        } else {
          // secondary node size based on total association
          size = 4 + node.totalAbs * 8;
          textY = size + 10;
        }

        return (
          <g key={node.id} style={{ transform: `translate(${node.x}px, ${node.y}px)` }} className="transition-transform duration-1000 ease-out">
            <circle 
              cx={0} cy={0} 
              r={size} 
              fill={fill} 
              stroke={stroke} 
              strokeWidth={node.isSource ? 2 : 1}
            />
            <text 
              x={0} y={textY} 
              textAnchor="middle" 
              fill={node.isSource ? "#FFF" : "#AAA"} 
              fontSize={node.isSource ? "12px" : "10px"}
              fontWeight={node.isSource ? "bold" : "normal"}
              pointerEvents="none"
              style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.8)" }}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
