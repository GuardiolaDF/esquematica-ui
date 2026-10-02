import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { dbMap } from '../dbMap';
import { variableInfo, cellCode, responseStats } from '../variableInfo';

// Figma: main-chart-panel › «Variable seleccionada» (2316:1381) — 297×63, surface/subtle, radius/md, Effects/Elevation/03.
//   · código: celda del Excel de donde sale la variable (p. ej. DO-1)
//   · pregunta en lenguaje natural: qué responde el control
//   · anillo: porcentaje de usuarios que respondieron esa variable
const RING_R = 19;
const RING_LEN = 2 * Math.PI * RING_R;

const VariablePanel = ({ compId }) => {
  const { allSetups } = useAppContext();
  const info = compId ? variableInfo[compId] : null;
  const fallbackLabel = compId ? dbMap[compId] : null;

  const stats = useMemo(() => (compId ? responseStats(compId, allSetups, dbMap) : null), [compId, allSetups]);
  const percent = stats?.percent ?? null;

  const question = info?.question
    || (fallbackLabel ? `¿${fallbackLabel}?` : 'Pasá el cursor por un control para ver qué pregunta responde.');

  return (
    <div className="relative w-[297px] h-[63px] rounded-md bg-surface-subtle shadow-elevation-03 overflow-clip select-none">
      <span className="absolute left-[11px] top-[7px] font-body font-bold text-[8px] leading-[14px] text-text-disabled whitespace-nowrap">
        Variable seleccionada
      </span>

      {/* Código de celda */}
      <div className="absolute left-[24px] top-[25px] h-[24px] w-[49px] flex items-center">
        <span className="font-body font-extralight text-[18px] leading-none text-text-primary whitespace-nowrap">
          {compId ? cellCode(compId) : '—'}
        </span>
      </div>
      <span className="absolute left-[79px] top-[25px] w-px h-[24px] bg-text-primary" />

      {/* Pregunta */}
      <div className="absolute left-[91px] top-[20px] h-[34px] w-[112px] flex items-center">
        <p className={`font-heading text-[9px] leading-[11px] line-clamp-3 ${compId ? 'text-text-primary' : 'text-text-muted'}`}>
          {question}
        </p>
      </div>

      {/* Respuestas */}
      <div className="absolute right-[50px] top-[13px] w-[44px] text-right font-heading text-[6px] leading-[6px] text-text-disabled pointer-events-none">
        <p>respondieron</p>
        <p>{stats && stats.total ? `${stats.answered} de ${stats.total}` : '— de —'}</p>
      </div>
      <div className="absolute left-[247px] top-[12px] w-[40px] h-[40px]">
        <svg width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0" fill="none">
          <circle cx="20" cy="20" r="19.5" stroke="var(--neutral-300)" strokeWidth="1" />
          <circle
            cx="20" cy="20" r={RING_R}
            stroke="var(--neutral-500)" strokeWidth="2" strokeLinecap={percent ? 'round' : 'butt'}
            strokeDasharray={`${((percent ?? 0) / 100) * RING_LEN} ${RING_LEN}`}
            transform="rotate(-90 20 20)"
            className="transition-[stroke-dasharray] duration-slow ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-body text-[12px] leading-none text-text-primary">
          {percent === null ? '–' : `${percent}%`}
        </span>
      </div>
    </div>
  );
};

export default VariablePanel;
