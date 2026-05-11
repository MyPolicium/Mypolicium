const fs = require('fs');
const targetPath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js';
let content = fs.readFileSync(targetPath, 'utf8');

const newFunc = "function renderLearnHubArticles(searchTerm = '', activeCategory = 'All') {\\n" +
"  const cornerstoneContainer = document.getElementById('cornerstone-articles-container');\\n" +
"  const featuredContainer = document.getElementById('featured-articles-container');\\n" +
"  const categoryContainer = document.getElementById('categorized-articles-container');\\n" +
"  if (!categoryContainer) return;\\n" +
"  searchTerm = searchTerm.toLowerCase().trim();\\n" +
"  let filteredArticles = [...ARTICLES].sort((a, b) => {\\n" +
"    const valA = a.publishDate || a.createdDate || '';\\n" +
"    const valB = b.publishDate || b.createdDate || '';\\n" +
"    return valB.localeCompare(valA);\\n" +
"  });\\n" +
"  if (searchTerm) {\\n" +
"    filteredArticles = filteredArticles.filter(a => a.title.toLowerCase().includes(searchTerm) || a.excerpt.toLowerCase().includes(searchTerm));\\n" +
"  }\\n" +
"  if (activeCategory !== 'All') {\\n" +
"    filteredArticles = filteredArticles.filter(a => a.category === activeCategory);\\n" +
"  }\\n" +
"  if (searchTerm || activeCategory !== 'All') {\\n" +
"    if (featuredContainer && featuredContainer.parentElement) featuredContainer.parentElement.style.display = 'none';\\n" +
"    if (cornerstoneContainer && cornerstoneContainer.parentElement) cornerstoneContainer.parentElement.style.display = 'none';\\n" +
"    if (filteredArticles.length === 0) {\\n" +
"      categoryContainer.innerHTML = '<div class=\"empty-state\"><h3>No articles found</h3><p>We couldn\\'t find any articles matching your criteria.</p><button class=\"btn btn-outline\" style=\"width:auto; margin-top:16px;\" onclick=\"document.getElementById(\\'learn-search\\').value=\\'\\'; setCategoryFilter(\\'All\\');\">Clear Filters</button></div>';\\n" +
"      return;\\n" +
"    }\\n" +
"    const groups = {};\\n" +
"    filteredArticles.forEach(article => { if (!groups[article.category]) groups[article.category] = []; groups[article.category].push(article); });\\n" +
"    let html = '';\\n" +
"    for (const [cat, arts] of Object.entries(groups)) {\\n" +
"      html += '<div class=\"category-section\"><h2 class=\"category-header\">' + cat + '</h2><div class=\"article-grid\">';\\n" +
"      arts.forEach(article => { html += generateArticleCard(article); });\\n" +
"      html += '</div></div>';\\n" +
"    }\\n" +
"    categoryContainer.innerHTML = html;\\n" +
"  } else {\\n" +
"    if (featuredContainer && featuredContainer.parentElement) featuredContainer.parentElement.style.display = 'block';\\n" +
"    if (cornerstoneContainer && cornerstoneContainer.parentElement) cornerstoneContainer.parentElement.style.display = 'block';\\n" +
"    const pillars = filteredArticles.filter(a => a.isPillar);\\n" +
"    const featured = filteredArticles.filter(a => a.featured && !a.isPillar);\\n" +
"    const nonFeatured = filteredArticles.filter(a => !a.featured && !a.isPillar);\\n" +
"    if (cornerstoneContainer && pillars.length > 0) {\\n" +
"      let pHtml = '<div class=\"featured-grid\">';\\n" +
"      pillars.forEach(article => { pHtml += generateFeaturedCard(article, \"Cornerstone Guide\"); });\\n" +
"      pHtml += '</div>';\\n" +
"      cornerstoneContainer.innerHTML = pHtml;\\n" +
"    } else if (cornerstoneContainer) { cornerstoneContainer.parentElement.style.display = 'none'; }\\n" +
"    if (featuredContainer && featured.length > 0) {\\n" +
"      let fHtml = '<div class=\"featured-grid\">';\\n" +
"      featured.forEach(article => { fHtml += generateFeaturedCard(article, \"Featured Guide\"); });\\n" +
"      fHtml += '</div>';\\n" +
"      featuredContainer.innerHTML = fHtml;\\n" +
"    } else if (featuredContainer) { featuredContainer.innerHTML = ''; }\\n" +
"    const groups = {};\\n" +
"    nonFeatured.forEach(article => { if (!groups[article.category]) groups[article.category] = []; groups[article.category].push(article); });\\n" +
"    const categoryOrder = [\"Total Loss & Vehicle Value\", \"Claims Process\", \"Ontario Auto Insurance\", \"Insurance Pricing & Premiums\", \"Coverage Basics\", \"Accident Scenarios\", \"Cross-Border & Travel\", \"Repair & Body Shop Process\"];\\n" +
"    let html = '';\\n" +
"    categoryOrder.forEach(cat => {\\n" +
"      if (groups[cat] && groups[cat].length > 0) {\\n" +
"        html += '<div class=\"category-section\"><h2 class=\"category-header\">' + cat + '</h2><div class=\"article-grid\">';\\n" +
"        groups[cat].forEach(article => { html += generateArticleCard(article); });\\n" +
"        html += '</div></div>';\\n" +
"      }\\n" +
"    });\\n" +
"    categoryContainer.innerHTML = html;\\n" +
"  }\\n" +
"}\\n";

const startIdx = content.indexOf('function renderLearnHubArticles');
const endIdx = content.indexOf('function renderRelatedArticles');
if (startIdx !== -1 && endIdx !== -1) {
  const oldFunc = content.substring(startIdx, endIdx);
  content = content.replace(oldFunc, newFunc);
}

// Update generateFeaturedCard
content = content.replace('function generateFeaturedCard(article) {', 'function generateFeaturedCard(article, badgeText = "Featured Guide") {');
content = content.replace('<div class="featured-badge">Featured Guide</div>', '<div class="featured-badge">' + "' + badgeText + '" + '</div>');

// Inject new article into ARTICLES array
const pillarObj = "  {\\n    title: \"Complete Guide to Total Loss Claims: Valuation, Process, and Negotiation\",\\n    excerpt: \"The master guide to navigating a total loss auto claim. Understand how insurers calculate actual cash value, what happens to your vehicle, and how to effectively negotiate a fair settlement.\",\\n    url: \"guide-total-loss-claims.html\",\\n    publishDate: \"2026-05-15\",\\n    createdDate: \"2026-05-15\",\\n    category: \"Total Loss & Vehicle Value\",\\n    featured: false,\\n    isPillar: true,\\n    tags: [\"total-loss\", \"acv\", \"pricing\", \"claims-process\", \"repair-process\"]\\n  },\\n";
if (!content.includes('guide-total-loss-claims.html')) {
  content = content.replace('const ARTICLES = [\\n', 'const ARTICLES = [\\n' + pillarObj);
}

// Boost related articles score
if (!content.includes('score += 1.5;')) {
  content = content.replace('if (article.category === currentCat) score += 2;', 'if (article.category === currentCat) score += 2;\\n    if (article.isPillar) score += 1.5;');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Hub JS successfully updated.');
