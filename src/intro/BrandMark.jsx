import React from 'react';
import logoRaw from '../assets/logo.svg?raw';

// Logo "strz" en línea para que tome el color del texto (currentColor) en vez del neutral/600 fijo del archivo.
// Proporción del viewBox: 1166×579.
const markup = logoRaw
  .replace(/<\?xml[^>]*>/, '')
  .replace(/<!DOCTYPE[^>]*>/, '')
  .replace(/fill:rgb\(113,105,99\)/g, 'fill:currentColor')
  .replace(/width="100%" height="100%"/, 'width="100%" height="100%" aria-hidden="true" focusable="false"');

const BrandMark = ({ className = '', style }) => (
  <div
    className={`block select-none pointer-events-none [&>svg]:block [&>svg]:w-full [&>svg]:h-full ${className}`}
    style={{ aspectRatio: '1166 / 579', ...style }}
    dangerouslySetInnerHTML={{ __html: markup }}
  />
);

export default BrandMark;
