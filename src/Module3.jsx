import React from 'react';
import ModuleShell from './ModuleShell';
import ModuleHeader from './components/ModuleHeader';
import SectionTag from './components/SectionTag';
import NamedKnob from './components/NamedKnob';
import LabeledToggle from './components/LabeledToggle';
import OutputPanel, { moduleOutputJacks } from './components/cables/OutputPanel';
import Fader from './components/actuators/Fader';
import Counter from './components/actuators/Counter';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import LedButton from './components/actuators/LedButton';
import RotarySwitch from './components/actuators/RotarySwitch';
import { useAppContext } from './contexts/AppContext';

// Figma: status-legend-panel "módulo 3 · SALUD MENTAL" (2316:1351). Medidas en px del frame.
// (En Figma el encabezado y los textos de la perilla grande / slider son los del módulo 1 y 2 copiados; acá se usan los de este módulo.)

// Columnas del grupo "Procrastinas": [ids de datos por posición en la grilla de 2 columnas]
const PROCRAST = [
  [{ label: 'RRSS', id: 'mod3-9' }, { label: 'Tareas', id: 'mod3-13' }, { label: 'Gym', id: 'mod3-11' }],
  [{ label: 'Dormir', id: 'mod3-12' }, { label: 'Orden', id: 'mod3-10' }, { label: 'Otros', id: 'mod3-14' }],
];

const STATE_TOGGLES = [
  { label: 'Emoción', id: 'mod3-17', align: 'left' },
  { label: 'Técnica', id: 'mod3-18', align: 'center' },
  { label: 'Síntomas', id: 'mod3-19', align: 'center' },
];

const Module3 = () => {
  const { mode, routingOutputs } = useAppContext();

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      <div className="absolute left-[13px] top-[12px] w-[400px] flex flex-col gap-px">
        <ModuleHeader number="3" title="SALUD MENTAL" />

        <div className="flex items-center gap-[30px] w-[379px]">

          {/* Columna izquierda (101×198) */}
          <div className="relative w-[101px] h-[198px] shrink-0">
            {/* Component 32: 2×2 perillas */}
            <div className="absolute left-[6px] top-[5px] w-[89px] h-[94px] flex justify-between">
              <div className="flex flex-col w-[33px]">
                <NamedKnob label="Presión" compId="mod3-1" />
                <NamedKnob label="Planificar" compId="mod3-3" />
              </div>
              <div className="flex flex-col w-[33px]">
                <NamedKnob label="Confianza" compId="mod3-2" />
                <NamedKnob label="Compararse" compId="mod3-4" />
              </div>
            </div>

            {/* Component 29: emoción dominante */}
            <div className="absolute left-[-30px] top-[101px] w-[161px] h-[94px]">
              <SectionTag label="EMOCIÓN DOMINANTE" className="absolute left-[19px] right-[15px] top-[1px]" tagClass="font-bold" />
              <RotarySwitch
                sizeClass="w-[64px]"
                className="!absolute left-[53px] top-[30px]"
                compId="mod3-5"
                sideLabelRadius={36}
                optionLabels={['Entus.', 'Flow', 'Ansiedad', 'Estrés', 'Frust.']}
              />
            </div>
          </div>

          {/* Columna derecha (250×182) */}
          <div className="w-[250px] h-[182px] shrink-0 flex flex-col gap-[13px]">

            <div className="flex items-center gap-[12px]">
              <div className="flex items-center gap-[18px] h-[66px]">
                <Counter label="sueño" compId="mod3-6" />
                <Counter label="entregas" compId="mod3-7" />
              </div>

              <div className="flex items-center gap-[2px] w-[124px]">
                {/* Procrast. */}
                <div className="w-[42px] h-[40px] flex flex-col justify-between shrink-0">
                  <span className="type-micro font-light text-text-muted w-[61px] whitespace-nowrap">Procrast.</span>
                  <ToggleSwitch sizeClass="w-[30px]" compId="mod3-8" />
                </div>
                {/* Qué postergás: 2 columnas de estados con nombre */}
                <div className="flex gap-[12px] w-[64px] h-[50px] shrink-0">
                  {PROCRAST.map((col, i) => (
                    <div key={i} className="flex flex-col gap-[5px]" style={{ width: i === 0 ? 37 : 35 }}>
                      {col.map(item => (
                        <div key={item.id} className="flex items-center gap-[4px]">
                          <LedButton baseClass="w-[8px] h-[8px]" compId={item.id} />
                          <span className="type-micro font-light leading-[14px] text-text-muted whitespace-nowrap">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-[6px] h-[98px]">
              {/* Ansiedad */}
              <Fader
                orientation="vertical"
                initialValue={50}
                trackClass="w-[16px] h-[71px] shrink-0"
                label="Ansiedad"
                labelClass="text-text-secondary font-light"
                compId="mod3-16"
              />

              <div className="w-[227px] h-[103px] shrink-0 flex flex-col justify-between">
                {/* Momento de mayor frustración (Component 14) */}
                <div className="relative w-[191px] h-[34px] flex items-end shrink-0">
                  <Fader
                    orientation="horizontal"
                    initialValue={50}
                    trackClass="w-full h-[22px]"
                    label="Momento mayor frustración"
                    markers={['1', '2', '3', '4', '5', '6']}
                    compId="mod3-15"
                  />
                  <span className="absolute left-[8px] top-full type-micro text-text-disabled leading-[12px]">Inicio</span>
                  <span className="absolute right-[8px] top-full type-micro text-text-disabled leading-[12px]">Entrega</span>
                </div>

                <div className="flex items-end gap-[7px] w-[227px]">
                  <div className="flex items-end justify-center gap-[13px]">
                    {STATE_TOGGLES.map(t => <LabeledToggle key={t.id} label={t.label} compId={t.id} align={t.align} />)}
                  </div>
                  <OutputPanel jacks={moduleOutputJacks('mod3', routingOutputs)} />
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
