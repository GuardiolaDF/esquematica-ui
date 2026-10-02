import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BrandMark from './BrandMark';
import RackSchematic from './RackSchematic';

// Onboarding de escritorio: un carrusel corto con lo esencial del instrumento. A la derecha, el esquema del rack
// (RackSchematic) enfoca la zona de la que habla cada paso. Se navega con los botones, las flechas del teclado,
// arrastrando o tocando las barras de progreso; "Saltar" (o Escape) va directo al instrumento.
const EASE = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    id: 'intro',
    kicker: 'Cómo funciona',
    title: 'Un instrumento para leer el estrés',
    body: 'El estrezometro toma las respuestas de una encuesta sobre hábitos, trabajo y salud mental y las convierte en una señal que se puede leer, comparar y filtrar. Funciona como un equipo de audio: módulos, un visualizador y un panel de control.',
  },
  {
    id: 'modules',
    kicker: 'Módulos',
    title: 'Tres módulos, tres temas',
    body: 'Consumos culturales, Modos de trabajo y Salud mental. Cada perilla, fader o botón es una pregunta de la encuesta. Pasá el cursor por encima de un control para ver cuál es.',
  },
  {
    id: 'vis',
    kicker: 'Visualizador',
    title: 'Cada pregunta es un carril',
    body: 'Cada arco del abanico es una pregunta, agrupadas por módulo. Las respuestas se ubican a lo largo del carril: hacia la izquierda, más relax; hacia la derecha, más estrés. Arriba, el display indica en qué modo estás.',
  },
  {
    id: 'console',
    kicker: 'Panel de control',
    title: 'Modos y filtros',
    body: 'Elegí el modo —Colectivo, Individual o Especulativo— y filtrá por edad, trabajo, país o vivienda para ver cómo cambia la señal. El contador muestra cuántas personas quedan en la muestra.',
  },
  {
    id: 'cables',
    kicker: 'Cables',
    title: 'Cruzá dos variables',
    body: 'En las vistas Espectro, Relación y Asociación, conectá con cables las salidas de los módulos a las entradas del visualizador para comparar una pregunta con otra.',
  },
  {
    id: 'yours',
    kicker: 'Tu turno',
    title: 'Ahora probalo',
    body: 'En modo Individual los controles son tuyos: respondé moviéndolos y mirá cómo se ve tu lectura al lado de la del grupo.',
  },
];

const ghostBtn = 'h-control-l px-space-16 rounded-md type-control text-text-secondary inline-flex items-center gap-space-8 cursor-pointer transition-colors duration-fast hover:text-text-primary hover:bg-background-sunken focus-visible:outline-none focus-visible:shadow-focus-soft disabled:opacity-disabled disabled:cursor-default disabled:hover:bg-transparent';
const primaryBtn = 'group h-control-l px-space-24 rounded-md bg-action-primary-default text-action-primary-text type-control inline-flex items-center gap-space-12 cursor-pointer shadow-elevation-02 transition-colors duration-fast hover:bg-action-primary-hover active:bg-action-primary-pressed active:shadow-inset-pressed focus-visible:outline-none focus-visible:shadow-focus-soft';

