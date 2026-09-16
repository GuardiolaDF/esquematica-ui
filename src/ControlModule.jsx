import React from 'react';
import ModuleShell from './ModuleShell';
import Fader from './components/actuators/Fader';
import Knob from './components/actuators/Knob';
import LedButton from './components/actuators/LedButton';
import RotarySwitch from './components/actuators/RotarySwitch';
import { SiYoutube, SiSpotify, SiHbo, SiNetflix, SiStremio, SiTiktok, SiTwitch, SiMubi, SiInstagram, SiKick } from 'react-icons/si';
import { TbBrandDisney } from 'react-icons/tb';
import { FaAmazon } from 'react-icons/fa';

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
  return (
    <ModuleShell>
      {/* GRILLA DIRECTA 12x7. 8px padding, 2px gap */}
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
        
        {/* BIG KNOB: Cols 2-3, Rows 2-3 (Modificado como RotarySwitch de 3 posiciones) */}
        {/* "alinealo a la base de la fila 3, osea hay que bajarlo hasta el borde inferior de la fila 3" */}
        <div className="col-start-2 col-span-2 row-start-2 row-span-2 flex items-end justify-center z-10 pointer-events-none">
          <div className="w-[80%] aspect-square rounded-full flex items-start justify-center pointer-events-auto relative">
             <RotarySwitch 
               label="FORMATO" 
               labelClass={LBL_UP} 
               sizeClass="w-full h-full" 
               angles={[-45, 0, 45]} 
               optionLabels={["Corto", "Medio", "Largo"]}
               compId="mod1-1" 
             />
          </div>
        </div>

        {/* 1 TINY BUTTON: Col 1, Row 3. Alineado abajo a la izquierda. (El segundo fue eliminado) */}
        <div className="col-start-1 row-start-3 flex items-end justify-start relative z-20">
          <LedButton baseClass="w-[30%] aspect-square rounded-[20%]" label="TEXTO" labelClass={LBL_UP} compId="mod1-2" />
        </div>

        {/* 7 FADER TRACKS: Desde F2 hasta L3 (Cols 6-12, Rows 2-3). Alineados a la izquierda */}
        {['Películas', 'Series', 'Jueguitos', 'RRSS', 'Música', 'Podcasts', 'Otros'].map((text, i) => (
          <div key={`fader-${i}`} style={{ gridColumnStart: 6 + i, gridRowStart: 2, gridRowEnd: 4 }} className="flex items-center justify-start z-10">
            <Fader 
              orientation="vertical"
              initialValue={75}
              trackClass="w-[30%] h-full bg-[#E5E5E5] rounded-full shadow-inner relative flex justify-center"
              thumbClass="w-full aspect-square bg-[#888] rounded-full absolute shadow-md"
              label={text}
              labelClass={LBL_V}
              compId={`mod1-${3 + i}`}
            />
          </div>
        ))}

        {/* 7 FADER TINY BUTTONS: Col 6-12, Row 4. Centrados con respecto al fader (No se cuentan para el vúmetro, no llevan compId) */}
        {/* "agrandalos como estan los demas en los modulo 2 y 3. y separalos de los fader la misma distancia de su propio alto." */}
        {[6, 7, 8, 9, 10, 11, 12].map((col) => (
          <div key={`fader-btn-${col}`} style={{ gridColumnStart: col, gridRowStart: 4 }} className="flex flex-col items-start justify-start z-10">
            <div className="w-[30%] aspect-square pointer-events-none"></div> {/* Spacer exacto del alto del botón */}
            <LedButton baseClass="w-[30%] aspect-square rounded-[20%]" />
          </div>
        ))}

        {/* DESCRIPTOR PADS: A4 (Col 1, Row 4). Alineado abajo a la izquierda */}
        <div className="col-start-1 col-span-4 row-start-4 flex items-end justify-start pointer-events-none z-10 pb-[2px]">
          <span className="text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap">PLATAFORMAS PREFERIDAS</span>
        </div>

        {/* 12 PADS: Cols 1-4, Rows 5-7 */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`pad-${i}`} style={{ gridColumnStart: 1 + (i % 4), gridRowStart: 5 + Math.floor(i / 4) }} className="flex items-center justify-center z-10">
            <LedButton baseClass="w-full h-full rounded-[15%]" icon={padIcons[i]} ledColor="yellow" compId={`mod1-${10 + i}`} />
          </div>
        ))}

        {/* HORIZONTAL SLIDER: Desde F5 hasta K5 (Cols 6-11, Row 5). */}
        <div className="col-start-6 col-span-6 row-start-5 row-span-1 flex items-end justify-center z-10">
          <Fader 
            orientation="horizontal"
            initialValue={50}
            trackClass="w-full h-[50%] bg-[#111] rounded-full shadow-inner relative flex items-center mb-2"
            thumbClass="h-full aspect-square bg-[#FFF] rounded-full absolute shadow-md z-20"
            label="HRS X DÍA EN RRSS"
            labelClass="absolute bottom-[100%] mb-[4px] left-0 text-[7px] uppercase tracking-[0.2em] text-[#777] font-sans font-bold whitespace-nowrap pointer-events-none"
            markers={['1', '2', '3', '4', '6', '+']}
            compId="mod1-22"
          />
        </div>

        {/* 3 POTES CHICOS: F7, G7, H7 (Cols 6-8, Row 7). "que queden sobre la fila 7" */}
        {[6, 7, 8].map((col, i) => (
          <div key={`knob-${col}`} style={{ gridColumnStart: col, gridRowStart: 7 }} className="flex items-center justify-center z-10">
            <Knob label="TEXTO" labelClass={LBL_UP} sizeClass="w-[80%]" initialValue={30 * i} compId={`mod1-${23 + i}`} />
          </div>
        ))}

        {/* 2 JACKS: K7, L7 (Cols 11-12, Row 7). Alineados abajo a la derecha */}
        {[11, 12].map((col, i) => (
          <div key={`jack-${i}`} style={{ gridColumnStart: col, gridRowStart: 7 }} className="flex items-end justify-end z-10">
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
export default ControlModule;
