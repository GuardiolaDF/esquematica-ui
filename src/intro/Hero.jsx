import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import BrandMark from './BrandMark';

// Hero — Figma "Desktop Data Visualizer" (2197:2209): sobre surface/subtle, el bloque del logo (685×474 en un frame de
// 1280×720, a 84/188) con "estrezometro", la marca strz, "Versión 1.0" y la bajada. Las medidas internas están en % del
// bloque y la tipografía en cqw, así el conjunto escala como una sola pieza.
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

const PrimaryButton = ({ children, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group h-control-xl px-space-24 rounded-md bg-action-primary-default text-action-primary-text type-control inline-flex items-center justify-center gap-space-12 cursor-pointer shadow-elevation-02 transition-colors duration-fast hover:bg-action-primary-hover active:bg-action-primary-pressed active:shadow-inset-pressed focus-visible:outline-none focus-visible:shadow-focus-soft ${className}`}
  >
    {children}
    <span aria-hidden="true" className="transition-transform duration-standard group-hover:translate-x-[3px]">→</span>
  </button>
);

// Bloque del logo. `withTagline` en falso deja la bajada afuera (versión de bolsillo, donde iría ilegible).
const Lockup = ({ withTagline = true }) => (
  <div className="relative w-full [container-type:inline-size]" style={{ aspectRatio: '548 / 379' }}>
    <motion.h1
      {...fadeUp(0.1)}
      className="absolute left-0 top-0 font-heading font-normal text-text-primary leading-none whitespace-nowrap"
      style={{ fontSize: '10.5cqw', letterSpacing: '-0.01em' }}
    >
      estrezometro
    </motion.h1>

    <motion.div
      className="absolute left-0 w-full text-neutral-1000"
      style={{ top: '16.4%' }}
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
    >
      <BrandMark className="w-full" />
    </motion.div>

    <motion.span
      {...fadeUp(1.1)}
      className="absolute font-body text-text-primary leading-none whitespace-nowrap"
      style={{ right: '0.6%', top: '21.4%', fontSize: '4.3cqw' }}
    >
      Versión 1.0
    </motion.span>

    {withTagline && (
      <motion.p
        {...fadeUp(1.3)}
        className="absolute left-[0.5%] font-heading font-normal text-text-primary leading-none whitespace-nowrap"
        style={{ top: '93.6%', fontSize: '3.55cqw' }}
      >
        Sistema experimental de visualización de datos.
      </motion.p>
    )}
  </div>
);

const Hero = ({ onStart, compact = false }) => {
  // Enter / espacio también entran
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStart(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart]);

  if (compact) {
    return (
      <section className="fixed inset-0 bg-surface-subtle text-text-primary flex flex-col px-space-24 pt-[max(48px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
        <motion.span {...fadeUp(0)} className="type-label-m text-text-muted uppercase tracking-label">Versión de bolsillo</motion.span>
        <div className="flex-1 flex flex-col justify-center gap-space-24">
          <Lockup withTagline={false} />
          <motion.p {...fadeUp(1.3)} className="font-heading text-[17px] leading-[24px] text-text-secondary max-w-[300px]">
            Sistema experimental de visualización de datos.
          </motion.p>
        </div>
        <motion.div {...fadeUp(1.5)}>
          <PrimaryButton onClick={onStart} className="w-full">Comenzar</PrimaryButton>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="fixed inset-0 bg-surface-subtle text-text-primary overflow-hidden">
      <div
        className="absolute"
        style={{ left: '6.55vw', top: 'max(32px, calc(59vh - min(53.5vw, 92vh) * 0.3458))', width: 'min(53.5vw, 92vh)' }}
      >
        <Lockup />
      </div>

      <motion.div
        {...fadeUp(1.6)}
        className="absolute flex items-center gap-space-16"
        style={{ right: '6.55vw', bottom: '8vh' }}
      >
        <span className="type-caption text-text-muted hidden md:inline">o presioná Enter</span>
        <PrimaryButton onClick={onStart}>Comenzar</PrimaryButton>
      </motion.div>
    </section>
  );
};

export default Hero;
