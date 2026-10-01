import React from 'react';
import ModuleShell from './ModuleShell';
import Jack from './components/cables/Jack';
import Fader from './components/actuators/Fader';
import Knob from './components/actuators/Knob';
import LedButton from './components/actuators/LedButton';
import { SiYoutube, SiSpotify, SiHbo, SiNetflix, SiStremio, SiTiktok, SiTwitch, SiMubi, SiInstagram, SiKick } from 'react-icons/si';
import { TbBrandDisney } from 'react-icons/tb';
import { FaAmazon } from 'react-icons/fa';
import { useAppContext } from './contexts/AppContext';
import { useHover } from './contexts/HoverContext';

const padIcons = [
  SiYoutube, SiSpotify, SiHbo, SiNetflix,
  SiStremio, SiTiktok, TbBrandDisney, SiTwitch,
  SiMubi, SiInstagram, FaAmazon, SiKick
];

const LBL_UP = "absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";
const LBL_DN = "absolute top-[100%] mt-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";
const LBL_V = "absolute right-[100%] mr-[4px] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";
const LBL_PAD = "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none z-20";

const ControlModule = () => {
  const { activePlatform, setActivePlatform, values, setValue, showGrid, mode, routingOutputs } = useAppContext();
  const { hoveredId } = useHover();
  
  // Determinamos si algún pad está siendo "hovered" para iluminar el fader vertical
  const isPadHovered = hoveredId && hoveredId.startsWith('mod1-') && parseInt(hoveredId.split('-')[1]) >= 10 && parseInt(hoveredId.split('-')[1]) <= 21;

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      <div className="w-full h-full flex flex-col p-[12px] gap-[16px] text-synth-ink-base">
        
        {/* HEADER: Component 15 */}
        <div className="flex items-center gap-2">
          <div className="flex bg-synth-module border border-synth-border-base items-center px-1">
            <div className="w-[13px] h-[12px] bg-synth-border-base mr-1"></div>
            <span className="text-synth-ink-black text-[12px] font-mono font-medium leading-none py-[2px]">1 módulo</span>
          </div>
          <span className="text-synth-ink-light font-display text-[12px] tracking-widest uppercase">
            CONSUMOS CULTURALES ||||||
          </span>
        </div>

        {/* MAIN SPLIT: Frame 61 */}
        <div className="flex flex-row flex-1 gap-[22px] min-h-0">
          
          {/* LEFT COLUMN: Frame 44 */}
          <div className="flex flex-col flex-[4] gap-[2px] min-w-0">
            {/* ROW 1: FORMATO y MODO AVION */}
            <div className="flex flex-row flex-1 min-h-0 justify-between">
              <div className="w-[102px] h-full flex flex-col items-center justify-center relative bg-synth-module">
                 {/* El Knob usa clases absolutas por ahora, lo dejaremos que crezca */}
                 <div className="w-16 h-16 mt-2 relative">
                   <Knob 
                     label="FORMATO" 
                     labelClass={LBL_UP} 
                     sizeClass="w-full h-full" 
                     startAngle={-90} endAngle={90}
                     markers={[{ angle: -90, label: "Largo" }, { angle: 0, label: "Medio" }, { angle: 90, label: "Corto" }]}
                     compId="mod1-1" 
                   />
                 </div>
              </div>
              <div className="w-[14px] h-full flex items-center justify-center relative bg-synth-module">
                <LedButton 
                  baseClass="w-3 h-3 rounded-[20%]" 
                  label="AVIÓN" 
                  labelClass={LBL_UP} 
                  compId="mod1-2" 
                />
              </div>
            </div>

            {/* ROW 2: PLATAFORMAS (Component 17) */}
            <div className="flex flex-row flex-1 min-h-0 bg-synth-surface border-[0.5px] border-synth-border-base p-[4px] gap-[14px]">
              <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-[2px]">
                {Array.from({ length: 12 }).map((_, i) => {
                  const compId = `mod1-${10 + i}`;
                  return (
                    <div key={`pad-${i}`} className="flex items-center justify-center bg-synth-module border border-synth-border-light p-1">
                      <LedButton 
                        baseClass="w-full h-full rounded-[15%]" 
                        icon={padIcons[i]} 
                        ledColor="yellow" 
                        compId={compId}
                        value={activePlatform === compId}
                        onChange={() => setActivePlatform(compId)}
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* VERTICAL FADER */}
              <div className="w-[16px] h-full flex flex-col items-center justify-center relative">
                <Fader 
                  orientation="vertical"
                  initialValue={50}
                  compId={activePlatform}
                  trackClass={`w-[30%] h-full bg-[#E5E5E5] rounded-full shadow-inner relative flex justify-center transition-all duration-300 ${isPadHovered ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : ''}`}
                  thumbClass={`w-full aspect-square bg-[#888] rounded-full absolute shadow-md transition-shadow ${isPadHovered ? 'shadow-[0_0_10px_rgba(251,191,36,0.8)]' : ''}`}
                  label="HRS"
                  labelClass={LBL_UP}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Frame 45 */}
          <div className="flex flex-col flex-[6] gap-[7px] min-w-0">
            {/* MEDIOS (7 Faders) */}
            <div className="flex flex-row flex-1 min-h-0 bg-synth-module justify-around items-end pb-3 pt-6">
              {['CINE', 'LIBROS', 'PODCAST', 'MÚSICA', 'SERIES', 'JUEGOS', 'OTROS'].map((text, i) => (
                <div key={`fader-${i}`} className="h-[90%] flex items-center justify-center relative w-6">
                  <Fader 
                    orientation="vertical"
                    initialValue={50}
                    trackClass="w-[30%] h-full bg-[#E5E5E5] rounded-full shadow-inner relative flex justify-center"
                    thumbClass="w-full aspect-square bg-[#888] rounded-full absolute shadow-md"
                    label={text}
                    labelClass={LBL_UP}
                    compId={`mod1-${3 + i}`}
                  />
                  {/* Tiny button below the fader */}
                  <div className="absolute -bottom-2 w-full flex justify-center">
                    <LedButton baseClass="w-2 h-2 rounded-[20%]" compId={`mod1-${3 + i}`} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* HORIZONTAL SLIDER */}
            <div className="h-[34px] bg-synth-module flex items-center justify-center px-8 relative">
              <Fader 
                orientation="horizontal"
                initialValue={50}
                trackClass="w-full h-[30%] bg-[#404040] rounded-full shadow-inner relative flex items-center"
                thumbClass="h-[150%] aspect-square bg-[#FFF] rounded-full absolute shadow-md z-20"
                label="HRS X DÍA EN RRSS"
                labelClass="absolute bottom-[100%] mb-[4px] left-0 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none"
                markers={['1', '2', '3', '4', '6', '+']}
                compId="mod1-22"
              />
            </div>

            {/* KNOBS & JACKS */}
            <div className="h-[54px] flex flex-row gap-[24px]">
              <div className="flex-[6] flex flex-row items-center justify-around bg-synth-module px-4 relative pt-3">
                <span className="absolute top-1 left-2 text-[7px] font-mono text-synth-ink-base">Referencias</span>
                {['FREC', 'IMP', 'IA'].map((text, i) => (
                  <div key={`knob-${i}`} className="w-8 h-8 relative">
                    <Knob label={text} labelClass={LBL_UP} sizeClass="w-full h-full" initialValue={50} compId={`mod1-${23 + i}`} />
                  </div>
                ))}
              </div>
              <div className="flex-[4] bg-synth-surface flex flex-col justify-center items-center p-1 border border-synth-border-light relative">
                <div className="w-full bg-synth-ink-dark text-white text-[10px] font-display text-center leading-none py-1 mb-1">SALIDAS</div>
                <div className="flex flex-row justify-around w-full px-2">
                  {['JACK 1', 'JACK 2'].map((item, i) => {
                    const isOut1Active = routingOutputs?.out1?.startsWith('mod1-');
                    const isOut2Active = routingOutputs?.out2?.startsWith('mod1-');
                    const isActive = (i === 0 && isOut1Active) || (i === 1 && isOut2Active);
                    const activeColor = i === 0 ? 'blue-500' : 'orange-500';
                    return (
                      <div key={`jack-mod1--${i}`} className="w-5 h-5">
                        <Jack 
                          id={`out-mod1-${i}`} 
                          type="output" 
                          label={item}
                          activeColor={isActive ? activeColor : null} 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
};
export default ControlModule;
