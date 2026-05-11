const fs = require('fs');

// 1. Update index.html
const indexFile = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/index.html';
let indexHtml = fs.readFileSync(indexFile, 'utf8');

const targetSection = `    <!-- Latest Articles Section -->`;
const cornerstoneSection = `    <!-- Cornerstone Guides Section -->
    <section class="cornerstone-section" style="margin-top: 64px;">
      <h2 class="cornerstone-header">Cornerstone Guides</h2>
      <p class="cornerstone-subtitle">Our most comprehensive, long-form educational resources.</p>
      <div id="cornerstone-guides-container">
        <!-- Rendered dynamically -->
      </div>
    </section>

    <!-- Latest Articles Section -->`;

if (!indexHtml.includes('cornerstone-guides-container')) {
  indexHtml = indexHtml.replace(targetSection, cornerstoneSection);
  fs.writeFileSync(indexFile, indexHtml, 'utf8');
  console.log('Updated index.html');
}

// 2. Update script.js DOMContentLoaded
const scriptFile = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js';
let scriptJs = fs.readFileSync(scriptFile, 'utf8');

const targetLogic = `  if (document.getElementById("latest-articles-container")) {`;
const cornerstoneLogic = `  if (document.getElementById("cornerstone-guides-container")) {
    const container = document.getElementById("cornerstone-guides-container");
    const pillars = typeof ARTICLES !== 'undefined' ? ARTICLES.filter(a => a.isPillar) : [];
    if (pillars.length > 0) {
      let pHtml = '<div class="featured-grid">';
      pillars.forEach(article => { pHtml += generateFeaturedCard(article, "Cornerstone Guide"); });
      pHtml += '</div>';
      container.innerHTML = pHtml;
    }
  }

  if (document.getElementById("latest-articles-container")) {`;

if (!scriptJs.includes('cornerstone-guides-container')) {
  scriptJs = scriptJs.replace(targetLogic, cornerstoneLogic);
  fs.writeFileSync(scriptFile, scriptJs, 'utf8');
  console.log('Updated script.js DOMContentLoaded');
}
