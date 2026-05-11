const fs = require('fs');

const cssContent = `
/* ==========================================================================
   Intelligent Internal Linking Styles
   ========================================================================== */

.related-content-section {
  margin-top: 64px;
  margin-bottom: 32px;
  padding-top: 40px;
  border-top: 1px solid var(--border-color);
}

.related-content-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.75rem;
  color: var(--primary-navy);
  margin-bottom: 24px;
}

.related-articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.related-article-card-link {
  text-decoration: none;
  display: block;
  height: 100%;
}

.related-article-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.related-article-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: #cbd5e1;
}

.related-article-card h4 {
  font-size: 1.1rem;
  margin-bottom: 12px;
  color: var(--primary-navy);
  line-height: 1.4;
}

.related-article-card p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 0;
  flex-grow: 1;
}

.related-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.related-cat {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary-blue);
  background-color: rgba(99, 102, 241, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.related-time {
  font-size: 0.75rem;
  color: var(--text-light);
  display: flex;
  align-items: center;
}

.related-time::before {
  content: "•";
  color: var(--text-light);
  margin-right: 8px;
}
`;

fs.appendFileSync('c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/index.css', cssContent);
console.log('Appended Related Articles CSS.');
