const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';

fs.readdirSync(targetDir).forEach(file => {
  if (file.endsWith('.html') && file.startsWith('article-') || file.endsWith('.html') && file.includes('-')) {
    // Only process article pages, not calculator, index, learn, about, etc.
    const isArticle = file !== 'calculator.html' && file !== 'learn.html' && file !== 'index.html' && file !== 'about.html' && file !== 'privacy.html' && file !== 'how-mypolicium-works.html';
    
    if (isArticle) {
      const filePath = path.join(targetDir, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Safe replacement of <section class="article-loop-section"> ... </section>
      // We will match <section class="article-loop-section"> and capture until the next </section>
      const loopRegex = /<section class="article-loop-section">[\s\S]*?<\/section>/i;
      
      if (loopRegex.test(content)) {
        content = content.replace(loopRegex, '<div id="related-articles-container"></div>');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Retrofitted ${file}`);
      } else {
        // console.log(`No loop section found in ${file}`);
      }
    }
  }
});
