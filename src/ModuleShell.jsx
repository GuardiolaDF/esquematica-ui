import React from 'react';

// Figma: contenedor de módulo (filters-panel) — background/base, radius/xl, Effects/Elevation/02.
const ModuleShell = ({ children, disabled = false }) => {
  return (
    <div className="w-full h-full bg-background-base rounded-xl overflow-hidden relative shadow-elevation-02 transition-opacity duration-slow">
      {children}
    </div>
  );
};

export default ModuleShell;
