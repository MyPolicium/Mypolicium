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
      sortedMakes.forEach(m => {
        const option = document.createElement("option");
        option.value = m.MakeName;
        option.textContent = m.MakeName;
        makeSelect.appendChild(option);
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
      sortedModels.forEach(m => {
        const option = document.createElement("option");
        option.value = m.Model_Name;
        option.textContent = m.Model_Name;
        modelSelect.appendChild(option);
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

  // 1. Dynamic base value and category mapped by Make
  const makeData = {
    "HONDA": { msrp: 28000, category: "economy" },
    "TOYOTA": { msrp: 29000, category: "economy" },
    "NISSAN": { msrp: 27000, category: "economy" },
    "HYUNDAI": { msrp: 26000, category: "economy" },
    "KIA": { msrp: 26000, category: "economy" },
    "VOLKSWAGEN": { msrp: 28000, category: "economy" },
    "MAZDA": { msrp: 28000, category: "economy" },
    "SUBARU": { msrp: 30000, category: "economy" },
    
    "FORD": { msrp: 38000, category: "moderate" },
    "CHEVROLET": { msrp: 36000, category: "moderate" },
    "RAM": { msrp: 40000, category: "moderate" },
    "JEEP": { msrp: 35000, category: "moderate" },
    "GMC": { msrp: 42000, category: "moderate" },
    "CHRYSLER": { msrp: 35000, category: "moderate" },
    "DODGE": { msrp: 34000, category: "moderate" },
    
    "BMW": { msrp: 50000, category: "luxury" },
    "MERCEDES-BENZ": { msrp: 55000, category: "luxury" },
    "AUDI": { msrp: 52000, category: "luxury" },
    "LEXUS": { msrp: 48000, category: "luxury" },
    "PORSCHE": { msrp: 75000, category: "luxury" },
    "TESLA": { msrp: 45000, category: "luxury" },
    "LAND ROVER": { msrp: 60000, category: "luxury" },
    "VOLVO": { msrp: 45000, category: "luxury" },
    "ACURA": { msrp: 40000, category: "luxury" },
    "INFINITI": { msrp: 42000, category: "luxury" },
    "CADILLAC": { msrp: 55000, category: "luxury" },
  };

  const makeUpper = make.toUpperCase();
  // Fall back to a reasonable default value if make is not specifically tracked
  const vehicleInfo = makeData[makeUpper] || { msrp: 30000, category: "moderate" };
  const baseMsrp = vehicleInfo.msrp;
  const category = vehicleInfo.category;

  // 2. Improve depreciation logic based on vehicle category heuristics
  let depreciationRate;
  if (category === "economy") depreciationRate = 0.10; // Economics hold value better
  else if (category === "luxury") depreciationRate = 0.15; // Luxury and tech drop faster
  else depreciationRate = 0.12; // Moderate / Trucks 

  // Apply initial 20% drop for the first year, then compound annual depreciation
  let value = baseMsrp * 0.8;
  for (let i = 2; i <= age; i++) {
    value -= (value * depreciationRate);
  }

  // 3. Improve mileage adjustments using a gradual sliding scale
  const expectedMileage = age === 0 ? 10000 : age * 20000;
  const diffKm = mileage - expectedMileage;
  const chunks = diffKm / 10000; // calculate chunks of 10,000 km difference
  
  let mileageMultiplier = 1.0;
  if (chunks > 0) {
    // Penalty: -1.5% per 10k over expected average
    mileageMultiplier -= (chunks * 0.015);
    if (mileageMultiplier < 0.6) mileageMultiplier = 0.6; // Cap penalty at -40%
  } else if (chunks < 0) {
    // Bonus: +1% per 10k under expected average
    mileageMultiplier += (Math.abs(chunks) * 0.01);
    if (mileageMultiplier > 1.2) mileageMultiplier = 1.2; // Cap bonus at +20%
  }
  
  value *= mileageMultiplier;

  // Hard floor value
  if (value < 1500) value = 1500;

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

  // Save to LocalStorage
  const appData = { year, make, model, mileage, province, estimatedRange: resultRange };
  localStorage.setItem("MyPoliciumAppData", JSON.stringify(appData));

  // Analytics Metric Sync (Fire and Forget)
  try {
    fetch('/api/save-calculation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...appData,
        timestamp: new Date().toISOString()
      })
    }).catch(() => { /* silent fail if endpoint is dead */ });
  } catch(e) {}

  // Re-trigger animation
  output.style.animation = 'none';
  output.offsetHeight; /* trigger reflow */
  output.style.animation = null;

  output.style.display = "block";
  output.innerHTML = `
    <div class='result-title'>Estimated Actual Cash Value</div>
    <div class='result-range'>${resultRange}</div>
    <div class='result-meta'><span>Vehicle:</span> <strong>${year} ${make} ${model}</strong></div>
    <div class='result-meta'><span>Mileage:</span> <strong>${Number(mileage).toLocaleString("en-CA")} km</strong></div>
    <div class='result-note'>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      Adjustment: ${provinceNote}
    </div>
    <div class='result-disclaimer'>
      *This is an estimate only. Actual insurance payouts may vary based on vehicle condition, trim, prior damage, options, local market conditions, and insurer valuation methods.
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

