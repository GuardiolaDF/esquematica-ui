import React, { createContext, useContext, useState } from 'react';

const HoverContext = createContext();

export const useHover = () => useContext(HoverContext);

export const HoverProvider = ({ children }) => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <HoverContext.Provider value={{ hoveredId, setHoveredId }}>
      {children}
    </HoverContext.Provider>
  );
};
