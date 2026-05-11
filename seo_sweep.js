const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';
const baseUrl = 'https://mypolicium.com';

const files = fs.readdirSync(targetDir);
const htmlFiles = files.filter(f => f.endsWith('.html'));

// 1. Generate Sitemap
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

htmlFiles.forEach(file => {
  if (file === 'article-template.html') return;
  
  let priority = "0.6";
  if (file === 'index.html') priority = "1.0";
  else if (file === 'calculator.html' || file === 'learn.html') priority = "0.9";
  else if (file === 'about.html' || file === 'how-mypolicium-works.html') priority = "0.8";
  else if (file === 'privacy.html') priority = "0.3";
  else if (file.startsWith('article-') || file.includes('-')) priority = "0.7";

  const loc = file === 'index.html' ? `${baseUrl}/` : `${baseUrl}/${file}`;

  sitemapContent += `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>\n`;
});
sitemapContent += `</urlset>`;

fs.writeFileSync(path.join(targetDir, 'sitemap.xml'), sitemapContent, 'utf8');
console.log('Generated sitemap.xml');

// 2. Generate robots.txt
const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
fs.writeFileSync(path.join(targetDir, 'robots.txt'), robotsContent, 'utf8');
console.log('Generated robots.txt');

// 3. Inject Canonical and OG Tags
let injectionCount = 0;
htmlFiles.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Simple check to prevent double injection if run multiple times
  if (content.includes('<!-- SEO & Social Metadata (Auto-Generated) -->')) {
    content = content.replace(/<!-- SEO & Social Metadata \(Auto-Generated\) -->[\s\S]*?<meta property="og:image"[^>]*>/i, '');
  }

  let titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : 'MyPolicium';

  let descMatch = content.match(/<meta name="description" content="([^"]+)"/i);
  let description = descMatch ? descMatch[1].trim() : 'MyPolicium - Empowering drivers through transparency.';

  const canonicalUrl = file === 'index.html' ? `${baseUrl}/` : `${baseUrl}/${file}`;
  
  const ogType = (file !== 'how-mypolicium-works.html' && file !== 'index.html' && file !== 'learn.html' && file !== 'calculator.html' && file !== 'privacy.html' && file !== 'about.html') ? 'article' : 'website';

  const injection = `  <!-- SEO & Social Metadata (Auto-Generated) -->
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="MyPolicium">
  <meta property="og:image" content="${baseUrl}/Logo1.jpg">`;

  if (content.includes('</head>')) {
    content = content.replace('</head>', `${injection}\n</head>`);
    fs.writeFileSync(filePath, content, 'utf8');
    injectionCount++;
  }
});

console.log("Injected canonical and OG tags into " + injectionCount + " HTML files.");
