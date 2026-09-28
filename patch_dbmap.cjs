
const fs = require('fs');
let content = fs.readFileSync('src/dbMap.js', 'utf8');

const booleanTracks = ['mod1-1', 'mod1-2', 'mod2-5', 'mod2-6', 'mod2-7', 'mod2-8', 'mod2-12', 'mod2-13', 'mod2-14', 'mod3-8', 'mod3-9', 'mod3-10', 'mod3-11', 'mod3-12', 'mod3-13', 'mod3-14', 'mod3-17', 'mod3-18', 'mod3-19'];

let lines = content.split('\n');
let currentKey = null;

for (let i = 0; i < lines.length; i++) {
    const keyMatch = lines[i].match(/"(mod\d+-\d+|demo-[a-z]+)":\s*\{/);
    if (keyMatch) {
        currentKey = keyMatch[1];
    }
    
    if (currentKey && booleanTracks.includes(currentKey) || (lines[i].includes('dataType: "categorical"'))) {
        if (lines[i].includes('visualizations:')) {
            lines[i] = lines[i].replace('"spectrum", ', '');
            lines[i] = lines[i].replace(', "spectrum"', '');
            lines[i] = lines[i].replace('"spectrum"', '');
            
            // Clean up empty arrays or arrays with just spaces
            lines[i] = lines[i].replace(/\[\s*,\s*/g, '[');
            lines[i] = lines[i].replace(/\s*,\s*\]/g, ']');
        }
    }
}

fs.writeFileSync('src/dbMap.js', lines.join('\n'), 'utf8');
console.log('dbMap updated');
