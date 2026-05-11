const fs = require('fs');

const targetPath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js';
let content = fs.readFileSync(targetPath, 'utf8');

function generateTags(url, title) {
  const str = (url + ' ' + title).toLowerCase();
  const tags = [];
  
  if (str.includes('total-loss') || str.includes('totaled')) tags.push('total-loss');
  if (str.includes('acv') || str.includes('actual cash value') || str.includes('comparables') || str.includes('value')) tags.push('acv');
  if (str.includes('deductible')) tags.push('deductibles');
  if (str.includes('dcpd') || str.includes('not-at-fault') || str.includes('parked')) tags.push('dcpd');
  if (str.includes('fault') || str.includes('rear-end')) tags.push('fault');
  if (str.includes('repair') || str.includes('estimate') || str.includes('body shop')) tags.push('repair-process');
  if (str.includes('settle') || str.includes('claim') || str.includes('subrogation')) tags.push('claims-process');
  if (str.includes('rental') || str.includes('opcf-20') || str.includes('loss-of-use') || str.includes('loss of use')) tags.push('rental-coverage');
  if (str.includes('premium') || str.includes('expensive') || str.includes('speeding') || str.includes('price')) tags.push('pricing');
  if (str.includes('uninsured')) tags.push('uninsured-driver');
  if (str.includes('gap')) tags.push('gap-insurance');
  if (str.includes('comprehensive') || str.includes('collision') || str.includes('opcf')) tags.push('coverage-basics');

  // fallback tag
  if (tags.length === 0) tags.push('insurance-basics');

  return tags;
}

const updatedContent = content.replace(/(url:\s*"([^"]+)",[\s\S]*?title:\s*"([^"]+)"[\s\S]*?featured:\s*(true|false))/g, (match, urlLine, url, title, featuredVal) => {
  if (match.includes('tags:')) return match; // already tagged
  
  const tags = generateTags(url, title);
  return `${match},\n    tags: ${JSON.stringify(tags)}`;
});

// Since the regex above might miss if the order of url/title/featured is different,
// let's do a simpler replacement based on the block
const finalContent = content.replace(/(\{\s*title:\s*"([^"]+)",\s*excerpt:[\s\S]*?url:\s*"([^"]+)",[\s\S]*?featured:\s*(true|false))\s*\}/g, (match, innerBlock, title, url, featuredVal) => {
  if (match.includes('tags:')) return match;
  const tags = generateTags(url, title);
  return `${innerBlock},\n    tags: ${JSON.stringify(tags)}\n  }`;
});

fs.writeFileSync(targetPath, finalContent, 'utf8');
console.log('Tags successfully injected into ARTICLES array.');
