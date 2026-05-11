const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';
const files = fs.readdirSync(dir);

let count = 0;
files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the specific text
    const oldFooter = 'Empowering drivers through transparency.';
    const newFooter = 'Empowering drivers with clear, unbiased education on auto insurance claims and vehicle valuation.';
    
    if (content.includes(oldFooter)) {
      content = content.replaceAll(oldFooter, newFooter);
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  }
});

console.log(`Updated footer in ${count} HTML files.`);
