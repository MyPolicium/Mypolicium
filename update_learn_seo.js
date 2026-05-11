const fs = require('fs');

const learnFile = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/learn.html';
let learnHtml = fs.readFileSync(learnFile, 'utf8');

const targetListStart = '<ul id="seo-links-list"';
const targetListEnd = '</ul>';

if (learnHtml.includes(targetListStart)) {
  const startIdx = learnHtml.indexOf(targetListStart);
  const endIdx = learnHtml.indexOf(targetListEnd, startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    let listContent = learnHtml.substring(startIdx, endIdx);
    if (!listContent.includes('guide-total-loss-claims.html')) {
      const newLink = '          <li><a href="guide-total-loss-claims.html">Complete Guide to Total Loss Claims: Valuation, Process, and Negotiation</a></li>\n';
      // inject right before the closing ul
      learnHtml = learnHtml.substring(0, endIdx) + newLink + learnHtml.substring(endIdx);
      fs.writeFileSync(learnFile, learnHtml, 'utf8');
      console.log('Updated SEO Directory in learn.html');
    }
  }
}
