import React from 'react';
import ModuleShell from './ModuleShell';
import ModuleHeader from './components/ModuleHeader';
import SectionTag from './components/SectionTag';
import OutputPanel, { moduleOutputJacks } from './components/cables/OutputPanel';
import Fader from './components/actuators/Fader';
import Knob from './components/actuators/Knob';
import LedButton from './components/actuators/LedButton';
import { SiYoutube, SiSpotify, SiHbo, SiNetflix, SiStremio, SiTiktok, SiTwitch, SiMubi, SiInstagram, SiKick } from 'react-icons/si';
import { TbBrandDisney } from 'react-icons/tb';
import { FaAmazon } from 'react-icons/fa';
import { useAppContext } from './contexts/AppContext';
import { useHover } from './contexts/HoverContext';
import iconAirplane from './assets/figma/icon-airplane.svg';
import iconWaveform from './assets/figma/icon-waveform.svg';
import iconList from './assets/figma/icon-list.svg';
import iconSparkles from './assets/figma/icon-sparkles.svg';
import mediosBracket from './assets/figma/medios-bracket.svg';

// Figma: filters-panel "módulo 1 · CONSUMOS CULTURALES" (2316:1315). Medidas en px del frame.
const padIcons = [
  SiYoutube, SiSpotify, SiHbo, SiNetflix,
  SiStremio, SiTiktok, TbBrandDisney, SiTwitch,
  SiMubi, SiInstagram, FaAmazon, SiKick
];

const MEDIOS = ['Cine', 'Libros', 'Podcasts', 'Música', 'Series', 'Videojuegos', 'Otros'];

const REFERENCIAS = [
  { compId: 'mod1-23', icon: iconWaveform, size: 'w-[15px] h-[15px]', title: 'Frecuencia' },
  { compId: 'mod1-24', icon: iconList, size: 'w-[13.5px] h-[13.5px]', title: 'Importancia' },
  { compId: 'mod1-25', icon: iconSparkles, size: 'w-[17px] h-[18px]', title: 'IA' },
];

const ControlModule = () => {
  const { activePlatform, setActivePlatform, mode, routingOutputs } = useAppContext();
  const { hoveredId } = useHover();

  // Si algún pad de plataforma está en hover se ilumina el fader de horas
  const isPadHovered = hoveredId && hoveredId.startsWith('mod1-') && parseInt(hoveredId.split('-')[1]) >= 10 && parseInt(hoveredId.split('-')[1]) <= 21;

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      <div className="w-full h-full pl-[15px] pr-[14px] flex flex-col justify-center gap-space-16">
        <ModuleHeader number="1" title="CONSUMOS CULTURALES" />

        <div className="flex items-end justify-between h-[184px]">

          {/* Columna izquierda (149) */}
          <div className="w-[149px] flex flex-col gap-[2px]">
            <div className="flex items-end">
              {/* FORMATO (Component 18, 102×94) */}
              <div className="relative w-[102px] h-[94px]">
                <SectionTag label="FORMATO" className="absolute left-0 right-0 top-[1px]" />
                <Knob
                  sizeClass="w-[64px]"
                  className="!absolute left-[19px] top-[30px]"
                  startAngle={-45} endAngle={45}
                  markers={[{ angle: -45, label: 'Largo' }, { angle: 0, label: 'Medio' }, { angle: 45, label: 'Corto' }]}
                  compId="mod1-1"
                />
              </div>
              {/* Modo avión (Component 21) */}
              <div className="w-[14px] h-[26px] flex flex-col items-center gap-[4px]" title="Modo avión">
                <img src={iconAirplane} alt="Modo avión" className="w-[11.6px] h-[12.8px] mt-[1px]" draggable={false} />
                <LedButton baseClass="w-[8px] h-[8px]" compId="mod1-2" />
              </div>
            </div>

            {/* Plataformas (Component 17, 149×99) */}
            <div className="relative w-[149px] h-[99px]">
              <div className="absolute left-[8px] top-[2px] w-[59px] h-[10px] bg-neutral-600 rounded-t-xs" />
              <span className="absolute left-[10px] top-0 type-micro font-light tracking-label leading-[16px] text-text-inverse">Plataformas</span>
              <div className="absolute inset-x-0 bottom-0 top-[11.76px] flex items-center justify-center gap-[14px] bg-surface-subtle border-[0.5px] border-border-strong rounded-md">
                <div className="grid grid-cols-4 grid-rows-3 gap-space-4 w-[107px] h-[80px]">
                  {padIcons.map((Icon, i) => {
                    const compId = `mod1-${10 + i}`;
                    return (
                      <LedButton
                        key={compId}
                        baseClass="w-full h-full"
                        icon={Icon}
                        compId={compId}
                        value={activePlatform === compId}
                        onChange={() => setActivePlatform(compId)}
                      />
                    );
                  })}
                </div>
                <Fader
                  orientation="vertical"
                  initialValue={50}
                  compId={activePlatform}
                  trackClass={`w-[16px] h-[71px] rounded-pill transition-shadow duration-standard ${isPadHovered ? 'shadow-focus-soft' : ''}`}
                  label="Hs. X día"
                  labelClass="text-text-muted"
                />
              </div>
            </div>
          </div>

          {/* Columna derecha (229) */}
          <div className="w-[229px] h-[195px] flex flex-col items-center gap-[7px]">
            {/* MEDIOS (Component 16, 238×90) */}
            <div className="relative w-[238px] h-[90px] shrink-0">
              <img src={mediosBracket} alt="" className="absolute left-[23px] top-0 w-[205px] h-[18.5px]" draggable={false} />
              <span className="absolute left-[34px] -top-[1px] font-heading text-[8px] leading-[14px] text-neutral-0">MEDIOS</span>
              <span className="absolute left-[78px] top-0 type-micro font-thin text-text-disabled whitespace-nowrap">Los soportes más consumidos</span>
              <div className="absolute left-0 right-0 bottom-0 flex justify-center">
                {MEDIOS.map((text, i) => (
                  <div key={text} className="w-[34px] h-[71px] flex justify-end pr-[6px]">
                    <Fader
                      orientation="vertical"
                      initialValue={50}
                      trackClass="w-[16px] h-[71px]"
                      label={text}
                      compId={`mod1-${3 + i}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Hs RRSS x día (Component 14, 191×34) */}
            <div className="w-[191px] h-[34px] flex items-end shrink-0">
              <Fader
                orientation="horizontal"
                initialValue={50}
                trackClass="w-full h-[22px]"
                label="Hs RRSS x día"
                markers={['1', '2', '3', '4', '5', '6']}
                compId="mod1-22"
              />
            </div>

            {/* Referencias + Salidas */}
            <div className="w-full flex items-end justify-end gap-space-24">
              <div className="relative w-[131px] h-[54px] flex items-end">
                <span className="absolute left-0 bottom-0 top-[2px] w-[18px] flex items-center justify-center">
                  <span className="[writing-mode:vertical-rl] rotate-180 font-body text-[7px] leading-[18px] text-text-muted">Referencias</span>
                </span>
                <div className="ml-[18px] flex-1 flex items-end justify-center gap-[7px]">
                  {REFERENCIAS.map(r => (
                    <div key={r.compId} className="w-[33px] flex flex-col items-center gap-[5px]" title={r.title}>
                      <img src={r.icon} alt={r.title} className={r.size} draggable={false} />
                      <Knob sizeClass="w-[33px]" initialValue={50} compId={r.compId} />
                    </div>
                  ))}
                </div>
              </div>
              <OutputPanel jacks={moduleOutputJacks('mod1', routingOutputs)} />
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
};
export default ControlModule;
