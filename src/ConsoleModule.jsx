import React from 'react';
import ModuleShell from './ModuleShell';
import RotarySwitch from './components/actuators/RotarySwitch';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import LedButton from './components/actuators/LedButton';
import StatusSquare from './components/actuators/StatusSquare';
import { useAppContext } from './contexts/AppContext';
import { useHover } from './contexts/HoverContext';
import { CHANNELS } from './design/channels';

// Figma: data-table-panel (2316:1391) — consola de filtros, 832×149. Medidas en px del frame.
const ROUTE_RING = Object.fromEntries(Object.entries(CHANNELS).map(([id, c]) => [id, `0 0 0 2px ${c.hex}, 0 0 8px rgba(${c.rgb},0.8)`]));

// Lista de opciones de selección única (cuadrado de estado + etiqueta, Figma: Frame 58)
const VerticalPads = ({ options, value, onChange, disabled, compId, gap = 5 }) => {
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
      className={`flex flex-col ${disabled && !isRoutingMode ? 'opacity-muted pointer-events-none' : ''}`}
      style={{ gap }}
      onPointerEnter={() => { if (compId) setHoveredId(compId); }}
      onPointerLeave={() => { if (compId) setHoveredId(null); }}
    >
      {options.map(opt => {
        const isSelected = value === opt.value;
        const lit = routeColor ? true : (!isRoutingMode && isSelected);
        return (
          <div
            key={opt.value}
            className="relative flex items-center gap-[4px] cursor-pointer group select-none"
            onClick={() => {
              if (isRoutingMode && compId) {
                toggleRoutingSource(compId);
              } else if (!isRoutingMode) {
                onChange(isSelected ? null : opt.value);
              }
            }}
          >
            <span className="absolute -inset-y-[2px] -inset-x-[4px]" />
            <StatusSquare on={lit} ring={routeColor ? ROUTE_RING[routeColor] : null} />
            <span className={`type-micro font-light leading-[14px] whitespace-nowrap transition-colors duration-standard ${lit ? 'text-text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}>
              {opt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Selector de modo (Figma: Component 35 — pad de 24 px + nombre en Satori Bold 7 px)
const ModeButton = ({ label, active, onClick }) => (
  <div className="relative w-[39px] h-[38px] shrink-0 cursor-pointer select-none" onClick={onClick} role="button" aria-pressed={active}>
    <span className="absolute -inset-[4px]" />
    <span
      className={`absolute left-0 top-0 w-[24px] h-[24px] rounded-sm border border-border-subtle transition-[background-color,box-shadow] duration-standard ${active ? 'bg-coral-400' : 'bg-surface-subtle hover:bg-coral-200'}`}
      style={{ boxShadow: active ? '6px 8px 20px rgba(45,45,45,0.22), -4px -4px 10px rgba(255,255,255,0.9)' : '2px 2px 5px rgba(45,45,45,0.15), -2px -2px 4px #FFFFFF' }}
    />
    <span className="absolute left-0 top-[24px] font-heading font-bold text-[7px] leading-[14px] text-text-secondary whitespace-nowrap pointer-events-none">{label}</span>
  </div>
);

export default function ConsoleModule({ isCol, saveToDb }) {
  const {
    filters, setFilters, distributions,
    mode, setMode,
  } = useAppContext();

  const isColective = isCol ?? mode === 'colectivo';
  const matchCount = Math.max(0, ...Object.values(distributions || {}).map(arr => arr?.length || 0));

  const modes = [
    { id: 'colectivo', label: 'Colectivo' },
    { id: 'individual', label: 'Individual' },
    { id: 'sandbox', label: 'Especulativo' },
  ];

  const edadOptions = [{ label: '18-22', value: '18-22' }, { label: '23-25', value: '23-25' }, { label: '26-28', value: '26-28' }, { label: '29-32', value: '29-32' }, { label: '+33', value: '33+' }];
  const off = (active) => (active ? '' : 'opacity-muted pointer-events-none');

  return (
    <ModuleShell isCol={isCol} moduleNumber={0}>
      {/* Los filtros se reparten el ancho disponible; modos y Usuarios quedan fijos a la derecha (Figma: gap mínimo 40) */}
      <div className="absolute left-[21px] right-[21px] top-[22px] flex items-start gap-[40px]">
      <div className="flex-1 min-w-0 flex items-start justify-between">

        {/* Promedio (Component 18, 102×108) */}
        <div className="w-[102px] shrink-0 flex flex-col">
          <LedButton variant="group" compId="demo-promedio-led" label="Promedio" value={filters.promedioActivo} onChange={(v) => setFilters(p => ({...p, promedioActivo: v}))} />
          <div className={`relative w-[102px] h-[94px] ${off(filters.promedioActivo)}`}>
            <RotarySwitch
              compId="demo-avg"
              sizeClass="w-[64px]"
              className="!absolute left-[19px] top-[30px]"
              angles={[-45, 0, 45]}
              optionLabels={['zen', 'Promedio', 'estresado']}
              stepIndex={['zen', 'Promedio', 'estresado'].indexOf(filters.promedioNivel)}
              onChange={(idx) => setFilters(p => ({...p, promedioNivel: ['zen', 'Promedio', 'estresado'][idx]}))}
            />
          </div>
        </div>

        {/* Edad */}
        <div className="w-[56px] shrink-0 flex flex-col items-center gap-[16px]">
          <LedButton variant="group" compId="demo-edad-led" label="Edad" value={filters.edadActiva} onChange={(v) => setFilters(p => ({...p, edadActiva: v}))} />
          <div className="w-full">
            <VerticalPads compId="demo-age" gap={4} options={edadOptions} value={filters.edadGroup} onChange={(v) => setFilters(p => ({...p, edadActiva: v !== null, edadGroup: v !== null ? v : p.edadGroup}))} disabled={!filters.edadActiva} />
          </div>
        </div>

        {/* Género y País */}
        <div className="w-[43px] shrink-0 flex flex-col gap-[13px]">
          <div className="flex flex-col gap-[8px]">
            <LedButton variant="group" compId="demo-genero-led" label="Género" value={filters.generoActivo} onChange={(v) => setFilters(p => ({...p, generoActivo: v}))} />
            <div className={off(filters.generoActivo)}>
              <ToggleSwitch compId="demo-gender" sizeClass="w-[30px]" onLabel="F" offLabel="M" value={filters.genero === 'F'} onChange={(v) => setFilters(p => ({...p, genero: v ? 'F' : 'M'}))} />
            </div>
          </div>
          <div className="flex flex-col gap-[8px]">
            <LedButton variant="group" compId="demo-pais-led" label="País" value={filters.paisActivo} onChange={(v) => setFilters(p => ({...p, paisActivo: v}))} />
            <div className={off(filters.paisActivo)}>
              <ToggleSwitch compId="demo-country" sizeClass="w-[30px]" onLabel="Otro" offLabel="Argentina" value={filters.nacionalidad === 'Extranjero'} onChange={(v) => setFilters(p => ({...p, nacionalidad: v ? 'Extranjero' : 'Argentino'}))} />
            </div>
          </div>
        </div>

        {/* Trabajo: Sí/No + Horas + Modalidad */}
        <div className="w-[186px] shrink-0 flex flex-col gap-[16px]">
          <LedButton variant="group" compId="demo-trabaja-led" label="Trabajo" value={filters.trabajaActivo} onChange={(v) => { setFilters(p => { let next = {...p, trabajaActivo: v}; if (!v) { next.horasTrabajoActivo = false; next.modalidadActiva = false; } return next; }); }} />
          <div className="flex items-start justify-center gap-[36px] w-[131px]">
            <div className={off(filters.trabajaActivo)}>
              <ToggleSwitch compId="demo-work" sizeClass="w-[30px]" onLabel="Sí" offLabel="No" value={filters.trabaja === 'SÍ'} onChange={(v) => { setFilters(p => ({...p, trabaja: v ? 'SÍ' : 'NO'})); }} />
            </div>
            <div className="w-[8px] shrink-0 flex flex-col gap-[5px]">
              <span className="type-micro font-light leading-[14px] text-text-muted h-[10px] whitespace-nowrap">Horas</span>
              <VerticalPads compId="demo-hours" options={[{label:'-4', value:'<4'}, {label:'4-6', value:'4-6'}, {label:'6-8', value:'6-8'}, {label:'+8', value:'>8'}]} value={filters.horasTrabajoActivo ? filters.horasTrabajo : null} onChange={(v) => setFilters(p => ({...p, horasTrabajoActivo: v !== null, horasTrabajo: v !== null ? v : p.horasTrabajo}))} disabled={!filters.trabajaActivo || filters.trabaja !== 'SÍ'} />
            </div>
            <div className="w-[8px] shrink-0 flex flex-col gap-[5px]">
              <span className="type-micro font-light leading-[14px] text-text-muted h-[10px] whitespace-nowrap">Modalidad</span>
              <VerticalPads compId="demo-modality" options={[{label:'Presencial', value:'Presencial'}, {label:'Híbrido', value:'Híbrido'}, {label:'Remoto', value:'Remoto'}]} value={filters.modalidadActiva ? filters.modalidad : null} onChange={(v) => setFilters(p => ({...p, modalidadActiva: v !== null, modalidad: v !== null ? v : p.modalidad}))} disabled={!filters.trabajaActivo || filters.trabaja !== 'SÍ'} />
            </div>
          </div>
        </div>

        {/* Viaje */}
        <div className="w-[20px] h-[82px] shrink-0 flex flex-col justify-between">
          <LedButton variant="group" compId="demo-viaje-led" label="Viaje" value={filters.viajeActivo} onChange={(v) => setFilters(p => ({...p, viajeActivo: v}))} />
          <div className="w-[8px]">
            <VerticalPads compId="demo-travel" options={[{label:'-1', value:'<1H'}, {label:'1-2', value:'1-2H'}, {label:'+2', value:'>2H'}]} value={filters.viajeActivo ? filters.tiempoViaje : null} onChange={(v) => setFilters(p => ({...p, viajeActivo: v !== null, tiempoViaje: v !== null ? v : p.tiempoViaje}))} disabled={!filters.viajeActivo} />
          </div>
        </div>

        {/* Vivienda */}
        <div className="w-[32px] shrink-0 flex flex-col justify-center gap-[16px]">
          <LedButton variant="group" compId="demo-vivienda-led" label="Vivienda" value={filters.convivenciaActiva} onChange={(v) => setFilters(p => ({...p, convivenciaActiva: v}))} />
          <div className="w-[8px]">
            <VerticalPads compId="demo-living" options={[{label:'Familia', value:'Familia'}, {label:'Solos', value:'Solo'}, {label:'Con pares', value:'Pares'}]} value={filters.convivenciaActiva ? filters.convivencia : null} onChange={(v) => setFilters(p => ({...p, convivenciaActiva: v !== null, convivencia: v !== null ? v : p.convivencia}))} disabled={!filters.convivenciaActiva} />
          </div>
        </div>

      </div>

        {/* Modos + Usuarios */}
        <div className="w-[121px] shrink-0 flex flex-col items-end justify-center gap-[34px]">
          <div className="relative w-[121px] h-[38px]">
            {modes.map((m, i) => (
              <div key={m.id} className="absolute top-0" style={{ left: i * 41 }}>
                <ModeButton label={m.label} active={mode === m.id} onClick={() => setMode(m.id)} />
              </div>
            ))}
          </div>

          <div className={`relative w-[80px] h-[51px] transition-opacity duration-slow ${isColective ? '' : 'opacity-disabled'}`}>
            <span className="absolute left-[6px] top-0 font-heading font-bold text-[8px] leading-[14px] text-icon-secondary">Usuarios</span>
            <div className="absolute inset-x-0 top-[11px] h-[40px] rounded-md bg-display-foreground flex items-center justify-center" style={{ boxShadow: 'inset 1px 2px 4px rgba(45,45,45,0.22), inset -1px -1px 2px rgba(255,255,255,0.78)' }}>
              <span className="font-body text-[20px] leading-none text-text-muted">{(matchCount || 0).toString().padStart(3, '0')}</span>
            </div>
          </div>
        </div>

      </div>
    </ModuleShell>
  );
}
