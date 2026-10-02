import { useState } from 'react';

// ¿Se está viendo desde un teléfono? Solo los teléfonos reciben la versión de bolsillo; tablets (iPad, tablets Android)
// y computadoras reciben la versión completa. La decisión es del dispositivo, no del tamaño de la ventana:
// una ventana de escritorio angosta sigue mostrando la versión completa.
//
// Para probar o forzar una vista: ?vista=movil  ·  ?vista=completa
const PHONE_UA = /iPhone|iPod|Windows Phone|Android.*Mobile|Mobile.*Firefox|BlackBerry|Opera Mini/i;

export const isPhoneDevice = () => {
  if (typeof window === 'undefined') return false;

  const forced = new URLSearchParams(window.location.search).get('vista');
  if (forced === 'movil' || forced === 'mobile') return true;
  if (forced === 'completa' || forced === 'desktop') return false;

  // Chromium informa `mobile: true` solo en teléfonos (las tablets Android reportan false)
  if (navigator.userAgentData?.mobile === true) return true;
  return PHONE_UA.test(navigator.userAgent);
};

export const useIsPhone = () => useState(isPhoneDevice)[0];
