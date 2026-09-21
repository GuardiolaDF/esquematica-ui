import React from 'react';
import ModuleShell from './ModuleShell';
import Fader from './components/actuators/Fader';
import Counter from './components/actuators/Counter';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import Knob from './components/actuators/Knob';
import LedButton from './components/actuators/LedButton';
import RotarySwitch from './components/actuators/RotarySwitch';
import { useAppContext } from './contexts/AppContext';

const LBL_UP = "absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";
const LBL_DN = "absolute top-[100%] mt-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";
const LBL_V = "absolute right-[100%] mr-[4px] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";

const Module2 = () => {
  const { showGrid, mode, routingOutputs } = useAppContext();
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const rows = [1, 2, 3, 4, 5, 6, 7];

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      {/* GRILLA DIRECTA 12x7. 8px padding, 2px gap (Igual que Módulo 1) */}
      <div className="w-full h-full grid grid-cols-12 grid-rows-7 p-[8px] gap-[2px] relative">
        
        {/* GRILLA DE COORDENADAS */}
        {showGrid && [1, 2, 3, 4, 5, 6, 7].map((row, rIdx) => 
          ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((col, cIdx) => (
            <div 
              key={`coord-${col}${row}`} 
              style={{ gridColumnStart: cIdx + 1, gridRowStart: rIdx + 1 }}
              className="bg-[#FF00FF]/15 flex items-start justify-start p-[2px] pointer-events-none rounded-[1px] z-0"
            >
              <span className="text-[9px] font-mono font-bold text-[#FF00FF] opacity-70 leading-none">
                {col}{row}
              </span>
            </div>
          ))
        )}

        {/* --- COMPONENTES DEL MÓDULO 2 --- */}

        {/* BIG KNOB (Rotary Switch): Centro de B-C (Cols 2-3), Rows 2-4. */}
        <div className="col-start-2 col-span-2 row-start-2 row-span-3 flex items-start justify-center relative z-10 pt-2">
           <RotarySwitch 
             label="BOCETO A MANO" 
             labelClass={LBL_UP} 
             sizeClass="h-[83.33%] aspect-square" 
             compId="mod2-1" 
             optionLabels={['SIEMPRE', 'CASI SIEMPRE', 'A VECES', 'CASI NUNCA', 'NUNCA']}
           />
        </div>

        {/* 2 MEDIUM KNOBS: Cols B-C (2-3), Rows 5 y 7. Iguales a los de G7 */}
        {[
          { r: 5, l: 'PERFECC.' },
          { r: 7, l: 'PROCRASTINAR' }
        ].map((item, i) => (
          <div key={`mknob-${item.r}`} style={{ gridColumnStart: 2, gridColumnEnd: 4, gridRowStart: item.r }} className="flex items-center justify-center z-10">
            <Knob label={item.l} labelClass={LBL_UP} sizeClass="w-[40%]" initialValue={50} compId={`mod2-${2 + i}`} />
          </div>
        ))}

        {/* VERTICAL SLIDER: Col E (5), Rows 2-4. Alineado a la derecha */}
        <div className="col-start-5 col-span-1 row-start-2 row-span-3 flex items-center justify-end z-10">
          <Fader 
            orientation="vertical"
            initialValue={50}
            trackClass="w-[30%] h-full bg-[#E5E5E5] rounded-full shadow-inner relative flex justify-center"
            thumbClass="w-full aspect-square bg-[#888] rounded-full absolute shadow-md"
            label="SILENCIO"
            labelClass={LBL_V}
            compId="mod2-4"
          />
        </div>

        {/* 4 TINY BUTTONS (MINI PADS): Cols D-E (4-5), Rows 6-7. Alineados arriba a la izquierda pegados a la celda */}
        {[
          { c: 4, r: 6, l: 'PAUSAS' }, { c: 5, r: 6, l: 'ESCRITORIO' },
          { c: 4, r: 7, l: 'NOCTURNO' }, { c: 5, r: 7, l: 'RESPALDO' }
        ].map((pos, i) => (
          <div key={`tbtn-${pos.c}-${pos.r}`} style={{ gridColumnStart: pos.c, gridRowStart: pos.r }} className="flex items-start justify-start z-10">
            <LedButton baseClass="w-[30%] aspect-square rounded-[20%]" label={pos.l} labelClass={LBL_UP} compId={`mod2-${5 + i}`} />
          </div>
        ))}

        {/* 3 SCREENS + ARROWS: Cols G-H, I-J, K-L (7-12), Rows 2-3 */}
        {[{c:7, l:'PROGRAMAS'}, {c:9, l:'PESTAÑAS'}, {c:11, l:'SIN TÍTULO'}].map((item, i) => (
          <div key={`screen-${i}`} style={{ gridColumnStart: item.c, gridColumnEnd: item.c + 2, gridRowStart: 2, gridRowEnd: 4 }} className="flex flex-row items-center justify-between z-10 w-full h-full">
            <Counter label={item.l} labelClass={LBL_UP} compId={`mod2-${9 + i}`} />
          </div>
        ))}

        {/* 3 SWITCHES DE PERILLA: Cols G, I, K (7, 9, 11), Row 5. Alineados abajo a la izquierda */}
        {[{c:7, l:'VERSIONES'}, {c:9, l:'NOTIFICACIONES'}, {c:11, l:'COMIDA'}].map((item, i) => (
          <div key={`switch-${item.c}`} style={{ gridColumnStart: item.c, gridRowStart: 5 }} className="flex items-end justify-start z-10 pb-1 pl-1">
            <ToggleSwitch label={item.l} labelClass={LBL_UP} compId={`mod2-${12 + i}`} />
          </div>
        ))}

        {/* 3 POTES CHICOS: Cols G-I (7-9), Row 7 */}
        {[
          { c: 7, l: 'INTERRUPCIONES' },
          { c: 8, l: 'IMPOSTOR' },
          { c: 9, l: 'ORDEN ARCHIVOS' }
        ].map((item, i) => (
          <div key={`mpote-${item.c}`} style={{ gridColumnStart: item.c, gridRowStart: 7 }} className="flex items-center justify-center z-10">
             <Knob label={item.l} labelClass={LBL_UP} sizeClass="w-[80%]" initialValue={50} compId={`mod2-${15 + i}`} />
          </div>
        ))}

        {/* 2 JACKS: Cols K-L (11-12), Row 7 */}
        {[11, 12].map((col, i) => {
          const isOut1Active = routingOutputs?.out1?.startsWith('mod2-');
          const isOut2Active = routingOutputs?.out2?.startsWith('mod2-');
          const isActive = (i === 0 && isOut1Active) || (i === 1 && isOut2Active);
          const activeColor = i === 0 ? 'orange-500' : 'blue-500';
          const glowClass = isActive ? `bg-${activeColor} shadow-[0_0_15px_rgba(${i === 0 ? '249,115,22' : '59,130,246'},0.8)]` : 'bg-[#111]';
          return (
            <div key={`jack2-${col}`} style={{ gridColumnStart: col, gridRowStart: 7 }} className="flex items-end justify-end z-10">
              <div className="w-[60%] aspect-square bg-[#CCC] rounded-full shadow-inner border border-[#999] flex items-center justify-center relative">
                 <span className={LBL_UP}>TEXTO</span>
                 <div className={`w-[45%] aspect-square rounded-full transition-all duration-300 ${glowClass}`}></div>
              </div>
            </div>
          );
        })}
      </div>
    </ModuleShell>
  );
};

export default Module2;
