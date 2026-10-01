const fs = require('fs');

const resetActuators = () => {
  ['Knob.jsx', 'Fader.jsx', 'LedButton.jsx', 'ToggleSwitch.jsx', 'Counter.jsx', 'RotarySwitch.jsx'].forEach(file => {
    let path = 'src/components/actuators/' + file;
    if (fs.existsSync(path)) {
      let content = fs.readFileSync(path, 'utf8');
      content = content.replace(/className=`relative flex flex-col items-center justify-end/g, 'className=`relative flex items-center justify-center');
      content = content.replace(/className="relative flex flex-col items-center justify-end/g, 'className="relative flex items-center justify-center');
      fs.writeFileSync(path, content, 'utf8');
    }
  });
};

const resetModules = () => {
  ['src/ControlModule.jsx', 'src/Module2.jsx', 'src/Module3.jsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Restore absolute positioning to labels
    content = content.replace(/mb-\[8px\] left-1\/2 -translate-x-1\/2 text-\[8px\]/g, 'absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 text-[7px]');
    content = content.replace(/mt-\[8px\] left-1\/2 -translate-x-1\/2 text-\[8px\]/g, 'absolute top-[100%] mt-[4px] left-1/2 -translate-x-1/2 text-[7px]');
    content = content.replace(/mr-\[6px\] top-1\/2 -translate-y-1\/2 -rotate-90 origin-center text-\[8\.5px\]/g, 'absolute right-[100%] mr-[4px] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[7px]');
    content = content.replace(/mb-\[8px\] left-1\/2 -translate-x-1\/2 -rotate-90 origin-bottom-left text-\[8\.5px\]/g, 'absolute bottom-[100%] mb-[4px] left-1/2 -translate-x-1/2 -rotate-90 origin-bottom-left text-[7px]');
    content = content.replace(/mb-\[6px\] left-0 text-\[8px\]/g, 'absolute bottom-[100%] mb-[4px] left-0 text-[7px]');
    
    fs.writeFileSync(file, content, 'utf8');
  });
};

resetActuators();
resetModules();
