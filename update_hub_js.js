const fs = require('fs');
const path = require('path');

const targetPath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js';
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Update renderLearnHubArticles to support cornerstone
// We will replace the entire function using regex or string splits
const startIdx = content.indexOf('function renderLearnHubArticles');
const endIdx = content.indexOf('function generateArticleCard');
if (startIdx !== -1 && endIdx !== -1) {
  const oldFunc = content.substring(startIdx, endIdx);
  const newFunc = \`function renderLearnHubArticles(searchTerm = '', activeCategory = 'All') {
  const cornerstoneContainer = document.getElementById('cornerstone-articles-container');
  const featuredContainer = document.getElementById('featured-articles-container');
  const categoryContainer = document.getElementById('categorized-articles-container');
  
  if (!categoryContainer) return; 

  searchTerm = searchTerm.toLowerCase().trim();

  let filteredArticles = [...ARTICLES].sort((a, b) => {
    const valA = a.publishDate || a.createdDate || "";
    const valB = b.publishDate || b.createdDate || "";
    return valB.localeCompare(valA);
  });

  if (searchTerm) {
    filteredArticles = filteredArticles.filter(a => 
      a.title.toLowerCase().includes(searchTerm) || 
      a.excerpt.toLowerCase().includes(searchTerm)
    );
  }

  if (activeCategory !== 'All') {
    filteredArticles = filteredArticles.filter(a => a.category === activeCategory);
  }

  if (searchTerm || activeCategory !== 'All') {
    if (featuredContainer && featuredContainer.parentElement) {
      featuredContainer.parentElement.style.display = 'none';
    }
    if (cornerstoneContainer && cornerstoneContainer.parentElement) {
      cornerstoneContainer.parentElement.style.display = 'none';
    }
    
    if (filteredArticles.length === 0) {
      categoryContainer.innerHTML = \`<div class="empty-state">
          <h3>No articles found</h3>
          <p>We couldn't find any articles matching your criteria. Try adjusting your search or category filter.</p>
          <button class="btn btn-outline" style="width:auto; margin-top:16px;" onclick="document.getElementById('learn-search').value=''; setCategoryFilter('All');">Clear Filters</button>
        </div>\`;
      return;
    }

    const groups = {};
    filteredArticles.forEach(article => {
      if (!groups[article.category]) groups[article.category] = [];
      groups[article.category].push(article);
    });

    let html = "";
    for (const [cat, arts] of Object.entries(groups)) {
      html += \`<div class="category-section"><h2 class="category-header">\${cat}</h2><div class="article-grid">\`;
      arts.forEach(article => {
        html += generateArticleCard(article);
      });
      html += \`</div></div>\`;
    }
    categoryContainer.innerHTML = html;
    
  } else {
    // Default View
    if (featuredContainer && featuredContainer.parentElement) {
      featuredContainer.parentElement.style.display = 'block';
    }
    if (cornerstoneContainer && cornerstoneContainer.parentElement) {
      cornerstoneContainer.parentElement.style.display = 'block';
    }

    const pillars = filteredArticles.filter(a => a.isPillar);
    const featured = filteredArticles.filter(a => a.featured && !a.isPillar);
    const nonFeatured = filteredArticles.filter(a => !a.featured && !a.isPillar);

    if (cornerstoneContainer && pillars.length > 0) {
      let pHtml = '<div class="featured-grid">';
      pillars.forEach(article => {
        pHtml += generateFeaturedCard(article, 'Cornerstone Guide');
      });
      pHtml += '</div>';
      cornerstoneContainer.innerHTML = pHtml;
    } else if (cornerstoneContainer) {
      cornerstoneContainer.parentElement.style.display = 'none';
    }

    if (featuredContainer && featured.length > 0) {
      let fHtml = '<div class="featured-grid">';
      featured.forEach(article => {
        fHtml += generateFeaturedCard(article, 'Featured');
      });
      fHtml += '</div>';
      featuredContainer.innerHTML = fHtml;
    } else if (featuredContainer) {
      featuredContainer.innerHTML = '';
    }

    const groups = {};
    nonFeatured.forEach(article => {
      if (!groups[article.category]) groups[article.category] = [];
      groups[article.category].push(article);
    });

    const categoryOrder = [
      "Total Loss & Vehicle Value",
      "Claims Process",
      "Insurance Pricing & Premiums",
      "Coverage Basics",
      "Accident Scenarios",
      "Cross-Border & Travel",
      "Repair & Body Shop Process"
    ];

    let html = "";
    categoryOrder.forEach(cat => {
      if (groups[cat] && groups[cat].length > 0) {
        html += \`<div class="category-section"><h2 class="category-header">\${cat}</h2><div class="article-grid">\`;
        groups[cat].forEach(article => {
          html += generateArticleCard(article);
        });
        html += \`</div></div>\`;
      }
    });

    categoryContainer.innerHTML = html;
  }
}

\`;
  content = content.replace(oldFunc, newFunc);
}

// 2. Modify generateFeaturedCard to accept badgeText
content = content.replace('function generateFeaturedCard(article) {', 'function generateFeaturedCard(article, badgeText = "Featured Guide") {');
content = content.replace('<div class="featured-badge">Featured Guide</div>', '<div class="featured-badge">\${badgeText}</div>');

// 3. Inject Pillar into ARTICLES
const pillarArticleObj = \`  {
    title: "Complete Guide to Total Loss Claims: Valuation, Process, and Negotiation",
    excerpt: "The master guide to navigating a total loss auto claim. Understand how insurers calculate actual cash value, what happens to your vehicle, and how to effectively negotiate a fair settlement.",
    url: "guide-total-loss-claims.html",
    publishDate: "2026-05-15",
    createdDate: "2026-05-15",
    category: "Total Loss & Vehicle Value",
    featured: false,
    isPillar: true,
    tags: ["total-loss", "acv", "pricing", "claims-process", "repair-process"]
  },\n\`;

if (!content.includes('guide-total-loss-claims.html')) {
  content = content.replace('const ARTICLES = [\n', 'const ARTICLES = [\n' + pillarArticleObj);
}

// 4. Boost pillar articles in renderRelatedArticles()
content = content.replace(
  'if (article.category === currentCat) score += 2;',
  'if (article.category === currentCat) score += 2;\n    if (article.isPillar) score += 1.5; // Boost pillar guides'
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Hub JS architecture updated.');
