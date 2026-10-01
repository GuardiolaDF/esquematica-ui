const fs = require('fs');
['Knob.jsx', 'Fader.jsx', 'LedButton.jsx', 'ToggleSwitch.jsx', 'Counter.jsx', 'RotarySwitch.jsx'].forEach(file => {
  let path = 'src/components/actuators/' + file;
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/className=`relative flex items-center justify-center/g, 'className=`relative flex flex-col items-center justify-end');
    content = content.replace(/className="relative flex items-center justify-center/g, 'className="relative flex flex-col items-center justify-end');
    fs.writeFileSync(path, content, 'utf8');
  }
});
