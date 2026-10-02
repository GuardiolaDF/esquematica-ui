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
  const { hoveredId } = useHover();
  const [helpOpen, setHelpOpen] = useState(false);
  const landscape = useLandscape();

  // Esta versión solo existe en modo colectivo / vista general
  useEffect(() => { if (mode !== 'colectivo') setMode('colectivo'); }, [mode, setMode]);
  useEffect(() => { setVisualizationMode('general'); }, [setVisualizationMode]);

  if (landscape) {
    return (
      <div className="fixed inset-0 bg-background-sunken flex flex-col items-center justify-center gap-space-16 p-space-32 text-center">
        <Logo height={40} />
        <p className="type-body-m text-text-secondary max-w-[260px]">Girá el teléfono a vertical para ver Esquemática.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background-sunken text-text-primary font-body flex flex-col gap-space-8 p-[10px] pt-[max(10px,env(safe-area-inset-top))] pb-[max(10px,env(safe-area-inset-bottom))]">

      {/* Tarjeta principal: logo, variable seleccionada y vúmetro */}
      <section className="relative flex-1 min-h-0 flex flex-col rounded-xl bg-background-base shadow-elevation-02 overflow-hidden px-space-16 pt-space-16 pb-space-8 gap-space-12">
        {/* Logo y, debajo, el ícono de ayuda */}
        <div className="flex flex-col items-end gap-space-8">
          <Logo height={40} />
          <button
            type="button"
            aria-label="¿Qué es esta versión?"
            onClick={() => setHelpOpen(true)}
            className="w-control-xl h-control-xl rounded-pill bg-surface-subtle border border-border-subtle shadow-elevation-02 text-text-secondary font-heading font-bold text-[20px] leading-none cursor-pointer select-none transition-shadow duration-fast active:shadow-inset-pressed focus-visible:outline-none focus-visible:shadow-focus-soft"
          >
            ?
          </button>
        </div>

        <div className="pointer-events-none self-center">
          <VariablePanel compId={hoveredId} />
        </div>

        <div className="relative flex-1 min-h-0">
          <DataVisualizer compact />
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
