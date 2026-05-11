const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';
const indexHtmlPath = path.join(dir, 'index.html');
const learnHtmlPath = path.join(dir, 'learn.html');

// 1. Update index.html
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Soften calculator claims
indexHtml = indexHtml.replace('Calculated using current regional market data.', 'Estimated using depreciation logic, mileage adjustments, and regional market assumptions.');

// Hide Cornerstone Section
indexHtml = indexHtml.replace('<section class="cornerstone-section" style="margin-top: 64px;">', '<section class="cornerstone-section" style="margin-top: 64px; display: none;">');

// Hide Featured Section on Homepage if it exists (latest articles)
// Wait, the user said "Cornerstone Guides / Featured Guides sections appear visually incomplete"
// "Temporarily hide/suppress these sections until true pillar guides exist."
// There is a "Featured Guides" section? Let's hide it if it's there.
indexHtml = indexHtml.replace('<section class="featured-section">', '<section class="featured-section" style="display: none;">');

fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');

// 2. Update learn.html
let learnHtml = fs.readFileSync(learnHtmlPath, 'utf8');

// Update intro
learnHtml = learnHtml.replace('<p>Knowledge is power when dealing with insurance claims. Learn how to navigate the process with confidence.</p>', '<p>Most drivers only learn how total loss settlements work after their vehicle has already been written off. MyPolicium helps explain the process before you are forced to make decisions under pressure.</p>');

// Hide Cornerstone Section
learnHtml = learnHtml.replace('<div class="cornerstone-section">', '<div class="cornerstone-section" style="display: none;">');

// Hide Featured Section
learnHtml = learnHtml.replace('<div style="margin-bottom: 64px;">\n      <h2 class="category-header">Featured Guides</h2>', '<div style="margin-bottom: 64px; display: none;">\n      <h2 class="category-header">Featured Guides</h2>');

fs.writeFileSync(learnHtmlPath, learnHtml, 'utf8');
console.log('Homepage and Learn Hub updated.');
