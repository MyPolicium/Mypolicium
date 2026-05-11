const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const titles = new Map();
const descriptions = new Map();
const issues = [];

files.forEach(f => {
  if(f === 'article-template.html') return;
  const c = fs.readFileSync(f, 'utf8');
  
  const tMatch = c.match(/<title>([\s\S]*?)<\/title>/i);
  const t = tMatch ? tMatch[1].trim() : null;
  
  const dMatch = c.match(/<meta name="description" content="([^"]+)"/i);
  const d = dMatch ? dMatch[1].trim() : null;
  
  const h1Match = c.match(/<h1.*?>/i);
  
  if (!t) issues.push({ file: f, issue: 'missing title' });
  else {
    if (t.length > 75) issues.push({ file: f, issue: "title too long (" + t.length + "): " + t });
    if (titles.has(t)) issues.push({ file: f, issue: "duplicate title with " + titles.get(t) });
    titles.set(t, f);
  }
  
  if (!d) issues.push({ file: f, issue: 'missing description' });
  else {
    if (d.length > 170) issues.push({ file: f, issue: "description too long (" + d.length + "): " + d });
    if (d.length < 50) issues.push({ file: f, issue: "description too short (" + d.length + "): " + d });
    if (descriptions.has(d)) issues.push({ file: f, issue: "duplicate description with " + descriptions.get(d) });
    descriptions.set(d, f);
  }
  
  if (!h1Match) issues.push({ file: f, issue: 'missing H1' });
});

console.log(JSON.stringify(issues, null, 2));
