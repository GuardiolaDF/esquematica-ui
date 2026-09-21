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
    const requiredKeys = Object.keys(dbMap);
    const missing = requiredKeys.filter(compId => values[compId] === undefined);
    
    if (missing.length > 0) {
      setMissingFields(missing);
      return false; // Failed
    }
    
    setMissingFields([]);
    setIsSaving(true);
    try {
      const dbValues = {};
      requiredKeys.forEach(compId => {
        dbValues[dbMap[compId]] = values[compId];
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

  const [visualizationMode, setVisualizationMode] = useState('general'); // 'general', 'ranking', 'distribution', 'relation', 'wordcloud'
  const [routingOutputs, setRoutingOutputs] = useState({ out1: null, out2: null });

  const toggleRoutingSource = (compId) => {
    const meta = dbMetadata[compId];
    if (!meta || !meta.routable) return;

    setRoutingOutputs(prev => {
      // If already selected, deselect it
      if (prev.out1 === compId) return { ...prev, out1: null };
      if (prev.out2 === compId) return { ...prev, out2: null };
      
      // If not selected, assign to first available slot
      if (!prev.out1) return { ...prev, out1: compId };
      if (!prev.out2) return { ...prev, out2: compId };
      
      // If full, do nothing
      return prev;
    });
  };

  // Ensure routing clears when going back to 'general'
  useEffect(() => {
    if (visualizationMode === 'general') {
      setRoutingOutputs({ out1: null, out2: null });
    }
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
      filters, setFilters,
      activePlatform, setActivePlatform,
      saveToDb: validateAndSave, 
      isSaving, 
      isLoading,
      showGrid, setShowGrid,
      showSavedOverlay,
      missingFields,
      visualizationMode, setVisualizationMode,
      routingOutputs, toggleRoutingSource, setRoutingOutputs
    }}>
      {children}
    </AppContext.Provider>
  );
};
