const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';
const scriptPath = path.join(dir, 'script.js');

let scriptContent = fs.readFileSync(scriptPath, 'utf8');

const newArticlesStr = `  {
    title: "What Happens After a Car Accident in Ontario?",
    excerpt: "A complete guide to navigating car accident claims in Ontario. Understand the DCPD system, no-fault rules, and when to use Collision Reporting Centres.",
    url: "car-accident-claims-ontario.html",
    publishDate: "2026-05-10",
    createdDate: "2026-05-10",
    category: "Ontario Auto Insurance",
    featured: false,
    tags: ["ontario", "dcpd", "claims"]
  },
  {
    title: "What To Do After a Car Accident in Toronto",
    excerpt: "Involved in a collision in Toronto? Learn the specific rules for local Collision Reporting Centres, tow truck bylaws, and how to navigate a DCPD claim.",
    url: "car-accident-toronto-guide.html",
    publishDate: "2026-05-09",
    createdDate: "2026-05-09",
    category: "Ontario Auto Insurance",
    featured: false,
    tags: ["toronto", "crc", "claims"]
  },
  {
    title: "What To Do After a Car Accident in Mississauga",
    excerpt: "A practical guide to navigating car accidents in Mississauga. Understand Peel Regional Police CRC reporting rules, towing regulations, and insurance claims.",
    url: "car-accident-mississauga-guide.html",
    publishDate: "2026-05-08",
    createdDate: "2026-05-08",
    category: "Ontario Auto Insurance",
    featured: false,
    tags: ["mississauga", "crc", "claims"]
  },
  {
    title: "What To Do After a Car Accident in Brampton",
    excerpt: "Involved in a collision in Brampton? Learn about local Peel Police reporting requirements, the no-fault insurance process, and how to protect your claim.",
    url: "car-accident-brampton-guide.html",
    publishDate: "2026-05-08",
    createdDate: "2026-05-08",
    category: "Ontario Auto Insurance",
    featured: false,
    tags: ["brampton", "crc", "claims"]
  },
  {
    title: "What To Do After a Car Accident in Ottawa",
    excerpt: "A comprehensive guide to handling car accidents in Ottawa. Learn about Ottawa Police reporting rules, winter collision dynamics, and local insurance claims.",
    url: "car-accident-ottawa-guide.html",
    publishDate: "2026-05-07",
    createdDate: "2026-05-07",
    category: "Ontario Auto Insurance",
    featured: false,
    tags: ["ottawa", "crc", "claims"]
  },\n`;

if (scriptContent.includes('car-accident-toronto-guide.html')) {
  scriptContent = scriptContent.replace(newArticlesStr, '');
  fs.writeFileSync(scriptPath, scriptContent, 'utf8');
  console.log('Removed 5 local guides from script.js to contain them.');
} else {
  console.log('Guides were not in script.js.');
}
