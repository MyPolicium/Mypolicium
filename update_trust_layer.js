const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';

const newNav = `    <nav class="nav-links">
      <a href="index.html">Home</a>
      <a href="calculator.html">Calculator</a>
      <a href="learn.html">Learn</a>
      <a href="about.html">About</a>
    </nav>`;

const newFooter = `  <footer>
    <div style="margin-bottom: 32px; display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; font-size: 0.9rem;">
      <a href="about.html" style="color: var(--text-light); text-decoration: none; transition: color 0.2s ease;">About</a>
      <a href="how-mypolicium-works.html" style="color: var(--text-light); text-decoration: none; transition: color 0.2s ease;">How MyPolicium Works</a>
      <a href="learn.html" style="color: var(--text-light); text-decoration: none; transition: color 0.2s ease;">Learn Hub</a>
      <a href="privacy.html" style="color: var(--text-light); text-decoration: none; transition: color 0.2s ease;">Privacy Policy</a>
    </div>
    <p>&copy; 2026 MyPolicium. Empowering drivers through transparency.</p>
    <p><a href="mailto:david@mypolicium.com" style="color: var(--primary-blue); text-decoration: none;">david@mypolicium.com</a></p>
    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 16px; max-width: 800px; margin-left: auto; margin-right: auto; line-height: 1.5;">This website is for informational and educational purposes only and does not represent any insurance company or employer. All information is based on general industry knowledge and publicly available concepts.</p>
  </footer>`;

fs.readdirSync(targetDir).forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let modified = false;

    // 1. Update Navigation
    const navRegex = /<nav class="nav-links">[\s\S]*?<\/nav>/i;
    if (navRegex.test(content)) {
      content = content.replace(navRegex, newNav);
      modified = true;
    }

    // 2. Update Footer
    const footerRegex = /<footer>[\s\S]*?<\/footer>/i;
    if (footerRegex.test(content)) {
      content = content.replace(footerRegex, newFooter);
      modified = true;
    }

    // 3. Update Article Headers (Trust Bar)
    // Looking for: <div class="article-header">...<h1>...</h1>...<span class="article-date">...</span>...</div>
    const articleHeaderRegex = /<div class="article-header">\s*(<h1[^>]*>.*?<\/h1>)\s*<span class="article-date">(.*?)<\/span>\s*<\/div>/gi;
    if (articleHeaderRegex.test(content)) {
      content = content.replace(articleHeaderRegex, (match, h1, dateText) => {
        // extract 'Published: Month DD, YYYY' to 'Last Updated: Month DD, YYYY'
        const updatedDate = dateText.replace('Published:', 'Last Updated:');
        return `<div class="article-header">
        <div class="editorial-trust-bar">
          <span class="trust-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Educational Guide
          </span>
          <span class="trust-date">${updatedDate}</span>
        </div>
        ${h1}
      </div>`;
      });
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
