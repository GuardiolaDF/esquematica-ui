import React from 'react';
import ModuleShell from './ModuleShell';
import Fader from './components/actuators/Fader';
import Counter from './components/actuators/Counter';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import Knob from './components/actuators/Knob';
import LedButton from './components/actuators/LedButton';
import RotarySwitch from './components/actuators/RotarySwitch';

const LBL_UP = "absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";
const LBL_DN = "absolute top-[100%] mt-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";
const LBL_V = "absolute right-[100%] mr-[4px] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";

const Module3 = () => {
  return (
    <ModuleShell>
      {/* GRILLA DIRECTA 12x7. 8px padding, 2px gap (Igual que Módulo 1) */}
      <div className="w-full h-full grid grid-cols-12 grid-rows-7 p-[8px] gap-[2px] relative">
        
        {/* GRILLA DE COORDENADAS (FONDO MAGENTA 15%) - ACTIVADA PARA AJUSTES */}
        {[1, 2, 3, 4, 5, 6, 7].map((row, rIdx) => 
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

        {/* --- COMPONENTES DEL MÓDULO 3 --- */}

        {/* 4 MEDIUM KNOBS: Centrados en las líneas A-B (1-2) y C-D (3-4), Rows 2 y 4 */}
        {[
          { c: 1, r: 2 }, { c: 3, r: 2 },
          { c: 1, r: 4 }, { c: 3, r: 4 }
        ].map((pos, i) => (
          <div key={`mknob-${i}`} style={{ gridColumnStart: pos.c, gridColumnEnd: pos.c + 2, gridRowStart: pos.r }} className="flex items-center justify-center z-10">
            <Knob label="TEXTO" labelClass={LBL_UP} sizeClass="w-[38%]" initialValue={10 * (i + 1)} compId={`mod3-${1 + i}`} />
          </div>
        ))}

        {/* BIG KNOB: Idéntico al del Módulo 1. Cols B-C (2-3), Rows 6-7. (Desplazado media celda hacia arriba) */}
        <div className="col-start-2 col-span-2 row-start-6 row-span-2 flex items-center justify-center z-10 pointer-events-none -translate-y-[25%]">
          <div className="w-[80%] aspect-square rounded-full flex items-start justify-center pointer-events-auto relative">
             <RotarySwitch label="TEXTO" labelClass={LBL_UP} sizeClass="w-full h-full" angles={[-45, 0, 45]} compId="mod3-5" />
          </div>
        </div>

        {/* 2 SCREENS + ARROWS: Cols E-F, G-H (5-6, 7-8), Rows 2-3 (2 módulos de alto) */}
        {[5, 7].map((col, i) => (
          <div key={`screen-${i}`} style={{ gridColumnStart: col, gridColumnEnd: col + 2, gridRowStart: 2, gridRowEnd: 4 }} className="flex flex-row items-center justify-between z-10 w-full h-full pr-1">
            <Counter label="TEXTO" labelClass={LBL_UP} compId={`mod3-${6 + i}`} />
          </div>
        ))}

        {/* 1 ISOLATED MINI SWITCH: Centrado entre I2, J2, I3, J3 (Cols 9-10, Rows 2-3) */}
        <div className="col-start-9 col-span-2 row-start-2 row-span-2 flex items-center justify-center z-10">
          <div className="w-1/2 flex items-center justify-center">
             <ToggleSwitch label="TEXTO" labelClass={LBL_UP} sizeClass="w-[45%]" compId="mod3-8" />
          </div>
        </div>

        {/* 6 TINY BUTTONS: Cols K-L (11-12). Repartidos entre la fila 2 y 3 (Arriba, medio, y abajo) */}
        {[11, 12].map((col, colIdx) => (
          <div key={`col-btns-${col}`} style={{ gridColumnStart: col, gridRowStart: 2, gridRowEnd: 4 }} className="flex flex-col justify-between items-start z-10 w-full h-full">
            <LedButton baseClass="w-[30%] aspect-square rounded-[20%]" label="TEXTO" labelClass={LBL_UP} compId={`mod3-${9 + colIdx * 3}`} />
            <LedButton baseClass="w-[30%] aspect-square rounded-[20%]" label="TEXTO" labelClass={LBL_UP} compId={`mod3-${10 + colIdx * 3}`} />
            <LedButton baseClass="w-[30%] aspect-square rounded-[20%]" label="TEXTO" labelClass={LBL_UP} compId={`mod3-${11 + colIdx * 3}`} />
          </div>
        ))}

        {/* HORIZONTAL SLIDER: Cols G-K (7-11), Row 5. Alineado al borde superior. Idéntico track/thumb al Módulo 1 */}
        <div className="col-start-7 col-span-5 row-start-5 flex items-start justify-start z-10 mt-1">
          <Fader 
            orientation="horizontal"
            initialValue={50}
            trackClass="w-full h-[50%] bg-[#111] rounded-full shadow-inner relative flex items-center mt-2"
            thumbClass="h-full aspect-square bg-[#FFF] rounded-full absolute shadow-md z-20"
            label="TEXTO"
            labelClass={LBL_UP}
            compId="mod3-15"
          />
        </div>

        {/* VERTICAL SLIDER: Col E (5), Rows 5-7. Alineado a la derecha */}
        <div className="col-start-5 col-span-1 row-start-5 row-span-3 flex items-center justify-end z-10">
          <Fader 
            orientation="vertical"
            initialValue={0}
            trackClass="w-[45%] h-full bg-[#E5E5E5] rounded-full shadow-inner relative flex justify-center"
            thumbClass="w-[120%] aspect-square bg-[#888] rounded-full absolute shadow-md"
            label="TEXTO"
            labelClass={LBL_V}
            compId="mod3-16"
          />
        </div>

        {/* 3 SWITCHES (Bottom): Cols G-I (7-9), Row 6 */}
        {[7, 8, 9].map((col, i) => (
          <div key={`switch-b-${col}`} style={{ gridColumnStart: col, gridRowStart: 6 }} className="flex items-end justify-start z-10 pb-1 pl-1">
            <ToggleSwitch label="TEXTO" labelClass={LBL_UP} compId={`mod3-${17 + i}`} />
          </div>
        ))}

        {/* 2 JACKS: Cols K-L (11-12), Row 7 */}
        {[11, 12].map((col) => (
          <div key={`jack3-${col}`} style={{ gridColumnStart: col, gridRowStart: 7 }} className="flex items-end justify-end z-10">
            <div className="w-[60%] aspect-square bg-[#CCC] rounded-full shadow-inner border border-[#999] flex items-center justify-center relative">
               <span className={LBL_UP}>TEXTO</span>
               <div className="w-[45%] aspect-square bg-[#111] rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
};

export default Module3;
