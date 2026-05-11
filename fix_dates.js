const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';

// Fix script.js
const scriptPath = path.join(dir, 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Replace 2026-05-1x with 2026-05-0x
scriptContent = scriptContent.replace(/2026-05-1(\d)/g, '2026-05-0$1');
// Also fix 2026-05-2x if any
scriptContent = scriptContent.replace(/2026-05-2(\d)/g, '2026-05-0$1');

fs.writeFileSync(scriptPath, scriptContent, 'utf8');
console.log('Fixed dates in script.js');

// Fix HTML files
const files = fs.readdirSync(dir);
let count = 0;
files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let original = content;
    
    // Replace "May 1X, 2026" with "May X, 2026"
    content = content.replace(/May 1(\d), 2026/g, (match, p1) => `May ${p1}, 2026`);
    content = content.replace(/May 2(\d), 2026/g, (match, p1) => `May ${p1}, 2026`);
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  }
});
console.log(`Fixed dates in ${count} HTML files.`);
