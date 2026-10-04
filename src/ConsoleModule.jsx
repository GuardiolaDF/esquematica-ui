import React, { useEffect, useState } from 'react';
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
  const { mode, visualizationMode, routingOutputs, toggleRoutingSource, canRoute } = useAppContext();

  // Solo se rutea si la variable es conectable en esta vista; si no, el pad sigue funcionando como filtro
  const isRoutingMode = mode === 'colectivo' && visualizationMode !== 'general' && !!compId && canRoute(compId);
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

// Solapas de modo: sobresalen del borde superior del panel de control, en el centro, como las fichas de un fichero.
// La activa tiene el mismo fondo que el panel y se funde con él; las otras quedan detrás, más bajas y apagadas.
const MODE_TABS = [
  { id: 'colectivo', label: 'Colectivo' },
  { id: 'individual', label: 'Individual' },
  { id: 'sandbox', label: 'Especulativo' },
];

const ModeTabs = ({ mode, setMode }) => (
  <div role="tablist" aria-label="Modo" className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%-3px)] z-20 flex items-end gap-[3px]">
    {MODE_TABS.map((m) => {
      const active = mode === m.id;
      return (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => setMode(m.id)}
          className={`relative w-[112px] flex items-center justify-center gap-[7px] rounded-t-lg font-heading font-bold text-[11px] leading-none uppercase tracking-label select-none cursor-pointer transition-[height,background-color,color] duration-standard focus-visible:outline-none focus-visible:shadow-focus-soft ${
            active
              ? 'h-[33px] pb-[3px] bg-background-base text-text-primary'
              : 'h-[26px] pb-[3px] bg-neutral-200 text-text-muted hover:text-text-secondary hover:bg-neutral-100'
          }`}
          style={{
            // La activa se separa del vúmetro (mismo color de fondo) con un filo fino y una sombra que solo sube y se abre
            // a los lados, para que siga fundida con el panel por abajo. Las otras quedan hundidas.
            boxShadow: active
              ? '0 -1px 0 var(--neutral-300), -1px 0 0 var(--neutral-300), 1px 0 0 var(--neutral-300), 0 -4px 8px -1px rgba(45,45,45,0.20), -4px -2px 6px -2px rgba(45,45,45,0.12), 4px -2px 6px -2px rgba(45,45,45,0.12)'
              : 'inset 0 -4px 6px -4px rgba(45,45,45,0.18)',
          }}
        >
          <span className={`w-[7px] h-[7px] rounded-xs border border-border-subtle transition-colors duration-standard ${active ? 'bg-coral-400' : 'bg-surface-subtle'}`} />
          {m.label}
        </button>
      );
    })}
  </div>
);

