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
    } else if (compId === 'mod2-10') { // PestaÃ±as
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

  // 3. Apply EsquemÃ¡tica semantic transformations (Relative mapping, Inversions, Zones)
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

export const calculateGlobalStress = (setup) => {
  if (!setup) return 0.5;
  const values = setup.values || {};
  const demog = setup.demographics || {};
  
  let score = 0;
  let maxPossible = 0;

  const add = (val, max, weight) => {
    if (val === undefined || isNaN(val)) return;
    score += (val / max) * weight;
    maxPossible += weight;
  };

  // 1. Nivel de ansiedad general (0-100)
  add(values['Nivel de ansiedad general'], 100, 3);
  
  // 2. Horas de sueño (Idealmente 8+. Menos es más estrés)
  const sleep = values['Horas sueno habituales'];
  if (sleep !== undefined && !isNaN(sleep)) {
    // 8h = 0 estrés, <= 4h = estrés máximo
    let sleepStress = Math.max(0, Math.min(4, 8 - sleep)) / 4; 
    score += sleepStress * 2;
    maxPossible += 2;
  }

  // 3. Procrastinacion (0-100)
  add(values['Procrastinacion'], 100, 1.5);

  // 4. Sintomas fisicos (booleano)
  const fisicos = values['Sintomas fisicos'];
  if (fisicos !== undefined) {
    add(fisicos === true ? 100 : 0, 100, 2);
  }

  // 5. Horas en RRSS
  const rrss = values['Horas en Redes Sociales'];
  if (rrss !== undefined && !isNaN(rrss)) {
     // max esperado = 8 horas para normalización
     let rrssStress = Math.min(8, rrss) / 8;
     score += rrssStress * 1.5;
     maxPossible += 1.5;
  }

  // 6. Demografía: Tiempo de viaje
  const viaje = demog.tiempoViaje;
  if (viaje) {
     if (viaje === '> 2hrs' || viaje === '>2hrs') { score += 1.5; maxPossible += 1.5; }
     else if (viaje === '1-2hrs') { score += 0.75; maxPossible += 1.5; }
     else { maxPossible += 1.5; } // base agregada pero 0 score
  }

  if (maxPossible === 0) return 0.5; // fallback neutral
  return score / maxPossible; // Retorna un factor entre 0.0 y 1.0
};
