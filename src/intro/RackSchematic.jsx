import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Esquema del instrumento para el onboarding. Redibujado sobre el diagrama "estrezometro" (1400×790): tres módulos a la
// izquierda, el visualizador con su abanico y la consola abajo. Cada paso del onboarding enfoca una zona (`step`),
// atenúa el resto, mueve la cámara (viewBox) y anima los controles de esa zona.

const INK = 'var(--neutral-900)';
const PANEL = 'var(--neutral-0)';
const CORAL = 'var(--coral-500)';
const TEAL = 'var(--teal-700)';
const EASE = [0.22, 1, 0.36, 1];

// ─── Cámara y foco por paso ─────────────────────────────────────────────
const STEPS = {
  intro:     { view: '0 0 1400 790',    focus: ['mod1', 'mod2', 'mod3', 'vis', 'console'] },
  modules:   { view: '0 0 1400 790',    focus: ['mod1', 'mod2', 'mod3'] },
  vis:       { view: '470 4 930 608',   focus: ['vis'] },
  console:   { view: '470 268 930 525', focus: ['console'] },
  cables:    { view: '0 0 1400 790',    focus: ['mod1', 'mod3', 'vis'] },
  yours:     { view: '0 0 1400 790',    focus: ['mod1', 'mod2', 'mod3', 'vis', 'console'] },
};

// ─── Primitivas ─────────────────────────────────────────────────────────
// Todas dibujan su trazo al aparecer (pathLength 0 → 1), con un pequeño retraso por orden.
const draw = (i = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { pathLength: { duration: 0.9, delay: 0.1 + i * 0.012, ease: EASE }, opacity: { duration: 0.2, delay: 0.1 + i * 0.012 } },
});

const R = ({ x, y, w, h, r = 4, i, fill = 'none', sw = 1.6 }) => (
  <motion.rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke="currentColor" strokeWidth={sw} {...draw(i)} />
);
const C = ({ cx, cy, r, i, fill = 'none', sw = 1.6 }) => (
  <motion.circle cx={cx} cy={cy} r={r} fill={fill} stroke="currentColor" strokeWidth={sw} {...draw(i)} />
);

// Perilla grande con ranura. `spin` = recorrido en grados para la animación (0 = quieta).
const BigKnob = ({ cx, cy, i, spin = 0, delay = 0 }) => (
  <g>
    <C cx={cx} cy={cy} r={28} i={i} fill={PANEL} />
    <motion.g
      style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: 'view-box' }}
      animate={spin ? { rotate: [-spin, spin, -spin] } : { rotate: 0 }}
      transition={spin ? { duration: 3.2, delay, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.6 }}
    >
      <R x={cx - 6} y={cy - 22} w={12} h={44} r={6} i={i} />
      <C cx={cx} cy={cy - 15} r={2.6} i={i} />
    </motion.g>
  </g>
);

// Perilla chica con puntero y dos marcas de recorrido.
const SmallKnob = ({ cx, cy, r = 13, i, spin = 0, delay = 0, marks = true }) => (
  <g>
    <C cx={cx} cy={cy} r={r} i={i} fill={PANEL} />
    {marks && <><circle cx={cx - r - 2} cy={cy + r - 1} r={1.6} fill="currentColor" /><circle cx={cx + r + 2} cy={cy + r - 1} r={1.6} fill="currentColor" /></>}
    <motion.line
      x1={cx} y1={cy} x2={cx} y2={cy - r + 3} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"
      style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: 'view-box' }}
      animate={spin ? { rotate: [-spin, spin * 0.8, -spin] } : { rotate: marks ? 0 : 40 }}
      transition={spin ? { duration: 2.6, delay, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.6 }}
    />
  </g>
);

// Fader vertical; el cursor sube y baja si `travel` > 0.
const VFader = ({ x, y, h = 72, i, travel = 0, delay = 0 }) => (
  <g>
    <R x={x} y={y} w={12} h={h} r={6} i={i} fill={PANEL} />
    <motion.circle
      cx={x + 6} r={3} fill={PANEL} stroke="currentColor" strokeWidth={1.4}
      initial={{ cy: y + 10 }}
      animate={travel ? { cy: [y + 10, y + 10 + travel, y + 10] } : { cy: y + 10 }}
      transition={travel ? { duration: 2.8, delay, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.6 }}
    />
  </g>
);

