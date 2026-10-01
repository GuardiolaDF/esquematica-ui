const fs = require('fs');
const data = JSON.parse(fs.readFileSync('figma_data.json', 'utf8'));

const colors = new Set();
const shadows = new Set();
const radii = new Set();
const fonts = new Set();

function traverse(node) {
  if (node.fills) node.fills.forEach(f => {
    if (f.color) colors.add(JSON.stringify(f.color));
  });
  if (node.strokes) node.strokes.forEach(s => {
    if (s.color) colors.add(JSON.stringify(s.color));
  });
  if (node.effects) node.effects.forEach(e => {
    if (e.type.includes('SHADOW')) {
      shadows.add(JSON.stringify({type: e.type, color: e.color, offset: e.offset, radius: e.radius, spread: e.spread}));
    }
  });
  if (node.cornerRadius !== undefined) radii.add(node.cornerRadius);
  if (node.style && node.style.fontFamily) {
    fonts.add(node.style.fontFamily + ' ' + node.style.fontWeight + ' ' + node.style.fontSize);
  }
  
  if (node.children) node.children.forEach(traverse);
}

const rootNode = data.nodes['2316:1313'].document;
traverse(rootNode);

console.log('--- COLORS (R G B) ---');
console.log(Array.from(colors).map(c => JSON.parse(c)).map(c => `rgba(${Math.round(c.r*255)}, ${Math.round(c.g*255)}, ${Math.round(c.b*255)}, ${c.a||1})`).join('\n'));

console.log('\n--- SHADOWS ---');
console.log(Array.from(shadows).join('\n'));

console.log('\n--- BORDER RADII ---');
console.log(Array.from(radii).join('\n'));

console.log('\n--- FONTS ---');
console.log(Array.from(fonts).join('\n'));
