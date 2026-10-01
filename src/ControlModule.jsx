import React, { useState } from 'react';
import ModuleShell from './ModuleShell';
import Knob from './components/actuators/Knob';
import Fader from './components/actuators/Fader';
import LedButton from './components/actuators/LedButton';
import Jack from './components/cables/Jack';
import { useAppContext } from './contexts/AppContext';
import { useHover } from './contexts/HoverContext';

const LBL_UP = "mb-[4px] left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.25em] text-text-secondary font-body font-bold whitespace-nowrap pointer-events-none";

const ControlModule = () => {
  const { mode, routingOutputs } = useAppContext();
  const [activePlatform, setActivePlatform] = useState(null);
  const { setHoveredId } = useHover();
  const isPadHovered = activePlatform !== null;

  const padIcons = [
    ({className}) => <svg viewBox="0 0 24 24" className={className}><path d="M12 2L2 12h3v8h14v-8h3L12 2z" fill="currentColor"/></svg>, // cine
    ({className}) => <svg viewBox="0 0 24 24" className={className}><path d="M4 4h16v16H4z M4 8h16" fill="currentColor"/></svg>, // libros
    ({className}) => <svg viewBox="0 0 24 24" className={className}><path d="M12 2a8 8 0 00-8 8v8h4v-8a4 4 0 018 0v8h4v-8a8 8 0 00-8-8z" fill="currentColor"/></svg>, // podcast
    ({className}) => <svg viewBox="0 0 24 24" className={className}><path d="M9 18V5l12-2v13 M9 9l12-2" fill="none" stroke="currentColor" strokeWidth="2"/></svg>, // musica
    ({className}) => <svg viewBox="0 0 24 24" className={className}><path d="M2 4h20v14H2z M12 4v14" fill="none" stroke="currentColor" strokeWidth="2"/></svg>, // series
    ({className}) => <svg viewBox="0 0 24 24" className={className}><path d="M4 8h16v8H4z M10 8v8 M14 8v8" fill="none" stroke="currentColor" strokeWidth="2"/></svg>, // juegos
    ({className}) => <svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/></svg> // otros
  ];

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      <div className="w-full h-full flex flex-col p-[16px] gap-[20px] text-text-secondary">
        
        {/* HEADER */}
        <div className="flex items-center gap-2 mb-[4px]">
          <div className="flex border-[0.5px] border-border-strong items-center px-[4px] py-[2px] bg-control-bg shadow-elevation-01">
            <div className="w-[10px] h-[10px] bg-synth-border-base mr-2"></div>
            <span className="text-text-primary text-[11px] font-body font-medium leading-none">1 módulo</span>
          </div>
          <span className="text-text-secondary font-heading text-[12px] tracking-[0.2em] uppercase">
            CONSUMOS CULTURALES ||||||
          </span>
        </div>

        {/* MAIN SPLIT */}
        <div className="flex flex-row flex-1 gap-[5.5%] min-h-0 pt-[10px]">
          
          {/* LEFT COLUMN: 44% */}
          <div className="flex flex-col w-[44%] justify-between min-w-0">
            {/* ROW 1: FORMATO y MODO AVIÓN */}
            <div className="flex flex-row h-[42%] justify-between items-center">
              <div className="w-[60%] h-full flex flex-col items-center justify-center relative mt-[10px]">
                 <div className="w-[70%] aspect-square relative">
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
              <div className="w-[20%] h-full flex items-center justify-center relative mt-[10px]">
                <LedButton 
                  baseClass="w-[70%] aspect-square rounded-[20%]" 
                  label="AVIÓN" 
                  labelClass={LBL_UP} 
                  compId="mod1-2" 
                />
              </div>
            </div>

            {/* ROW 2: PLATAFORMAS */}
            <div className="flex flex-row h-[52%] bg-bg-base border-[1px] border-border-subtle shadow-inset-control p-[3%] rounded-xl justify-between">
              <div className="w-[75%] grid grid-cols-4 grid-rows-3 gap-[4px]">
                {Array.from({ length: 12 }).map((_, i) => {
                  const compId = `mod1-${10 + i}`;
                  return (
                    <div key={`pad-${i}`} className="flex items-center justify-center border border-border-subtle bg-synth-panel shadow-elevation-01 rounded-sm p-[10%]">
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
              <div className="w-[18%] h-full flex flex-col items-center justify-center relative">
                <Fader 
                  orientation="vertical"
                  initialValue={50}
                  compId={activePlatform}
                  trackClass={`w-[35%] h-full relative flex justify-center transition-all duration-300 ${isPadHovered ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : ''}`}
                  thumbClass={`w-[160%] aspect-[3/1] absolute transition-shadow ${isPadHovered ? 'shadow-[0_0_10px_rgba(251,191,36,0.8)]' : ''}`}
                  label="HRS"
                  labelClass="mb-[2px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-text-muted font-body font-medium whitespace-nowrap pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 50.5% */}
          <div className="flex flex-col w-[50.5%] justify-between min-w-0">
            {/* MEDIOS (7 Faders) */}
            <div className="flex flex-row h-[42%] justify-around items-end pb-[2%] mt-[10px]">
              {['CINE', 'LIBROS', 'PODCAST', 'MÚSICA', 'SERIES', 'JUEGOS', 'OTROS'].map((text, i) => (
                <div key={`fader-${i}`} className="h-full flex items-center justify-center relative w-[10%]">
                  <Fader 
                    orientation="vertical"
                    initialValue={50}
                    trackClass="w-[30%] h-full relative flex justify-center"
                    thumbClass="w-[180%] aspect-[2/1] absolute z-10"
                    label={text}
                    labelClass="absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 -rotate-90 origin-bottom-left text-[7px] uppercase tracking-[0.25em] text-text-primary font-body font-bold whitespace-nowrap pointer-events-none"
                    compId={`mod1-${3 + i}`}
                  />
                  <div className="absolute top-[108%] w-full flex justify-center">
                    <LedButton baseClass="w-[50%] aspect-square rounded-full" compId={`mod1-${3 + i}`} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* HORIZONTAL SLIDER */}
            <div className="h-[18%] flex items-center justify-center relative mt-[8%]">
              <Fader 
                orientation="horizontal"
                initialValue={50}
                trackClass="w-full h-[25%] relative flex items-center"
                thumbClass="h-[180%] aspect-[1/2] absolute z-20"
                label="HRS X DÍA EN RRSS"
                labelClass="absolute bottom-[100%] mb-[4px] left-0 text-[7px] uppercase tracking-[0.25em] text-text-secondary font-body font-bold whitespace-nowrap pointer-events-none"
                markers={['1', '2', '3', '4', '6', '+']}
                compId="mod1-22"
              />
            </div>

            {/* KNOBS & JACKS */}
            <div className="h-[25%] flex flex-row justify-between mt-[4%]">
              <div className="w-[55%] flex flex-row items-center justify-around relative border border-transparent pt-[10px]">
                <span className="absolute top-[-10px] left-1 text-[8px] font-body font-bold tracking-widest text-text-muted uppercase">Referencias</span>
                {['FREC', 'IMP', 'IA'].map((text, i) => (
                  <div key={`knob-${i}`} className="w-[22%] aspect-square relative">
                    <Knob label={text} labelClass={LBL_UP} sizeClass="w-full h-full" initialValue={50} compId={`mod1-${23 + i}`} />
                  </div>
                ))}
              </div>
              <div className="w-[40%] bg-bg-base flex flex-col justify-center items-center p-[2%] border-[1px] border-border-subtle shadow-inset-control rounded-xl relative">
                <div className="w-[90%] bg-text-primary text-synth-border-light text-[9px] font-body font-bold text-center leading-none py-[4%] mb-[3%] tracking-[0.3em] uppercase rounded-sm drop-shadow-sm">SALIDAS</div>
                <div className="flex flex-row justify-around w-full px-[4%] flex-1 items-center">
                  {['JACK 1', 'JACK 2'].map((item, i) => {
                    const isOut1Active = routingOutputs?.out1?.startsWith('mod1-');
                    const isOut2Active = routingOutputs?.out2?.startsWith('mod1-');
                    const isActive = (i === 0 && isOut1Active) || (i === 1 && isOut2Active);
                    const activeColor = i === 0 ? 'blue-500' : 'orange-500';
                    return (
                      <div key={`jack-mod1--${i}`} className="w-[35%] aspect-square">
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