export default function ConsoleModule({ isCol, compact = false }) {
  const {
    filters, setFilters, distributions,
    mode, setMode,
    saveToDb, isSaving, missingFields,
  } = useAppContext();
  const [saveFailed, setSaveFailed] = useState(false);
  const missingCount = missingFields?.length || 0;
  const handleSave = async () => {
    if (isSaving) return;
    setSaveFailed(false);
    const ok = await saveToDb();
    // 'missing' → el botón ya muestra cuántos datos faltan; false → falló el envío (red, permisos)
    if (ok === false) setSaveFailed(true);
  };
  // El aviso se limpia al seguir completando
  useEffect(() => { setSaveFailed(false); }, [mode]);

  const isColective = isCol ?? mode === 'colectivo';
  const matchCount = Math.max(0, ...Object.values(distributions || {}).map(arr => arr?.length || 0));

  const edadOptions = [{ label: '18-22', value: '18-22' }, { label: '23-25', value: '23-25' }, { label: '26-28', value: '26-28' }, { label: '29-32', value: '29-32' }, { label: '+33', value: '33+' }];
  const off = (active) => (active ? '' : 'opacity-muted pointer-events-none');

  return (
    <div className="relative w-full h-full">
    {!compact && <ModeTabs mode={mode} setMode={setMode} />}
    <ModuleShell isCol={isCol} moduleNumber={0}>
      {/* Los filtros se reparten el ancho disponible; modos y Usuarios quedan fijos a la derecha (Figma: gap mínimo 40). */}
      {/* En la versión de bolsillo (compact) solo quedan Promedio, Edad y Trabajo. */}
      <div className={`absolute top-[22px] flex items-start gap-[40px] ${compact ? 'left-[16px] right-[16px]' : 'left-[21px] right-[21px]'}`}>
      <div className="flex-1 min-w-0 flex items-start justify-between">

        {/* Promedio (Component 18, 102×108) */}
        <div className={`${compact ? 'w-[96px]' : 'w-[102px]'} shrink-0 flex flex-col`}>
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
        <div className={`${compact ? 'w-[44px]' : 'w-[56px]'} shrink-0 flex flex-col items-center gap-[16px]`}>
          <LedButton variant="group" compId="demo-edad-led" label="Edad" value={filters.edadActiva} onChange={(v) => setFilters(p => ({...p, edadActiva: v}))} />
          <div className="w-full">
            <VerticalPads compId="demo-age" gap={4} options={edadOptions} value={filters.edadGroup} onChange={(v) => setFilters(p => ({...p, edadActiva: v !== null, edadGroup: v !== null ? v : p.edadGroup}))} disabled={!filters.edadActiva} />
          </div>
        </div>

        {!compact && (
        <>
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

        </>
        )}
        {/* Trabajo: Sí/No + Horas + Modalidad */}
        <div className={`${compact ? 'w-[157px]' : 'w-[186px]'} shrink-0 flex flex-col gap-[16px]`}>
          <LedButton variant="group" compId="demo-trabaja-led" label="Trabajo" value={filters.trabajaActivo} onChange={(v) => { setFilters(p => { let next = {...p, trabajaActivo: v}; if (!v) { next.horasTrabajoActivo = false; next.modalidadActiva = false; } return next; }); }} />
          <div className={`flex items-start ${compact ? 'justify-start gap-[12px] w-[157px]' : 'justify-center gap-[36px] w-[131px]'}`}>
            <div className={off(filters.trabajaActivo)}>
              <ToggleSwitch compId="demo-work" sizeClass="w-[30px]" onLabel="Sí" offLabel="No" value={filters.trabaja === 'SÍ'} onChange={(v) => { setFilters(p => ({...p, trabaja: v ? 'SÍ' : 'NO'})); }} />
            </div>
            <div className={`${compact ? 'w-[28px]' : 'w-[8px]'} shrink-0 flex flex-col gap-[5px]`}>
              <span className="type-micro font-light leading-[14px] text-text-muted h-[10px] whitespace-nowrap">Horas</span>
              <VerticalPads compId="demo-hours" options={[{label:'-4', value:'<4'}, {label:'4-6', value:'4-6'}, {label:'6-8', value:'6-8'}, {label:'+8', value:'>8'}]} value={filters.horasTrabajoActivo ? filters.horasTrabajo : null} onChange={(v) => setFilters(p => ({...p, horasTrabajoActivo: v !== null, horasTrabajo: v !== null ? v : p.horasTrabajo}))} disabled={!filters.trabajaActivo || filters.trabaja !== 'SÍ'} />
            </div>
            <div className={`${compact ? 'w-[60px]' : 'w-[8px]'} shrink-0 flex flex-col gap-[5px]`}>
              <span className="type-micro font-light leading-[14px] text-text-muted h-[10px] whitespace-nowrap">Modalidad</span>
              <VerticalPads compId="demo-modality" options={[{label:'Presencial', value:'Presencial'}, {label:'Híbrido', value:'Híbrido'}, {label:'Remoto', value:'Remoto'}]} value={filters.modalidadActiva ? filters.modalidad : null} onChange={(v) => setFilters(p => ({...p, modalidadActiva: v !== null, modalidad: v !== null ? v : p.modalidad}))} disabled={!filters.trabajaActivo || filters.trabaja !== 'SÍ'} />
            </div>
          </div>
        </div>

        {!compact && (
        <>
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

        </>
        )}
      </div>

        {!compact && (
        <>
        {/* Reserva el ancho de la columna derecha (Usuarios / Guardar), que va centrada en el alto del panel */}
        <div className="w-[100px] shrink-0" />

        </>
        )}
      </div>

      {!compact && (
        <div className="absolute right-[21px] top-0 bottom-0 w-[100px] flex flex-col items-end justify-center">
          {mode === 'individual' ? (
            // Guardar: sube tus respuestas a la base y vuelve al colectivo con tu lectura sobre la del grupo
            <div className="relative w-[100px] h-[55px]">
              <span className="absolute left-[6px] top-0 font-heading font-bold text-[8px] leading-[14px] text-icon-secondary">Tus respuestas</span>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || missingCount > 0}
                className={`absolute inset-x-0 top-[13px] h-[40px] rounded-md px-space-8 font-heading font-bold text-[11px] leading-[13px] uppercase tracking-label flex items-center justify-center text-center cursor-pointer select-none transition-[background-color,box-shadow,color] duration-fast disabled:cursor-default focus-visible:outline-none focus-visible:shadow-focus-soft ${
                  missingCount || saveFailed
                    ? 'bg-status-danger-background text-status-danger-foreground'
                    : 'bg-action-primary-default text-action-primary-text hover:bg-action-primary-hover active:bg-action-primary-pressed active:shadow-inset-pressed'
                }`}
                style={{ boxShadow: missingCount || saveFailed ? undefined : '3px 3px 8px rgba(45,45,45,0.28), -2px -2px 6px #FFFFFF' }}
                aria-live="polite"
              >
                {isSaving ? 'Enviando…' : saveFailed ? 'Error · reintentar' : missingCount ? `Faltan ${missingCount} ${missingCount === 1 ? 'dato' : 'datos'}` : 'Guardar'}
              </button>
            </div>
          ) : (
            <div className="relative w-[80px] h-[51px]">
              <span className="absolute left-[6px] top-0 font-heading font-bold text-[8px] leading-[14px] text-icon-secondary">Usuarios</span>
              <div className="absolute inset-x-0 top-[11px] h-[40px] rounded-md bg-display-foreground flex items-center justify-center" style={{ boxShadow: 'inset 1px 2px 4px rgba(45,45,45,0.22), inset -1px -1px 2px rgba(255,255,255,0.78)' }}>
                <span className="font-body text-[20px] leading-none text-text-muted">{(matchCount || 0).toString().padStart(3, '0')}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </ModuleShell>
    </div>
  );
}
