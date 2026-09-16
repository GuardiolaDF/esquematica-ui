import React from 'react';

const ModuleShell = ({ children }) => {
  return (
    <div className="w-full h-full bg-[#1A1A1A] border border-[#333] rounded-sm overflow-hidden relative shadow-lg">
      {children}
    </div>
  );
};

export default ModuleShell;
