const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';
const sitemapPath = path.join(dir, 'sitemap.xml');

let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

const newUrls = [
  'car-accident-claims-ontario.html',
  'car-accident-toronto-guide.html',
  'car-accident-mississauga-guide.html',
  'car-accident-brampton-guide.html',
  'car-accident-ottawa-guide.html'
];

let injectedCount = 0;

const insertionPoint = '</urlset>';

newUrls.forEach(url => {
  if (!sitemapContent.includes(url)) {
    const urlBlock = \`  <url>\\n    <loc>https://mypolicium.com/\${url}</loc>\\n    <lastmod>2026-05-10</lastmod>\\n    <changefreq>monthly</changefreq>\\n    <priority>0.7</priority>\\n  </url>\\n\`;
    sitemapContent = sitemapContent.replace(insertionPoint, urlBlock + insertionPoint);
    injectedCount++;
  }
});

fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
console.log(\`Injected \${injectedCount} URLs into sitemap.xml\`);
