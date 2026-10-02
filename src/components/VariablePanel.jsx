import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { dbMap } from '../dbMap';
import { variableInfo, cellCode, responseStats } from '../variableInfo';
import { dbMetadata } from '../dbMap';
import { trackReading, stressPercent } from '../dataTransforms';

// Figma: main-chart-panel › «Variable seleccionada» (2316:1381) — 297×63, surface/subtle, radius/md, Effects/Elevation/03.
//   · código: celda del Excel de donde sale la variable (p. ej. DO-1)
//   · pregunta en lenguaje natural: qué responde el control
//   · anillo: lectura de la variable en la escala del vúmetro (0 = + relax, 100 = + estrés)
//       colectivo → promedio de la muestra filtrada · individual / especulativo → el valor del control
//       filtros de la consola (sin escala de estrés) → porcentaje de personas que respondieron
const RING_R = 19;
const RING_LEN = 2 * Math.PI * RING_R;

// Medidas por variante (Figma): escritorio 297×63 · bolsillo 229×63
const LAYOUT = {
  full: { w: 297, code: 'left-[24px] w-[49px] text-[18px]', divider: 'left-[79px]', q: 'left-[91px] w-[112px] text-[9px] leading-[11px]', label: 'right-[50px]', ring: 'left-[247px]' },
  compact: { w: 229, code: 'left-[11px] w-[35px] text-[12px]', divider: 'left-[46px]', q: 'left-[59px] w-[92px] text-[7px] leading-[9px]', label: 'right-[55px]', ring: 'left-[174px]' },
};

const VariablePanel = ({ compId, compact = false, emptyText = 'Pasá el cursor por un control para ver qué pregunta responde.' }) => {
  const L = compact ? LAYOUT.compact : LAYOUT.full;
  const { allSetups, filteredSetups, mode, values } = useAppContext();
  const info = compId ? variableInfo[compId] : null;
  const fallbackLabel = compId ? dbMap[compId] : null;

  const stats = useMemo(() => (compId && (info || fallbackLabel) ? responseStats(compId, allSetups, dbMap) : null), [compId, info, fallbackLabel, allSetups]);

  // Lectura de la variable (solo carriles del vúmetro)
  const reading = useMemo(() => {
    if (!compId || !compId.startsWith('mod') || !dbMap[compId]) return null;
    const type = dbMetadata[compId]?.dataType;
    if (mode === 'colectivo') {
      const r = trackReading(compId, dbMap[compId], filteredSetups, type);
      return r ? { value: Math.round(r.value), caption: ['promedio', `${r.count} resp.`] } : null;
    }
    const p = stressPercent(compId, values[compId], type);
    return { value: p === undefined ? null : Math.round(p), caption: ['tu lectura', p === undefined ? 'sin respuesta' : 'relax → estrés'] };
  }, [compId, mode, filteredSetups, values]);

  const percent = reading ? reading.value : (stats?.percent ?? null);
  const caption = reading ? reading.caption : ['respondieron', stats && stats.total ? `${stats.answered} de ${stats.total}` : '— de —'];

  const question = info?.question
    || (fallbackLabel ? `¿${fallbackLabel}?` : emptyText);

  return (
    <div className={`relative h-[63px] rounded-md bg-surface-subtle shadow-elevation-03 overflow-clip select-none ${compact ? 'w-[229px]' : 'w-[297px]'}`}>
      <span className="absolute left-[11px] top-[7px] font-body font-bold text-[8px] leading-[14px] text-text-disabled whitespace-nowrap">
        Variable seleccionada
      </span>

      {/* Código de celda */}
      <div className={`absolute top-[25px] h-[24px] flex items-center ${L.code.split(' ').filter(x => !x.startsWith('text-')).join(' ')}`}>
        <span className={`font-body font-extralight leading-none text-text-primary whitespace-nowrap ${L.code.split(' ').find(x => x.startsWith('text-'))}`}>
          {compId ? cellCode(compId) : '—'}
        </span>
      </div>
      <span className={`absolute top-[25px] w-px h-[24px] bg-text-primary ${L.divider}`} />

      {/* Pregunta */}
      <div className={`absolute top-[20px] h-[34px] flex items-center ${L.q.split(' ').filter(x => x.startsWith('left') || x.startsWith('w-')).join(' ')}`}>
        <p className={`font-heading ${L.q.split(' ').filter(x => x.startsWith('text-') || x.startsWith('leading')).join(' ')} line-clamp-3 ${compId ? 'text-text-primary' : 'text-text-muted'}`}>
          {question}
        </p>
      </div>

      {/* Respuestas */}
      <div className={`absolute top-[13px] w-[44px] text-right whitespace-nowrap ${L.label} font-heading text-[6px] leading-[6px] text-text-disabled pointer-events-none`}>
        <p>{caption[0]}</p>
        <p>{caption[1]}</p>
      </div>
      <div className={`absolute top-[12px] w-[40px] h-[40px] ${L.ring}`}>
        <svg width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0" fill="none">
          <circle cx="20" cy="20" r="19.5" stroke="var(--neutral-300)" strokeWidth="1" />
          <circle
            cx="20" cy="20" r={RING_R}
            stroke={reading ? 'var(--coral-500)' : 'var(--neutral-500)'} strokeWidth="2" strokeLinecap={percent ? 'round' : 'butt'}
            strokeDasharray={`${((percent ?? 0) / 100) * RING_LEN} ${RING_LEN}`}
            transform="rotate(-90 20 20)"
            className="transition-[stroke-dasharray] duration-slow ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-body text-[12px] leading-none text-text-primary">
          {percent === null ? '–' : reading ? percent : `${percent}%`}
        </span>
      </div>
    </div>
  );
};

export default VariablePanel;
