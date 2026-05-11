const fs = require('fs');
const targetPath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/index.css';
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(/\.learn-header \{\s*text-align: center;\s*margin-bottom: \d+px;\s*\}/, '.learn-header {\n  text-align: center;\n  margin-bottom: 32px;\n}');
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Updated learn header margins.');
