import React, { useState } from 'react';
import ModuleShell from './ModuleShell';
import Knob from './components/actuators/Knob';
import Fader from './components/actuators/Fader';
import ToggleSwitch from './components/actuators/ToggleSwitch';
import Jack from './components/actuators/Jack';
import { useAppContext } from './contexts/AppContext';

// Platform SVG icons matching Figma icon set
const PlatIcon = ({ d, fill = '#A89F90', viewBox = '0 0 24 24', children }) => (
  <svg viewBox={viewBox} width="18" height="18" fill="none">
    {children || <path d={d} fill={fill} />}
  </svg>
);

const platforms = [
  // Row 1: YouTube, Spotify, HBO, Netflix
  () => <PlatIcon><rect x="3" y="7" width="18" height="10" rx="2" fill="#A89F90"/><polygon points="10,10 16,12 10,14" fill="#EFEBE2"/></PlatIcon>,
  () => <PlatIcon><circle cx="12" cy="12" r="9" fill="#A89F90"/></PlatIcon>,
  () => <PlatIcon><text x="2" y="17" fontFamily="serif" fontSize="12" fill="#A89F90" fontWeight="bold">HBO</text></PlatIcon>,
  () => <PlatIcon><path d="M8 4 L12 20 L14 20 L14 4" fill="#A89F90"/></PlatIcon>,
  // Row 2: Stremio, TikTok, Disney+, Twitch
  () => <PlatIcon><path d="M6 12 L18 6 L18 18 Z" fill="#A89F90"/></PlatIcon>,
  () => <PlatIcon><path d="M12 4 C12 4 16 8 16 12 A4 4 0 1 1 8 12 C8 8 12 4 12 4Z" fill="#A89F90"/></PlatIcon>,
  () => <PlatIcon><circle cx="12" cy="12" r="5" fill="#A89F90"/><text x="7" y="10" fontSize="5" fill="#EFEBE2">D+</text></PlatIcon>,
  () => <PlatIcon><path d="M5 6 L19 6 L19 16 L14 16 L12 20 L10 16 L5 16 Z" fill="#A89F90"/></PlatIcon>,
  // Row 3: MUBI, Instagram, Prime, Kick
  () => <PlatIcon><circle cx="8" cy="12" r="4" fill="#A89F90"/><circle cx="16" cy="12" r="4" fill="#A89F90"/></PlatIcon>,
  () => <PlatIcon><rect x="6" y="6" width="12" height="12" rx="3" stroke="#A89F90" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="#A89F90" strokeWidth="1.5"/></PlatIcon>,
  () => <PlatIcon><path d="M4 8 L12 12 L20 8 M4 8 L4 16 L20 16 L20 8" stroke="#A89F90" strokeWidth="1.5"/></PlatIcon>,
  () => <PlatIcon><path d="M6 6 L14 6 L14 12 L10 10 L10 18 L6 18 Z" fill="#A89F90"/></PlatIcon>,
];

const faderLabels = ['Cine', 'Libros', 'Podcasts', 'Música', 'Series', 'Videojuegos', 'Otros'];

// Figma knob spec:
// main-knob: bg #EFEBE2, border #DDD9CE, inset-control shadow, 999px radius
// knob-cap: 52px inside 64px container, bg #EFEBE2, complex shadow
// indicator dot: 7px, bg #FF9479 (coral/500)

