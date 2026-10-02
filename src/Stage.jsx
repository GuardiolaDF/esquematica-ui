import React, { useLayoutEffect, useState } from 'react';

// Lienzo de diseño: la UI se construye en px de Figma sobre un frame base de 1280×720 y se escala para llenar la pantalla.
// Dentro del rango de proporciones admitido el lienzo además se estira en un eje (más alto en 4:3 / iPad,
// más ancho en ultrawide) para aprovechar la pantalla sin deformar; fuera de ese rango queda centrado con bandas.
export const BASE_W = 1280;
export const BASE_H = 720;
const MIN_ASPECT = 4 / 3;  // iPad
const MAX_ASPECT = 21 / 9; // ultrawide
const BASE_ASPECT = BASE_W / BASE_H;

const computeStage = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspect = Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, vw / vh));
  const width = aspect >= BASE_ASPECT ? BASE_H * aspect : BASE_W;
  const height = aspect >= BASE_ASPECT ? BASE_H : BASE_W / aspect;
  const scale = Math.min(vw / width, vh / height);
  return {
    width,
    height,
    scale,
    left: (vw - width * scale) / 2,
    top: (vh - height * scale) / 2,
  };
};

const Stage = ({ children }) => {
  const [stage, setStage] = useState(computeStage);

  useLayoutEffect(() => {
    const onResize = () => setStage(prev => {
      const next = computeStage();
      return Object.keys(next).every(k => next[k] === prev[k]) ? prev : next;
    });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Los jacks registran su posición en pantalla al recibir 'resize'; se re-emite cuando el lienzo ya se reescaló.
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    return () => cancelAnimationFrame(id);
  }, [stage]);

  // En vertical (tablet) el lienzo queda chico: se sugiere girar el dispositivo en la banda superior.
  const isPortrait = stage.top > 0 && window.innerHeight > window.innerWidth;

  return (
    <>
      {isPortrait && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-center px-space-24" style={{ height: stage.top }}>
          <span className="type-label-m text-text-secondary text-center">Girá el dispositivo para ver Esquemática a pantalla completa</span>
        </div>
      )}
      <div
        className="absolute origin-top-left"
        style={{
          width: stage.width,
          height: stage.height,
          left: stage.left,
          top: stage.top,
          transform: `scale(${stage.scale})`,
        }}
      >
        {children}
      </div>
    </>
  );
};

export default Stage;