const HSlider = ({ x, y, w = 200, i, travel = 0, delay = 0, start = 48 }) => (
  <g>
    <R x={x} y={y} w={w} h={18} r={9} i={i} fill={PANEL} />
    <motion.circle
      cy={y + 9} r={5.5} fill={PANEL} stroke="currentColor" strokeWidth={1.4}
      initial={{ cx: x + start }}
      animate={travel ? { cx: [x + start, x + start + travel, x + start] } : { cx: x + start }}
      transition={travel ? { duration: 3.4, delay, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.6 }}
    />
  </g>
);

const Stepper = ({ x, y, i }) => (
  <g>
    <R x={x} y={y} w={44} h={50} r={8} i={i} fill={PANEL} />
    <path d={`M${x + 48},${y + 15} l3,-6 l3,6 z M${x + 48},${y + 35} l3,6 l3,-6 z`} fill="none" stroke="currentColor" strokeWidth={1.1} />
  </g>
);

// Caja de salida con dos jacks
const JackBox = ({ x, y, i, glow = false }) => (
  <g>
    <R x={x} y={y} w={68} h={42} r={8} i={i} fill={PANEL} />
    {[x + 14, x + 54].map((jx) => (
      <g key={jx}>
        <C cx={jx} cy={y + 28} r={9} i={i} />
        <motion.circle cx={jx} cy={y + 28} r={5.5} fill={glow ? CORAL : 'none'} stroke="currentColor" strokeWidth={1.4}
          initial={{ fillOpacity: 0 }} animate={{ fillOpacity: glow ? [0.2, 1, 0.2] : 0 }} transition={{ duration: 1.6, repeat: glow ? Infinity : 0 }} />
      </g>
    ))}
  </g>
);

// Cuadradito / LED. `lit` = color; `pulse` = parpadea con retraso.
const Led = ({ x, y, s = 10, lit, pulse, delay = 0 }) => (
  <motion.rect
    x={x} y={y} width={s} height={s} rx={2} stroke="currentColor" strokeWidth={1.4}
    initial={false}
    animate={{ fill: lit ? lit : PANEL, opacity: pulse ? [0.35, 1, 0.35] : 1 }}
    transition={pulse ? { opacity: { duration: 1.8, delay, repeat: Infinity }, fill: { duration: 0.3 } } : { duration: 0.3 }}
  />
);

// ─── Módulos ────────────────────────────────────────────────────────────
const Module1 = ({ live }) => (
  <g>
    <R x={12} y={12} w={458} h={248} r={12} i={0} fill={PANEL} sw={1.8} />
    <BigKnob cx={111} cy={89} i={1} spin={live ? 70 : 0} />
    <Led x={33} y={117} />
    {[243, 274, 305, 336, 366, 397, 427].map((x, k) => (
      <VFader key={x} x={x - 6} y={56} i={2 + k} travel={live ? 20 + ((k * 17) % 34) : 0} delay={k * 0.18} />
    ))}
    <R x={34} y={148} w={162} h={96} r={8} i={9} fill={PANEL} />
    {Array.from({ length: 12 }, (_, k) => {
      const col = k % 4; const row = Math.floor(k / 4);
      return (
        <motion.rect
          key={k} x={40 + col * 30.5} y={154 + row * 30} width={26} height={26} rx={3} stroke="currentColor" strokeWidth={1.4}
          initial={false}
          animate={{ fill: live ? [PANEL, CORAL, PANEL] : PANEL }}
          transition={live ? { duration: 0.9, delay: 0.4 + ((k * 7) % 12) * 0.35, repeat: Infinity, repeatDelay: 3.3 } : { duration: 0.3 }}
        />
      );
    })}
    <VFader x={172} y={158} h={72} i={10} travel={live ? 30 : 0} delay={0.6} />
    <HSlider x={231} y={157} i={11} travel={live ? 110 : 0} />
    {[231, 280, 329].map((x, k) => <SmallKnob key={x} cx={x} cy={228} i={12 + k} spin={live ? 60 : 0} delay={k * 0.3} />)}
    <JackBox x={383} y={203} i={15} />
  </g>
);

