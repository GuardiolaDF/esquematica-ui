import React from 'react';
import { RACK_LAYOUT } from './rackConfig';
import { moduleRegistry } from './moduleRegistry';

const RackGrid = () => {
  return (
    <div className="w-screen h-screen bg-[#111111] overflow-hidden flex items-center justify-center">
      {/* Rack scaling to fill screen, 2:1 aspect ratio mantenido */}
      <div 
        className="relative bg-[#0A0A0A] grid grid-cols-12 grid-rows-3 gap-[2px] p-[2px]"
        style={{
          width: '100%',
          maxHeight: '100vh',
          maxWidth: 'calc(100vh * 2)', // Mantiene proporción 2:1 sin dejar márgenes gigantes
          aspectRatio: '2 / 1'
        }}
      >
        {RACK_LAYOUT.map((config) => {
          const Component = moduleRegistry[config.component];
          if (!Component) return null;
          return (
            <div 
              key={config.id} 
              style={{ 
                gridArea: config.gridArea,
                height: config.height || '100%',
                alignSelf: config.alignSelf || 'stretch'
              }}
              className={`min-h-0 w-full ${config.className || ''}`}
            >
              <Component />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RackGrid;
