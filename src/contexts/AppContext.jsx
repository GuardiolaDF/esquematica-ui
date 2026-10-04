import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { dbMap, reverseDbMap, dbMetadata } from '../dbMap';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [mode, setMode] = useState('colectivo'); // 'colectivo' | 'individual' | 'sandbox'
  const [values, setValues] = useState({});
  const [averages, setAverages] = useState({});
  const [distributions, setDistributions] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [allSetups, setAllSetups] = useState(null);
  const [filteredSetups, setFilteredSetups] = useState([]);

  // Carga inicial (una sola vez) para no tener latencia al filtrar
  useEffect(() => {
    getDocs(collection(db, 'setups')).then(snapshot => {
      const setups = snapshot.docs.map(doc => doc.data());
      setAllSetups(setups);
    }).catch(err => console.error("Error loading setups:", err));
  }, []);
  
  // Demographics filters
  const [filters, setFilters] = useState({
    promedioActivo: false,
    promedioNivel: 'Promedio', // 'zen', 'Promedio', 'estresado'
    edadActiva: false,
    edadGroup: '18-22',
    generoActivo: false,
    genero: 'F',
    trabajaActivo: false,
    trabaja: 'SÍ',
    horasTrabajoActivo: false,
    horasTrabajo: '4-6',
    modalidadActiva: false,
    modalidad: 'Híbrido',
    paisActivo: false,
    nacionalidad: 'Argentino',
    viajeActivo: false,
    tiempoViaje: '1-2H',
    convivenciaActiva: false,
    convivencia: 'Familia',
  });

  const [activePlatform, setActivePlatform] = useState('mod1-10'); // Default to first pad

  const setValue = (id, val) => {
    if (!id) return;
    setValues(prev => ({ ...prev, [id]: val }));
  };

  const fetchAverages = () => {
    if (!allSetups) return;
    setIsLoading(true);
    
    try {
      
      const sums = {};
      const counts = {};
      const rawDist = {};
      const validSetups = [];
      
      allSetups.forEach(data => {
        const demog = data.demographics || {};
        
        // Filtros (si están activos)
        if (filters.promedioActivo) {
          const ansiedad = data.values["Nivel de ansiedad general"];
          if (ansiedad !== undefined) {
            if (filters.promedioNivel === 'zen' && ansiedad > 33) return;
            if (filters.promedioNivel === 'Promedio' && (ansiedad <= 33 || ansiedad > 66)) return;
            if (filters.promedioNivel === 'estresado' && ansiedad <= 66) return;
          }
        }

        if (filters.generoActivo && demog.genero !== filters.genero) return;
        if (filters.paisActivo && demog.nacionalidad !== filters.nacionalidad) return;
        if (filters.edadActiva && demog.edadGroup !== filters.edadGroup) return;
        
        if (filters.trabajaActivo && demog.trabaja !== filters.trabaja) return;
        if (filters.horasTrabajoActivo && filters.trabaja === 'SÍ' && demog.horasTrabajo !== filters.horasTrabajo) return;
        if (filters.modalidadActiva && filters.trabaja === 'SÍ' && demog.modalidad !== filters.modalidad) return;
        
        if (filters.convivenciaActiva && demog.convivencia !== filters.convivencia) return;
        if (filters.viajeActivo && demog.tiempoViaje !== filters.tiempoViaje) return;
        
        validSetups.push(data);
Object.keys(data.values || {}).forEach(dbKey => {
          const compId = reverseDbMap[dbKey];
          if (compId) {
            const val = data.values[dbKey];
            if (!sums[compId]) { sums[compId] = 0; counts[compId] = 0; rawDist[compId] = []; }
            sums[compId] += (typeof val === 'boolean' ? (val ? 100 : 0) : val);
            counts[compId] += 1;
            rawDist[compId].push({ val: typeof val === 'boolean' ? (val ? 100 : 0) : val });
          }
        });
      });

      const avgs = {};
      Object.keys(sums).forEach(compId => {
        avgs[compId] = sums[compId] / counts[compId];
      });
      setAverages(avgs);
      setDistributions(rawDist);
      setFilteredSetups(validSetups);
    } catch (error) {
      console.error("Error calculating averages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when mode changes to colectivo OR filters change OR allSetups loads
  useEffect(() => {
    if (mode === 'colectivo') {
      fetchAverages();
    }
  }, [mode, filters, allSetups]);

  const [showSavedOverlay, setShowSavedOverlay] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    if (mode === 'individual') {
      setValues({});
      setShowSavedOverlay(false);
      setMissingFields([]);
    } else if (mode === 'sandbox') {
      setValues({ ...averages });
      setShowSavedOverlay(false);
    }
  }, [mode, averages]);

  const validateAndSave = async () => {
    // Se exige responder todas las preguntas de los módulos. Quedan afuera: los filtros de la consola (la demografía
    // sale de los filtros; algunos, como carrera o experiencia, no tienen control) y las horas por plataforma
    // (mod1-10…mod1-21), donde no tocar una plataforma significa 0 horas.
    const PLATFORM_HOURS = /^mod1-(1[0-9]|2[01])$/;
    const requiredKeys = Object.keys(dbMap).filter(id => id.startsWith('mod'));
    const missing = requiredKeys.filter(compId => !PLATFORM_HOURS.test(compId) && values[compId] === undefined);
    
    if (missing.length > 0) {
      setMissingFields(missing);
      return 'missing'; // Faltan respuestas (no es un error de envío)
    }
    
    setMissingFields([]);
    setIsSaving(true);
    try {
      const dbValues = {};
      requiredKeys.forEach(compId => {
        dbValues[dbMap[compId]] = values[compId] ?? (PLATFORM_HOURS.test(compId) ? 0 : null);
      });

      await addDoc(collection(db, 'setups'), {
        values: dbValues,
        demographics: {
          edadGroup: filters.edadGroup,
          genero: filters.genero,
          nacionalidad: filters.nacionalidad,
          trabaja: filters.trabaja,
          horasTrabajo: filters.horasTrabajo,
          modalidad: filters.modalidad,
          tiempoViaje: filters.tiempoViaje,
          convivencia: filters.convivencia
        },
        timestamp: new Date()
      });
      
      // Fetch latest
      const snapshot = await getDocs(collection(db, 'setups'));
      setAllSetups(snapshot.docs.map(doc => doc.data()));
      
      setMode('colectivo');
      setShowSavedOverlay(true);
      return true;
    } catch (error) {
      console.error("Error al guardar: ", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const [visualizationMode, setVisualizationMode] = useState('general'); // 'general', 'spectrum', 'relation', 'association'
  const [routingOutputs, setRoutingOutputs] = useState({ out1: null, out2: null });

  // Ruteo con cables (modo colectivo, vistas distintas de General):
  //  · cada vista acepta solo ciertos tipos de dato (dbMetadata[compId].visualizations)
  //  · Espectro muestra una sola variable → una sola entrada (out1)
  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general';
  const maxInputs = visualizationMode === 'spectrum' ? 1 : 2;
  const canRoute = (compId) => {
    const meta = dbMetadata[compId];
    return !!(meta && meta.routable && meta.visualizations?.includes(visualizationMode));
  };
  // Control que no se puede conectar en la vista actual (se muestra atenuado y no responde)
  const isRouteBlocked = (compId) => isRoutingMode && !!compId && compId.startsWith('mod') && !canRoute(compId);

  const toggleRoutingSource = (compId) => {
    if (!canRoute(compId)) return;

    setRoutingOutputs(prev => {
      // Si ya estaba elegido, se suelta
      if (prev.out1 === compId) return { ...prev, out1: null };
      if (prev.out2 === compId) return { ...prev, out2: null };
      // Espectro: una sola entrada, la nueva elección reemplaza a la anterior
      if (maxInputs === 1) return { out1: compId, out2: null };
      if (!prev.out1) return { ...prev, out1: compId };
      if (!prev.out2) return { ...prev, out2: compId };
      return prev;
    });
  };

  // Al cambiar de vista: General suelta todo; en las demás se sueltan las variables que esa vista no acepta
  useEffect(() => {
    if (visualizationMode === 'general') {
      setRoutingOutputs({ out1: null, out2: null });
      return;
    }
    setRoutingOutputs(prev => {
      const keep = (id) => (id && dbMetadata[id]?.visualizations?.includes(visualizationMode) ? id : null);
      const next = { out1: keep(prev.out1), out2: visualizationMode === 'spectrum' ? null : keep(prev.out2) };
      return next.out1 === prev.out1 && next.out2 === prev.out2 ? prev : next;
    });
  }, [visualizationMode]);

  // When switching modes, if we go to individual/sandbox, or visualization mode goes to 'general', we might want to reset routing.
  // Actually, the user says "Al volver a GENERAL, desaparecen los controles de routing y los módulos vuelven a mostrar el estado colectivo general."
  // Routing state can be kept but just hidden, or reset. Let's just keep the state, we will hide the UI.

  return (
    <AppContext.Provider value={{ 
      mode, setMode, 
      values, setValue, 
      averages, 
      distributions,
      allSetups,
      filteredSetups,
      filters, setFilters,
      activePlatform, setActivePlatform,
      saveToDb: validateAndSave, 
      isSaving, 
      isLoading,
      showGrid, setShowGrid,
      showSavedOverlay,
      missingFields,
      visualizationMode, setVisualizationMode,
      routingOutputs, toggleRoutingSource, setRoutingOutputs,
      isRoutingMode, maxInputs, canRoute, isRouteBlocked
    }}>
      {children}
    </AppContext.Provider>
  );
};

