const fs = require('fs');
const targetPath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js';
let content = fs.readFileSync(targetPath, 'utf8');

const schemaLogic = `

function generateArticleSchema() {
  if (!document.querySelector('.article-content')) return;

  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  const article = typeof ARTICLES !== 'undefined' ? ARTICLES.find(a => a.url === currentFile) : null;
  if (!article) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "datePublished": article.publishDate || "2026-05-01",
    "dateModified": article.createdDate || article.publishDate || "2026-05-01",
    "url": \`https://mypolicium.com/\${article.url}\`,
    "publisher": {
      "@type": "Organization",
      "name": "MyPolicium",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mypolicium.com/Logo1.jpg"
      }
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}
`;

if (!content.includes('generateArticleSchema')) {
  // append function definition
  content += schemaLogic;
  // inject call inside DOMContentLoaded
  content = content.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n  generateArticleSchema();");
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Appended generateArticleSchema to script.js');
} else {
  console.log('generateArticleSchema already exists.');
}
