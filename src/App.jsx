import React from 'react';
import RackGrid from './RackGrid';
import { HoverProvider } from './contexts/HoverContext';

function App() {
  return (
    <HoverProvider>
      <div className="w-full h-screen bg-[#222] flex items-center justify-center p-8 overflow-hidden font-sans">
        <RackGrid />
      </div>
    </HoverProvider>
  );
}

export default App;
