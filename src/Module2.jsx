import React from 'react';
import ModuleShell from './ModuleShell';
import ModuleHeader from './components/ModuleHeader';
import SectionTag from './components/SectionTag';
import OutputPanel, { moduleOutputJacks } from './components/cables/OutputPanel';
import Fader from './components/actuators/Fader';
import Counter from './components/actuators/Counter';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import Knob from './components/actuators/Knob';
import LedButton from './components/actuators/LedButton';
import RotarySwitch from './components/actuators/RotarySwitch';
import { useAppContext } from './contexts/AppContext';
import iconUserPause from './assets/figma/icon-user-pause.svg';
import iconDesk from './assets/figma/icon-desk.svg';
import iconMoonCloud from './assets/figma/icon-moon-cloud.svg';
import iconCloudUpload from './assets/figma/icon-cloud-upload.svg';
import iconCursor from './assets/figma/icon-cursor.svg';
import iconVr from './assets/figma/icon-vr.svg';
import iconPages from './assets/figma/icon-pages.svg';

// Figma: kpi-panel "módulo 2 · MODOS DE TRABAJO" (2316:1330). Medidas en px del frame.
const COUNTERS = [
  { label: 'Programas', id: 'mod2-9' },
  { label: 'Pestañas', id: 'mod2-10' },
  { label: 'Archivos s/t', id: 'mod2-11' },
];

const TOGGLES = [
  { label: 'Versiones', id: 'mod2-12', align: 'text-left' },
  { label: 'Notif', id: 'mod2-13', align: 'text-center' },
  { label: 'Comida', id: 'mod2-14', align: 'text-center' },
];

const REFERENCIAS = [
  { id: 'mod2-15', icon: iconCursor, iconClass: 'w-[11.2px] h-[14.26px]', gap: 'gap-[4px]', title: 'Interrupciones' },
  { id: 'mod2-16', icon: iconVr, iconClass: 'w-[17px] h-[10px]', gap: 'gap-[8px]', title: 'Impostor' },
  { id: 'mod2-17', icon: iconPages, iconClass: 'w-[13.33px] h-[13.33px]', gap: 'gap-[4px]', title: 'Orden' },
];

// Ícono + cuadrado de estado (Frame 53: grilla de 2×2)
const StatusCell = ({ icon, iconBox, gap, title, compId, className = '' }) => (
  <div className={`flex flex-col items-center ${gap} ${className}`} title={title}>
    <div className={`flex items-center justify-center ${iconBox}`}>
      <img src={icon} alt={title} className="max-w-none shrink-0 pointer-events-none select-none" draggable={false} />
    </div>
    <LedButton baseClass="w-[8px] h-[8px]" compId={compId} />
  </div>
);

// Perilla con su nombre arriba (Component 11): el texto arranca 19 px a la izquierda de la perilla
const NamedKnob = ({ label, compId }) => (
  <div className="relative w-[33px] h-[47px] shrink-0">
    <span className="absolute -left-[19px] top-0 type-micro leading-[18px] text-text-secondary whitespace-nowrap">{label}</span>
    <Knob sizeClass="w-[33px]" className="!absolute left-0 top-[14px]" initialValue={50} compId={compId} />
  </div>
);

const Module2 = () => {
  const { mode, routingOutputs } = useAppContext();

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      <div className="absolute left-[19px] top-[13px] w-[385px] flex flex-col">
        <ModuleHeader number="2" title="MODOS DE TRABAJO" />

        <div className="flex items-center justify-end w-[385px]">

          {/* Bloque izquierdo (191×186) */}
          <div className="w-[191px] h-[186px] shrink-0 flex flex-col">
            <div className="flex items-end justify-center gap-[10px]">
              {/* BOCET A MANO (Component 29, 161×94) */}
              <div className="relative w-[161px] h-[94px] shrink-0">
                <SectionTag label="BOCET A MANO" tagClass="w-[78px] font-bold" className="absolute left-[19px] right-[15px] top-[1px]" />
                <RotarySwitch
                  sizeClass="w-[64px]"
                  className="!absolute left-[53px] top-[30px]"
                  compId="mod2-1"
                  optionLabels={['Siempre', '+/-', 'A veces', '-/+', 'Nunca']}
                />
              </div>
              {/* Silencio */}
              <Fader
                orientation="vertical"
                initialValue={50}
                trackClass="w-[16px] h-[71px] shrink-0"
                label="Silencio"
                labelClass="text-text-secondary font-light"
                compId="mod2-4"
              />
            </div>

            <div className="flex items-center justify-center gap-[39px]">
              <div className="flex flex-col w-[33px] shrink-0">
                <NamedKnob label="Perfeccionismo" compId="mod2-2" />
                <NamedKnob label="Procrastinación" compId="mod2-3" />
              </div>
              {/* Frame 53 */}
              <div className="grid grid-cols-[16px_16px] grid-rows-[26.5px_26.5px] gap-x-[15px] gap-y-[8px] w-[47px] h-[61px] shrink-0">
                <StatusCell icon={iconUserPause} iconBox="w-[16px] h-[16px]" gap="gap-[3px]" title="Pausas" compId="mod2-5" />
                <StatusCell icon={iconDesk} iconBox="w-[13px] h-[10px]" gap="gap-[6px]" title="Escritorio" compId="mod2-6" />
                <StatusCell icon={iconMoonCloud} iconBox="w-[14px] h-[12px]" gap="gap-[4px]" title="Nocturno" compId="mod2-7" className="self-end" />
                <StatusCell icon={iconCloudUpload} iconBox="w-[16px] h-[18px]" gap="gap-0" title="Respaldo" compId="mod2-8" />
              </div>
            </div>
          </div>

          {/* Bloque derecho (210×186) */}
          <div className="w-[210px] h-[186px] shrink-0 flex flex-col items-center justify-center gap-[15px]">
            <div className="flex items-start justify-end gap-[17px] w-[192px]">
              {COUNTERS.map(c => <Counter key={c.id} label={c.label} compId={c.id} />)}
            </div>

            <div className="flex items-center justify-center gap-[13px]">
              {TOGGLES.map(t => (
                <div key={t.id} className="w-[40px] flex flex-col">
                  <span className={`type-micro font-light text-text-muted whitespace-nowrap ${t.align}`}>{t.label}</span>
                  <ToggleSwitch sizeClass="w-[30px]" compId={t.id} />
                </div>
              ))}
            </div>

            <div className="flex items-end gap-[28px] w-[192px]">
              {/* Component 26 (107×51) */}
              <div className="flex items-end gap-[4px] w-[107px] shrink-0">
                {REFERENCIAS.map(r => (
                  <div key={r.id} className={`w-[33px] flex flex-col items-center ${r.gap}`} title={r.title}>
                    <img src={r.icon} alt={r.title} className={`max-w-none ${r.iconClass}`} draggable={false} />
                    <Knob sizeClass="w-[33px]" initialValue={50} compId={r.id} />
                  </div>
                ))}
              </div>
              <OutputPanel jacks={moduleOutputJacks('mod2', routingOutputs)} />
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
};

export default Module2;
