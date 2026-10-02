export const directInvertedTracks = [
  'mod2-1', 'mod2-5', 'mod2-6', 'mod2-8', 'mod2-12', 'mod2-17',
  'mod3-5', 'mod3-18'
];

export const counterTracks = ['mod2-9', 'mod2-10', 'mod2-11', 'mod3-6', 'mod3-7'];
export const zonedTracks = ['mod2-1', 'mod3-5'];
export const booleanTracks = ['mod2-5', 'mod2-6', 'mod2-7', 'mod2-8', 'mod2-12', 'mod2-13', 'mod2-14', 'mod3-8', 'mod3-9', 'mod3-10', 'mod3-11', 'mod3-12', 'mod3-13', 'mod3-14', 'mod3-17', 'mod3-18', 'mod3-19'];

// Some tracks might have conceptual domains that we want to preserve in XY charts
const knownDomains = {
  // RotateSwitches conceptually are 1 to 5 options, though they emit 0, 25, 50, 75, 100
  'mod2-1': [1, 5],
  'mod3-5': [1, 5],
};

export const getRelativeValue = (compId, val) => {
  if (counterTracks.includes(compId)) {
    if (compId === 'mod3-6' || compId === 'mod3-7') {
      if (val >= 9) return 10;
      if (val === 8) return 20;
      if (val === 7) return 30;
      if (val === 6) return 45;
      if (val === 5) return 60;
      if (val === 4) return 75;
      if (val === 3) return 85;
      if (val === 2) return 90;
      if (val === 1) return 95;
      if (val === 0) return 98;
    }
    
    if (val === 0) return 2;
    
    let maxRelax = 2, maxInter = 4;
    if (compId === 'mod2-9') { // Programas
      maxRelax = 2; maxInter = 4;
    } else if (compId === 'mod2-10') { // Pestañas
      maxRelax = 4; maxInter = 10;
    } else if (compId === 'mod2-11') { // Archivos
      maxRelax = 5; maxInter = 15;
    }
    
    if (val <= maxRelax) {
      if (maxRelax === 1) return 20;
      return 10 + ((val - 1) / (maxRelax - 1)) * 23; 
    }
    
    if (val <= maxInter) {
      if (maxInter - maxRelax === 1) return 50;
      return 35 + ((val - maxRelax - 1) / (maxInter - maxRelax - 1)) * 31;
    }
    
    const over = val - maxInter; 
    const k = 0.2; 
    return 67 + (31 * (1 - Math.exp(-k * over)));
  }
  return val;
};

export const getZonedValue = (compId, val) => {
  if (zonedTracks.includes(compId)) {
    return 10 + (val / 100) * 80;
  }
  if (booleanTracks.includes(compId)) {
    return val < 50 ? 25 : 75;
  }
  return val;
};

// Unified function that transforms raw DB data into a visualizable object 
// containing the semantically transformed value, and its intended domain.
export const getVisualizableData = (compId, rawVal, metaDataType) => {
  if (rawVal === undefined || rawVal === null) {
    return { value: undefined, min: 0, max: 100 };
  }

  // 1. Initial standardization (e.g. booleans to 0/100)
  let numericVal = typeof rawVal === 'boolean' ? (rawVal ? 100 : 0) : rawVal;

  // 2. Determine raw domain for numerical values
  // By default, scales are 0-100, numerics use their real values unless mapped
  let min = 0;
  let max = 100;
  
  if (metaDataType === 'numeric' && !counterTracks.includes(compId)) {
     // If it's a raw numeric without special mapping (e.g. YouTube hours), 
     // its domain is defined by the data itself, but for a single point we just pass it raw.
     // RelationXY will compute min/max dynamically for numeric types.
  }

  // 3. Apply Esquemática semantic transformations (Relative mapping, Inversions, Zones)
  let processedVal = getRelativeValue(compId, numericVal);
  
  if (directInvertedTracks.includes(compId)) {
    processedVal = 100 - processedVal;
  }
  
  processedVal = getZonedValue(compId, processedVal);

  // 4. If the variable has a known conceptual domain (e.g. 1-5), map the 0-100 value to it.
  if (knownDomains[compId]) {
    min = knownDomains[compId][0];
    max = knownDomains[compId][1];
    processedVal = min + (processedVal / 100) * (max - min);
  }

  return { value: processedVal, min, max };
};

