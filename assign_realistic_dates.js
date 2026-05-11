const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';
const scriptPath = path.join(dir, 'script.js');
const sitemapPath = path.join(dir, 'sitemap.xml');

// 1. Read script.js and extract articles
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Define date distributions
const dates = {
  // Foundational (April 1 - 15)
  'what-is-actual-cash-value.html': '2026-04-02',
  'article-total-loss.html': '2026-04-05',
  'negotiate-total-loss.html': '2026-04-08',
  'what-happens-after-total-loss.html': '2026-04-10',
  'article-opcf-43.html': '2026-04-12',
  'how-do-car-insurance-deductibles-work.html': '2026-04-14',
  'dcpd-coverage.html': '2026-04-15',

  // Coverage & Specifics (April 16 - 30)
  'gap-insurance.html': '2026-04-18',
  'comprehensive-vs-collision-insurance.html': '2026-04-20',
  'someone-else-driving-my-car-accident.html': '2026-04-22',
  'hit-by-uninsured-driver.html': '2026-04-24',
  'rear-end-collisions-who-is-at-fault.html': '2026-04-26',
  'what-happens-if-someone-hits-your-parked-car.html': '2026-04-28',
  'opcf-20-loss-of-use-coverage.html': '2026-04-30',

  // May (May 1 - 10)
  'how-to-find-comparables-total-loss.html': '2026-05-02',
  'dispute-total-loss-value.html': '2026-05-04',
  'guide-total-loss-claims.html': '2026-05-06',
  'salvage-title-keep-total-loss-vehicle.html': '2026-05-08',
  'at-fault-vs-not-at-fault-insurance.html': '2026-05-09'
};

// Also catch any others and assign a default date
const defaultDate = '2026-05-01';

// Function to format date like "May 5, 2026"
function formatReadable(dateStr) {
  const parts = dateStr.split('-');
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[monthNum - 1]} ${day}, ${year}`;
}

// 2. Update script.js
// I need to use regex to replace publishDate and createdDate for each URL block
// We can parse the ARTICLES array using eval, but since it's hardcoded as a string, let's just do a controlled replacement.
let currentArticleUrl = '';
let newScriptLines = [];
scriptContent.split('\n').forEach(line => {
  let modifiedLine = line;
  
  const urlMatch = line.match(/url:\s*['"]([^'"]+)['"]/);
  if (urlMatch) {
    currentArticleUrl = urlMatch[1];
  }
  
  if (line.includes('publishDate:')) {
    const d = dates[currentArticleUrl] || defaultDate;
    modifiedLine = line.replace(/publishDate:\s*['"][^'"]+['"]/, `publishDate: "${d}"`);
  }
  if (line.includes('createdDate:')) {
    const d = dates[currentArticleUrl] || defaultDate;
    modifiedLine = line.replace(/createdDate:\s*['"][^'"]+['"]/, `createdDate: "${d}"`);
  }
  
  newScriptLines.push(modifiedLine);
});
fs.writeFileSync(scriptPath, newScriptLines.join('\n'), 'utf8');
console.log('Updated script.js dates.');

// 3. Update HTML files
const files = fs.readdirSync(dir);
let htmlUpdateCount = 0;
files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const targetDate = dates[file] || defaultDate;
    const readableDate = formatReadable(targetDate);
    
    // We want to replace `<span class="trust-date">Last Updated: ...</span>`
    // or `<p style="...">Published: ...</p>`
    // The safest way is to replace dates that match April or May 2026 inside HTML.
    // Instead of blind regex, let's look for "Last Updated: Month DD, YYYY" or "Published: Month DD, YYYY"
    const original = content;
    
    content = content.replace(/(Last Updated:\s*)(April|May)\s+\d+,\s+2026/g, `$1${readableDate}`);
    content = content.replace(/(Published:\s*)(April|May)\s+\d+,\s+2026/g, `$1${readableDate}`);
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      htmlUpdateCount++;
    }
  }
});
console.log(`Updated dates in ${htmlUpdateCount} HTML files.`);

// 4. Update sitemap.xml
if (fs.existsSync(sitemapPath)) {
  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  let sitemapLines = sitemapContent.split('\n');
  let currentLoc = '';
  for (let i=0; i<sitemapLines.length; i++) {
    const locMatch = sitemapLines[i].match(/<loc>https:\/\/mypolicium.com\/([^<]+)<\/loc>/);
    if (locMatch) {
      currentLoc = locMatch[1];
    }
    
    if (sitemapLines[i].includes('<lastmod>')) {
      if (currentLoc && (dates[currentLoc] || defaultDate)) {
        const d = dates[currentLoc] || defaultDate;
        sitemapLines[i] = sitemapLines[i].replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${d}</lastmod>`);
      }
    }
  }
  fs.writeFileSync(sitemapPath, sitemapLines.join('\n'), 'utf8');
  console.log('Updated sitemap.xml dates.');
}
