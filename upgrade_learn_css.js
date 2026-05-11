const fs = require('fs');

const cssContent = `
/* ==========================================================================
   Learn Hub UX Upgrade Styles
   ========================================================================== */

/* Popular Topics */
.popular-topics {
  margin-top: 16px;
  margin-bottom: 32px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.popular-topics-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: 4px;
}

.popular-topics button {
  background: none;
  border: none;
  color: var(--primary-blue);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.popular-topics button:hover {
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary-navy);
}

/* Tighter Category Pills */
.category-chip {
  padding: 6px 14px !important;
  font-size: 0.85rem !important;
}

/* Reduced Vertical Whitespace */
.category-section {
  margin-bottom: 48px !important;
}
.learn-controls {
  margin-bottom: 32px !important;
}

/* Article Meta */
.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.meta-cat {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary-blue);
  background-color: rgba(99, 102, 241, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.meta-time {
  font-size: 0.8rem;
  color: var(--text-light);
  display: flex;
  align-items: center;
}

.meta-time::before {
  content: "•";
  color: var(--text-light);
  margin-right: 12px;
}

/* Adjust card date since it is no longer alone */
.card-date {
  margin-bottom: 12px !important;
}

/* Featured Card Restyling (Horizontal on Desktop) */
.featured-header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.featured-header-row .featured-badge {
  margin-bottom: 0 !important;
}

.featured-header-row .article-meta {
  margin-bottom: 0 !important;
}

@media (min-width: 768px) {
  .featured-grid {
    grid-template-columns: 1fr !important; /* Stack featured horizontal cards vertically instead of side-by-side */
  }
  
  .featured-article-card {
    flex-direction: row !important;
    align-items: center;
    gap: 32px;
    padding: 40px !important;
  }
  
  .featured-card-content {
    flex: 1;
  }
}
`;

fs.appendFileSync('c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/index.css', cssContent);
console.log('Appended Learn Hub UX styles to index.css');
