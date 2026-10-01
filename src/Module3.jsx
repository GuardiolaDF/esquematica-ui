import React from 'react';
import ModuleShell from './ModuleShell';
import Jack from './components/cables/Jack';
import Fader from './components/actuators/Fader';
import Counter from './components/actuators/Counter';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import Knob from './components/actuators/Knob';
import LedButton from './components/actuators/LedButton';
import RotarySwitch from './components/actuators/RotarySwitch';
import { useAppContext } from './contexts/AppContext';

const LBL_UP = "absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.25em] text-synth-ink-base font-mono font-bold whitespace-nowrap pointer-events-none";
const LBL_DN = "absolute top-[100%] mt-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.25em] text-synth-ink-base font-mono font-bold whitespace-nowrap pointer-events-none";
const LBL_V = "absolute right-[100%] mr-[4px] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[7px] uppercase tracking-[0.25em] text-synth-ink-dark font-mono font-bold whitespace-nowrap pointer-events-none";

const Module3 = () => {
  const { showGrid, mode, routingOutputs } = useAppContext();
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const rows = [1, 2, 3, 4, 5, 6, 7];

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      <div className="w-full h-full flex flex-col p-[16px] gap-[20px] text-synth-ink-base">
        
        {/* HEADER */}
        <div className="flex items-center gap-2 mb-[4px]">
          <div className="flex border-[0.5px] border-synth-border-base items-center px-[4px] py-[2px] bg-synth-module shadow-neo-out">
            <div className="w-[10px] h-[10px] bg-synth-border-base mr-2"></div>
            <span className="text-synth-ink-dark text-[11px] font-mono font-medium leading-none">3 módulo</span>
          </div>
          <span className="text-synth-ink-base font-display text-[12px] tracking-[0.2em] uppercase">
            SALUD MENTAL ||||||
          </span>
        </div>

        {/* MAIN SPLIT */}
        <div className="flex flex-row flex-1 min-h-0 w-full pt-[2%]">
          
          {/* LEFT COLUMN: 33% */}
          <div className="flex flex-col w-[33%] h-full justify-between pr-[4%]">
            {/* 4 Small Knobs */}
            <div className="grid grid-cols-2 grid-rows-2 gap-[10%] h-[45%] w-full  p-[4%]">
              {[
                { l: 'PRESIÃ“N', id: 'mod3-1' }, { l: 'CONFIANZA', id: 'mod3-2' },
                { l: 'ÃšLT. MOMENTO', id: 'mod3-3' }, { l: 'COMPARAC.', id: 'mod3-4' }
              ].map((item, i) => (
                <div key={item.id} className="flex items-center justify-center relative">
                  <Knob label={item.l} labelClass={LBL_UP} sizeClass="w-[70%] aspect-square" initialValue={50} compId={item.id} />
                </div>
              ))}
            </div>

            {/* BIG KNOB */}
            <div className="h-[45%] w-full flex items-center justify-center relative ">
               <RotarySwitch 
                 label="EMOCIÃ“N DOMINANTE" 
                 labelClass={LBL_UP} 
                 sizeClass="h-[80%] aspect-square" 
                 compId="mod3-5" 
                 optionLabels={['ENTUSIASMO', 'FLOW', 'ANSIEDAD', 'ESTRÃ‰S', 'FRUSTRACIÃ“N']}
               />
            </div>
          </div>

          {/* MIDDLE COLUMN: 12% */}
          <div className="w-[12%] h-full flex flex-col items-center justify-center pr-[4%]">
            <div className="h-full w-full flex flex-col items-center justify-center relative  py-[10%]">
              <Fader 
                orientation="vertical"
                initialValue={50}
                trackClass="w-[30%] h-full    relative flex justify-center"
                thumbClass="w-[150%] aspect-square   absolute  z-10"
                label="ANSIEDAD"
                labelClass={LBL_V}
                compId="mod3-16"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: 55% */}
          <div className="flex flex-col w-[55%] h-full justify-between">
            
            {/* ROW 1: Counters, Switch, and Pads (45%) */}
            <div className="flex flex-row h-[45%] justify-between">
              <div className="w-[60%] flex flex-row items-center justify-around ">
                {[{ l: 'HS SUEÃ‘O', id: 'mod3-6' }, { l: 'PRE-ENTR.', id: 'mod3-7' }].map((item) => (
                  <div key={item.id} className="w-[35%] h-full flex flex-col items-center justify-center relative">
                    <Counter label={item.l} labelClass={LBL_UP} compId={item.id} />
                  </div>
                ))}
                
                <div className="w-[20%] flex items-center justify-center relative">
                   <ToggleSwitch label="PROCRAST." labelClass={LBL_UP} compId="mod3-8" />
                </div>
              </div>
              
              <div className={"w-[35%] grid grid-cols-2 grid-rows-3 gap-[4px] bg-synth-surface border border-synth-border-light p-[2%] transition-opacity duration-300 "}>
                {['RRSS', 'DORMIR', 'ORDENAR', 'TAREAS', 'GYM', 'OTROS'].map((l, i) => (
                  <div key={l} className="flex items-center justify-center  relative">
                    <LedButton baseClass="w-[60%] aspect-square rounded-[20%]" label={l} labelClass={LBL_UP} compId={`mod3-${9 + i}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 2: Horizontal Slider (20%) */}
            <div className="h-[20%]  flex items-center justify-center px-[8%] relative">
              <Fader 
                orientation="horizontal"
                initialValue={50}
                trackClass="w-full h-[30%]    relative flex items-center"
                thumbClass="h-[150%] aspect-square   absolute  z-20"
                label="MOMENTO FRUSTRACIÃ“N"
                labelClass={LBL_UP}
                compId="mod3-15"
              />
              <span className="absolute left-[8%] -bottom-1 text-[6px] text-synth-ink-light font-bold">INICIO</span>
              <span className="absolute right-[8%] -bottom-1 text-[6px] text-synth-ink-light font-bold">ENTREGA</span>
            </div>

            {/* ROW 3: 3 Switches & 2 Jacks (30%) */}
            <div className="flex flex-row h-[30%] justify-between bg-synth-surface">
              {/* SWITCHES */}
              <div className="w-[60%] flex flex-row items-end justify-around  pb-[2%] px-[2%]">
                {[{ l: 'RESULTADO', id: 'mod3-17' }, { l: 'TÃ‰CNICAS', id: 'mod3-18' }, { l: 'SÃNTOMAS', id: 'mod3-19' }].map((item) => (
                  <div key={item.id} className="w-[20%] flex items-end justify-center relative">
                    <ToggleSwitch label={item.l} labelClass={LBL_UP} compId={item.id} />
                  </div>
                ))}
              </div>
              
              {/* JACKS */}
              <div className="w-[35%] bg-synth-surface flex flex-col justify-center items-center p-[2%] border border-synth-border-light relative">
                <div className="w-full bg-synth-ink-dark text-white text-[9px] font-sans font-bold text-center leading-none py-[4%] mb-[4%] tracking-widest uppercase text-synth-surface">SALIDAS</div>
                <div className="flex flex-row justify-around w-full px-[4%] flex-1 items-center">
                  {['JACK 1', 'JACK 2'].map((item, i) => {
                    const isOut1Active = routingOutputs?.out1?.startsWith('mod3-');
                    const isOut2Active = routingOutputs?.out2?.startsWith('mod3-');
                    const isActive = (i === 0 && isOut1Active) || (i === 1 && isOut2Active);
                    const activeColor = i === 0 ? 'blue-500' : 'orange-500';
                    return (
                      <div key={`jack-mod3-${i}`} className="w-[35%] aspect-square">
                        <Jack 
                          id={`out-mod3-${i}`} 
                          type="output" 
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

export default Module3;



