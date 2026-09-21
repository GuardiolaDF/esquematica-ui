import React from 'react';
import ModuleShell from './ModuleShell';
import RotarySwitch from './components/actuators/RotarySwitch';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import LedButton from './components/actuators/LedButton';
import { useAppContext } from './contexts/AppContext';

import { useHover } from './contexts/HoverContext';

const LBL_UP = "absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";

const VerticalPads = ({ options, value, onChange, disabled, compId }) => {
  const { setHoveredId } = useHover();
  const { mode, visualizationMode, routingOutputs, toggleRoutingSource } = useAppContext();
  
  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general';
  let routeColor = null;
  if (isRoutingMode && compId) {
    if (routingOutputs.out1 === compId) routeColor = 'blue-500';
    else if (routingOutputs.out2 === compId) routeColor = 'orange-500';
  }

  return (
    <div 
      className={`flex flex-col gap-[7px] w-full ${disabled && !isRoutingMode ? 'pointer-events-none' : ''}`}
      onMouseEnter={() => { if (compId) setHoveredId(compId); }}
      onMouseLeave={() => { if (compId) setHoveredId(null); }}
    >
      {options.map(opt => {
        const isSelected = value === opt.value;
        let boxClass = isSelected ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-[#555] border border-[#444]';
        
        if (routeColor) {
          boxClass = `bg-${routeColor} shadow-[0_0_8px_rgba(${routeColor === 'blue-500' ? '59,130,246' : '249,115,22'},0.8)]`;
        } else if (isRoutingMode) {
          boxClass = 'bg-[#333] border border-[#555]'; // Deselected state in routing mode
        }

        return (
          <div 
            key={opt.value} 
            className="flex items-center gap-1.5 cursor-pointer" 
            onClick={() => {
              if (isRoutingMode && compId) {
                toggleRoutingSource(compId);
              } else if (!isRoutingMode) {
                onChange(isSelected ? null : opt.value);
              }
            }}
          >
            <div className={`w-[10px] h-[10px] shrink-0 rounded-[2px] transition-all ${boxClass}`}></div>
            <span className={`text-[7.5px] font-sans whitespace-nowrap transition-colors ${isSelected || routeColor ? 'text-white font-bold' : (disabled && !isRoutingMode ? 'text-[#666]' : 'text-[#999]')}`}>{opt.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const BASE_TXT = "text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";
const HEADER_TXT = `absolute top-[2px] ${BASE_TXT}`;

export default function ConsoleModule({ isCol, saveToDb }) {
  const { 
    mode, 
    setMode, 
    filters, 
    setFilters, 
    distributions,
    saveToDb: saveToDbFromContext, 
    isSaving,
    showGrid, 
    setShowGrid,
    missingFields
  } = useAppContext();
  const matchCount = Math.max(0, ...Object.values(distributions || {}).map(arr => arr?.length || 0));
  
  const modes = [
    { id: 'colectivo', label: 'COLECTIVO', col: 20 },
    { id: 'individual', label: 'INDIVIDUAL', col: 22 },
    { id: 'sandbox', label: 'Y SI...?', col: 24 },
  ];

  const edadOptions = ['18-22', '23-25', '26-28', '29-32', '33+'];

  return (
    <ModuleShell isCol={isCol} moduleNumber={0}>
      <div className="w-full h-full relative">
        
        {/* GRILLA DE COORDENADAS PARA LA CONSOLA - VINCULADA AL BOTON MAGENTA */}
        {/*
        {showGrid && (
          <div className="absolute inset-0 grid grid-cols-[repeat(24,minmax(0,1fr))] grid-rows-3 p-[8px] gap-[2px] pointer-events-none z-0">
            {[1, 2, 3].map((row, rIdx) => 
              Array.from({length: 24}).map((_, cIdx) => {
                const colLetter = String.fromCharCode(65 + cIdx); // A, B, C... X
                return (
                  <div 
                    key={`coord-cons-${colLetter}${row}`} 
                    style={{ gridColumnStart: cIdx + 1, gridRowStart: rIdx + 1 }}
                    className="bg-[#FF00FF]/15 flex items-start justify-start p-[2px] pointer-events-none rounded-[1px] z-0"
                  >
                    <span className="text-[7px] font-mono font-bold text-[#FF00FF] opacity-70 leading-none">
                      {colLetter}{row}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
        */}

        {/* CONTENIDO PRINCIPAL EN GRILLA ESTRICTA 24x3 */}
        <div className="absolute inset-0 grid grid-cols-[repeat(24,minmax(0,1fr))] grid-rows-3 p-[8px] gap-[2px] z-10">
          
          {/* MODES: colectivo: T1 (20), individual: V1 (22), sandbox: X1 (24) */}
          {modes.map((m) => {
            return (
              <div 
                key={m.id} 
                style={{ gridColumnStart: m.col, gridRowStart: 1 }} 
                className="flex flex-col items-center justify-center relative w-full h-full z-20"
              >
                <span className={`${HEADER_TXT} left-1/2 -translate-x-1/2`}>{m.label}</span>
                <div 
                  className={`w-full aspect-square rounded-[20%] cursor-pointer flex items-center justify-center transition-all ${
                    mode === m.id 
                      ? 'bg-[#E5E5E5] shadow-[0_0_15px_rgba(255,255,255,0.8)] border border-white' 
                      : 'bg-[#888] shadow-md border border-transparent'
                  }`}
                  onClick={() => setMode(m.id)}
                >
                  {mode === m.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                  )}
                </div>
              </div>
            );
          })}

          {/* FILTROS DEMOGRÁFICOS */}

          {/* --- ROW 1: CABECERAS Y LEDs (ALINEADOS AL BORDE IZQUIERDO DE LA CELDA) --- */}
          
          {/* PROMEDIO (Cols 2-3) */}
          <div style={{ gridColumnStart: 2, gridColumnEnd: 4, gridRowStart: 1 }} className="flex flex-col items-start justify-end pb-[4px] relative w-full h-full z-20">
             <span className={HEADER_TXT}>Promedio</span>
             <LedButton compId="demo-avg" baseClass="w-[12px] h-[12px] rounded-full" value={filters.promedioActivo} onChange={(v) => setFilters(p => ({...p, promedioActivo: v}))} />
          </div>

          {/* EDAD (Col E = 5) */}
          <div style={{ gridColumnStart: 5, gridRowStart: 1 }} className="flex flex-col items-start justify-end pb-[4px] relative w-full h-full z-20">
             <span className={`${HEADER_TXT} left-0`}>Edad</span>
             <LedButton compId="demo-age" baseClass="w-[12px] h-[12px] rounded-full" value={filters.edadActiva} onChange={(v) => setFilters(p => ({...p, edadActiva: v}))} />
          </div>

          {/* GÉNERO (Col G = 7) */}
          <div style={{ gridColumnStart: 7, gridRowStart: 1 }} className="flex flex-col items-start justify-end pb-[4px] relative w-full h-full z-20">
             <span className={`${HEADER_TXT} left-0`}>Género</span>
             <LedButton compId="demo-gender" baseClass="w-[12px] h-[12px] rounded-full" value={filters.generoActivo} onChange={(v) => setFilters(p => ({...p, generoActivo: v}))} />
          </div>

          {/* TRABAJO (Col I = 9) */}
          <div style={{ gridColumnStart: 9, gridRowStart: 1 }} className="flex flex-col items-start justify-end pb-[4px] relative w-full h-full z-20">
             <span className={`${HEADER_TXT} left-0`}>Trabajo</span>
             <LedButton compId="demo-work" baseClass="w-[12px] h-[12px] rounded-full" value={filters.trabajaActivo} onChange={(v) => {
                  setFilters(p => { let next = {...p, trabajaActivo: v}; if (!v || p.trabaja === 'NO') { next.horasTrabajoActivo = false; next.modalidadActiva = false; } return next; });
             }} />
          </div>

          {/* HORAS (Col J = 10) */}
          <div style={{ gridColumnStart: 10, gridRowStart: 1 }} className="flex flex-col items-start justify-end pb-[4px] relative w-full h-full z-20">
             <span className={`${HEADER_TXT} left-0`}>horas</span>
          </div>

          {/* MODALIDAD (Col L = 12) */}
          <div style={{ gridColumnStart: 12, gridRowStart: 1 }} className="flex flex-col items-start justify-end pb-[4px] relative w-full h-full z-20">
             <span className={`${HEADER_TXT} left-0`}>modalidad</span>
          </div>

          {/* VIAJE (Col O = 15) */}
          <div style={{ gridColumnStart: 15, gridRowStart: 1 }} className="flex flex-col items-start justify-end pb-[4px] relative w-full h-full z-20">
             <span className={`${HEADER_TXT} left-0`}>Viaje</span>
             <LedButton compId="demo-travel" baseClass="w-[12px] h-[12px] rounded-full" value={filters.viajeActivo} onChange={(v) => setFilters(p => ({...p, viajeActivo: v}))} />
          </div>

          {/* VIVIENDA (Col Q = 17) */}
          <div style={{ gridColumnStart: 17, gridRowStart: 1 }} className="flex flex-col items-start justify-end pb-[4px] relative w-full h-full z-20">
             <span className={`${HEADER_TXT} left-0`}>Vivienda</span>
             <LedButton compId="demo-living" baseClass="w-[12px] h-[12px] rounded-full" value={filters.convivenciaActiva} onChange={(v) => setFilters(p => ({...p, convivenciaActiva: v}))} />
          </div>

          {/* BOTÓN ENVIAR (Col V-W = 22-23, Row 2) */}
          {mode === 'individual' && (
            <div style={{ gridColumnStart: 22, gridColumnEnd: 24, gridRowStart: 2 }} className="flex items-center justify-center z-20 w-full h-full pt-[4px]">
              <div 
                className="w-full h-full max-h-[16px] bg-[#333] cursor-pointer rounded flex items-center justify-center border border-[#555] hover:bg-amber-500 hover:border-white shadow-md active:scale-95 transition-all"
                onClick={() => saveToDbFromContext()}
              >
                <span className="text-white text-[7px] font-bold uppercase tracking-widest pointer-events-none">
                  {isSaving ? 'ENVIANDO' : 'ENVIAR'}
                </span>
              </div>
            </div>
          )}
          {missingFields?.length > 0 && mode === 'individual' && (
            <div style={{ gridColumnStart: 22, gridColumnEnd: 25, gridRowStart: 2 }} className="flex items-end justify-center z-20 w-full h-full pb-0 pointer-events-none">
              <span className="text-red-500 text-[5px] uppercase font-bold text-center leading-tight">Faltan<br/>datos</span>
            </div>
          )}


          {/* --- ROW 2 & 3: COMPONENTES FÍSICOS (ALINEADOS AL BORDE IZQUIERDO DE LA CELDA) --- */}

          {/* PROMEDIO (Rotary): Cols 2-3 */}
          <div style={{ gridColumnStart: 2, gridColumnEnd: 4, gridRowStart: 2 }} className="flex flex-col items-start justify-center relative w-full h-full">
             <div className={`relative flex flex-col items-center justify-center w-[90%] ${!filters.promedioActivo ? 'pointer-events-none' : ''}`}>
                <RotarySwitch compId="demo-avg" sizeClass="w-full aspect-square" angles={[45, 90, 135]} optionLabels={['zen', 'Promedio', 'estresado']} stepIndex={['zen', 'Promedio', 'estresado'].indexOf(filters.promedioNivel)} onChange={(idx) => setFilters(p => ({...p, promedioNivel: ['zen', 'Promedio', 'estresado'][idx]}))} />
             </div>
          </div>

          {/* EDAD (Pads): Col E = 5 */}
          <div style={{ gridColumnStart: 5, gridRowStart: 2, gridRowEnd: 4 }} className="flex flex-col items-start justify-start pt-[6px] w-full h-full">
             <VerticalPads compId="demo-age" options={edadOptions.map(o=>({label:o, value:o}))} value={filters.edadGroup} onChange={(v) => setFilters(p => ({...p, edadActiva: v !== null, edadGroup: v !== null ? v : p.edadGroup}))} disabled={!filters.edadActiva} />
          </div>

          {/* GÉNERO (Switch en top de G2) + PAÍS LED (en bottom de G2): Col G = 7 */}
          <div style={{ gridColumnStart: 7, gridRowStart: 2 }} className="flex flex-col items-start justify-between relative w-full h-full">
             <div className={`h-[12px] w-[90%] pt-[2px] ${!filters.generoActivo ? 'pointer-events-none' : ''}`}>
                <ToggleSwitch compId="demo-gender" sizeClass="h-full aspect-[2/1]" onLabel="F" offLabel="M" value={filters.genero === 'F'} onChange={(v) => setFilters(p => ({...p, genero: v ? 'F' : 'M'}))} />
             </div>
             <div className="flex flex-col items-start justify-end pb-0">
                <span className={BASE_TXT}>País</span>
                <LedButton compId="demo-country" baseClass="w-[12px] h-[12px] rounded-full" value={filters.paisActivo} onChange={(v) => setFilters(p => ({...p, paisActivo: v}))} />
             </div>
          </div>

          {/* PAÍS (Switch en top de G3): Col G = 7 */}
          <div style={{ gridColumnStart: 7, gridRowStart: 3 }} className="flex flex-col items-start justify-start pt-[2px] w-full h-full">
             <div className={`h-[12px] w-[90%] ${!filters.paisActivo ? 'pointer-events-none' : ''}`}>
                <ToggleSwitch compId="demo-country" sizeClass="h-full aspect-[2/1]" onLabel="Otro" offLabel="Argentina" value={filters.nacionalidad === 'Extranjero'} onChange={(v) => setFilters(p => ({...p, nacionalidad: v ? 'Extranjero' : 'Argentino'}))} />
             </div>
          </div>

          {/* TRABAJO (Switch): Col I = 9 */}
          <div style={{ gridColumnStart: 9, gridRowStart: 2 }} className="flex flex-col items-start justify-start pt-[6px] relative w-full h-full">
             <div className={`h-[12px] w-[90%] ${!filters.trabajaActivo ? 'pointer-events-none' : ''}`}>
                <ToggleSwitch compId="demo-work" sizeClass="h-full aspect-[2/1]" onLabel="si" offLabel="no" value={filters.trabaja === 'SÍ'} onChange={(v) => {
                  setFilters(p => {
                    let next = {...p, trabaja: v ? 'SÍ' : 'NO'};
                    if (!v) { next.horasTrabajoActivo = false; next.modalidadActiva = false; }
                    return next;
                  });
                }} />
             </div>
          </div>

          {/* HORAS (Pads): Col J = 10 */}
          <div style={{ gridColumnStart: 10, gridRowStart: 2, gridRowEnd: 4 }} className="flex flex-col items-start justify-start pt-[6px] w-full h-full">
             <VerticalPads 
                compId="demo-hours"
                options={[{label:'< 4', value:'<4'}, {label:'4-6', value:'4-6'}, {label:'6-8', value:'6-8'}, {label:'>8', value:'>8'}]} 
                value={filters.horasTrabajoActivo ? filters.horasTrabajo : null} 
                onChange={(v) => setFilters(p => ({...p, horasTrabajoActivo: v !== null, horasTrabajo: v !== null ? v : p.horasTrabajo}))} 
                disabled={!filters.trabajaActivo || filters.trabaja !== 'SÍ'} 
             />
          </div>

          {/* MODALIDAD (Pads): Col L = 12 */}
          <div style={{ gridColumnStart: 12, gridRowStart: 2, gridRowEnd: 4 }} className="flex flex-col items-start justify-start pt-[6px] w-full h-full">
             <VerticalPads 
                compId="demo-modality"
                options={[{label:'presencial', value:'Presencial'}, {label:'híbrido', value:'Híbrido'}, {label:'remoto', value:'Remoto'}]} 
                value={filters.modalidadActiva ? filters.modalidad : null} 
                onChange={(v) => setFilters(p => ({...p, modalidadActiva: v !== null, modalidad: v !== null ? v : p.modalidad}))} 
                disabled={!filters.trabajaActivo || filters.trabaja !== 'SÍ'} 
             />
          </div>

          {/* VIAJE (Pads): Col O = 15 */}
          <div style={{ gridColumnStart: 15, gridRowStart: 2, gridRowEnd: 4 }} className="flex flex-col items-start justify-start pt-[6px] w-full h-full">
             <VerticalPads 
                compId="demo-travel"
                options={[{label:'<1hr', value:'<1H'}, {label:'1-2hra', value:'1-2H'}, {label:'>2hrs', value:'>2H'}]} 
                value={filters.viajeActivo ? filters.tiempoViaje : null} 
                onChange={(v) => setFilters(p => ({...p, viajeActivo: v !== null, tiempoViaje: v !== null ? v : p.tiempoViaje}))} 
                disabled={!filters.viajeActivo} 
             />
          </div>

          {/* VIVIENDA (Pads): Col Q = 17 */}
          <div style={{ gridColumnStart: 17, gridRowStart: 2, gridRowEnd: 4 }} className="flex flex-col items-start justify-start pt-[6px] w-full h-full">
             <VerticalPads 
                compId="demo-living"
                options={[{label:'Familia', value:'Familia'}, {label:'Solo/a', value:'Solo'}, {label:'con pares', value:'Pares'}]} 
                value={filters.convivenciaActiva ? filters.convivencia : null} 
                onChange={(v) => setFilters(p => ({...p, convivenciaActiva: v !== null, convivencia: v !== null ? v : p.convivencia}))} 
                disabled={!filters.convivenciaActiva} 
             />
          </div>

          {/* --- PANEL DERECHO: LCD FILTRADOS --- */}
          {/* Celdas V3, W3, X3 -> Cols 22, 23, 24, Row 3 */}
          <div style={{ gridColumnStart: 22, gridColumnEnd: 25, gridRowStart: 3 }} className={`flex items-center justify-center z-10 w-full h-full ${!isCol ? 'opacity-20' : ''}`}>
            <div className="w-full h-full bg-[#111] rounded shadow-inner border border-[#222] flex items-center justify-center relative">
              <span className="absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none">ALUMNOS MATCH</span>
              <span className="text-amber-500 font-mono text-4xl tracking-widest drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                {(matchCount || 0).toString().padStart(3, '0')}
              </span>
            </div>
          </div>

        </div>
      </div>
    </ModuleShell>
  );
}
