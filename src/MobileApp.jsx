import React, { useEffect, useState } from 'react';
import { useAppContext } from './contexts/AppContext';
import { useHover } from './contexts/HoverContext';
import DataVisualizer from './DataVisualizer';
import ConsoleModule from './ConsoleModule';
import VariablePanel from './components/VariablePanel';
import Logo from './components/Logo';
import HelpDialog from './components/HelpDialog';

// Versión de bolsillo: no es la versión completa adaptada, es otra pantalla pensada para el teléfono en vertical.
//  - sin los tres módulos de la izquierda
//  - solo el modo colectivo, vista general (sin pestañas de visualización, sin modos ni cables)
//  - panel de control reducido: Promedio, Edad y Trabajo
// Las partes que quedan son las mismas de la versión de escritorio y se comportan igual.

// Pistas para descubrir que los carriles se tocan:
//  1) texto inicial del panel de variable y leyenda bajo el vúmetro
//  2) una demostración breve: se resalta un carril y el panel muestra su variable
// Todo se apaga con el primer toque del usuario.
const DEMO_IDS = ['mod1-22', 'mod3-16', 'mod2-9'];
const DEMO_STEP_MS = 2200;
const DEMO_STEPS = 6;

const useLandscape = () => {
  const query = '(orientation: landscape)';
  const [landscape, setLandscape] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setLandscape(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return landscape;
};

const MobileApp = () => {
  const { mode, setMode, setVisualizationMode } = useAppContext();
  const { hoveredId, setHoveredId } = useHover();
  const [helpOpen, setHelpOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const landscape = useLandscape();

  // Esta versión solo existe en modo colectivo / vista general
  useEffect(() => { if (mode !== 'colectivo') setMode('colectivo'); }, [mode, setMode]);
  useEffect(() => { setVisualizationMode('general'); }, [setVisualizationMode]);

  // Demostración de toque (hasta el primer toque del usuario)
  useEffect(() => {
    if (touched || landscape) return undefined;
    let step = 0;
    const id = setInterval(() => {
      if (step >= DEMO_STEPS) { clearInterval(id); setHoveredId(null); return; }
      setHoveredId(DEMO_IDS[step % DEMO_IDS.length]);
      step += 1;
    }, DEMO_STEP_MS);
    const first = setTimeout(() => { setHoveredId(DEMO_IDS[0]); step = 1; }, 1200);
    return () => { clearInterval(id); clearTimeout(first); };
  }, [touched, landscape, setHoveredId]);

  const markTouched = () => {
    if (!touched) { setTouched(true); setHoveredId(null); }
  };

  if (landscape) {
    return (
      <div className="fixed inset-0 bg-background-sunken flex flex-col items-center justify-center gap-space-16 p-space-32 text-center">
        <Logo height={40} />
        <p className="type-body-m text-text-secondary max-w-[260px]">Girá el teléfono a vertical para ver Esquemática.</p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-background-sunken text-text-primary font-body flex flex-col gap-space-8 p-[10px] pt-[max(10px,env(safe-area-inset-top))] pb-[max(10px,env(safe-area-inset-bottom))]"
      onPointerDownCapture={markTouched}
    >

      {/* Tarjeta principal: variable seleccionada + logo y vúmetro */}
      <section className="relative flex-1 min-h-0 flex flex-col rounded-xl bg-background-base shadow-elevation-02 overflow-hidden px-space-12 pt-space-12 pb-space-8 gap-space-8">
        <div className="flex items-start justify-between gap-space-8">
          <div className="pointer-events-none shrink-0">
            <VariablePanel compId={hoveredId} compact emptyText="Tocá un carril del vúmetro para ver qué variable es." />
          </div>

          <div className="flex flex-col items-end gap-space-4">
            <Logo height={40} />
            {/* El círculo es chico, pero el área táctil sigue siendo de 44 px */}
            <button
              type="button"
              aria-label="¿Qué es esta versión?"
              onClick={() => setHelpOpen(true)}
              className="relative w-[24px] h-[24px] mr-[4px] rounded-pill bg-surface-subtle border border-border-subtle shadow-elevation-01 text-text-secondary font-heading font-bold text-[13px] leading-none cursor-pointer select-none transition-shadow duration-fast active:shadow-inset-pressed focus-visible:outline-none focus-visible:shadow-focus-soft"
            >
              <span className="absolute -inset-[10px]" />
              ?
            </button>
          </div>
        </div>

        <div className="relative flex-1 min-h-0">
          <DataVisualizer compact hint={touched ? null : 'Tocá un carril'} />
        </div>
      </section>

      {/* Panel de control reducido */}
      <div className="h-[166px] shrink-0">
        <ConsoleModule compact />
      </div>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

export default MobileApp;
