import React, { useEffect, useRef } from 'react';

// Ventana emergente de la versión de bolsillo. Superficie elevada sobre el scrim del sistema (overlay/scrim);
// se cierra con el botón, tocando afuera o con Escape.
const HelpDialog = ({ open, onClose }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    buttonRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-space-24 bg-overlay-scrim"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="w-full max-w-[340px] rounded-xl bg-surface-subtle shadow-[0_8px_24px_rgba(45,45,45,0.35)] p-space-24 flex flex-col gap-space-16"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="help-title" className="type-h3 text-text-primary">Versión de bolsillo</h2>
        <p className="type-body-m text-text-secondary">
          Esta es una versión reducida de Esquemática: muestra el modo colectivo y un panel de filtros acotado.
        </p>
        <p className="type-body-m text-text-secondary">
          Tocá cualquier carril del vúmetro para ver qué variable es: el panel de arriba muestra su pregunta y cuánta gente la respondió.
          Los controles de abajo filtran los datos.
        </p>
        <p className="type-body-m text-text-secondary">
          Para ver el proyecto completo —los tres módulos, todos los modos de visualización y el panel de control entero—
          abrilo desde una computadora o una tablet.
        </p>
        <button
          ref={buttonRef}
          type="button"
          onClick={onClose}
          className="self-end h-control-l px-space-24 rounded-md bg-action-primary-default text-action-primary-text type-control cursor-pointer transition-colors duration-fast hover:bg-action-primary-hover active:bg-action-primary-pressed focus-visible:outline-none focus-visible:shadow-focus-soft"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default HelpDialog;
