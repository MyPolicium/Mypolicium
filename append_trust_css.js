const fs = require('fs');
const cssContent = `
/* ==========================================================================
   Trust & Authority (E-E-A-T) Styles
   ========================================================================== */

/* Editorial Trust Bar */
.editorial-trust-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.trust-label {
  display: inline-flex;
  align-items: center;
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary-blue);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 6px 12px;
  border-radius: 20px;
}

.trust-date {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-family: 'Inter', sans-serif;
  display: inline-flex;
  align-items: center;
}

/* Ensure article h1 doesn't have too much top margin now */
.article-header h1 {
  margin-top: 0;
}
`;

fs.appendFileSync('c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/index.css', cssContent);
console.log('Appended E-E-A-T styles to index.css');
