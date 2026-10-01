import React from 'react';
import ModuleShell from './ModuleShell';
import RotarySwitch from './components/actuators/RotarySwitch';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import LedButton from './components/actuators/LedButton';
import { useAppContext } from './contexts/AppContext';
import { useHover } from './contexts/HoverContext';

const LBL_UP = "absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-synth-ink-light font-body font-medium whitespace-nowrap pointer-events-none";

const VerticalPads = ({ options, value, onChange, disabled, compId }) => {
  const { setHoveredId } = useHover();
  const { mode, visualizationMode, routingOutputs, toggleRoutingSource } = useAppContext();
  
  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general';
  let routeColor = null;
  if (isRoutingMode && compId) {
    if (routingOutputs.out1 === compId) routeColor = 'synth-accent';
    else if (routingOutputs.out2 === compId) routeColor = 'blue-500';
  }

  return (
    <div 
      className={`flex flex-col gap-[7px] w-full ${disabled && !isRoutingMode ? 'opacity-50 pointer-events-none' : ''}`}
      onMouseEnter={() => { if (compId) setHoveredId(compId); }}
      onMouseLeave={() => { if (compId) setHoveredId(null); }}
    >
      {options.map(opt => {
        const isSelected = value === opt.value;
        let boxClass = isSelected ? 'bg-synth-ink-dark shadow-neo-in' : 'bg-synth-surface border-[0.5px] border-synth-border-light shadow-neo-out';
        
        if (routeColor) {
          boxClass = `bg-${routeColor} shadow-neo-in`;
        } else if (isRoutingMode) {
          boxClass = 'bg-synth-surface border-[0.5px] border-synth-border-light shadow-neo-out';
        }

        return (
          <div 
            key={opt.value} 
            className="flex items-center gap-1.5 cursor-pointer group" 
            onClick={() => {
              if (isRoutingMode && compId) {
                toggleRoutingSource(compId);
              } else if (!isRoutingMode) {
                onChange(isSelected ? null : opt.value);
              }
            }}
          >
            <div className={`w-[10px] h-[10px] shrink-0 rounded-[2px] transition-all flex items-center justify-center ${boxClass}`}>
               {isSelected && <div className="w-[4px] h-[4px] bg-synth-accent rounded-full shadow-[0_0_4px_#ff9479]"></div>}
            </div>
            <span className={`text-[8px] font-sans font-bold whitespace-nowrap transition-colors ${isSelected || routeColor ? 'text-synth-ink-dark' : 'text-synth-ink-light group-hover:text-synth-ink-base'}`}>
              {opt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ConsoleModule({ isCol, saveToDb }) {
  const { 
    filters, setFilters, distributions, 
    mode, setMode,
    isSaving, missingFields
  } = useAppContext();
  
  const matchCount = Math.max(0, ...Object.values(distributions || {}).map(arr => arr?.length || 0));
  
  const modes = [
    { id: 'colectivo', label: 'COLECTIVO' },
    { id: 'individual', label: 'INDIVIDUAL' },
    { id: 'sandbox', label: 'Y SI...?' },
  ];

  const edadOptions = ['18-22', '23-25', '26-28', '29-32', '33+'];

  return (
    <ModuleShell isCol={isCol} moduleNumber={0}>
      <div className="w-full h-full relative flex flex-col pt-[10px] pb-[14px] px-[24px]">
        
        <div className="w-full flex-1 flex flex-row justify-between items-end pb-[4px]">
          
          <div className="w-[7.6%] h-full flex flex-col gap-[5px]">
            <LedButton compId="demo-promedio-led" label="PROMEDIO" labelClass={LBL_UP} baseClass="w-[12px] h-[12px]" value={filters.promedioActivo} onChange={(v) => setFilters(p => ({...p, promedioActivo: v}))} />
            <div className={`w-full mt-auto mb-4 ${!filters.promedioActivo ? 'opacity-50 pointer-events-none' : ''}`}>
              <RotarySwitch compId="demo-avg" sizeClass="w-[90%] aspect-square" angles={[-45, 0, 45]} optionLabels={['zen', 'Promedio', 'estresado']} stepIndex={['zen', 'Promedio', 'estresado'].indexOf(filters.promedioNivel)} onChange={(idx) => setFilters(p => ({...p, promedioNivel: ['zen', 'Promedio', 'estresado'][idx]}))} />
            </div>
          </div>

          <div className="w-[30.9%] h-full flex flex-row justify-between">
            <div className="w-[37.6%] flex flex-col gap-[5px]">
              <LedButton compId="demo-edad-led" label="EDAD" labelClass={LBL_UP} baseClass="w-[12px] h-[12px]" value={filters.edadActiva} onChange={(v) => setFilters(p => ({...p, edadActiva: v}))} />
              <div className="mt-auto">
                <VerticalPads compId="demo-age" options={edadOptions.map(o=>({label:o, value:o}))} value={filters.edadGroup} onChange={(v) => setFilters(p => ({...p, edadActiva: v !== null, edadGroup: v !== null ? v : p.edadGroup}))} disabled={!filters.edadActiva} />
              </div>
            </div>
            <div className="w-[15.7%] flex flex-col gap-[5px]">
              <LedButton compId="demo-genero-led" label="GÉNERO" labelClass={LBL_UP} baseClass="w-[12px] h-[12px]" value={filters.generoActivo} onChange={(v) => setFilters(p => ({...p, generoActivo: v}))} />
              <div className={`mt-auto h-[12px] w-full ${!filters.generoActivo ? 'opacity-50 pointer-events-none' : ''}`}>
                 <ToggleSwitch compId="demo-gender" sizeClass="h-full aspect-[2/1]" onLabel="F" offLabel="M" value={filters.genero === 'F'} onChange={(v) => setFilters(p => ({...p, genero: v ? 'F' : 'M'}))} />
              </div>
            </div>
            <div className="w-[14.8%] flex flex-col gap-[5px]">
              <LedButton compId="demo-pais-led" label="PAÍS" labelClass={LBL_UP} baseClass="w-[12px] h-[12px]" value={filters.paisActivo} onChange={(v) => setFilters(p => ({...p, paisActivo: v}))} />
              <div className={`mt-auto h-[12px] w-full ${!filters.paisActivo ? 'opacity-50 pointer-events-none' : ''}`}>
                 <ToggleSwitch compId="demo-country" sizeClass="h-full aspect-[2/1]" onLabel="Otro" offLabel="Argentina" value={filters.nacionalidad === 'Extranjero'} onChange={(v) => setFilters(p => ({...p, nacionalidad: v ? 'Extranjero' : 'Argentino'}))} />
              </div>
            </div>
          </div>

          <div className="w-[11.2%] h-full flex flex-row justify-between">
            <div className="w-[44.3%] flex flex-col gap-[5px]">
              <LedButton compId="demo-trabaja-led" label="TRABAJO" labelClass={LBL_UP} baseClass="w-[12px] h-[12px]" value={filters.trabajaActivo} onChange={(v) => { setFilters(p => { let next = {...p, trabajaActivo: v}; if (!v) { next.horasTrabajoActivo = false; next.modalidadActiva = false; } return next; }); }} />
              <div className={`mt-auto h-[12px] w-[90%] ${!filters.trabajaActivo ? 'opacity-50 pointer-events-none' : ''}`}>
                 <ToggleSwitch compId="demo-work" sizeClass="h-full aspect-[2/1]" onLabel="si" offLabel="no" value={filters.trabaja === 'SÍ'} onChange={(v) => { setFilters(p => ({...p, trabaja: v ? 'SÍ' : 'NO'})); }} />
              </div>
            </div>
            <div className="w-[31.8%] flex flex-col gap-[5px]">
              <span className={LBL_UP.replace('absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2', '')}>HORAS</span>
              <div className="mt-auto">
                <VerticalPads compId="demo-hours" options={[{label:'< 4', value:'<4'}, {label:'4-6', value:'4-6'}, {label:'6-8', value:'6-8'}, {label:'>8', value:'>8'}]} value={filters.horasTrabajoActivo ? filters.horasTrabajo : null} onChange={(v) => setFilters(p => ({...p, horasTrabajoActivo: v !== null, horasTrabajo: v !== null ? v : p.horasTrabajo}))} disabled={!filters.trabajaActivo || filters.trabaja !== 'SÍ'} />
              </div>
            </div>
          </div>

          <div className="w-[19.1%] h-full flex flex-row justify-between">
            <div className="w-[30%] flex flex-col gap-[5px]">
              <span className={LBL_UP.replace('absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2', '')}>MODALIDAD</span>
              <div className="mt-auto">
                <VerticalPads compId="demo-modality" options={[{label:'presencial', value:'Presencial'}, {label:'híbrido', value:'Híbrido'}, {label:'remoto', value:'Remoto'}]} value={filters.modalidadActiva ? filters.modalidad : null} onChange={(v) => setFilters(p => ({...p, modalidadActiva: v !== null, modalidad: v !== null ? v : p.modalidad}))} disabled={!filters.trabajaActivo || filters.trabaja !== 'SÍ'} />
              </div>
            </div>
            <div className="w-[19.3%] flex flex-col gap-[5px]">
              <LedButton compId="demo-viaje-led" label="VIAJE" labelClass={LBL_UP} baseClass="w-[12px] h-[12px]" value={filters.viajeActivo} onChange={(v) => setFilters(p => ({...p, viajeActivo: v}))} />
              <div className="mt-auto">
                <VerticalPads compId="demo-travel" options={[{label:'<1hr', value:'<1H'}, {label:'1-2hra', value:'1-2H'}, {label:'>2hrs', value:'>2H'}]} value={filters.viajeActivo ? filters.tiempoViaje : null} onChange={(v) => setFilters(p => ({...p, viajeActivo: v !== null, tiempoViaje: v !== null ? v : p.tiempoViaje}))} disabled={!filters.viajeActivo} />
              </div>
            </div>
            <div className="w-[27.3%] flex flex-col gap-[5px]">
              <LedButton compId="demo-vivienda-led" label="VIVIENDA" labelClass={LBL_UP} baseClass="w-[12px] h-[12px]" value={filters.convivenciaActiva} onChange={(v) => setFilters(p => ({...p, convivenciaActiva: v}))} />
              <div className="mt-auto">
                <VerticalPads compId="demo-living" options={[{label:'Familia', value:'Familia'}, {label:'Solo/a', value:'Solo'}, {label:'con pares', value:'Pares'}]} value={filters.convivenciaActiva ? filters.convivencia : null} onChange={(v) => setFilters(p => ({...p, convivenciaActiva: v !== null, convivencia: v !== null ? v : p.convivencia}))} disabled={!filters.convivenciaActiva} />
              </div>
            </div>
          </div>

          <div className="w-[13.4%] h-full flex flex-col justify-between items-end">
            <div className="w-full flex flex-row justify-between">
              {modes.map(m => (
                <div key={m.id} className="flex flex-col items-center gap-[4px]">
                  <span className="text-[6px] font-sans font-bold text-synth-ink-base uppercase">{m.label}</span>
                  <div className={`w-[14px] h-[14px] rounded-[3px] transition-all cursor-pointer flex items-center justify-center ${mode === m.id ? 'bg-synth-ink-dark shadow-neo-in' : 'bg-synth-surface border-[0.5px] border-synth-border-light shadow-neo-out'}`} onClick={() => setMode(m.id)}>
                    {mode === m.id && <div className="w-[6px] h-[6px] bg-synth-accent rounded-full shadow-[0_0_4px_#ff9479]"></div>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={`w-[80%] aspect-[80/51] bg-synth-module shadow-neo-in border-[1.5px] border-synth-border-light rounded-[10px] flex flex-col items-center justify-center relative mt-auto ${!isCol ? 'opacity-30' : ''}`}>
               <span className="text-synth-ink-light text-[8px] font-sans font-bold uppercase mb-1">Usuarios</span>
               <span className="text-synth-ink-dark font-heading text-3xl tracking-wider leading-none">
                 {(matchCount || 0).toString().padStart(3, '0')}
               </span>
            </div>
          </div>
          
        </div>
      </div>
    </ModuleShell>
  );
}
