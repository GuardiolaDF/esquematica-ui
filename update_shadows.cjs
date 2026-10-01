const fs = require('fs');
let content = fs.readFileSync('tailwind.config.js', 'utf8');
const replacement = `      boxShadow: {
        'neo-out': '3px 3px 8px rgba(45, 45, 45, 0.18), -2px -2px 6px rgba(255, 255, 255, 0.82)',
        'neo-in': 'inset 1px 2px 4px rgba(45, 45, 45, 0.22), inset -1px -1px 2px rgba(255, 255, 255, 0.78)',
        'neo-knob': '3px 4px 8px rgba(45, 45, 45, 0.22), inset 1px 1px 2px rgba(255, 255, 255, 0.75)',
        'neo-panel': '6px 8px 20px rgba(45, 45, 45, 0.22), -4px -4px 10px rgba(255, 255, 255, 0.9)'
      },`;
content = content.replace(/boxShadow: \{[\s\S]*?\},/, replacement);
fs.writeFileSync('tailwind.config.js', content, 'utf8');
