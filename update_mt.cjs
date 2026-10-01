const fs = require('fs');
let content = fs.readFileSync('src/ControlModule.jsx', 'utf8');
content = content.replace(/className="h-\[46\.1%\] flex flex-row items-end pb-\[2%\] gap-\[2%\] mt-\[10px\]"/, 'className="h-[46.1%] flex flex-row items-end pb-[2%] gap-[2%] mt-[25px]"');
fs.writeFileSync('src/ControlModule.jsx', content, 'utf8');
