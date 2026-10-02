import React from 'react';
import { moduleRegistry } from './moduleRegistry';

// Grilla del frame de Figma (1280×720): margen 10, separación 8, columna de módulos de 418 y consola de 149.
// La columna derecha absorbe el espacio extra cuando el lienzo se estira (ver Stage).
const RackGrid = () => {
  const ControlModule = moduleRegistry['ControlModule'];
  const Module2 = moduleRegistry['Module2'];
  const Module3 = moduleRegistry['Module3'];
  const DataVisualizer = moduleRegistry['DataVisualizer'];
  const ConsoleModule = moduleRegistry['ConsoleModule'];

  return (
    <div className="w-full h-full p-[10px] flex flex-row gap-space-8">

      {/* Columna izquierda: ancho fijo, los tres módulos se reparten el alto */}
      <div className="w-[418px] h-full flex flex-col gap-space-8 flex-shrink-0">
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

      {/* Columna derecha: visualizador flexible + consola de alto fijo */}
      <div className="flex-grow h-full flex flex-col gap-space-8 min-w-0">
        <div className="flex-grow w-full min-h-0 relative z-0">
          <DataVisualizer />
        </div>
        <div className="w-full h-[149px] flex-shrink-0 z-10">
          <ConsoleModule />
        </div>
      </div>
    </div>
  );
};

export default RackGrid;
