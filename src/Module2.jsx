import React from 'react';
import ModuleShell from './ModuleShell';
import OutputPanel, { moduleOutputJacks } from './components/cables/OutputPanel';
import Fader from './components/actuators/Fader';
import Counter from './components/actuators/Counter';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import Knob from './components/actuators/Knob';
import LedButton from './components/actuators/LedButton';
import RotarySwitch from './components/actuators/RotarySwitch';
import { useAppContext } from './contexts/AppContext';

const LBL_UP = "absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.25em] text-text-secondary font-body font-bold whitespace-nowrap pointer-events-none";
const LBL_DN = "absolute top-[100%] mt-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.25em] text-text-secondary font-body font-bold whitespace-nowrap pointer-events-none";
const LBL_V = "absolute right-[100%] mr-[4px] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[7px] uppercase tracking-[0.25em] text-text-primary font-body font-bold whitespace-nowrap pointer-events-none";

const Module2 = () => {
  const { showGrid, mode, routingOutputs } = useAppContext();
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const rows = [1, 2, 3, 4, 5, 6, 7];

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      <div className="w-full h-full flex flex-col p-[16px] gap-[20px] text-text-secondary">
        
        {/* HEADER */}
        <div className="flex items-center gap-2 mb-[4px]">
          <div className="flex border-[0.5px] border-border-strong items-center px-[4px] py-[2px] bg-control-bg shadow-elevation-01">
            <div className="w-[10px] h-[10px] bg-neutral-400 mr-2"></div>
            <span className="text-text-primary text-[11px] font-body font-medium leading-none">2 módulo</span>
          </div>
          <span className="text-text-secondary font-heading text-[12px] tracking-[0.2em] uppercase">
            MODOS DE TRABAJO ||||||
          </span>
        </div>

        {/* MAIN SPLIT */}
        <div className="flex flex-row flex-1 min-h-0 w-full">
          
          {/* LEFT COLUMN: 48% */}
          <div className="flex flex-col w-[48%] h-full justify-between pr-[4%]">
            
            {/* ROW 1: Boceto & Silencio (50%) */}
            <div className="flex flex-row h-[50%] justify-between items-center  border-[0.5px] border-border-subtle p-[2%]">
              {/* BOCETO A MANO (RotarySwitch) */}
              <div className="w-[84%] h-full flex items-center justify-center relative">
                 <RotarySwitch 
                   label="BOCETO A MANO" 
                   labelClass={LBL_UP} 
                   sizeClass="h-[80%] aspect-square" 
                   compId="mod2-1" 
                   optionLabels={['SIEMPRE', 'CASI SIEMPRE', 'A VECES', 'CASI NUNCA', 'NUNCA']}
                 />
              </div>
              
              {/* SILENCIO (Fader) */}
              <div className="w-[10%] h-[90%] flex flex-col items-center justify-center relative">
                <Fader 
                  orientation="vertical"
                  initialValue={50}
                  trackClass="w-[30%] h-full    relative flex justify-center"
                  thumbClass="w-[150%] aspect-square   absolute  z-10"
                  label="SILENCIO"
                  labelClass={LBL_V}
                  compId="mod2-4"
                />
              </div>
            </div>

            {/* ROW 2: Perfeccionismo, Procrastinar, Icons (50%) */}
            <div className="flex flex-row h-[48%] justify-between items-center mt-[2%] bg-bg-base border-[0.5px] border-border-subtle p-[4%]">
              {/* 2 SMALL KNOBS */}
              <div className="flex flex-col h-full justify-around w-[30%] ">
                {[{ l: 'PERFECC.', id: 'mod2-2' }, { l: 'PROCRAST.', id: 'mod2-3' }].map((item, i) => (
                  <div key={item.id} className="w-[80%] aspect-square relative self-center">
                    <Knob label={item.l} labelClass={LBL_UP} sizeClass="w-full h-full" initialValue={50} compId={item.id} />
                  </div>
                ))}
              </div>
              
              {/* 4 MINI PADS (Icons) */}
              <div className="grid grid-cols-2 grid-rows-2 w-[40%] gap-[4px] h-[80%]  p-[2%]">
                {[{ l: 'PAUSAS', id: 'mod2-5' }, { l: 'ESCRITORIO', id: 'mod2-6' },
                  { l: 'NOCTURNO', id: 'mod2-7' }, { l: 'RESPALDO', id: 'mod2-8' }].map((pos, i) => (
                  <div key={pos.id} className="flex items-center justify-center">
                    <LedButton baseClass="w-full h-full rounded-[20%]" label={pos.l} labelClass={LBL_UP} compId={pos.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 52% */}
          <div className="flex flex-col w-[52%] h-full justify-between">
            
            {/* ROW 1: 3 Counters (33.3%) */}
            <div className="flex flex-row h-[33.3%] justify-between items-center  px-[2%]">
              {[{l:'PROGRAMAS', id:'mod2-9'}, {l:'PESTAÑAS', id:'mod2-10'}, {l:'ARCHIVOS', id:'mod2-11'}].map((item, i) => (
                <div key={item.id} className="w-[28%] h-full flex flex-col items-center justify-center relative">
                  <Counter label={item.l} labelClass={LBL_UP} compId={item.id} />
                </div>
              ))}
            </div>

            {/* ROW 2: 3 Switches (21.5%) */}
            <div className="flex flex-row h-[21.5%] justify-between items-end bg-bg-base pb-[2%] px-[2%]">
              {[{l:'VERSIONES', id:'mod2-12'}, {l:'NOTIF.', id:'mod2-13'}, {l:'COMIDA', id:'mod2-14'}].map((item, i) => (
                <div key={item.id} className="w-[28%] flex items-end justify-center relative">
                  <ToggleSwitch label={item.l} labelClass={LBL_UP} compId={item.id} />
                </div>
              ))}
            </div>

            {/* ROW 3: 3 Knobs & 2 Jacks (27.6%) */}
            <div className="flex flex-row h-[27.6%] justify-between bg-bg-base">
              {/* KNOBS */}
              <div className="w-[51%] flex flex-row items-center justify-around  px-[2%] relative pt-[4%]">
                {[{ l: 'INTERRUP.', id: 'mod2-15' }, { l: 'IMPOSTOR', id: 'mod2-16' }, { l: 'ORDEN', id: 'mod2-17' }].map((item, i) => (
                  <div key={item.id} className="w-[25%] aspect-square relative">
                    <Knob label={item.l} labelClass={LBL_UP} sizeClass="w-full h-full" initialValue={50} compId={item.id} />
                  </div>
                ))}
              </div>
              
              {/* JACKS */}
              <div className="w-[45%] flex items-center justify-center">
                <OutputPanel jacks={moduleOutputJacks('mod2', routingOutputs)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
};

export default Module2;

