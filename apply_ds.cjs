const fs = require('fs');

const updateApp = () => {
  let file = 'src/App.jsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-synth-surface/g, 'bg-bg-sunken text-text-primary');
  fs.writeFileSync(file, content, 'utf8');
};

const updateModuleShell = () => {
  let file = 'src/ModuleShell.jsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-synth-panel/g, 'bg-bg-base');
  content = content.replace(/border-synth-border-light/g, 'border-border-subtle');
  content = content.replace(/shadow-neo-panel/g, 'shadow-elevation-03');
  fs.writeFileSync(file, content, 'utf8');
};

const updateKnob = () => {
  let file = 'src/components/actuators/Knob.jsx';
  let content = fs.readFileSync(file, 'utf8');
  // track/surface
  content = content.replace(/bg-synth-surface/g, 'bg-control-bg shadow-elevation-02');
  content = content.replace(/bg-synth-module/g, 'bg-control-bg shadow-elevation-02');
  content = content.replace(/border-synth-border-light/g, 'border-border-subtle');
  content = content.replace(/border-synth-border-dark/g, 'border-border-default');
  content = content.replace(/bg-synth-accent/g, 'bg-indicator-active');
  fs.writeFileSync(file, content, 'utf8');
};

const updateFader = () => {
  let file = 'src/components/actuators/Fader.jsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-synth-track/g, 'bg-control-track shadow-inset-control');
  content = content.replace(/bg-synth-module/g, 'bg-control-track shadow-inset-control');
  content = content.replace(/bg-synth-surface/g, 'bg-control-track shadow-inset-control');
  content = content.replace(/bg-synth-panel/g, 'bg-control-bg shadow-elevation-02'); // thumb
  content = content.replace(/border-synth-border-light/g, 'border-border-subtle');
  content = content.replace(/bg-synth-accent/g, 'bg-indicator-active');
  fs.writeFileSync(file, content, 'utf8');
};

const updateToggle = () => {
  let file = 'src/components/actuators/ToggleSwitch.jsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-synth-track/g, 'bg-control-track shadow-inset-control');
  content = content.replace(/bg-synth-module/g, 'bg-control-track shadow-inset-control');
  content = content.replace(/bg-synth-surface/g, 'bg-control-track shadow-inset-control');
  content = content.replace(/bg-synth-panel/g, 'bg-control-bg shadow-elevation-02'); // thumb
  content = content.replace(/border-synth-border-light/g, 'border-border-subtle');
  content = content.replace(/bg-synth-accent/g, 'bg-indicator-active');
  fs.writeFileSync(file, content, 'utf8');
};

const updateLedButton = () => {
  let file = 'src/components/actuators/LedButton.jsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-synth-module/g, 'bg-control-bg');
  content = content.replace(/bg-synth-surface/g, 'bg-control-bg');
  content = content.replace(/border-synth-border-light/g, 'border-border-subtle');
  content = content.replace(/shadow-neo-out/g, 'shadow-elevation-01');
  content = content.replace(/shadow-neo-in/g, 'shadow-inset-pressed');
  content = content.replace(/bg-synth-accent/g, 'bg-indicator-active');
  fs.writeFileSync(file, content, 'utf8');
};

const updateModules = () => {
  ['src/ControlModule.jsx', 'src/Module2.jsx', 'src/Module3.jsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/text-synth-ink-base/g, 'text-text-secondary');
    content = content.replace(/text-synth-ink-light/g, 'text-text-muted');
    content = content.replace(/text-synth-ink-dark/g, 'text-text-primary');
    content = content.replace(/text-synth-ink-black/g, 'text-text-primary');
    content = content.replace(/bg-synth-ink-dark/g, 'bg-text-primary');
    content = content.replace(/bg-synth-surface/g, 'bg-bg-base');
    content = content.replace(/bg-synth-module/g, 'bg-control-bg');
    content = content.replace(/border-synth-border-base/g, 'border-border-strong');
    content = content.replace(/border-synth-border-light/g, 'border-border-subtle');
    content = content.replace(/shadow-neo-out/g, 'shadow-elevation-01');
    content = content.replace(/shadow-neo-in/g, 'shadow-inset-control');
    fs.writeFileSync(file, content, 'utf8');
  });
};

updateApp();
updateModuleShell();
updateKnob();
updateFader();
updateToggle();
updateLedButton();
updateModules();
