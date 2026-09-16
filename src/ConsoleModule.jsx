import React from 'react';
import ModuleShell from './ModuleShell';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import LedButton from './components/actuators/LedButton';
import RotarySwitch from './components/actuators/RotarySwitch';

const LBL_UP = "absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none";

const ConsoleModule = () => {
  return (
    <ModuleShell isConsole={true}>
      {/* GRILLA DIRECTA 24x5. 8px padding, 2px gap (Igual que Módulo 1) */}
      <div className="w-full h-full grid grid-cols-[repeat(24,minmax(0,1fr))] grid-rows-5 p-[8px] gap-[2px] relative">
        
        {/* GRILLA DE COORDENADAS (FONDO MAGENTA 15%) - ACTIVADA PARA AJUSTES */}
        {[1, 2, 3, 4, 5].map((row, rIdx) => 
          ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'].map((col, cIdx) => (
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

        {/* --- COMPONENTES DEL MÓDULO CONSOLA --- */}

        {/* 1. 3 BOTONES CLAROS (Estilo botones bajo faders M1): Col B (2), Rows 2, 3, 4 */}
        {[2, 3, 4].map(row => (
          <div key={`btn-left-${row}`} style={{ gridColumnStart: 2, gridRowStart: row }} className="flex items-center justify-center z-10">
            <div className="w-[80%] aspect-square bg-[#E5E5E5] rounded-[20%] shadow-md relative">
              <span className={LBL_UP}>TEXTO</span>
            </div>
          </div>
        ))}

        {/* HORIZONTAL SLIDER LARGO: Cols C-J (3-10), Row 5 */}
        <div style={{ gridColumnStart: 3, gridColumnEnd: 'span 8', gridRowStart: 5 }} className="flex items-center justify-start z-10">
          <div className="w-full h-[50%] bg-[#111] rounded-full shadow-inner relative flex items-center">
            <span className={LBL_UP}>TEXTO</span>
            <div className="h-full aspect-square bg-[#FFF] rounded-full absolute left-[15%] shadow-md"></div>
          </div>
        </div>

        {/* 2. BIG KNOB 1 (Rotary Switch, Estilo Módulo 2 con puntos): Cols E-G (5-7), Rows 2-4 */}
        <div style={{ gridColumnStart: 5, gridColumnEnd: 'span 3', gridRowStart: 2, gridRowEnd: 'span 3' }} className="flex items-center justify-center z-10 pt-2">
          <RotarySwitch label="TEXTO" labelClass={LBL_UP} sizeClass="w-[85%] aspect-square" />
        </div>

        {/* 3. 6 TINY BUTTONS (Estilo Módulo 3): Cols J (10) y L (12). Rows 2-4 */}
        {[10, 12].map((col) => (
          <div key={`col-btns-${col}`} style={{ gridColumnStart: col, gridRowStart: 2, gridRowEnd: 5 }} className="flex flex-col justify-between items-center z-10 w-full h-full py-1">
            <LedButton baseClass="w-[30%] aspect-square rounded-[20%]" label="TEXTO" labelClass={LBL_UP} />
            <LedButton baseClass="w-[30%] aspect-square rounded-[20%]" label="TEXTO" labelClass={LBL_UP} />
            <LedButton baseClass="w-[30%] aspect-square rounded-[20%]" label="TEXTO" labelClass={LBL_UP} />
          </div>
        ))}

        {/* 4. BIG KNOB 2 (Rotary Switch, Estilo Módulo 2 con puntos): Cols O-Q (15-17), Rows 2-4 */}
        <div style={{ gridColumnStart: 15, gridColumnEnd: 'span 3', gridRowStart: 2, gridRowEnd: 'span 3' }} className="flex items-center justify-center z-10 pt-2">
          <RotarySwitch label="TEXTO" labelClass={LBL_UP} sizeClass="w-[85%] aspect-square" initialStep={4} />
        </div>

        {/* 2 SWITCHES DE PERILLA: Cols 19 y 20, Row 3. Alineados al centro */}
        {[19, 20].map((col) => (
          <div key={`switch-${col}`} style={{ gridColumnStart: col, gridRowStart: 3 }} className="flex items-center justify-center z-10">
            <ToggleSwitch label="TEXTO" labelClass={LBL_UP} />
          </div>
        ))}

        {/* 6. BIG KNOB 3 (Estilo Módulo 1): Cols V-W (22-23), Rows 2-3 */}
        <div style={{ gridColumnStart: 22, gridColumnEnd: 'span 2', gridRowStart: 2, gridRowEnd: 'span 2' }} className="flex items-center justify-center z-10 pointer-events-none">
          <div className="w-[80%] aspect-square rounded-full bg-[#E5E5E5] shadow-md flex items-start justify-center pt-2 pointer-events-auto relative">
            <span className={LBL_UP}>TEXTO</span>
            <div className="w-1 h-1 bg-[#444] rounded-full"></div>
          </div>
        </div>

      </div>
    </ModuleShell>
  );
};

export default ConsoleModule;
