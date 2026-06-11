const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/script.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find the block for "guide-total-loss-claims.html" and remove it.
const articleBlockRegex = /\{\s*title:\s*"Complete Guide to Total Loss Claims: Valuation, Process, and Negotiation",[\s\S]*?url:\s*"guide-total-loss-claims\.html",[\s\S]*?tags:\s*\[[^\]]+\]\s*\}(,\s*)?/g;

if (articleBlockRegex.test(content)) {
    content = content.replace(articleBlockRegex, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Removed guide-total-loss-claims from ARTICLES');
} else {
    console.log('Could not find guide-total-loss-claims in script.js');
}

// Ensure index.html doesn't have the empty Cornerstone block
const indexPath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/index.html';
let indexContent = fs.readFileSync(indexPath, 'utf8');
const indexRegex = /<!-- Cornerstone Guides Section -->[\s\S]*?<section class="cornerstone-section"[\s\S]*?<\/section>/g;
if (indexRegex.test(indexContent)) {
    indexContent = indexContent.replace(indexRegex, '');
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('Removed Cornerstone section from index.html');
}

// Remove Cornerstone and Featured empty sections from learn.html if they exist there
const learnPath = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM/learn.html';
let learnContent = fs.readFileSync(learnPath, 'utf8');
const learnCornerstoneRegex = /<h2[^>]*>Cornerstone Guides<\/h2>[\s\S]*?(<div[^>]*id="cornerstone-[^>]*>[\s\S]*?<\/div>)/g;
const learnFeaturedRegex = /<h2[^>]*>Featured Guides<\/h2>[\s\S]*?(<div[^>]*id="featured-[^>]*>[\s\S]*?<\/div>)/g;

let modifiedLearn = false;
if (learnCornerstoneRegex.test(learnContent)) {
    learnContent = learnContent.replace(learnCornerstoneRegex, '');
    modifiedLearn = true;
    console.log('Removed Cornerstone section from learn.html');
}
if (learnFeaturedRegex.test(learnContent)) {
    learnContent = learnContent.replace(learnFeaturedRegex, '');
    modifiedLearn = true;
    console.log('Removed Featured section from learn.html');
}
if (modifiedLearn) {
    fs.writeFileSync(learnPath, learnContent, 'utf8');
}
