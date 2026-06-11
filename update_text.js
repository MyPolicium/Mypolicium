const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';
const oldFooter = 'Empowering drivers with clear, unbiased education on auto insurance claims and vehicle valuation.';
const newFooter = 'Helping drivers understand auto claims, vehicle value, and insurance decisions before they are under pressure.';
const oldFaq = "In many situations, yes. The insurer's first offer is an attempt at fair market value, but a valuation can often be reviewed if you have relevant comparables. You can pull comparable listings for identical cars in your area and submit recent maintenance receipts to justify a higher settlement.";
const newFaq = "In many situations, you may be able to ask your insurer to review a total loss valuation if you have relevant comparables, correct trim details, mileage information, or condition evidence. Actual outcomes can vary depending on the policy, facts, and valuation support.";

const cornerstoneRegex = /<!-- Cornerstone Guides Section -->[\s\S]*?<\/section>/;

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        if (content.includes(oldFooter)) {
            content = content.replace(new RegExp(oldFooter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newFooter);
            modified = true;
        }

        if (content.includes(oldFaq)) {
            content = content.replace(oldFaq, newFaq);
            modified = true;
        }

        if (file === 'index.html' && cornerstoneRegex.test(content)) {
            content = content.replace(cornerstoneRegex, '');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
});