const Module2 = ({ live }) => (
  <g>
    <R x={12} y={270} w={458} h={248} r={12} i={4} fill={PANEL} sw={1.8} />
    <BigKnob cx={69} cy={350} i={5} spin={live ? 55 : 0} delay={0.4} />
    <VFader x={137} y={318} i={6} travel={live ? 38 : 0} delay={0.2} />
    {[203, 292, 382].map((x, k) => <Stepper key={x} x={x} y={315} i={7 + k} />)}
    {[222, 271, 320].map((x, k) => <SmallKnob key={x} cx={x} cy={412} r={10} marks={false} i={10 + k} spin={live ? 70 : 0} delay={k * 0.25} />)}
    <SmallKnob cx={58} cy={430} i={13} spin={live ? 50 : 0} />
    <SmallKnob cx={58} cy={478} i={14} spin={live ? 50 : 0} delay={0.5} />
    {[[103, 433], [137, 433], [103, 467], [137, 467]].map(([x, y], k) => (
      <Led key={k} x={x} y={y} lit={live && k % 3 === 0 ? CORAL : null} />
    ))}
    {[220, 270, 320].map((x, k) => <SmallKnob key={x} cx={x} cy={480} i={15 + k} spin={live ? 60 : 0} delay={0.3 + k * 0.2} />)}
    <JackBox x={383} y={455} i={18} />
  </g>
);

const Module3 = ({ live }) => (
  <g>
    <R x={12} y={528} w={458} h={248} r={12} i={8} fill={PANEL} sw={1.8} />
    {[[58, 612], [106, 612], [58, 660], [106, 660]].map(([cx, cy], k) => (
      <SmallKnob key={k} cx={cx} cy={cy} i={9 + k} spin={live ? 55 : 0} delay={k * 0.22} />
    ))}
    <BigKnob cx={76} cy={735} i={13} spin={live ? 60 : 0} delay={0.8} />
    <Stepper x={191} y={572} i={14} />
    <Stepper x={263} y={572} i={15} />
    <SmallKnob cx={355} cy={598} r={10} marks={false} i={16} />
    {[577, 599, 621].flatMap((y) => [400, 422].map((x) => [x - 5, y - 5])).map(([x, y], k) => (
      <Led key={k} x={x} y={y} lit={live && (k === 1 || k === 4) ? TEAL : null} />
    ))}
    <HSlider x={217} y={662} i={17} travel={live ? 90 : 0} start={48} delay={0.5} />
    <VFader x={174} y={672} h={70} i={18} travel={live ? 34 : 0} delay={0.9} />
    {[231, 280, 329].map((x, k) => <SmallKnob key={x} cx={x} cy={738} i={19 + k} spin={live ? 60 : 0} delay={0.2 + k * 0.3} />)}
    <JackBox x={383} y={713} i={22} />
  </g>
);

// ─── Visualizador ───────────────────────────────────────────────────────
const APEX = { x: 933, y: 585 };
const FAN_L = { x: 567, y: 217 };
const FAN_R = { x: 1300, y: 217 };
const FAN_CTRL = { x: 933, y: 47 };

// Escala un punto hacia el vértice del abanico
const toward = (p, k) => ({ x: APEX.x + (p.x - APEX.x) * k, y: APEX.y + (p.y - APEX.y) * k });
const bandPath = (k) => {
  const a = toward(FAN_L, k); const c = toward(FAN_CTRL, k); const b = toward(FAN_R, k);
  return `M${a.x},${a.y} Q${c.x},${c.y} ${b.x},${b.y}`;
};
// Punto sobre el arco exterior (t 0..1) escalado por k
const onFan = (t, k) => {
  const x = (1 - t) ** 2 * FAN_L.x + 2 * (1 - t) * t * FAN_CTRL.x + t ** 2 * FAN_R.x;
  const y = (1 - t) ** 2 * FAN_L.y + 2 * (1 - t) * t * FAN_CTRL.y + t ** 2 * FAN_R.y;
  return toward({ x, y }, k);
};

