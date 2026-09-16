import React from 'react';
import ModuleShell from './ModuleShell';

const PlaceholderModule = ({ title }) => {
  return (
    <ModuleShell title={title || "UNTITLED"}>
      <div className="flex items-center justify-center w-full h-full text-xs text-neutral-500 font-mono text-center border border-dashed border-neutral-700/50 rounded-sm bg-neutral-900/50">
        Módulo en construcción
      </div>
    </ModuleShell>
  );
};

export default PlaceholderModule;
