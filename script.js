document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle handled via global toggleMobileMenu function

  // Update articles globally
  if (document.getElementById("featured-guides-container")) {
    renderArticles("featured-guides-container");
  }
  if (document.getElementById("latest-articles-container")) {
    renderArticles("latest-articles-container", 2); // Show only latest 2 on homepage
  }

  // 1) Fill Year dropdown
  const yearSelect = document.getElementById("year");
  if (yearSelect) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1990; y--) {
      const option = document.createElement("option");
      option.value = y;
      option.textContent = y;
      yearSelect.appendChild(option);
    }
    // 2) Event Listeners
    yearSelect.addEventListener("change", loadMakes);
  }

  const makeSelect = document.getElementById("make");
  if (makeSelect) makeSelect.addEventListener("change", loadModels);

  const estimateBtn = document.getElementById("estimate-btn");
  if (estimateBtn) estimateBtn.addEventListener("click", estimate);
  
  const decodeBtn = document.getElementById("decode-btn");
  if (decodeBtn) decodeBtn.addEventListener("click", decodeVIN);

  // 3) Setup FAQ accordions
  setupFAQ();

  // 4) Auto load stored data
  if (document.getElementById("estimator")) {
    autoLoadSavedData();
  }
});

function autoLoadSavedData() {
  const savedData = localStorage.getItem("MyPoliciumAppData");
  if (!savedData) return;
  try {
    const data = JSON.parse(savedData);
    if (data.mileage) document.getElementById("mileage").value = data.mileage;
    if (data.province) document.getElementById("province").value = data.province;
    
    if (data.year) {
      const yearSelect = document.getElementById("year");
      if (yearSelect) {
        yearSelect.value = data.year;
        loadMakes().then(() => {
          if (data.make) {
            const makeSelect = document.getElementById("make");
            makeSelect.value = data.make;
            loadModels().then(() => {
              if (data.model) {
                const modelSelect = document.getElementById("model");
                modelSelect.value = data.model;
              }
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn("Could not parse saved calculator data.");
  }
}

function loadMakes() {
  return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`)
    .then(res => res.json())
    .then(data => {
      const makeSelect = document.getElementById("make");
      makeSelect.innerHTML = '<option value="" disabled selected>Select Make</option>';
      document.getElementById("model").innerHTML = '<option value="" disabled selected>Select Model</option>';

      const sortedMakes = data.Results.sort((a, b) => {
        const nameA = (a.MakeName || "").trim().toUpperCase();
        const nameB = (b.MakeName || "").trim().toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      const seenMakes = new Set();
      sortedMakes.forEach(m => {
        const rawName = m.MakeName || "";
        const cleanName = rawName.trim();
        const upperName = cleanName.toUpperCase();

        if (cleanName && !seenMakes.has(upperName)) {
          seenMakes.add(upperName);
          const option = document.createElement("option");
          option.value = cleanName;
          option.textContent = cleanName;
          makeSelect.appendChild(option);
        }
      });
    })
    .catch(err => console.error("Make fetch error:", err));
}

function loadModels() {
  const year = document.getElementById("year").value;
  const make = document.getElementById("make").value;
  if (!year || !make) return Promise.resolve();

  const makeEncoded = encodeURIComponent(make);
  return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${makeEncoded}/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      const modelSelect = document.getElementById("model");
      modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';

      const sortedModels = data.Results.sort((a, b) => {
        const nameA = (a.Model_Name || "").trim().toUpperCase();
        const nameB = (b.Model_Name || "").trim().toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      const seenModels = new Set();
      sortedModels.forEach(m => {
        const rawName = m.Model_Name || "";
        const cleanName = rawName.trim();
        const upperName = cleanName.toUpperCase();

        if (cleanName && !seenModels.has(upperName)) {
          seenModels.add(upperName);
          const option = document.createElement("option");
          option.value = cleanName;
          option.textContent = cleanName;
          modelSelect.appendChild(option);
        }
      });

      if (!data.Results.length) {
        const option = document.createElement("option");
        option.textContent = "No models for this year/make";
        option.disabled = true;
        option.selected = true;
        modelSelect.appendChild(option);
      }
    })
    .catch(err => console.error("Model fetch error:", err));
}

function decodeVIN() {
  const vin = document.getElementById("vin").value.trim().toUpperCase();
  if (!vin || vin.length !== 17) {
    alert("Please enter a valid 17-character VIN.");
    return;
  }

  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`)
    .then(res => res.json())
    .then(data => {
      if (data.Results && data.Results.length > 0) {
        let year = null;
        let make = null;
        let model = null;

        data.Results.forEach(result => {
          if (result.Variable === "Model Year") {
            year = result.Value;
          } else if (result.Variable === "Make") {
            make = result.Value;
          } else if (result.Variable === "Model") {
            model = result.Value;
          }
        });

        // Populate the fields properly with Promises
        if (year) {
          document.getElementById("year").value = year;
          loadMakes().then(() => {
            if (make) {
              const makeSelect = document.getElementById("make");
              const options = Array.from(makeSelect.options);
              const matchingOption = options.find(opt => opt.value.trim().toUpperCase() === make.trim().toUpperCase());
              if (matchingOption) {
                makeSelect.value = matchingOption.value;
                loadModels().then(() => {
                  if (model) {
                    const modelSelect = document.getElementById("model");
                    const modOptions = Array.from(modelSelect.options);
                    const modMatch = modOptions.find(opt => opt.value.trim().toUpperCase() === model.trim().toUpperCase() || opt.value.trim().toUpperCase().includes(model.trim().toUpperCase()));
                    if (modMatch) {
                      modelSelect.value = modMatch.value;
                    }
                  }
                });
              }
            }
          });
        }

        if (!year && !make && !model) {
          alert("Unable to decode vehicle information from this VIN. Please enter details manually.");
        }
      } else {
        alert("Invalid VIN or unable to decode. Please check the VIN and try again.");
      }
    })
    .catch(err => {
      console.error("VIN decode error:", err);
      alert("Error decoding VIN. Please try again later.");
    });
}

function estimate() {
  const year = document.getElementById("year").value;
  const make = document.getElementById("make").value;
  const model = document.getElementById("model").value;
  const mileage = document.getElementById("mileage").value;
  const province = document.getElementById("province").value;
  const output = document.getElementById("output");

  if (!year || !make || !model || model === "No models for this year/make") {
    output.style.display = "block";
    output.innerHTML = "<div class='result-note' style='color:red;'>Please select a valid Year, Make, and Model.</div>";
    return;
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  const makeUpper = make.toUpperCase();
  const modelUpper = model.toUpperCase();

  // 1. Exotic Check
  const exotics = ["FERRARI", "LAMBORGHINI", "MCLAREN", "BENTLEY", "ROLLS-ROYCE", "ASTON MARTIN", "BUGATTI", "KOENIGSEGG", "PAGANI"];
  if (exotics.includes(makeUpper)) {
    output.style.display = "block";
    output.innerHTML = `
      <div class='result-title' style='color: #b91c1c;'>Manual Valuation Required</div>
      <div class='result-meta'><span>Vehicle:</span> <strong>${year} ${make} ${model}</strong></div>
      <div class='result-note' style='margin-top: 16px; color: var(--text-dark); background: #fee2e2; padding: 12px; border-radius: 6px; border: 1px solid #f87171;'>
        Rare, exotic, or collector vehicles are not accurately tracked by standard depreciation models. Please seek a professional appraisal.
      </div>
    `;
    return;
  }

  // 2. Structured Lookup
  const makeData = {
    "HONDA": {
      models: { "CIVIC": { msrp: 26000, category: "economy" }, "ACCORD": { msrp: 30000, category: "midsize" }, "CR-V": { msrp: 34000, category: "suv" }, "PILOT": { msrp: 42000, category: "suv" } },
      default: { msrp: 28000, category: "midsize" }
    },
    "TOYOTA": {
      models: { "COROLLA": { msrp: 25000, category: "economy" }, "CAMRY": { msrp: 30000, category: "midsize" }, "RAV4": { msrp: 35000, category: "suv" }, "HIGHLANDER": { msrp: 45000, category: "suv" }, "TACOMA": { msrp: 40000, category: "truck" }, "TUNDRA": { msrp: 55000, category: "truck" } },
      default: { msrp: 29000, category: "midsize" }
    },
    "FORD": {
      models: { "F-150": { msrp: 50000, category: "truck" }, "ESCAPE": { msrp: 33000, category: "suv" }, "EXPLORER": { msrp: 45000, category: "suv" }, "MUSTANG": { msrp: 40000, category: "performance" } },
      default: { msrp: 38000, category: "suv" }
    },
    "CHEVROLET": {
      models: { "SILVERADO": { msrp: 48000, category: "truck" }, "EQUINOX": { msrp: 32000, category: "suv" }, "TAHOE": { msrp: 60000, category: "suv" }, "CORVETTE": { msrp: 75000, category: "performance" } },
      default: { msrp: 36000, category: "suv" }
    },
    "NISSAN": {
      models: { "SENTRA": { msrp: 24000, category: "economy" }, "ROGUE": { msrp: 33000, category: "suv" }, "PATHFINDER": { msrp: 42000, category: "suv" } },
      default: { msrp: 27000, category: "midsize" }
    },
    "HYUNDAI": {
      models: { "ELANTRA": { msrp: 24000, category: "economy" }, "SONATA": { msrp: 28000, category: "midsize" }, "TUCSON": { msrp: 32000, category: "suv" } },
      default: { msrp: 26000, category: "midsize" }
    },
    "KIA": {
      models: { "FORTE": { msrp: 24000, category: "economy" }, "SPORTAGE": { msrp: 32000, category: "suv" }, "TELLURIDE": { msrp: 45000, category: "suv" } },
      default: { msrp: 26000, category: "midsize" }
    },
    "ROVER": { default: { msrp: 60000, category: "luxury" } },
    "LAND ROVER": { default: { msrp: 60000, category: "luxury" } },
    "BMW": { default: { msrp: 50000, category: "luxury" } },
    "MERCEDES-BENZ": { default: { msrp: 55000, category: "luxury" } },
    "AUDI": { default: { msrp: 52000, category: "luxury" } },
    "LEXUS": { default: { msrp: 48000, category: "luxury" } },
    "PORSCHE": { default: { msrp: 75000, category: "performance" } },
    "MASERATI": { default: { msrp: 80000, category: "luxury" } },
    "TESLA": { default: { msrp: 45000, category: "luxury" } },
    "RAM": { default: { msrp: 50000, category: "truck" } },
    "JEEP": {
      models: { "WRANGLER": { msrp: 45000, category: "suv" }, "GRAND CHEROKEE": { msrp: 48000, category: "suv" } },
      default: { msrp: 38000, category: "suv" }
    },
    "GMC": { default: { msrp: 52000, category: "truck" } },
    "CHRYSLER": { default: { msrp: 35000, category: "midsize" } },
    "DODGE": { default: { msrp: 34000, category: "midsize" } },
    "VOLKSWAGEN": { default: { msrp: 28000, category: "economy" } },
    "MAZDA": { default: { msrp: 28000, category: "economy" } },
    "SUBARU": { default: { msrp: 30000, category: "economy" } },
    "VOLVO": { default: { msrp: 45000, category: "luxury" } },
    "ACURA": { default: { msrp: 40000, category: "luxury" } },
    "INFINITI": { default: { msrp: 42000, category: "luxury" } },
    "CADILLAC": { default: { msrp: 55000, category: "luxury" } }
  };

  let baseMsrp = 30000;
  let category = "midsize";
  let confidenceLevel = "Moderate";
  
  if (makeUpper === "MASERATI" || makeUpper === "PORSCHE") {
     confidenceLevel = "Low";
  }

  const mkData = makeData[makeUpper];
  if (mkData) {
    let modelMatched = false;
    if (mkData.models) {
      for (const [modKey, modVal] of Object.entries(mkData.models)) {
        if (modelUpper.includes(modKey)) {
          baseMsrp = modVal.msrp;
          category = modVal.category;
          modelMatched = true;
          if (confidenceLevel !== "Low") confidenceLevel = "High";
          break;
        }
      }
    }
    if (!modelMatched && mkData.default) {
      baseMsrp = mkData.default.msrp;
      category = mkData.default.category;
    }
  }

  // 3. Specialty Vehicle Detection (Low Confidence)
  const isSpecialty = modelUpper.match(/\b(TYPE R|GT3|HELLCAT|Z06|TRACKHAWK|BLACK SERIES|SVJ|AMG|RS)\b/) || modelUpper.match(/\bM\d\b/);
  if (isSpecialty) {
    confidenceLevel = "Low";
    category = "performance";
  }

  // 4. Trim logic
  let trimMultiplier = 1.0;
  if (!isSpecialty) {
    if (modelUpper.match(/\b(BASE|LX|LE)\b/)) trimMultiplier = 0.975;
    else if (modelUpper.match(/\b(EX|XLE|SPORT|SE)\b/)) trimMultiplier = 1.03;
    else if (modelUpper.match(/\b(TOURING|LIMITED|PLATINUM)\b/)) trimMultiplier = 1.06;
  }
  baseMsrp *= trimMultiplier;

  // 5. Category-based Depreciation
  let depreciationRate = 0.12; 
  if (category === "economy") depreciationRate = 0.11;
  else if (category === "suv") depreciationRate = 0.10;
  else if (category === "truck") depreciationRate = 0.08;
  else if (category === "performance") depreciationRate = 0.14;
  else if (category === "luxury") depreciationRate = 0.15;

  let value = baseMsrp * 0.8;
  for (let i = 2; i <= age; i++) {
    value -= (value * depreciationRate);
  }

  // 6. Mileage adjustments
  const expectedMileage = age === 0 ? 10000 : age * 20000;
  const diffKm = mileage - expectedMileage;
  const chunks = diffKm / 10000;
  
  let mileageMultiplier = 1.0;
  if (chunks > 0) {
    mileageMultiplier -= (chunks * 0.015);
    if (mileageMultiplier < 0.6) mileageMultiplier = 0.6;
  } else if (chunks < 0) {
    mileageMultiplier += (Math.abs(chunks) * 0.01);
    if (mileageMultiplier > 1.2) mileageMultiplier = 1.2;
  }
  value *= mileageMultiplier;

  // 7. Sanity Checks & Bounds
  let minFloor = Math.max(baseMsrp * 0.12, 2000);
  if (category === "suv" || category === "truck") {
    minFloor = Math.max(baseMsrp * 0.15, 3000);
  }
  if (value < minFloor) value = minFloor;
  
  if (value > baseMsrp * 1.15) value = baseMsrp * 1.15;

  // Province Multiplier
  let provinceMultiplier = 1.0;
  let provinceNote = "";
  switch (province) {
    case "Ontario": provinceMultiplier = 1.00; provinceNote = "Ontario baseline"; break;
    case "Quebec": provinceMultiplier = 0.97; provinceNote = "Quebec −3%"; break;
    case "British Columbia": provinceMultiplier = 1.05; provinceNote = "BC +5%"; break;
    case "Alberta": provinceMultiplier = 0.95; provinceNote = "Alberta −5%"; break;
    case "Saskatchewan": provinceMultiplier = 0.93; provinceNote = "Saskatchewan −7%"; break;
    case "Manitoba": provinceMultiplier = 0.94; provinceNote = "Manitoba −6%"; break;
    case "New Brunswick": provinceMultiplier = 0.96; provinceNote = "New Brunswick −4%"; break;
    case "Nova Scotia": provinceMultiplier = 0.95; provinceNote = "Nova Scotia −5%"; break;
    case "Prince Edward Island": provinceMultiplier = 0.94; provinceNote = "PEI −6%"; break;
    case "Newfoundland and Labrador": provinceMultiplier = 0.92; provinceNote = "Newfoundland −8%"; break;
    case "Yukon": provinceMultiplier = 1.08; provinceNote = "Yukon +8%"; break;
    case "Northwest Territories": provinceMultiplier = 1.10; provinceNote = "NWT +10%"; break;
    case "Nunavut": provinceMultiplier = 1.15; provinceNote = "Nunavut +15%"; break;
  }
  value *= provinceMultiplier;

  const low = value * 0.9;
  const high = value * 1.1;

  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  });

  const resultRange = `${formatter.format(low)} – ${formatter.format(high)}`;

  const appData = { year, make, model, mileage, province, estimatedRange: resultRange };
  localStorage.setItem("MyPoliciumAppData", JSON.stringify(appData));

  try {
    fetch('/api/save-calculation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...appData, timestamp: new Date().toISOString() })
    }).catch(() => {});
  } catch(e) {}

  output.style.animation = 'none';
  output.offsetHeight;
  output.style.animation = null;

  let confidenceColor = "#10b981"; // high
  if (confidenceLevel === "Moderate") confidenceColor = "#f59e0b";
  else if (confidenceLevel === "Low") confidenceColor = "#f97316";

  let lowConfidenceWarning = "";
  if (confidenceLevel === "Low") {
    lowConfidenceWarning = `<div style="margin-top: 12px; font-size: 0.85rem; color: #9a3412; background: #fff7ed; padding: 10px; border-radius: 6px; border: 1px solid #fed7aa;">
      <strong>Note:</strong> Performance, luxury, or specialty vehicles often deviate from standard depreciation curves. Treat this estimate with caution.
    </div>`;
  }

  output.style.display = "block";
  output.innerHTML = `
    <div class='result-title'>Estimated Actual Cash Value</div>
    <div class='result-range'>${resultRange}</div>
    <div style='margin-bottom: 16px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;'>
      <div style="width: 10px; height: 10px; border-radius: 50%; background: ${confidenceColor};"></div>
      <strong>Confidence:</strong> ${confidenceLevel}
    </div>
    <div class='result-meta'><span>Vehicle:</span> <strong>${year} ${make} ${model}</strong></div>
    <div class='result-meta'><span>Mileage:</span> <strong>${Number(mileage).toLocaleString("en-CA")} km</strong></div>
    <div class='result-note'>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      Adjustment: ${provinceNote}
    </div>
    ${lowConfidenceWarning}
    <div class='result-disclaimer'>
      *This estimate is a benchmark only and may not reflect your insurer’s final valuation. Actual cash value may vary based on condition, trim, and comparable vehicles.
    </div>
  `;
}

function setupFAQ() {
  const faqs = document.querySelectorAll('.faq-question');
  faqs.forEach(faq => {
    faq.addEventListener('click', () => {
      const parent = faq.parentElement;
      const isActive = parent.classList.contains('active');

      // Close all others
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Open if it wasn't already active
      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });
}

/** 
 * Global function for mobile menu toggle 
 * Linked via onclick in HTML to bypass potential JS load order issues 
 */
function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
}

/**
 * Article Data & Rendering
 */
const ARTICLES = [
  {
    title: "What Is OPCF 43 Depreciation Waiver and Is It Worth It?",
    excerpt: "If you have a newer vehicle, there’s a good chance you’ve heard about OPCF 43, also known as a depreciation waiver. But what exactly is it, and is it actually worth having?",
    url: "article-opcf-43.html",
    publishDate: "2026-04-11",
    createdDate: "2026-04-11"
  },
  {
    title: "What Happens After Your Car Is Declared a Total Loss?",
    excerpt: "If your car has been written off, you are probably wondering what actually happens next. Learn about the valuation process, salvage branding, and what happens to your vehicle after the claim.",
    url: "what-happens-after-total-loss.html",
    publishDate: "2026-04-10",
    createdDate: "2026-04-10"
  },
  {
    title: "Can You Negotiate a Total Loss Settlement?",
    excerpt: "One of the first things you’ll look at is the settlement amount and think, \"this feels low.\" Learn how to approach the negotiation process with real market evidence.",
    url: "negotiate-total-loss.html",
    publishDate: "2026-04-08",
    createdDate: "2026-04-08"
  },
  {
    title: "How Much Will Insurance Pay for Your Car After a Total Loss?",
    excerpt: "If your car has been written off after an accident, the first thing on your mind is probably: \"How much am I actually getting back?\" Explore our full breakdown of Actual Cash Value and how the payout process works.",
    url: "article-total-loss.html",
    publishDate: "2026-04-05",
    createdDate: "2026-04-05"
  }
];

function renderArticles(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Sort: Newest first (Descending)
  const sortedArticles = [...ARTICLES].sort((a, b) => {
    const dateA = new Date(a.publishDate || a.createdDate);
    const dateB = new Date(b.publishDate || b.createdDate);
    return dateB - dateA;
  });

  const displayArticles = limit ? sortedArticles.slice(0, limit) : sortedArticles;

  let html = "";
  displayArticles.forEach((article, index) => {
    html += `
      <a href="${article.url}" style="text-decoration: none;">
        <div class="feature-box">
          <h4>${article.title}</h4>
          <p>${article.excerpt}</p>
          <span class="read-more">Read the Full Article →</span>
        </div>
      </a>
    `;
    
    // Add spacer if not the last one
    if (index < displayArticles.length - 1) {
      html += `<div style="margin-bottom: 32px;"></div>`;
    }
  });

  container.innerHTML = html;
}