// Carriles: arcos concéntricos (como en el vúmetro real), del más interno (k = 0.32) al borde exterior (k = 1).
// Las bandas gruesas separan los tres módulos. A lo largo de cada arco: izquierda + relax, derecha + estrés.
const LANES = 24;
const laneK = (l) => 0.32 + ((l + 0.5) / LANES) * 0.68;
const MODULE_BANDS = [0.32 + 0.68 * (8 / LANES), 0.32 + 0.68 * (16 / LANES)];

// Pseudoaleatorio estable para que los puntos no cambien en cada render
const rand = (seed) => { const s = Math.sin(seed * 9301 + 49297) * 233280; return s - Math.floor(s); };

const DISPLAY_TEXT = {
  intro: 'ESTREZOMETRO', modules: 'ESTREZOMETRO', vis: 'MODO COLECTIVO', console: null, cables: 'RELACIÓN', yours: 'MODO INDIVIDUAL',
};
const CONSOLE_MODES = ['MODO COLECTIVO', 'MODO INDIVIDUAL', 'MODO ESPECULATIVO'];

const Visualizer = ({ step, modeIndex }) => {
  const showFan = step !== 'cables';
  const dots = useMemo(() => Array.from({ length: 80 }, (_, k) => {
    const lane = Math.floor(rand(k + 1) * LANES);
    const t = Math.min(0.97, Math.max(0.03, 0.5 + (rand(k + 99) + rand(k + 199) - 1) * 0.55));
    return onFan(t, laneK(lane));
  }), []);
  const relDots = useMemo(() => Array.from({ length: 46 }, (_, k) => {
    const u = rand(k + 7);
    return { x: 640 + u * 600, y: 520 - u * 330 + (rand(k + 31) - 0.5) * 130 };
  }), []);
  const text = step === 'console' ? CONSOLE_MODES[modeIndex] : DISPLAY_TEXT[step];

  return (
    <g>
      <R x={479} y={12} w={910} h={591} r={12} i={1} fill={PANEL} sw={1.8} />
      {/* Display de modo */}
      <R x={489} y={30} w={322} h={72} r={16} i={2} fill="var(--neutral-900)" />
      <motion.text
        key={text} x={511} y={74} fill="var(--neutral-50)" fontFamily="JetBrains Mono, monospace" fontSize={20} letterSpacing={1}
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.85, 1] }} transition={{ duration: 0.5 }}
      >
        {text}
      </motion.text>

      {/* Abanico (vúmetro) */}
      <motion.g initial={{ opacity: 1 }} animate={{ opacity: showFan ? 1 : 0.12 }} transition={{ duration: 0.5 }}>
        <motion.path
          d={`M${FAN_L.x},${FAN_L.y} Q${FAN_CTRL.x},${FAN_CTRL.y} ${FAN_R.x},${FAN_R.y} L${APEX.x},${APEX.y} Z`}
          fill="none" stroke="currentColor" strokeWidth={1.8} {...draw(3)}
        />
        {/* Carriles y bandas: aparecen al hablar del visualizador */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: ['vis', 'yours', 'console'].includes(step) ? 1 : 0 }} transition={{ duration: 0.6 }}>
          {Array.from({ length: LANES }, (_, l) => (
            <path key={l} d={bandPath(laneK(l))} fill="none" stroke="var(--neutral-200)" strokeWidth={1} />
          ))}
          {MODULE_BANDS.map((k) => <path key={k} d={bandPath(k)} fill="none" stroke="currentColor" strokeWidth={1.6} />)}
          {/* Un carril resaltado que recorre el abanico */}
          {step === 'vis' && (
            <motion.path
              fill="none" stroke={TEAL} strokeWidth={9} strokeLinecap="round" opacity={0.35}
              initial={{ d: bandPath(laneK(20)) }}
              animate={{ d: [20, 5, 13, 22, 9, 20].map((l) => bandPath(laneK(l))) }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <text x={575} y={590} fontFamily="JetBrains Mono, monospace" fontSize={17} fill="currentColor">+ RELAX</text>
          <text x={1292} y={590} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={17} fill="currentColor">+ ESTRÉS</text>
          {dots.map((d, k) => (
            <motion.circle
              key={k} cx={d.x} cy={d.y} r={4.5} fill={CORAL}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: step === 'yours' ? 0.25 : 0.85 }}
              transition={{ delay: 0.3 + k * 0.025, duration: 0.4 }}
              style={{ originX: `${d.x}px`, originY: `${d.y}px`, transformBox: 'view-box' }}
            />
          ))}
        </motion.g>
        {/* Aguja */}
        <motion.line
          x1={APEX.x} y1={APEX.y} x2={APEX.x} y2={APEX.y - 420} stroke="var(--neutral-600)" strokeWidth={5} strokeLinecap="round"
          style={{ originX: `${APEX.x}px`, originY: `${APEX.y}px`, transformBox: 'view-box' }}
          initial={{ opacity: 0, rotate: -18 }}
          animate={{ opacity: step === 'intro' || step === 'modules' ? 0 : 1, rotate: [-18, 12, -4, 16, -18] }}
          transition={{ rotate: { duration: 9, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.5 } }}
        />
      </motion.g>

      {/* Relación X/Y: aparece cuando se conectan dos variables con cables */}
      {step === 'cables' && (
        <g>
          <motion.path d="M620,560 L620,150 M620,560 L1300,560" stroke="currentColor" strokeWidth={1.4} fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.6, duration: 0.6 }} />
          {relDots.map((d, k) => (
            <motion.circle key={k} cx={d.x} cy={d.y} r={5} fill={k % 2 ? CORAL : TEAL}
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.9, scale: 1 }}
              transition={{ delay: 2 + k * 0.03, duration: 0.35 }}
              style={{ originX: `${d.x}px`, originY: `${d.y}px`, transformBox: 'view-box' }} />
          ))}
        </g>
      )}

      {/* Entradas del visualizador */}
      <JackBox x={492} y={551} i={4} glow={step === 'cables'} />
    </g>
  );
};

