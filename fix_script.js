const fs = require('fs');
const targetPath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js';
let content = fs.readFileSync(targetPath, 'utf8');

// The file has literal "\n" strings in it, instead of real line breaks.
// Wait, the string in script.js literally has `\n`.
content = content.replace(/\\n/g, '\n');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Fixed script.js line breaks');
