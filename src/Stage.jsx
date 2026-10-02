import React, { useLayoutEffect, useRef, useState } from 'react';

// Lienzo de diseño: la UI se construye en px de Figma sobre un frame base de 1280×720 y se escala para llenar la pantalla.
// Dentro del rango de proporciones admitido el lienzo además se estira en un eje (más alto en 4:3 / iPad,
// más ancho en ultrawide) para aprovechar la pantalla sin deformar; fuera de ese rango queda centrado con bandas.
export const BASE_W = 1280;
export const BASE_H = 720;
const MIN_ASPECT = 4 / 3;  // iPad
const MAX_ASPECT = 21 / 9; // ultrawide
const BASE_ASPECT = BASE_W / BASE_H;

// Se mide el contenedor real (100dvh) y no window.innerHeight: en Safari de iPad la barra de direcciones hace que
// difieran, y el lienzo quedaba más bajo que la pantalla (con una banda vacía abajo).
const computeStage = (vw = window.innerWidth, vh = window.innerHeight) => {
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
  const hostRef = useRef(null);
  const [stage, setStage] = useState(() => computeStage());

  useLayoutEffect(() => {
    const host = hostRef.current;
    const onResize = () => setStage(prev => {
      const w = host?.clientWidth || window.innerWidth;
      const h = host?.clientHeight || window.innerHeight;
      const next = computeStage(w, h);
      return Object.keys(next).every(k => next[k] === prev[k]) ? prev : next;
    });
    onResize();
    const ro = host ? new ResizeObserver(onResize) : null;
    ro?.observe(host);
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, []);

  // Los jacks registran su posición en pantalla al recibir 'resize'; se re-emite cuando el lienzo ya se reescaló.
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    return () => cancelAnimationFrame(id);
  }, [stage]);

  // En vertical (tablet) el lienzo queda chico: se sugiere girar el dispositivo en la banda superior.
  const isPortrait = stage.top > 0 && window.innerHeight > window.innerWidth;

  return (
    <div ref={hostRef} className="absolute inset-0">
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
    </div>
  );
};

export default Stage;