// ─── Consola / panel de control ─────────────────────────────────────────
const Console = ({ step, modeIndex }) => {
  const live = step === 'console';
  return (
    <g>
      <R x={479} y={610} w={910} h={166} r={12} i={6} fill={PANEL} sw={1.8} />
      {[537, 667, 768, 869, 1073, 1167].map((x, k) => (
        <motion.circle key={x} cx={x} cy={647} r={6} stroke="currentColor" strokeWidth={1.4}
          initial={false}
          animate={{ fill: live && (k + modeIndex) % 2 === 0 ? CORAL : PANEL }}
          transition={{ duration: 0.3 }} />
      ))}
      <BigKnob cx={554} cy={704} i={7} spin={live ? 45 : 0} />
      {[0, 1, 2, 3, 4].map((k) => <Led key={k} x={663} y={672 + k * 14} s={9} lit={live && k === (modeIndex + 1) % 5 ? CORAL : null} />)}
      <SmallKnob cx={762} cy={681} r={10} marks={false} i={8} spin={live ? 60 : 0} />
      <Led x={763} y={711} s={9} />
      <SmallKnob cx={762} cy={746} r={10} marks={false} i={9} spin={live ? 60 : 0} delay={0.4} />
      <SmallKnob cx={869} cy={680} r={10} marks={false} i={10} spin={live ? 50 : 0} delay={0.2} />
      {[[935, 4], [984, 3], [1068, 3], [1162, 3]].map(([x, n], g) => (
        Array.from({ length: n }, (_, k) => <Led key={`${g}-${k}`} x={x} y={672 + k * 14} s={9} lit={live && (k + g + modeIndex) % 3 === 0 ? TEAL : null} />)
      ))}
      {/* Solapas de modo sobre el borde del panel: Colectivo / Individual / Especulativo */}
      {['COLECTIVO', 'INDIVIDUAL', 'ESPECULATIVO'].map((label, k) => {
        const on = live ? modeIndex === k : step === 'yours' ? k === 1 : k === 0;
        const x = 767 + k * 114; const h = on ? 28 : 20;
        return (
          <g key={label}>
            <motion.path
              initial={false}
              animate={{ d: `M${x},612 L${x},${612 - h + 8} Q${x},${612 - h} ${x + 8},${612 - h} L${x + 102},${612 - h} Q${x + 110},${612 - h} ${x + 110},${612 - h + 8} L${x + 110},612`, fill: on ? PANEL : 'var(--neutral-200)' }}
              transition={{ duration: 0.25 }}
              stroke="currentColor" strokeWidth={1.4}
            />
            <motion.rect x={x + 12} y={on ? 593 : 599} width={8} height={8} rx={2} stroke="currentColor" strokeWidth={1}
              initial={false} animate={{ fill: on ? CORAL : PANEL, y: on ? 592 : 598 }} transition={{ duration: 0.25 }} />
            <motion.text x={x + 26} fontFamily="Satori, sans-serif" fontWeight={700} fontSize={11} fill="currentColor"
              initial={false} animate={{ y: on ? 601 : 607, opacity: on ? 1 : 0.55 }} transition={{ duration: 0.25 }}>{label}</motion.text>
          </g>
        );
      })}
      {/* Contador de usuarios (o Guardar, en individual), centrado en el alto del panel */}
      <motion.rect x={1271} y={671} width={86} height={44} rx={8} stroke="currentColor" strokeWidth={1.6}
        initial={false}
        animate={{ fill: step === 'yours' ? 'var(--teal-700)' : PANEL, opacity: step === 'yours' ? [1, 0.75, 1] : 1 }}
        transition={step === 'yours' ? { opacity: { duration: 1.4, repeat: Infinity }, fill: { duration: 0.3 } } : { duration: 0.3 }} />
      <motion.text x={1314} y={step === 'yours' ? 697 : 700} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={step === 'yours' ? 14 : 18}
        fill={step === 'yours' ? 'var(--neutral-50)' : 'var(--neutral-500)'} fontWeight={step === 'yours' ? 700 : 400}
        key={`u-${modeIndex}-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {step === 'yours' ? 'GUARDAR' : live ? ['128', '001', '128'][modeIndex] : '128'}
      </motion.text>
    </g>
  );
};

// ─── Cables (de los módulos al visualizador) ────────────────────────────
const CABLES = [
  { d: 'M437,231 C520,330 430,520 506,579', color: CORAL, delay: 0.3 },
  { d: 'M437,741 C540,800 560,690 546,579', color: TEAL, delay: 0.9 },
];

const Cables = () => (
  <g>
    {CABLES.map((c) => {
      const [sx, sy] = c.d.slice(1).split(' ')[0].split(',').map(Number);
      const end = c.d.split(' ').pop().split(',').map(Number);
      return (
        <g key={c.d}>
          <motion.path d={c.d} fill="none" stroke={c.color} strokeWidth={7} strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: c.delay, duration: 0.9, ease: EASE }} />
          <circle cx={sx} cy={sy} r={8} fill={c.color} stroke={INK} strokeWidth={1.4} />
          <motion.circle cx={end[0]} cy={end[1]} r={8} fill={c.color} stroke={INK} strokeWidth={1.4}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: c.delay + 0.85 }} />
        </g>
      );
    })}
  </g>
);

// ─── Conjunto ───────────────────────────────────────────────────────────
const Zone = ({ id, focus, children }) => {
  const on = focus.includes(id);
  return (
    <motion.g initial={{ opacity: 1 }} animate={{ opacity: on ? 1 : 0.28 }} transition={{ duration: 0.5 }} style={{ color: INK }}>
      {children}
    </motion.g>
  );
};

const RackSchematic = ({ step = 'intro', modeIndex = 0, className = '' }) => {
  const cfg = STEPS[step] ?? STEPS.intro;
  const liveModules = step === 'modules' || step === 'yours';
  return (
    <motion.svg
      className={className}
      initial={{ viewBox: STEPS.intro.view }}
      animate={{ viewBox: cfg.view }}
      transition={{ duration: 0.9, ease: EASE }}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
    >
      <R x={2} y={2} w={1396} h={786} r={14} i={0} sw={1.6} />
      <Zone id="mod1" focus={cfg.focus}><Module1 live={liveModules} /></Zone>
      <Zone id="mod2" focus={cfg.focus}><Module2 live={liveModules} /></Zone>
      <Zone id="mod3" focus={cfg.focus}><Module3 live={liveModules} /></Zone>
      <Zone id="vis" focus={cfg.focus}><Visualizer step={step} modeIndex={modeIndex} /></Zone>
      <Zone id="console" focus={cfg.focus}><Console step={step} modeIndex={modeIndex} /></Zone>
      {step === 'cables' && <Cables />}
    </motion.svg>
  );
};

export default RackSchematic;
