const fs = require('fs');

const cssContent = `
/* ==========================================================================
   Pillar Guide Architecture
   ========================================================================== */

html {
  scroll-behavior: smooth;
}

.pillar-container {
  max-width: 850px;
  margin: 0 auto;
}

.pillar-toc {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 32px;
  margin: 48px 0;
  box-shadow: var(--shadow-sm);
}

.pillar-toc h3 {
  margin-top: 0;
  margin-bottom: 24px;
  font-family: 'Outfit', sans-serif;
  color: var(--primary-navy);
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.pillar-toc ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pillar-toc li {
  margin-bottom: 16px;
}

.pillar-toc li:last-child {
  margin-bottom: 0;
}

.pillar-toc a {
  color: var(--primary-blue);
  text-decoration: none;
  font-size: 1.05rem;
  font-weight: 500;
  transition: color 0.2s ease;
  display: inline-block;
}

.pillar-toc a:hover {
  color: var(--primary-navy);
  text-decoration: underline;
}

.pillar-content h2 {
  font-size: 2.25rem;
  margin-top: 80px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  scroll-margin-top: 100px;
  color: var(--primary-navy);
  font-family: 'Outfit', sans-serif;
}

.pillar-content h3 {
  font-size: 1.65rem;
  margin-top: 56px;
  margin-bottom: 20px;
  scroll-margin-top: 100px;
  color: var(--primary-navy);
}

.pillar-content h4 {
  font-size: 1.25rem;
  margin-top: 32px;
  margin-bottom: 16px;
}

.pillar-content p {
  font-size: 1.15rem;
  line-height: 1.8;
  margin-bottom: 28px;
  color: var(--text-color);
}

.pillar-content ul, .pillar-content ol {
  font-size: 1.15rem;
  line-height: 1.8;
  margin-bottom: 32px;
  padding-left: 24px;
}

.pillar-content li {
  margin-bottom: 12px;
}

.pillar-summary-card {
  background-color: rgba(99, 102, 241, 0.05);
  border-left: 4px solid var(--primary-blue);
  padding: 24px 32px;
  margin: 40px 0;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.pillar-summary-card h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--primary-navy);
  font-size: 1.25rem;
}

.pillar-summary-card p {
  font-size: 1.05rem;
  margin-bottom: 0;
  color: var(--text-color);
}

/* Hub Integration */
.cornerstone-header {
  font-size: 2.5rem;
  color: var(--primary-navy);
  margin-bottom: 16px;
  font-family: 'Outfit', sans-serif;
}

.cornerstone-subtitle {
  font-size: 1.2rem;
  color: var(--text-muted);
  margin-bottom: 40px;
}

.cornerstone-section {
  margin-bottom: 80px;
}
`;

fs.appendFileSync('c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/index.css', cssContent);
console.log('Appended Pillar CSS.');
