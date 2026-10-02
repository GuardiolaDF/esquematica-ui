import React from 'react';
import logoSrc from '../assets/logo.svg';

// Logo del proyecto (SVG original, relleno neutral/600). La proporción es la de su viewBox (1166×579).
const Logo = ({ height = 36, className = '' }) => (
  <img
    src={logoSrc}
    alt="Logo del proyecto"
    draggable={false}
    className={`block select-none pointer-events-none ${className}`}
    style={{ height, aspectRatio: '1166 / 579' }}
  />
);

export default Logo;
