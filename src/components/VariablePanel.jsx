import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { dbMap } from '../dbMap';
import { variableInfo, cellCode, responseStats } from '../variableInfo';
import { dbMetadata } from '../dbMap';
import { trackReading, stressPercent } from '../dataTransforms';
import { answerGuide, gestureText } from '../answerGuide';

// Lectura en palabras de un valor 0–100 entre los dos extremos del control
const verbal = (v, g) => {
  if (v === undefined || v === null) return 'Sin responder';
  if (g.kind === 'toggle') return v >= 50 ? 'Sí' : 'No';
  if (v <= 15) return g.low;
  if (v >= 85) return g.high;
  if (v < 40) return `Más bien ${g.low.toLowerCase()}`;
  if (v > 60) return `Más bien ${g.high.toLowerCase()}`;
  return 'Intermedio';
};

// Guía de respuesta (modo individual / especulativo): qué gesto hacer, qué significa cada extremo y qué estás
// respondiendo ahora. Va pegada debajo del panel de la variable.
const AnswerGuide = ({ compId, value, width }) => {
  const g = answerGuide[compId];
  if (!g) return null;
  const isCounter = g.kind === 'counter';
  const current = isCounter
    ? (value === undefined ? 'Sin responder' : `${Math.round(value)} ${g.unit}`)
    : verbal(value, g);
  const pos = value === undefined || isCounter ? null : Math.max(0, Math.min(100, value));
  return (
    <div className="rounded-md bg-surface-subtle shadow-elevation-02 px-[11px] pt-[6px] pb-[7px] flex flex-col gap-[5px]" style={{ width }}>
      <div className="flex items-baseline justify-between gap-space-8">
        <span className="font-body font-bold text-[8px] leading-[10px] text-text-accent whitespace-nowrap">{gestureText(g)}</span>
        <span className={`font-heading font-bold text-[10px] leading-[12px] whitespace-nowrap ${value === undefined ? 'text-text-disabled' : 'text-text-primary'}`}>{current}</span>
      </div>
      {!isCounter && (
        <div className="flex items-center gap-[6px]">
          <span className="font-body text-[7px] leading-[8px] text-text-muted whitespace-nowrap">{g.low}</span>
          <div className="relative flex-1 h-[4px] rounded-pill bg-neutral-200">
            {pos !== null && (
              <>
                <div className="absolute left-0 top-0 bottom-0 rounded-pill bg-coral-300 transition-[width] duration-fast" style={{ width: `${pos}%` }} />
                <div className="absolute top-1/2 w-[9px] h-[9px] -translate-x-1/2 -translate-y-1/2 rounded-pill bg-coral-500 border-[1.5px] border-neutral-0 shadow-elevation-01 transition-[left] duration-fast" style={{ left: `${pos}%` }} />
              </>
            )}
          </div>
          <span className="font-body text-[7px] leading-[8px] text-text-muted whitespace-nowrap">{g.high}</span>
        </div>
      )}
    </div>
  );
};

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

  const showGuide = !compact && compId && mode !== 'colectivo' && answerGuide[compId];

  return (
    <div className="flex flex-col gap-[4px]">
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
    {showGuide && <AnswerGuide compId={compId} value={values[compId]} width={L.w} />}
    </div>
  );
};

export default VariablePanel;
