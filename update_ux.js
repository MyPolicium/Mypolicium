const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';
const cssPath = path.join(dir, 'index.css');
const scriptPath = path.join(dir, 'script.js');

// 1. Update index.css
let css = fs.readFileSync(cssPath, 'utf8');

// Typography / Reading Rhythm
css = css.replace(/margin-top: 48px;\s*margin-bottom: 24px;\s*color: var\(--primary-navy\);/g, 'margin-top: 48px;\n  margin-bottom: 16px;\n  color: var(--primary-navy);');
css = css.replace(/margin-top: 40px;\s*margin-bottom: 20px;\s*color: var\(--primary-navy\);/g, 'margin-top: 32px;\n  margin-bottom: 12px;\n  color: var(--primary-navy);');
css = css.replace(/\.article-content p \{\s*margin-bottom: 24px;\s*\}/g, '.article-content p {\n  margin-bottom: 20px;\n}');
css = css.replace(/line-height: 1\.8;/g, 'line-height: 1.75;');

// Result Clarity
css = css.replace(/\.result-range \{\s*font-size: 2\.5rem;/g, '.result-range {\n  font-size: 3rem;');
css = css.replace(/\.result-title \{\s*font-size: 0\.75rem;\s*font-weight: 600;\s*text-transform: uppercase;\s*color: var\(--text-muted\);/g, '.result-title {\n  font-size: 0.8rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  color: var(--primary-blue);');

// Add Loading State Animations
const loadingCSS = `
/* Calculator Loading State */
.loading-state-container {
  padding: 48px 20px;
  text-align: center;
}
.loading-shimmer-pulse {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-blue);
  opacity: 0.2;
  margin: 0 auto 20px auto;
  animation: calcPulse 1.2s infinite ease-in-out;
}
@keyframes calcPulse {
  0% { transform: scale(0.8); opacity: 0.2; }
  50% { transform: scale(1.2); opacity: 0.4; }
  100% { transform: scale(0.8); opacity: 0.2; }
}
`;
if (!css.includes('.loading-state-container')) {
  css += loadingCSS;
}
fs.writeFileSync(cssPath, css, 'utf8');
console.log('index.css updated');

// 2. Update script.js for Loading State
let js = fs.readFileSync(scriptPath, 'utf8');

// The HTML injection logic in estimate() starts around line 745
// Currently it is:
//     output.style.display = "block";
//     output.innerHTML = `
//       <div class='result-title'>Estimated Fair Market Value Range</div>

const origInjection = `    output.style.display = "block";
    output.innerHTML = \`
      <div class='result-title'>Estimated Fair Market Value Range</div>`;

const newInjection = `    const finalHtml = \`
      <div class='result-title'>Estimated Fair Market Value Range</div>`;

if (js.includes(origInjection)) {
  js = js.replace(origInjection, newInjection);
  
  // Now we need to find where the template literal ends and inject the setTimeout
  // The try block ends with:
  //       </div>
  //     \`;
  //   } catch (renderError) {
  
  const origEnd = `      </div>
    \`;
  } catch (renderError) {`;

  const newEnd = `      </div>
    \`;
    
    // Simulate Processing State
    const estimateBtn = document.getElementById("estimate-btn");
    if (estimateBtn) {
      estimateBtn.disabled = true;
      estimateBtn.style.opacity = '0.7';
      estimateBtn.textContent = "Analyzing market conditions...";
    }
    
    output.style.display = "block";
    output.innerHTML = \`<div class="loading-state-container">
      <div class="loading-shimmer-pulse"></div>
      <p style="color: var(--text-muted); font-size: 1rem; font-weight: 500;">Cross-referencing regional market data...</p>
    </div>\`;
    
    setTimeout(() => {
      output.innerHTML = finalHtml;
      if (estimateBtn) {
        estimateBtn.disabled = false;
        estimateBtn.style.opacity = '1';
        estimateBtn.textContent = "Calculate Fair Market Value";
      }
    }, 600);

  } catch (renderError) {`;

  js = js.replace(origEnd, newEnd);
  fs.writeFileSync(scriptPath, js, 'utf8');
  console.log('script.js updated');
} else {
  console.log('Could not find injection point in script.js');
}
