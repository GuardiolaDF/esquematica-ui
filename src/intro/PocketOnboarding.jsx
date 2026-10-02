import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Onboarding de la versión de bolsillo: dos tarjetas. Qué hace el instrumento y qué tiene esta versión.
// Se pasa deslizando o con el botón; "Saltar" va directo.
const EASE = [0.22, 1, 0.36, 1];
const rand = (seed) => { const s = Math.sin(seed * 9301 + 49297) * 233280; return s - Math.floor(s); };

// Vúmetro mínimo: abanico con carriles, respuestas que caen y la aguja.
const MiniMeter = ({ width = 240 }) => {
  const cx = 120; const cy = 150; const r = 120;
  const pt = (a, k) => [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k];
  const a0 = -Math.PI * 0.78; const a1 = -Math.PI * 0.22;
  const [lx, ly] = pt(a0, 1); const [rx, ry] = pt(a1, 1);
  const lanes = 12;
  const laneK = (l) => 0.34 + ((l + 0.5) / lanes) * 0.66;
  const arc = (k) => { const [ax, ay] = pt(a0, k); const [bx, by] = pt(a1, k); return `M${ax},${ay} A${r * k},${r * k} 0 0 1 ${bx},${by}`; };
  // Cada respuesta cae sobre un carril (arco); más a la derecha, más estrés
  const dots = Array.from({ length: 34 }, (_, i) => {
    const t = Math.min(0.96, Math.max(0.04, 0.5 + (rand(i + 40) + rand(i + 80) - 1) * 0.6));
    return pt(a0 + t * (a1 - a0), laneK(Math.floor(rand(i + 3) * lanes)));
  });
  return (
    <svg viewBox="0 0 240 160" width={width} className="overflow-visible" aria-hidden="true">
      <motion.path d={`M${cx},${cy} L${lx},${ly} A${r},${r} 0 0 1 ${rx},${ry} Z`} fill="var(--neutral-0)" stroke="var(--neutral-900)" strokeWidth={1.5}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: EASE }} />
      {Array.from({ length: lanes }, (_, i) => (
        <path key={i} d={arc(laneK(i))} fill="none" stroke="var(--neutral-200)" strokeWidth={0.8} />
      ))}
      {[laneK(3.5), laneK(7.5)].map((k) => <path key={k} d={arc(k)} fill="none" stroke="var(--neutral-900)" strokeWidth={1} />)}
      {dots.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r={3} fill="var(--coral-500)"
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.9, scale: 1 }} transition={{ delay: 0.6 + i * 0.04 }}
          style={{ originX: `${x}px`, originY: `${y}px`, transformBox: 'view-box' }} />
      ))}
      <motion.line x1={cx} y1={cy} x2={cx} y2={cy - 100} stroke="var(--neutral-600)" strokeWidth={3.5} strokeLinecap="round"
        style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: 'view-box' }}
        animate={{ rotate: [-20, 14, -4, 18, -20] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
    </svg>
  );
};

