import React from 'react';

const ModuleShell = ({ children, disabled = false }) => {
  return (
    <div className={`w-full h-full bg-synth-panel border-[1.5px] border-synth-border-light rounded-2xl overflow-hidden relative shadow-neo-panel transition-opacity duration-500`}>
      {children}
    </div>
  );
};

export default ModuleShell;

