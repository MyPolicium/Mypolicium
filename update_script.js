const fs = require('fs');
const content = fs.readFileSync('c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js', 'utf8');

const newArticlesContent = `const ARTICLES = [
  {
    title: "What Is Subrogation in Car Insurance Claims?",
    excerpt: "Learn what subrogation means in car insurance, how insurers recover costs from at-fault drivers, and how you might get your deductible back.",
    url: "what-is-subrogation-insurance.html",
    publishDate: "2026-05-30",
    createdDate: "2026-05-30",
    category: "Claims Process",
    featured: false
  },
  {
    title: "How to Read an Auto Insurance Repair Estimate",
    excerpt: "Confused by your auto repair estimate? Learn how to decode OEM vs aftermarket parts, labour times, paint blending, and why supplements happen during claims.",
    url: "how-to-read-auto-insurance-repair-estimate.html",
    publishDate: "2026-05-29",
    createdDate: "2026-05-29",
    category: "Repair & Body Shop Process",
    featured: false
  },
  {
    title: "How Long Does an Insurance Company Have to Settle a Claim?",
    excerpt: "Waiting on a car insurance payout? Learn how long insurers have to settle a claim, what causes repair delays, and how the total loss timeline works.",
    url: "how-long-to-settle-insurance-claim.html",
    publishDate: "2026-05-28",
    createdDate: "2026-05-28",
    category: "Claims Process",
    featured: true
  },
  {
    title: "At-Fault vs. Not-At-Fault Accidents: How They Affect Insurance Rates",
    excerpt: "Learn the difference between at-fault and not-at-fault accidents and how insurance companies determine if a claim will increase your premium.",
    url: "at-fault-vs-not-at-fault-insurance.html",
    publishDate: "2026-05-27",
    createdDate: "2026-05-27",
    category: "Insurance Pricing & Premiums",
    featured: false
  },
  {
    title: "Should I File an Insurance Claim for a Minor Accident?",
    excerpt: "Deciding whether to file an insurance claim for a minor scrape or fender bender? Learn the hidden costs, risks, and factors to consider before calling your insurer.",
    url: "should-i-file-claim-minor-accident.html",
    publishDate: "2026-05-26",
    createdDate: "2026-05-26",
    category: "Accident Scenarios",
    featured: false
  },
  {
    title: "How to Lower Your Car Insurance Premium Legally",
    excerpt: "Learn practical, legitimate ways to lower your car insurance premium without resorting to gimmicks or sacrificing essential coverage.",
    url: "how-to-lower-car-insurance-premium.html",
    publishDate: "2026-05-25",
    createdDate: "2026-05-25",
    category: "Insurance Pricing & Premiums",
    featured: true
  },
  {
    title: "Why Is My Car Insurance So Expensive?",
    excerpt: "Learn exactly how insurance companies calculate your auto insurance premium and the hidden factors that make car insurance so expensive.",
    url: "why-is-car-insurance-expensive.html",
    publishDate: "2026-05-24",
    createdDate: "2026-05-24",
    category: "Insurance Pricing & Premiums",
    featured: false
  },
  {
    title: "How Do Speeding Tickets Affect Car Insurance Rates?",
    excerpt: "Learn exactly how speeding tickets and other driving convictions affect your car insurance premium and how insurers evaluate driving risk.",
    url: "how-do-speeding-tickets-affect-insurance.html",
    publishDate: "2026-05-23",
    createdDate: "2026-05-23",
    category: "Insurance Pricing & Premiums",
    featured: false
  },
  {
    title: "What Is a Salvage Title and Can You Keep Your Total Loss Vehicle?",
    excerpt: "Learn what a salvage title is, how owner-retained salvage buybacks work, and whether keeping your totaled car makes financial sense.",
    url: "salvage-title-keep-total-loss-vehicle.html",
    publishDate: "2026-05-22",
    createdDate: "2026-05-22",
    category: "Total Loss & Vehicle Value",
    featured: false
  },
  {
    title: "What Happens If I Disagree With My Total Loss Valuation?",
    excerpt: "Learn what happens if you disagree with your insurance company's total loss settlement offer and how to review the valuation process.",
    url: "dispute-total-loss-value.html",
    publishDate: "2026-05-21",
    createdDate: "2026-05-21",
    category: "Total Loss & Vehicle Value",
    featured: false
  },
  {
    title: "How to Find Comparables for a Total Loss Vehicle",
    excerpt: "Learn how insurance companies use comparable vehicles to determine your car's actual cash value after a total loss.",
    url: "how-to-find-comparables-total-loss.html",
    publishDate: "2026-05-20",
    createdDate: "2026-05-20",
    category: "Total Loss & Vehicle Value",
    featured: false
  },
  {
    title: "What Happens If You Get Into an Accident in the USA as a Canadian?",
    excerpt: "Learn how Canadian auto insurance works if you get into an accident in the USA, including liability, rentals, and total loss complications.",
    url: "accident-in-usa-as-canadian.html",
    publishDate: "2026-05-19",
    createdDate: "2026-05-19",
    category: "Cross-Border & Travel",
    featured: false
  },
  {
    title: "What Is OPCF 20 Loss of Use Coverage?",
    excerpt: "Learn what OPCF 20 Loss of Use coverage is, how rental reimbursement works during an insurance claim, and what happens if your rental limit runs out.",
    url: "opcf-20-loss-of-use-coverage.html",
    publishDate: "2026-05-18",
    createdDate: "2026-05-18",
    category: "Ontario Auto Insurance",
    featured: false
  },
  {
    title: "What Is Direct Compensation Property Damage (DCPD)?",
    excerpt: "Learn what Direct Compensation Property Damage (DCPD) is, how Ontario's no-fault insurance system works, and who actually pays for your car repairs.",
    url: "dcpd-coverage.html",
    publishDate: "2026-05-17",
    createdDate: "2026-05-17",
    category: "Ontario Auto Insurance",
    featured: false
  },
  {
    title: "How Do Car Insurance Deductibles Work?",
    excerpt: "Learn how car insurance deductibles work, how they affect your premium, and how to choose the right deductible for your vehicle.",
    url: "how-do-car-insurance-deductibles-work.html",
    publishDate: "2026-05-16",
    createdDate: "2026-05-16",
    category: "Coverage Basics",
    featured: false
  },
  {
    title: "What Is GAP Insurance and Do You Need It?",
    excerpt: "Learn what GAP insurance is, how it covers the difference between your car loan and actual cash value, and if you actually need it.",
    url: "gap-insurance.html",
    publishDate: "2026-05-15",
    createdDate: "2026-05-15",
    category: "Coverage Basics",
    featured: false
  },
  {
    title: "Comprehensive vs. Collision Insurance: What\\'s the Difference?",
    excerpt: "Learn the difference between comprehensive and collision auto insurance, what each coverage protects, and how to decide if you still need them.",
    url: "comprehensive-vs-collision-insurance.html",
    publishDate: "2026-05-14",
    createdDate: "2026-05-14",
    category: "Coverage Basics",
    featured: false
  },
  {
    title: "What Happens If Someone Else Drives My Car and Crashes?",
    excerpt: "Learn what happens if a friend or family member crashes your car, how permissive use works, and whose insurance pays for the damage.",
    url: "someone-else-driving-my-car-accident.html",
    publishDate: "2026-05-13",
    createdDate: "2026-05-13",
    category: "Accident Scenarios",
    featured: false
  },
  {
    title: "What To Do If You're Hit By an Uninsured Driver",
    excerpt: "Learn what happens if you're hit by an uninsured driver, how uninsured motorist coverage works, and how to handle the insurance claim process.",
    url: "hit-by-uninsured-driver.html",
    publishDate: "2026-05-12",
    createdDate: "2026-05-12",
    category: "Accident Scenarios",
    featured: false
  },
  {
    title: "Rear-End Collisions: Who Is At Fault?",
    excerpt: "Learn who is at fault in a rear-end collision, how your insurance handles the claim, and what happens when multiple cars are involved in a pileup.",
    url: "rear-end-collisions-who-is-at-fault.html",
    publishDate: "2026-05-11",
    createdDate: "2026-05-11",
    category: "Accident Scenarios",
    featured: false
  },
  {
    title: "What Happens If Someone Hits Your Parked Car?",
    excerpt: "Discover what happens if someone hits your parked car, how insurance handles hit-and-runs, and if your rates will go up after a parking lot accident.",
    url: "what-happens-if-someone-hits-your-parked-car.html",
    publishDate: "2026-05-10",
    createdDate: "2026-05-10",
    category: "Accident Scenarios",
    featured: false
  },
  {
    title: "What Is Actual Cash Value (ACV) and How Is It Calculated?",
    excerpt: "If your car is written off, the amount you receive is based on Actual Cash Value. Learn how ACV is calculated and why it matters for your claim.",
    url: "what-is-actual-cash-value.html",
    publishDate: "2026-04-14",
    createdDate: "2026-04-14",
    category: "Total Loss & Vehicle Value",
    featured: true
  },
  {
    title: "What Is OPCF 43 Depreciation Waiver and Is It Worth It?",
    excerpt: "If you have a newer vehicle, there\\'s a good chance you\\'ve heard about OPCF 43, also known as a depreciation waiver. But what exactly is it, and is it actually worth having?",
    url: "article-opcf-43.html",
    publishDate: "2026-04-11",
    createdDate: "2026-04-11",
    category: "Ontario Auto Insurance",
    featured: false
  },
  {
    title: "What Happens After Your Car Is Declared a Total Loss?",
    excerpt: "If your car has been written off, you are probably wondering what actually happens next. Learn about the valuation process, salvage branding, and what happens to your vehicle after the claim.",
    url: "what-happens-after-total-loss.html",
    publishDate: "2026-04-10",
    createdDate: "2026-04-10",
    category: "Total Loss & Vehicle Value",
    featured: false
  },
  {
    title: "Can You Negotiate a Total Loss Settlement?",
    excerpt: "One of the first things you\\'ll look at is the settlement amount and think, \\"this feels low.\\" Learn how to approach the negotiation process with real market evidence.",
    url: "negotiate-total-loss.html",
    publishDate: "2026-04-08",
    createdDate: "2026-04-08",
    category: "Total Loss & Vehicle Value",
    featured: true
  },
  {
    title: "How Much Will Insurance Pay for Your Car After a Total Loss?",
    excerpt: "If your car has been written off after an accident, the first thing on your mind is probably: \\"How much am I actually getting back?\\" Explore our full breakdown of Actual Cash Value and how the payout process works.",
    url: "article-total-loss.html",
    publishDate: "2026-04-05",
    createdDate: "2026-04-05",
    category: "Total Loss & Vehicle Value",
    featured: false
  }
];

function renderArticles(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const sortedArticles = [...ARTICLES].sort((a, b) => {
    const valA = a.publishDate || a.createdDate || "";
    const valB = b.publishDate || b.createdDate || "";
    return valB.localeCompare(valA);
  });

  const displayArticles = limit ? sortedArticles.slice(0, limit) : sortedArticles;

  let html = "";
  displayArticles.forEach((article, index) => {
    html += \`
      <a href="\${article.url}" style="text-decoration: none;">
        <div class="feature-box">
          <h4>\${article.title}</h4>
          <p>\${article.excerpt}</p>
          <span class="read-more">Read the Full Article &rarr;</span>
        </div>
      </a>
    \`;
    if (index < displayArticles.length - 1) {
      html += \`<div style="margin-bottom: 32px;"></div>\`;
    }
  });

  container.innerHTML = html;
}

// Learn Hub Logic
function initLearnHub() {
  const searchInput = document.getElementById('learn-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderLearnHubArticles(e.target.value, window.currentCategory || 'All');
    });
  }
}

function setCategoryFilter(category) {
  window.currentCategory = category;
  
  // Update UI chips
  document.querySelectorAll('.category-chip').forEach(chip => {
    if (chip.dataset.category === category) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  const searchInput = document.getElementById('learn-search');
  renderLearnHubArticles(searchInput ? searchInput.value : '', category);
}

function renderLearnHubArticles(searchTerm = '', activeCategory = 'All') {
  const featuredContainer = document.getElementById('featured-articles-container');
  const categoryContainer = document.getElementById('categorized-articles-container');
  
  if (!categoryContainer) return; // Not on learn.html

  searchTerm = searchTerm.toLowerCase().trim();

  // Filter articles
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

  // If we are searching or filtering by category, don't separate featured articles
  if (searchTerm || activeCategory !== 'All') {
    if (featuredContainer && featuredContainer.parentElement) {
      featuredContainer.parentElement.style.display = 'none';
    }
    
    if (filteredArticles.length === 0) {
      categoryContainer.innerHTML = \`
        <div class="empty-state">
          <h3>No articles found</h3>
          <p>We couldn't find any articles matching your criteria. Try adjusting your search or category filter.</p>
          <button class="btn btn-outline" style="width:auto; margin-top:16px;" onclick="document.getElementById('learn-search').value=''; setCategoryFilter('All');">Clear Filters</button>
        </div>
      \`;
      return;
    }

    const groups = {};
    filteredArticles.forEach(article => {
      if (!groups[article.category]) groups[article.category] = [];
      groups[article.category].push(article);
    });

    let html = "";
    for (const [cat, arts] of Object.entries(groups)) {
      html += \`
        <div class="category-section">
          <h2 class="category-header">\${cat}</h2>
          <div class="article-grid">
      \`;
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

    const featured = filteredArticles.filter(a => a.featured);
    const nonFeatured = filteredArticles.filter(a => !a.featured);

    if (featuredContainer && featured.length > 0) {
      let fHtml = '<div class="featured-grid">';
      featured.forEach(article => {
        fHtml += generateFeaturedCard(article);
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
      "Ontario Auto Insurance",
      "Insurance Pricing & Premiums",
      "Coverage Basics",
      "Accident Scenarios",
      "Cross-Border & Travel",
      "Repair & Body Shop Process"
    ];

    let html = "";
    categoryOrder.forEach(cat => {
      if (groups[cat] && groups[cat].length > 0) {
        html += \`
          <div class="category-section">
            <h2 class="category-header">\${cat}</h2>
            <div class="article-grid">
        \`;
        groups[cat].forEach(article => {
          html += generateArticleCard(article);
        });
        html += \`</div></div>\`;
      }
    });

    categoryContainer.innerHTML = html;
  }
}

function generateArticleCard(article) {
  const dateStr = article.publishDate ? \`<span class="card-date">\${formatDate(article.publishDate)}</span>\` : '';
  return \`
    <a href="\${article.url}" class="article-card-link">
      <div class="article-card">
        \${dateStr}
        <h4>\${article.title}</h4>
        <p>\${article.excerpt}</p>
        <span class="read-more">Read Guide &rarr;</span>
      </div>
    </a>
  \`;
}

function generateFeaturedCard(article) {
  const dateStr = article.publishDate ? \`<span class="card-date">\${formatDate(article.publishDate)}</span>\` : '';
  return \`
    <a href="\${article.url}" class="article-card-link featured-link">
      <div class="featured-article-card">
        <div class="featured-badge">Featured</div>
        \${dateStr}
        <h3>\${article.title}</h3>
        <p>\${article.excerpt}</p>
        <span class="read-more">Read Complete Guide &rarr;</span>
      </div>
    </a>
  \`;
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString + 'T00:00:00Z').toLocaleDateString('en-US', options);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('learn-search')) {
    initLearnHub();
    setCategoryFilter('All');
  }
});
`;

const startIndex = content.indexOf('const ARTICLES = [');
if (startIndex !== -1) {
  const newContent = content.substring(0, startIndex) + newArticlesContent;
  fs.writeFileSync('c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js', newContent, 'utf8');
  console.log('Successfully updated script.js');
} else {
  console.log('Error: Could not find ARTICLES array in script.js');
}