// Teléfono con el vúmetro adentro y un dedo que toca un carril
const PhoneSketch = () => (
  <div className="relative w-[150px] h-[250px] rounded-[26px] border-[1.5px] border-neutral-900 bg-background-base shadow-elevation-02 flex flex-col items-center p-space-12 gap-space-8">
    <div className="w-[34px] h-[4px] rounded-pill bg-neutral-300" />
    <div className="w-full flex-1 rounded-lg bg-surface-subtle flex items-center justify-center overflow-hidden"><MiniMeter width={112} /></div>
    <div className="w-full h-[52px] rounded-lg bg-surface-subtle flex items-center justify-around px-space-8">
      {[0, 1, 2].map((k) => (
        <motion.span key={k} className="w-[16px] h-[16px] rounded-pill border-[1.5px] border-neutral-900"
          animate={{ backgroundColor: ['var(--neutral-0)', 'var(--teal-700)', 'var(--neutral-0)'] }}
          transition={{ duration: 1.2, delay: 1 + k * 0.6, repeat: Infinity, repeatDelay: 1.8 }} />
      ))}
    </div>
    <motion.span
      className="absolute w-[26px] h-[26px] rounded-pill bg-coral-500/40 border-[1.5px] border-coral-700"
      style={{ left: 70, top: 64 }}
      animate={{ scale: [0.6, 1.2, 0.6], opacity: [0, 1, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }}
    />
  </div>
);

const CARDS = [
  {
    id: 'what',
    kicker: 'El instrumento',
    title: 'Un vúmetro para el estrés',
    body: 'El estrezometro toma las respuestas de una encuesta sobre hábitos, trabajo y salud mental y las muestra como una señal: cada arco es una pregunta y cada punto una respuesta, ubicada entre más relax y más estrés.',
    art: <MiniMeter width={250} />,
  },
  {
    id: 'pocket',
    kicker: 'Versión de bolsillo',
    title: 'Lo esencial, en tu mano',
    body: 'Acá ves el modo colectivo con algunos filtros. Tocá un carril para leer su pregunta. Para el instrumento completo —módulos, cables y todos los modos— abrilo en una compu o una tablet.',
    art: <PhoneSketch />,
  },
];

const PocketOnboarding = ({ onDone }) => {
  const [[index, dir], setPage] = useState([0, 1]);
  const card = CARDS[index];
  const last = index === CARDS.length - 1;
  const go = useCallback((to) => {
    setPage(([cur]) => {
      const n = Math.max(0, Math.min(CARDS.length - 1, to));
      return [n, n >= cur ? 1 : -1];
    });
  }, []);
  const next = () => (last ? onDone() : go(index + 1));

  return (
    <section className="fixed inset-0 bg-background-sunken text-text-primary font-body flex flex-col px-space-24 pt-[max(16px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] overflow-hidden">
      <header className="shrink-0 h-[56px] flex items-center justify-between">
        <span className="type-caption text-text-muted tabular-nums">{String(index + 1).padStart(2, '0')} / {String(CARDS.length).padStart(2, '0')}</span>
        <button type="button" onClick={onDone} className="h-control-l px-space-12 -mr-space-12 rounded-md type-control text-text-secondary active:bg-background-base cursor-pointer">
          Saltar →|
        </button>
      </header>

      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={card.id}
            custom={dir}
            variants={{
              enter: (d) => ({ opacity: 0, x: d * 40 }),
              center: { opacity: 1, x: 0 },
              exit: (d) => ({ opacity: 0, x: d * -40 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) next();
              else if (info.offset.x > 60) go(index - 1);
            }}
            className="absolute inset-0 flex flex-col gap-space-24 touch-pan-y"
          >
            <div className="flex-1 min-h-[180px] flex items-center justify-center">{card.art}</div>
            <div className="flex flex-col gap-space-12">
              <span className="type-label-m text-text-muted uppercase tracking-label">{card.kicker}</span>
              <h2 className="font-heading font-bold text-[28px] leading-[32px] tracking-heading-tight">{card.title}</h2>
              <p className="type-body-l text-text-secondary">{card.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="shrink-0 pt-space-24 flex items-center gap-space-16">
        <div className="flex items-center gap-space-6">
          {CARDS.map((c, k) => (
            <motion.span key={c.id} className="block h-[4px] rounded-pill" initial={false}
              animate={{ width: k === index ? 32 : 12, backgroundColor: k <= index ? 'var(--coral-500)' : 'var(--neutral-300)' }} />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="ml-auto h-control-xl px-space-24 rounded-md bg-action-primary-default text-action-primary-text type-control inline-flex items-center gap-space-12 shadow-elevation-02 active:bg-action-primary-pressed cursor-pointer"
        >
          {last ? 'Empezar' : 'Siguiente'} <span aria-hidden="true">→</span>
        </button>
      </footer>
    </section>
  );
};

export default PocketOnboarding;
