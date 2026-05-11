const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';

const fixes = {
  descriptions: {
    'index.html': "Calculate your vehicle's actual cash value (ACV) and navigate total loss claims with confidence. Unbiased, free educational tools for drivers.",
    'calculator.html': "Estimate your car's actual cash value (ACV) and total loss settlement range using our free, educational insurance valuation calculator.",
    'learn.html': "Explore our comprehensive library of auto insurance guides. Learn about total loss claims, actual cash value, deductibles, and the repair process.",
    'privacy.html': "Read the MyPolicium Privacy Policy. Learn how we protect your data and why we never share your information with insurance companies.",
    'article-opcf-43.html': "Understand the OPCF 43 Waiver of Depreciation in Ontario. Learn how it protects the value of your new car if it is declared a total loss.",
    'article-total-loss.html': "Learn what a total loss car insurance claim is, how actual cash value is calculated, and what your options are if your car is totaled.",
    'negotiate-total-loss.html': "Discover how to negotiate a fair total loss settlement. Learn how to gather comparables and dispute a low actual cash value appraisal."
  },
  titles: {
    'accident-in-usa-as-canadian.html': "Accidents in the USA as a Canadian Driver | MyPolicium",
    'at-fault-vs-not-at-fault-insurance.html': "At-Fault vs. Not-At-Fault Accidents in Auto Insurance | MyPolicium",
    'salvage-title-keep-total-loss-vehicle.html': "Salvage Titles & Keeping Your Total Loss Vehicle | MyPolicium"
  },
  trimDescription: {
    'what-happens-after-total-loss.html': "Learn what happens after your car is declared a total loss. Understand the payout process, actual cash value (ACV), and your options for keeping your vehicle."
  }
};

for (const [file, newDesc] of Object.entries(fixes.descriptions)) {
  const filePath = path.join(targetDir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('<meta name="description"')) {
    content = content.replace(/(<title>[\s\S]*?<\/title>)/i, "$1\n  <meta name=\"description\" content=\"" + newDesc + "\">");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed missing description in', file);
  }
}

for (const [file, newTitle] of Object.entries(fixes.titles)) {
  const filePath = path.join(targetDir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<title>[\s\S]*?<\/title>/i, "<title>" + newTitle + "</title>");
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed title in', file);
}

for (const [file, newDesc] of Object.entries(fixes.trimDescription)) {
  const filePath = path.join(targetDir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<meta name="description" content="[^"]+"/i, "<meta name=\"description\" content=\"" + newDesc + "\"");
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed description length in', file);
}
