const fs = require('fs');
const targetPath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/index.css';
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(/padding: 12px 16px;/g, 'padding: 14px 16px;');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Padding updated.');