const Onboarding = ({ onDone }) => {
  const [[index, dir], setPage] = useState([0, 1]);
  const [modeIndex, setModeIndex] = useState(0);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const go = useCallback((to) => {
    setPage(([cur]) => {
      const next = Math.max(0, Math.min(STEPS.length - 1, to));
      return next === cur ? [cur, 1] : [next, next > cur ? 1 : -1];
    });
  }, []);
  const next = useCallback(() => { if (last) onDone(); else go(index + 1); }, [last, onDone, go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onDone]);

  // En el paso del panel de control, el modo activo va rotando
  useEffect(() => {
    if (step.id !== 'console') return undefined;
    setModeIndex(0);
    const id = setInterval(() => setModeIndex((m) => (m + 1) % 3), 1800);
    return () => clearInterval(id);
  }, [step.id]);

  return (
    <section className="fixed inset-0 bg-background-sunken text-text-primary font-body flex flex-col overflow-hidden">
      {/* Barra superior */}
      <header className="shrink-0 flex items-center justify-between gap-space-16 px-[6.55vw] pt-space-32 pb-space-16">
        <div className="flex items-end gap-space-12 text-neutral-1000">
          <BrandMark style={{ height: 26 }} />
          <span className="font-heading text-[18px] leading-none pb-[1px]">estrezometro</span>
        </div>
        <button type="button" onClick={onDone} className={ghostBtn}>
          Saltar
          <span aria-hidden="true">→|</span>
        </button>
      </header>

      {/* Contenido */}
      <motion.div
        className="flex-1 min-h-0 grid grid-rows-[auto_minmax(0,1fr)] lg:grid-rows-1 lg:grid-cols-[minmax(280px,380px)_1fr] gap-space-24 lg:gap-[5vw] items-center px-[6.55vw] py-space-16"
        onPanEnd={(_, info) => {
          if (info.offset.x < -70) next();
          else if (info.offset.x > 70) prev();
        }}
      >
        <div className="relative max-w-[560px] min-h-[170px] lg:min-h-[300px]" aria-live="polite">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step.id}
              custom={dir}
              variants={{
                enter: (d) => ({ opacity: 0, x: d * 28 }),
                center: { opacity: 1, x: 0 },
                exit: (d) => ({ opacity: 0, x: d * -28 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: EASE }}
              className="flex flex-col gap-space-16"
            >
              <div className="flex items-center gap-space-12">
                <span className="type-label-m text-text-inverse bg-text-muted px-[4px] h-[16px] flex items-center tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="type-label-m text-text-muted uppercase tracking-label">{step.kicker}</span>
              </div>
              <h2 className="font-heading font-bold text-[clamp(28px,3.2vw,44px)] leading-[1.08] tracking-heading-tight text-text-primary">
                {step.title}
              </h2>
              <p className="type-body-l text-text-secondary">{step.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative h-full min-h-0 flex items-center justify-center">
          <div className="w-full max-w-full max-h-full rounded-xl bg-background-base shadow-elevation-03 p-[2.2vw] overflow-hidden" style={{ aspectRatio: '1400 / 790' }}>
            <RackSchematic step={step.id} modeIndex={modeIndex} className="w-full h-full" />
          </div>
        </div>
      </motion.div>

      {/* Navegación */}
      <footer className="shrink-0 flex flex-wrap items-center justify-between gap-space-16 px-[6.55vw] pt-space-16 pb-space-32">
        <div className="flex items-center gap-space-16">
          <div className="flex items-center gap-space-6" role="tablist" aria-label="Pasos">
            {STEPS.map((s, k) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={k === index}
                aria-label={`Paso ${k + 1}: ${s.kicker}`}
                onClick={() => go(k)}
                className="relative h-[20px] cursor-pointer focus-visible:outline-none focus-visible:shadow-focus-soft rounded-xs"
              >
                <motion.span
                  className="block h-[4px] rounded-pill"
                  initial={false}
                  animate={{ width: k === index ? 40 : 16, backgroundColor: k <= index ? 'var(--coral-500)' : 'var(--neutral-300)' }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
              </button>
            ))}
          </div>
          <span className="type-caption text-text-muted tabular-nums whitespace-nowrap">
            {String(index + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-space-8">
          <button type="button" onClick={prev} disabled={index === 0} className={ghostBtn}>
            <span aria-hidden="true">←</span> Atrás
          </button>
          <button type="button" onClick={next} className={primaryBtn}>
            {last ? 'Empezar' : 'Siguiente'}
            <span aria-hidden="true" className="transition-transform duration-standard group-hover:translate-x-[3px]">→</span>
          </button>
        </div>
      </footer>
    </section>
  );
};

export default Onboarding;
