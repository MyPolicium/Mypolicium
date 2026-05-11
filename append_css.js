const fs = require('fs');

const cssContent = `
/* ==========================================================================
   Learn Hub Overhaul Styles
   ========================================================================== */

/* Search & Filter Controls */
.learn-controls {
  max-width: 800px;
  margin: 0 auto 48px;
  text-align: center;
}

.search-bar-container {
  position: relative;
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  padding: 16px 20px 16px 48px;
  font-size: 1.125rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--surface-color);
  color: var(--primary-navy);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 4px var(--border-focus);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  width: 20px;
  height: 20px;
  pointer-events: none;
}

/* Category Chips */
.category-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.category-chip {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-chip:hover {
  border-color: var(--text-light);
  color: var(--primary-navy);
}

.category-chip.active {
  background-color: var(--primary-navy);
  border-color: var(--primary-navy);
  color: white;
}

/* Category Sections */
.category-section {
  margin-bottom: 64px;
}

.category-header {
  font-size: 2rem;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--primary-navy);
  font-family: 'Outfit', sans-serif;
}

/* Grid Layouts */
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.featured-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 64px;
}

@media (min-width: 768px) {
  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Article Cards */
.article-card-link {
  text-decoration: none;
  display: block;
  height: 100%;
}

.article-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: #cbd5e1;
}

.article-card h4 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--primary-navy);
}

.article-card p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 16px;
  flex-grow: 1;
}

/* Featured Cards */
.featured-article-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.featured-article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
  border-color: var(--primary-blue);
}

.featured-article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-blue);
}

.featured-badge {
  display: inline-block;
  background-color: var(--primary-blue);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 16px;
  align-self: flex-start;
}

.featured-article-card h3 {
  font-size: 1.75rem;
  margin-bottom: 16px;
  color: var(--primary-navy);
}

.featured-article-card p {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin-bottom: 24px;
  flex-grow: 1;
}

.card-date {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 8px;
  display: block;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: var(--surface-color);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-color);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.empty-state p {
  color: var(--text-muted);
}

/* SEO Article Directory (Hidden visually but accessible) */
.seo-directory {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid var(--border-color);
}
.seo-directory h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
}
.seo-directory ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}
.seo-directory a {
  color: var(--primary-blue);
  text-decoration: none;
  font-size: 0.9rem;
}
.seo-directory a:hover {
  text-decoration: underline;
}
`;

fs.appendFileSync('c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/index.css', cssContent);
console.log('Appended Learn Hub styles to index.css');
