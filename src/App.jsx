import React, { useState } from 'react';
import RackGrid from './RackGrid';
import Stage from './Stage';
import { HoverProvider } from './contexts/HoverContext';
import { useAppContext } from './contexts/AppContext';
import { CableProvider } from './contexts/CableContext';
import CableOverlay from './components/cables/CableOverlay';
import MobileApp from './MobileApp';
import { useIsPhone } from './useDeviceClass';
import Hero from './intro/Hero';
import Onboarding from './intro/Onboarding';
import PocketOnboarding from './intro/PocketOnboarding';

// Antes del instrumento: hero → onboarding → instrumento. Para entrar directo (desarrollo): ?intro=0
const initialScreen = () => (new URLSearchParams(window.location.search).get('intro') === '0' ? 'app' : 'hero');

function App() {
  const { showGrid, setShowGrid } = useAppContext();
  // Teléfono → versión de bolsillo; tablet y escritorio → versión completa (ver useDeviceClass)
  const isPhone = useIsPhone();
  const [screen, setScreen] = useState(initialScreen);
  const [leaving, setLeaving] = useState(false);

  // Fundido controlado por estado (sin ciclo de salida de framer, que repintaba un fotograma del hero al desmontarlo):
  // la pantalla se apaga con una transición CSS, y recién con opacidad 0 se monta la siguiente, que entra con un fundido.
  if (screen !== 'app') {
    const goTo = (next) => {
      if (leaving) return;
      setLeaving(true);
      setTimeout(() => { setScreen(next); setLeaving(false); }, 350);
    };
    return (
      <div
        key={screen}
        className="fixed inset-0 bg-background-sunken"
        style={leaving ? { opacity: 0, transition: 'opacity 350ms ease' } : { animation: 'screen-in 450ms ease both' }}
      >
        {screen === 'hero'
          ? <Hero compact={isPhone} onStart={() => goTo('onboarding')} />
          : isPhone
            ? <PocketOnboarding onDone={() => goTo('app')} />
            : <Onboarding onDone={() => goTo('app')} />}
      </div>
    );
  }

  return (
    <HoverProvider>
      <CableProvider>
      {isPhone ? <MobileApp /> : (
      <div className="w-screen h-[100dvh] bg-background-sunken text-text-primary overflow-hidden font-body relative">
        <Stage>
          <RackGrid />
        </Stage>
        <CableOverlay />
        
        {/* Toggle Grid Button (Oculto a pedido del usuario) */}
        {/* 
        <button 
          onClick={() => setShowGrid(!showGrid)}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-[9999] ${
            showGrid ? 'bg-magenta-500/20 border-[#FF00FF] text-[#FF00FF]' : 'bg-[#333] border-[#555] text-[#777]'
          }`}
          title="Toggle Grid"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
        </button>
        */}
      </div>
      )}
          </CableProvider>
    </HoverProvider>
  );
}

export default App;

