import React from 'react';

const ModuleShell = ({ children, disabled = false }) => {
  return (
    <div className={`w-full h-full bg-bg-base border-[1.5px] border-border-subtle rounded-2xl overflow-hidden relative shadow-elevation-03 transition-opacity duration-500`}>
      {children}
    </div>
  );
};

export default ModuleShell;