// ─── Lecturas del vúmetro ────────────────────────────────────────────────
// Todas las lecturas usan la misma escala que dibuja el abanico: 0 = + relax, 100 = + estrés.

const clamp100 = (v) => Math.max(0, Math.min(100, v));

// Posición de una respuesta en su carril (incluye zonas e inversiones, igual que el dibujo).
export const stressPercent = (compId, rawVal, dataType) => {
  const v = getVisualizableData(compId, rawVal, dataType);
  if (v.value === undefined || Number.isNaN(v.value)) return undefined;
  return clamp100(((v.value - v.min) / ((v.max - v.min) || 1)) * 100);
};

// Promedio de un carril para un conjunto de respuestas (null si nadie respondió).
export const trackReading = (compId, dbKey, setups, dataType) => {
  let sum = 0; let n = 0;
  (setups || []).forEach((s) => {
    const p = stressPercent(compId, s.values?.[dbKey], dataType);
    if (p !== undefined) { sum += p; n += 1; }
  });
  return n ? { value: sum / n, count: n } : null;
};

// ─── Índice de estrés por persona (0–100) ───────────────────────────────
// Combina las respuestas que mejor describen la carga de cada persona. Sirve para ordenar, dentro de una misma
// respuesta, a quienes contestaron lo mismo: el enjambre deja de formar bloques y pasa a ser un degradé.
// Valor orientado sin zonas: 0 = sin estrés, 100 = máximo (booleanos 0/100, contadores con su curva, inversiones).
const orientedValue = (compId, raw) => {
  if (raw === undefined || raw === null || raw === '') return undefined;
  let v = typeof raw === 'boolean' ? (raw ? 100 : 0) : Number(raw);
  if (Number.isNaN(v)) return undefined;
  v = getRelativeValue(compId, v);
  if (directInvertedTracks.includes(compId)) v = 100 - v;
  return clamp100(v);
};

// [compId, clave en la base, peso]
const STRESS_ANSWERS = [
  ['mod3-16', 'Nivel de ansiedad general', 3],
  ['mod3-6', 'Horas sueno habituales', 2],
  ['mod3-7', 'Horas sueno pre entrega', 1],
  ['mod3-19', 'Sintomas fisicos', 1.5],
  ['mod3-1', 'Trabajo bajo presión', 1],
  ['mod3-4', 'Comparacion con otros', 1],
  ['mod2-16', 'Sindrome impostor', 1],
  ['mod2-3', 'Procrastinacion', 1],
];

// Demografía: mismos textos que usan los filtros de la consola (se toleran variantes de escritura)
const norm = (x) => String(x ?? '').toUpperCase().replace(/\s|HRS|HS|H/g, '');
const workLoad = (d) => {
  const works = norm(d.trabaja);
  if (!works) return undefined;
  if (works.startsWith('NO')) return 0;
  const h = norm(d.horasTrabajo);
  if (h.includes('>8') || h.includes('+8')) return 100;
  if (h.includes('6-8')) return 75;
  if (h.includes('4-6')) return 50;
  if (h.includes('<4') || h.includes('-4')) return 25;
  return 50; // trabaja, sin horas declaradas
};
const travelLoad = (d) => {
  const t = norm(d.tiempoViaje);
  if (!t) return undefined;
  if (t.includes('>2') || t.includes('+2')) return 100;
  if (t.includes('1-2')) return 55;
  if (t.includes('<1') || t.includes('-1')) return 15;
  return undefined;
};

export const stressIndex = (setup) => {
  if (!setup) return null;
  const values = setup.values || {};
  const demog = setup.demographics || {};
  let score = 0; let weight = 0;
  const add = (v, w) => { if (v !== undefined) { score += v * w; weight += w; } };

  STRESS_ANSWERS.forEach(([compId, key, w]) => add(orientedValue(compId, values[key]), w));
  add(workLoad(demog), 1.5);
  add(travelLoad(demog), 1);

  return weight ? score / weight : null;
};

// Compatibilidad: versión 0–1
export const calculateGlobalStress = (setup) => {
  const s = stressIndex(setup);
  return s === null ? 0.5 : s / 100;
};
