const fs = require('fs');

const scriptContent = fs.readFileSync('c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js', 'utf8');
const startIndex = scriptContent.indexOf('const ARTICLES = [');
const endIndex = scriptContent.indexOf('];', startIndex) + 2;
const arrayStr = scriptContent.substring(startIndex, endIndex).replace('const ARTICLES = ', '');

let ARTICLES;
try {
  ARTICLES = eval(arrayStr);
} catch (e) {
  console.error("Error parsing ARTICLES:", e);
  process.exit(1);
}

let seoLinksHtml = '';
ARTICLES.forEach(article => {
  seoLinksHtml += `        <li><a href="${article.url}">${article.title}</a></li>\n`;
});

const learnHtml = `<!DOCTYPE html>
<html lang="en">

<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-C4162GS2PX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-C4162GS2PX');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learn | MyPolicium</title>

  <!-- Favicon -->
  <link rel="icon" type="image/jpeg" href="Logo1.jpg">
  <link rel="shortcut icon" type="image/jpeg" href="Logo1.jpg">

  <!-- Modern Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700;800&display=swap"
    rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="index.css">
</head>

<body>

  <!-- Navigation -->
  <header>
    <div class="brand-wrapper">
      <a href="index.html">
        <img src="Logo1.jpg" alt="MyPolicium Logo" class="brand-logo">
      </a>
    </div>
    <button class="mobile-menu-btn" aria-label="Toggle navigation" onclick="toggleMobileMenu()">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"
        stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
    <nav class="nav-links">
      <a href="index.html">Home</a>
      <a href="calculator.html">Calculator</a>
      <a href="learn.html">Learn</a>
      <a href="privacy.html">Privacy</a>
    </nav>
  </header>

  <main class="container">
    <div class="learn-header">
      <h1>Insurance Education Hub</h1>
      <p>Knowledge is power when dealing with insurance claims. Learn how to navigate the process with confidence.</p>
    </div>

    <div class="learn-controls">
      <div class="search-bar-container">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="learn-search" class="search-input" placeholder="Search for articles, topics, or terms...">
      </div>
      
      <div class="category-chips">
        <button class="category-chip active" data-category="All" onclick="setCategoryFilter('All')">All Topics</button>
        <button class="category-chip" data-category="Total Loss & Vehicle Value" onclick="setCategoryFilter('Total Loss & Vehicle Value')">Total Loss & Value</button>
        <button class="category-chip" data-category="Claims Process" onclick="setCategoryFilter('Claims Process')">Claims Process</button>
        <button class="category-chip" data-category="Insurance Pricing & Premiums" onclick="setCategoryFilter('Insurance Pricing & Premiums')">Pricing & Premiums</button>
        <button class="category-chip" data-category="Ontario Auto Insurance" onclick="setCategoryFilter('Ontario Auto Insurance')">Ontario</button>
        <button class="category-chip" data-category="Coverage Basics" onclick="setCategoryFilter('Coverage Basics')">Coverage Basics</button>
        <button class="category-chip" data-category="Accident Scenarios" onclick="setCategoryFilter('Accident Scenarios')">Accident Scenarios</button>
        <button class="category-chip" data-category="Repair & Body Shop Process" onclick="setCategoryFilter('Repair & Body Shop Process')">Repair Process</button>
      </div>
    </div>

    <!-- Featured Articles Target -->
    <div style="margin-bottom: 64px;">
      <h2 class="category-header">Featured Guides</h2>
      <div id="featured-articles-container"></div>
    </div>

    <!-- Categorized Articles Target -->
    <div id="categorized-articles-container"></div>

    <!-- Educational Content -->
    <section class="info-section">
      <h2>Popular Questions Drivers Ask</h2>

      <div class="faq-item">
        <button class="faq-question">
          <span>How accurate is the benchmark estimate?</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          <p>This tool provides a solid foundational benchmark based on standardized depreciation, mileage, and geographic market health. Actual payouts will fluctuate based on real comparable autos your adjuster finds.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question">
          <span>Why is my insurer’s payout different?</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          <p>Insurers run detailed property evaluations. They consider pre-loss condition (scratches, interior wear), sub-models/trims, aftermarket additions, and specific dealership replacement data in your local area.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question">
          <span>Can I negotiate a total loss payout?</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          <p>Absolutely. The insurer's first offer is an attempt at fair market value, but it is negotiable. You can pull comparable listings for identical cars in your area and submit recent maintenance receipts to justify a higher settlement.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question">
          <span>How is the market data calculated?</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          <p>We continuously refine our models based on regional trends, depreciation curves, and typical market behavior to ensure our benchmarks remain a reliable educational resource for your research.</p>
        </div>
      </div>
    </section>

    <!-- SEO Directory (Crawlable Static Links) -->
    <nav class="seo-directory" aria-label="Article Directory">
      <h2>Complete Article Directory</h2>
      <ul id="seo-links-list">
${seoLinksHtml}      </ul>
    </nav>
  </main>

  <footer>
    <p>&copy; 2026 MyPolicium. Empowering drivers through transparency.</p>
    <p><a href="mailto:david@mypolicium.com">david@mypolicium.com</a></p>
    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 16px; max-width: 800px; margin-left: auto; margin-right: auto; line-height: 1.5;">This website is for informational and educational purposes only and does not represent any insurance company or employer. All information is based on general industry knowledge and publicly available concepts.</p>
  </footer>

  <script src="script.js"></script>
</body>

</html>
`;

fs.writeFileSync('c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/learn.html', learnHtml, 'utf8');
console.log('Successfully updated learn.html');
