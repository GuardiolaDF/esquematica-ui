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

const Module3 = () => {
  const { values, averages, mode, showGrid } = useAppContext();
  
  // Determinar si el switch de procrastinación está activo
  // En modo colectivo, si el promedio es > 0, lo consideramos activo para iluminar el banco de pads
  const procIsOn = mode === 'colectivo' ? (averages['mod3-8'] > 0) : (values['mod3-8'] === 100 || values['mod3-8'] === true);

  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const rows = [1, 2, 3, 4, 5, 6, 7];

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      {/* GRILLA DIRECTA 12x7 */}
      <div className="w-full h-full grid grid-cols-12 grid-rows-7 p-[8px] gap-[2px] relative">
        
        {/* GRILLA DE COORDENADAS */}
        {showGrid && rows.map((row, rIdx) => 
          cols.map((col, cIdx) => (
            <div 
              key={`coord-m3-${col}${row}`} 
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
        {[
          { c: 1, r: 2, l: 'BAJO PRESIÓN' }, { c: 3, r: 2, l: 'CONFIANZA' },
          { c: 1, r: 4, l: 'ÚLTIMO MOMENTO' }, { c: 3, r: 4, l: 'COMPARACIÓN' }
        ].map((pos, i) => (
          <div key={`mknob-${i}`} style={{ gridColumnStart: pos.c, gridColumnEnd: pos.c + 2, gridRowStart: pos.r }} className="flex items-center justify-center z-10">
            <Knob label={pos.l} labelClass={LBL_UP} sizeClass="w-[38%]" initialValue={50} compId={`mod3-${1 + i}`} />
          </div>
        ))}

        {/* BIG KNOB: Cols B-C (2-3), Rows 6-7. */}
        <div className="col-start-2 col-span-2 row-start-6 row-span-2 flex items-center justify-center z-10 pointer-events-none -translate-y-[25%]">
          <div className="w-[80%] aspect-square rounded-full flex items-start justify-center pointer-events-auto relative">
             <RotarySwitch 
               label="EMOCIÓN DOMINANTE" 
               labelClass={LBL_UP} 
               sizeClass="w-full h-full" 
               compId="mod3-5" 
               optionLabels={['ENTUSIASMO', 'FLOW', 'ANSIEDAD', 'ESTRÉS', 'FRUSTRACIÓN']}
             />
          </div>
        </div>

        {/* 2 SCREENS + ARROWS: Cols E-F, G-H (5-6, 7-8), Rows 2-3 (2 módulos de alto) */}
        {[
          { col: 5, l: 'HS SUEÑO' }, 
          { col: 7, l: 'PRE-ENTREGA' }
        ].map((item, i) => (
          <div key={`screen-${i}`} style={{ gridColumnStart: item.col, gridColumnEnd: item.col + 2, gridRowStart: 2, gridRowEnd: 4 }} className="flex flex-row items-center justify-between z-10 w-full h-full pr-1">
            <Counter label={item.l} labelClass={LBL_UP} compId={`mod3-${6 + i}`} />
          </div>
        ))}

        {/* 1 ISOLATED MINI SWITCH: Centrado entre I2, J2, I3, J3 (Cols 9-10, Rows 2-3) */}
        <div className="col-start-9 col-span-2 row-start-2 row-span-2 flex items-center justify-center z-10">
          <div className="w-1/2 flex items-center justify-center relative">
             <ToggleSwitch label="PROCRASTINÁS" labelClass={LBL_UP} sizeClass="w-[45%]" compId="mod3-8" />
          </div>
        </div>

        {/* 6 TINY BUTTONS (PROCRASTINATION METHODS): Cols K-L (11-12). Repartidos entre la fila 2 y 3 (Arriba, medio, y abajo) */}
        {[11, 12].map((col, colIdx) => (
          <div 
            key={`col-btns-${col}`} 
            style={{ gridColumnStart: col, gridRowStart: 2, gridRowEnd: 4 }} 
            className={`flex flex-col justify-between items-start z-10 w-full h-full transition-all duration-300 ${procIsOn ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}
          >
            {[
              { l: colIdx === 0 ? 'RRSS' : 'DORMIR', i: 0 },
              { l: colIdx === 0 ? 'ORDENAR' : 'TAREAS', i: 1 },
              { l: colIdx === 0 ? 'GYM' : 'OTROS', i: 2 }
            ].map(btn => (
              <LedButton 
                key={btn.l}
                baseClass="w-[30%] aspect-square rounded-[20%]" 
                label={btn.l} 
                labelClass={LBL_UP} 
                compId={`mod3-${9 + (colIdx * 3) + btn.i}`} 
              />
            ))}
          </div>
        ))}

        {/* HORIZONTAL SLIDER: Cols G-K (7-11), Row 5. */}
        <div className="col-start-7 col-span-5 row-start-5 flex items-start justify-start z-10 mt-1 relative">
          <Fader 
            orientation="horizontal"
            initialValue={50}
            trackClass="w-full h-[50%] bg-[#111] rounded-full shadow-inner relative flex items-center mt-2"
            thumbClass="h-full aspect-square bg-[#FFF] rounded-full absolute shadow-md z-20"
            label="MOMENTO FRUSTRACIÓN"
            labelClass={LBL_UP}
            compId="mod3-15"
          />
          {/* Etiquetas del eje temporal */}
          <span className="absolute left-0 -bottom-[10px] text-[5px] text-[#888] font-bold">INICIO</span>
          <span className="absolute right-0 -bottom-[10px] text-[5px] text-[#888] font-bold">ENTREGA</span>
        </div>

        {/* VERTICAL SLIDER: Col E (5), Rows 4-6. Alineado a la derecha */}
        <div className="col-start-5 col-span-1 row-start-4 row-span-3 flex items-center justify-end z-10">
          <Fader 
            orientation="vertical"
            initialValue={50}
            trackClass="w-[30%] h-full bg-[#E5E5E5] rounded-full shadow-inner relative flex justify-center"
            thumbClass="w-full aspect-square bg-[#888] rounded-full absolute shadow-md"
            label="ANSIEDAD"
            labelClass={LBL_V}
            compId="mod3-16"
          />
        </div>

        {/* 3 SWITCHES (Bottom): Cols G-I (7-9), Row 6 */}
        {[
          { c: 7, l: 'EMOCIÓN RESULTADO' },
          { c: 8, l: 'TÉCNICAS CONC.' },
          { c: 9, l: 'SÍNTOMAS FÍS.' }
        ].map((item, i) => (
          <div key={`switch-b-${item.c}`} style={{ gridColumnStart: item.c, gridRowStart: 6 }} className="flex items-end justify-start z-10 pb-1 pl-1">
            <ToggleSwitch label={item.l} labelClass={LBL_UP} compId={`mod3-${17 + i}`} />
          </div>
        ))}

        {/* 2 JACKS: Cols K-L (11-12), Row 7 */}
        {[11, 12].map((col, i) => {
          const isOut1Active = routingOutputs?.out1?.startsWith('mod3-');
          const isOut2Active = routingOutputs?.out2?.startsWith('mod3-');
          const isActive = (i === 0 && isOut1Active) || (i === 1 && isOut2Active);
          const activeColor = i === 0 ? 'orange-500' : 'blue-500';
          const glowClass = isActive ? `bg-${activeColor} shadow-[0_0_15px_rgba(${i === 0 ? '249,115,22' : '59,130,246'},0.8)]` : 'bg-[#111]';
          return (
            <div key={`jack3-${col}`} style={{ gridColumnStart: col, gridRowStart: 7 }} className="flex items-end justify-end z-10">
              <div className="w-[60%] aspect-square bg-[#CCC] rounded-full shadow-inner border border-[#999] flex items-center justify-center relative">
                 <span className={LBL_UP}>&nbsp;</span>
                 <div className={`w-[45%] aspect-square rounded-full transition-all duration-300 ${glowClass}`}></div>
              </div>
            </div>
          );
        })}
      </div>
    </ModuleShell>
  );
};

export default Module3;
