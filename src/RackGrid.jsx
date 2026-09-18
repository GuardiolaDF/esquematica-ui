import React from 'react';
import { moduleRegistry } from './moduleRegistry';

const RackGrid = () => {
  const ControlModule = moduleRegistry['ControlModule'];
  const Module2 = moduleRegistry['Module2'];
  const Module3 = moduleRegistry['Module3'];
  const DataVisualizer = moduleRegistry['DataVisualizer'];
  const ConsoleModule = moduleRegistry['ConsoleModule'];

  return (
    <div className="w-screen h-screen bg-[#0A0A0A] overflow-hidden flex flex-row p-[2px] gap-[2px]">
      
      {/* Columna Izquierda: Fija en ancho, se estira en alto exactamente a 1/3 cada módulo */}
      <div className="w-[426px] h-full flex flex-col gap-[2px] flex-shrink-0">
        <div className="w-full flex-1 min-h-0">
          <ControlModule />
        </div>
        <div className="w-full flex-1 min-h-0">
          <Module2 />
        </div>
        <div className="w-full flex-1 min-h-0">
          <Module3 />
        </div>
      </div>

      {/* Columna Derecha: Ocupa el resto del ancho de la pantalla */}
      <div className="flex-grow h-full flex flex-col gap-[2px] min-w-0">
        
        {/* Visualizador de Datos: Ocupa todo el espacio alto disponible */}
        <div className="flex-grow w-full min-h-0 relative z-0">
          <DataVisualizer />
        </div>
        
        {/* Consola: Altura fija, Ancho fluido */}
        <div className="w-full h-[166px] flex-shrink-0 z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <ConsoleModule />
        </div>

      </div>
    </div>
  );
};

export default RackGrid;