const KnobFigma = ({ size = 64, compId }) => {
  const [value, setValue] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const lastY = React.useRef(0);

  const rotation = -135 + (value / 100) * 270;

  const handleMouseDown = (e) => {
    lastY.current = e.clientY;
    setIsDragging(true);
    const move = (ev) => {
      const delta = lastY.current - ev.clientY;
      lastY.current = ev.clientY;
      setValue(v => Math.max(0, Math.min(100, v + delta * 0.8)));
    };
    const up = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div
      style={{ width: size, height: size, position: 'relative' }}
      onMouseDown={handleMouseDown}
      className="cursor-pointer select-none"
    >
      {/* main-knob (outer ring / track) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#EFEBE2',
          border: '1px solid #DDD9CE',
          boxShadow: 'inset 1px 2px 4px rgba(45, 45, 45, 0.22), inset -1px -1px 2px rgba(255, 255, 255, 0.78)',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          isolation: 'isolate',
        }}
      >
        {/* knob-cap (rotating part) */}
        <div
          style={{
            width: size - 12,
            height: size - 12,
            background: '#EFEBE2',
            border: '0.4px solid rgba(113, 105, 99, 0.75)',
            boxShadow: '1px 2px 3px rgba(0,0,0,0.1), 3px 4px 8px rgba(0,0,0,0.22), inset 2px 3px 6px rgba(0,0,0,0.12), inset -2px -2px 4px rgba(255,255,255,0.9)',
            borderRadius: '999px',
            position: 'relative',
            transform: `rotate(${rotation}deg)`,
            flexShrink: 0,
          }}
        >
          {/* indicator dot */}
          <div
            style={{
              position: 'absolute',
              width: 7,
              height: 7,
              left: '50%',
              top: 3,
              transform: 'translateX(-50%)',
              background: '#FF9479',
              boxShadow: 'inset 0.2px 0.2px 0.5px #000, inset -0.5px -0.5px 0.5px rgba(255,255,255,0.5), inset 1px 1px 1.9px rgba(0,0,0,0.5)',
              borderRadius: '999px',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Figma fader-2 spec (vertical):
// 16px wide, pill-shape track with inset shadow
// indicator-wedge: 10px wide, 61px, with inset+outer shadows
// dot: 7px #FF9479

const FaderFigma = ({ height = 71, label, compId }) => {
  const [value, setValue] = useState(30);
  const trackRef = React.useRef(null);

  const handleMouseDown = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const move = (ev) => {
      const pct = 1 - Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));
      setValue(pct * 100);
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    move(e);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const thumbTop = ((1 - value / 100) * (height - 14));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 34, height: height + 20 }}>
      {/* Label rotated at top */}
      {label && (
        <span
          style={{
            fontFamily: '"JetBrains Mono"',
            fontSize: 8,
            color: '#5C5451',
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            whiteSpace: 'nowrap',
            marginBottom: 2,
          }}
        >
          {label}
        </span>
      )}
      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        style={{
          width: 16,
          height: height,
          position: 'relative',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Track background */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 16,
            height: height,
            background: '#EFEBE2',
            boxShadow: 'inset -1px -1px 1px rgba(255,255,255,0.75), inset 1px 1px 1px rgba(0,0,0,0.25)',
            borderRadius: 14,
          }}
        />
        {/* Thumb (indicator-wedge style) */}
        <div
          style={{
            position: 'absolute',
            left: 3,
            width: 10,
            height: 10,
            top: thumbTop,
            background: '#EFEBE2',
            boxShadow: '0.5px 0.5px 0.7px rgba(0,0,0,0.75), 2px 2px 1.7px rgba(0,0,0,0.25), inset 1px 1px 1px rgba(255,255,255,0.75), inset -0.5px -0.5px 0.7px rgba(0,0,0,0.5)',
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Dot */}
          <div
            style={{
              width: 7,
              height: 7,
              background: '#FF9479',
              boxShadow: 'inset 0.2px 0.2px 0.5px #000, inset -0.5px -0.5px 0.5px rgba(255,255,255,0.5), inset 1px 1px 1.9px rgba(0,0,0,0.5)',
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Horizontal slider for RRSS
const HSliderFigma = ({ width = 191 }) => {
  const [value, setValue] = useState(20);
  const trackRef = React.useRef(null);

  const handleMouseDown = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const move = (ev) => {
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      setValue(pct * 100);
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    move(e);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div style={{ width, position: 'relative' }}>
      <span style={{ fontFamily: '"JetBrains Mono"', fontSize: 8, color: '#A89F90', letterSpacing: 0.2 }}>
        Hs RRSS x día
      </span>
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          width: '100%',
          height: 34,
          background: '#EFEBE2',
          boxShadow: 'inset -1px -1px 1px rgba(255,255,255,0.75), inset 1px 1px 1px rgba(0,0,0,0.25)',
          borderRadius: 14,
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          marginTop: 2,
        }}
      >
        {/* scale marks */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
          {['1','2','3','4','5','6'].map(n => (
            <span key={n} style={{ fontFamily: '"JetBrains Mono"', fontSize: 10, color: '#A89F90' }}>{n}</span>
          ))}
        </div>
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${value}% - 14px)`,
            width: 14,
            height: 28,
            background: '#EFEBE2',
            boxShadow: '0.5px 0.5px 0.7px rgba(0,0,0,0.75), 2px 2px 1.7px rgba(0,0,0,0.25), inset 1px 1px 1px rgba(255,255,255,0.75), inset -0.5px -0.5px 0.7px rgba(0,0,0,0.5)',
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div style={{ width: 10, height: 10, background: '#FF9479', boxShadow: 'inset 0.2px 0.2px 0.5px #000, inset 1px 1px 1.9px rgba(0,0,0,0.5)', borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
};

const ControlModule = () => {
  const { mode } = useAppContext();

  return (
    <ModuleShell disabled={mode === 'colectivo'}>
      {/* Figma: Frame 94 — flex-col, p:0, gap:16px, absolute 389x217 but we fill container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '15px 15px 12px 15px',
          gap: 16,
          fontFamily: '"JetBrains Mono"',
          color: '#2D2D2D',
          overflow: 'hidden',
        }}
      >

        {/* ── HEADER (Component 15) ── */}
        {/* Figma: módulo label + rectangle badge "1" + title */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0, height: 17, position: 'relative' }}>
          {/* "módulo" text */}
          <span style={{ fontFamily: '"JetBrains Mono"', fontWeight: 500, fontSize: 12, lineHeight: '16px', letterSpacing: 0.2, color: '#8A8177' }}>
            módulo
          </span>
          {/* Rectangle badge + "1" */}
          <div style={{ position: 'relative', marginLeft: 2, marginRight: 6 }}>
            <div style={{ width: 14, height: 13, background: '#8A8177', borderRadius: 0 }} />
            <span style={{ position: 'absolute', top: 0, left: 2, fontFamily: '"JetBrains Mono"', fontWeight: 500, fontSize: 12, lineHeight: '16px', color: '#FDFAF2' }}>
              1
            </span>
          </div>
          {/* Line separator */}
          <div style={{ width: 1, height: 13, background: '#5C5451', marginRight: 8 }} />
          {/* Title */}
          <span style={{ fontFamily: 'Satori TRIAL, "Satori", sans-serif', fontWeight: 100, fontSize: 12, lineHeight: '16px', letterSpacing: 0.2, color: '#A89F90' }}>
            CONSUMOS CULTURALES ||||||
          </span>
        </div>

        {/* ── FRAME 61: main row, space-between, items-end ── */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 22, flex: 1, minHeight: 0 }}>

          {/* ── LEFT: Frame 44 (149px wide) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: 149, flexShrink: 0 }}>

            {/* Frame 97: FORMATO knob section */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: 149, height: 94 }}>

              {/* Frame 43: Component 18 — knob with labels */}
              <div style={{ position: 'relative', width: 102, height: 94 }}>
                {/* Labels */}
                <span style={{ position: 'absolute', left: 0, top: '27.66%', fontFamily: '"JetBrains Mono"', fontSize: 8, color: '#8A8177' }}>Largo</span>
                <span style={{ position: 'absolute', right: 0, top: '27.66%', fontFamily: '"JetBrains Mono"', fontSize: 8, color: '#8A8177' }}>Corto</span>
                <span style={{ position: 'absolute', left: '37.25%', top: '12.77%', fontFamily: '"JetBrains Mono"', fontSize: 8, color: '#8A8177' }}>Medio</span>
                {/* Tick marks (Line 1, 5, 6) */}
                <div style={{ position: 'absolute', left: 6, top: 6, width: 4, height: 0, border: '1px solid #8A8177', transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', right: 0, top: 6, width: 4, height: 0, border: '1px solid #8A8177', transform: 'rotate(-45deg)' }} />
                <div style={{ position: 'absolute', left: 32, top: -5, width: 4, height: 0, border: '1px solid #8A8177', transform: 'rotate(-90deg)' }} />
                {/* FORMATO label badge */}
                <div style={{ position: 'absolute', left: 0, top: 0, background: '#716963', borderRadius: '2px 2px 0 0', padding: '0 3px', display: 'flex', alignItems: 'center', height: 8 }}>
                  <span style={{ fontFamily: 'Satori TRIAL, "Satori", sans-serif', fontSize: 8, color: '#FDFAF2' }}>FORMATO</span>
                </div>
                {/* Line 23 under badge */}
                <div style={{ position: 'absolute', left: '51.96%', right: 0, top: '12.77%', height: 1, background: '#5C5451', border: '1px solid #716963' }} />
                {/* Knob centered in 102x94 lower area */}
                <div style={{ position: 'absolute', left: '18.63%', right: '18.63%', top: '31.91%', bottom: 0 }}>
                  <KnobFigma size={62} compId="mod1-formato" />
                </div>
              </div>

              {/* Component 21: airplane icon + toggle (14x26) */}
              <div style={{ width: 14, height: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginLeft: 4, alignSelf: 'flex-end' }}>
                {/* Airplane icon */}
                <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#8A8177"/>
                  </svg>
                </div>
                {/* status indicator */}
                <div style={{ width: 8, height: 8, background: '#EFEBE2', boxShadow: '1px 1px 2px rgba(45,45,45,0.5), -1px -1px 2px #ffffff', borderRadius: 2 }} />
              </div>
            </div>

            {/* Component 17: Plataformas box */}
            <div style={{ width: 149, height: 99, position: 'relative' }}>
              {/* Plataformas label */}
              <div style={{ position: 'absolute', left: 8, top: 0, background: '#716963', borderRadius: '2px 2px 0 0', padding: '0 4px', zIndex: 1, height: 10, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontFamily: '"JetBrains Mono"', fontSize: 8, fontWeight: 300, color: '#FDFAF2', letterSpacing: 0.2 }}>Plataformas</span>
              </div>
              {/* Frame 38: platform grid box */}
              <div style={{
                position: 'absolute',
                left: 0, right: 0, top: '11.88%', bottom: 0,
                background: '#EFEBE2',
                border: '0.5px solid #8A8177',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0',
                gap: 14,
              }}>
                {/* Frame 37: 4x3 grid of platform buttons */}
                <div style={{ width: 107, height: 80, position: 'relative' }}>
                  {platforms.map((PlatComp, i) => {
                    const col = i % 4;
                    const row = Math.floor(i / 4);
                    return (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: col * 27.75,
                          top: row * 28,
                          width: 23.75,
                          height: 24,
                          background: '#EFEBE2',
                          border: '1px solid #DDD9CE',
                          boxShadow: '1px 1px 3px rgba(45,45,45,0.15), -1px -1px 2px #ffffff',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <PlatComp />
                      </div>
                    );
                  })}
                </div>
                {/* fader-2 vertical (16x71) for Hs. x día */}
                <div style={{ width: 16, height: 71, position: 'relative', flexShrink: 0 }}>
                  <span style={{
                    position: 'absolute',
                    left: -11, top: 8,
                    width: 53,
                    fontFamily: '"JetBrains Mono"', fontWeight: 300, fontSize: 8, color: '#8A8177',
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'top left',
                    whiteSpace: 'nowrap',
                  }}>Hs. X día</span>
                  <FaderFigma height={71} compId="mod1-plat-fader" />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Frame 45 (229px wide) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, width: 229, flexShrink: 0 }}>

            {/* Component 16: MEDIOS faders section (238x90) */}
            <div style={{ width: '100%', height: 90, position: 'relative' }}>
              {/* Group 2: MEDIOS header with connecting lines */}
              <div style={{ position: 'absolute', left: '9.66%', right: '4.2%', top: 0, bottom: '79.49%' }}>
                {/* Rectangle 3: MEDIOS badge */}
                <div style={{ position: 'absolute', left: 0, top: 0, right: '68.49%', bottom: '87.78%', background: '#716963' }} />
                {/* MEDIOS text */}
                <span style={{ position: 'absolute', left: '14.29%', top: '-1.11%', fontFamily: 'Satori TRIAL, "Satori", sans-serif', fontSize: 8, color: '#FFFFFF' }}>MEDIOS</span>
                {/* subtitle */}
                <span style={{ position: 'absolute', left: '32.77%', top: 0, fontFamily: '"JetBrains Mono"', fontWeight: 100, fontSize: 8, color: '#A89F90', whiteSpace: 'nowrap' }}>Los soportes más consumidos</span>
                {/* Horizontal line */}
                <div style={{ position: 'absolute', left: '9.66%', right: 0, top: '16.24%', height: 1, background: '#716963', border: '1px solid #716963' }} />
                {/* Vertical tick lines for each fader */}
                {[0,1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ position: 'absolute', left: `${9.66 + i * 13.67}%`, top: '16.24%', width: 1, height: '83.76%', background: '#716963', border: '1px solid #716963', transform: 'rotate(90deg)', transformOrigin: 'top left' }} />
                ))}
              </div>

              {/* Frame 2: faders row */}
              <div style={{ position: 'absolute', left: 'calc(50% - 111px)', top: 'calc(50% - 35.5px + 8.5px)', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 0 }}>
                {faderLabels.map((label, i) => (
                  <FaderFigma key={i} height={71} label={label} compId={`mod1-fader-${i}`} />
                ))}
              </div>
            </div>

            {/* Component 14: Hs RRSS x día horizontal slider (191x34) */}
            <div style={{ width: '100%' }}>
              <HSliderFigma width={210} />
            </div>

            {/* Frame 46: Referencias + Salidas (229x54) */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 24, width: '100%', height: 54 }}>

              {/* Component 20: Referencias knobs (131x54) */}
              <div style={{ width: 131, height: 54, position: 'relative' }}>
                {/* "Referencias" rotated label */}
                <span style={{
                  position: 'absolute',
                  left: 0, top: '3.7%',
                  fontFamily: '"JetBrains Mono"', fontSize: 7, color: '#8A8177',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'top left',
                  whiteSpace: 'nowrap',
                }}>Referencias</span>

                {/* Frame 43: 3 knobs with icons */}
                <div style={{ position: 'absolute', left: '13.74%', right: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 7 }}>
                  {/* Knob 1: wave icon */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 33 }}>
                    <svg viewBox="0 0 15 15" width="15" height="15" fill="none">
                      <path d="M1 8 Q4 3 7 8 Q10 13 13 8" stroke="#8A8177" strokeWidth="1.5"/>
                    </svg>
                    <KnobFigma size={33} compId="mod1-ref-1" />
                  </div>
                  {/* Knob 2: list icon */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 33 }}>
                    <svg viewBox="0 0 13.5 13.5" width="13.5" height="13.5" fill="none">
                      <line x1="4.5" y1="1.5" x2="13.5" y2="1.5" stroke="#8A8177" strokeWidth="1.5"/>
                      <line x1="4.5" y1="6.75" x2="13.5" y2="6.75" stroke="#8A8177" strokeWidth="1.5"/>
                      <line x1="4.5" y1="12" x2="13.5" y2="12" stroke="#8A8177" strokeWidth="1.5"/>
                      <circle cx="1.5" cy="1.5" r="1" fill="#8A8177"/>
                      <circle cx="1.5" cy="6.75" r="1" fill="#8A8177"/>
                      <circle cx="1.5" cy="12" r="1" fill="#8A8177"/>
                    </svg>
                    <KnobFigma size={33} compId="mod1-ref-2" />
                  </div>
                  {/* Knob 3: star/sparkle icon */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 33 }}>
                    <svg viewBox="0 0 17 18" width="17" height="18" fill="none">
                      <path d="M8.5 1 L10 7 L16 7 L11 11 L13 17 L8.5 13.5 L4 17 L6 11 L1 7 L7 7 Z" stroke="#716963" strokeWidth="1.125"/>
                    </svg>
                    <KnobFigma size={33} compId="mod1-ref-3" />
                  </div>
                </div>
              </div>

              {/* Frame 29: Salidas box (74x44) */}
              <div style={{
                width: 74,
                height: 44,
                background: '#EFEBE2',
                boxShadow: '3px 3px 8px rgba(45,45,45,0.18), -2px -2px 6px rgba(255,255,255,0.82)',
                borderRadius: 8,
                position: 'relative',
                flexShrink: 0,
              }}>
                {/* Rectangle 2: dark header bar */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 16, background: '#423F3D', borderRadius: '8px 8px 0 0' }} />
                {/* "Salisdas" text */}
                <span style={{
                  position: 'absolute',
                  left: 0, right: 0, top: 2,
                  textAlign: 'center',
                  fontFamily: 'Satori TRIAL, "Satori", sans-serif',
                  fontWeight: 700, fontSize: 12, lineHeight: '14px',
                  color: '#FFFFFF',
                }}>Salisdas</span>
                {/* Two jacks */}
                <div style={{ position: 'absolute', left: 11, bottom: 0, top: 19, display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Jack compId="out1" />
                  <Jack compId="out2" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
};

export default ControlModule;
