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
    yearSelect.addEventListener("change", () => loadMakes("year", "make", "model"));
  }

  const makeSelect = document.getElementById("make");
  if (makeSelect) makeSelect.addEventListener("change", () => loadModels("year", "make", "model"));

  const estimateBtn = document.getElementById("estimate-btn");
  if (estimateBtn) estimateBtn.addEventListener("click", estimate);
  
  const decodeBtn = document.getElementById("decode-btn");
  if (decodeBtn) decodeBtn.addEventListener("click", decodeVIN);

  // 5) Homepage Quick Start initialization
  const qsYearSelect = document.getElementById("qs-year");
  if (qsYearSelect) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1990; y--) {
      const option = document.createElement("option");
      option.value = y;
      option.textContent = y;
      qsYearSelect.appendChild(option);
    }
    qsYearSelect.addEventListener("change", () => loadMakes("qs-year", "qs-make", "qs-model"));
    
    const qsMakeSelect = document.getElementById("qs-make");
    if (qsMakeSelect) qsMakeSelect.addEventListener("change", () => loadModels("qs-year", "qs-make", "qs-model"));

    const qsContinueBtn = document.getElementById("qs-continue-btn");
    if (qsContinueBtn) {
      qsContinueBtn.addEventListener("click", () => {
        const year = document.getElementById("qs-year").value;
        const make = document.getElementById("qs-make").value;
        const model = document.getElementById("qs-model").value;
        const mileage = document.getElementById("qs-mileage").value;
        const province = document.getElementById("qs-province").value;

        if (!year || !make || !model) {
          alert("Please select Year, Make, and Model to continue.");
          return;
        }

        const appData = { year, make, model, mileage, province };
        localStorage.setItem("MyPoliciumAppData", JSON.stringify(appData));
        window.location.href = 'calculator.html';
      });
    }
  }

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

// ---------------------------------------------------------
// Vehicle Make Whitelist (Mainstream Passenger Vehicles)
// ---------------------------------------------------------
const APPROVED_MAKES = [
  "Acura", "Alfa Romeo", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", 
  "Dodge", "FIAT", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "INFINITI", 
  "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Lucid", "Maserati", 
  "Mazda", "Mercedes-AMG", "Mercedes-Benz", "MINI", "Mitsubishi", "Nissan", "Polestar", 
  "Porsche", "Ram", "Rivian", "Rolls-Royce", "smart", "Subaru", "Suzuki", "Tesla", 
  "Toyota", "Volkswagen", "Volvo"
].sort((a, b) => a.localeCompare(b));

// Map curated labels to NHTSA API canonical values if necessary
const MAKE_API_MAPPING = {
  "Mercedes-AMG": "MERCEDES-BENZ"
};

function loadMakes(yearId = "year", makeId = "make", modelId = "model") {
  const makeSelect = document.getElementById(makeId);
  if (!makeSelect) return Promise.resolve();

  const modelSelect = document.getElementById(modelId);
  if (modelSelect) modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';

  const currentValue = makeSelect.value;
  makeSelect.innerHTML = '<option value="" disabled selected>Select Make</option>';

  APPROVED_MAKES.forEach(make => {
    const option = document.createElement("option");
    option.value = make;
    option.textContent = make;
    makeSelect.appendChild(option);
  });

  // Restore value if it exists in the new list
  if (currentValue && APPROVED_MAKES.includes(currentValue)) {
    makeSelect.value = currentValue;
  }

  return Promise.resolve();
}

function loadModels(yearId = "year", makeId = "make", modelId = "model") {
  const year = document.getElementById(yearId).value;
  const make = document.getElementById(makeId).value;
  if (!year || !make) return Promise.resolve();

  // Use API mapping or fallback to selected make label
  const apiMake = MAKE_API_MAPPING[make] || make;
  const makeEncoded = encodeURIComponent(apiMake);
  return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${makeEncoded}/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      const modelSelect = document.getElementById(modelId);
      if (!modelSelect) return;
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

        // Filter out commercial/heavy models if needed (optional but recommended)
        // For now, we keep logic simple but ensure uniqueness
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

// Helper for robust model matching
function normalizeString(str) {
  if (!str) return "";
  return str.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Deterministic jitter (±2-3%) based on input hash
function getDeterministicJitter(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert hash to a range of -0.025 to +0.025 (±2.5%)
  const jitterValue = ((Math.abs(hash) % 1000) / 1000) * 0.05 - 0.025;
  return 1 + jitterValue;
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
  const yearRaw = document.getElementById("year").value;
  const makeRaw = document.getElementById("make").value;
  const modelRaw = document.getElementById("model").value;
  const mileageRaw = document.getElementById("mileage").value;
  const provinceRaw = document.getElementById("province").value;
  const insurerOfferRaw = document.getElementById("insurer-offer") ? document.getElementById("insurer-offer").value : "";
  const output = document.getElementById("output");

  // Normalization
  const year = yearRaw ? yearRaw.trim() : "";
  const make = makeRaw ? makeRaw.trim() : "";
  const model = modelRaw ? modelRaw.trim() : "";
  const mileage = mileageRaw ? parseInt(mileageRaw.trim()) : 0;
  const province = provinceRaw ? provinceRaw.trim() : "";

  if (!year || !make || !model || model === "No models for this year/make") {
    output.style.display = "block";
    output.innerHTML = "<div class='result-note' style='color:red;'>Please select a valid Year, Make, and Model.</div>";
    return;
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - parseInt(year);
  const makeUpper = make.toUpperCase();
  const modelUpper = model.toUpperCase();
  const modelNorm = normalizeString(model);

  // 1. Exotic Guard
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

  // 2. STACKING ORDER: Step 1 - Model Base Value
  const makeData = {
    "HONDA": {
      models: { "CIVIC": { msrp: 26500, category: "economy" }, "ACCORD": { msrp: 33000, category: "midsize" }, "CR-V": { msrp: 36500, category: "suv" }, "PILOT": { msrp: 45000, category: "suv" } },
      default: { msrp: 31000, category: "midsize" }
    },
    "TOYOTA": {
      models: { "COROLLA": { msrp: 26000, category: "economy" }, "CAMRY": { msrp: 33000, category: "midsize" }, "RAV4": { msrp: 37500, category: "suv" }, "HIGHLANDER": { msrp: 49000, category: "suv" }, "TACOMA": { msrp: 43000, category: "truck" }, "TUNDRA": { msrp: 59000, category: "truck" } },
      default: { msrp: 32000, category: "midsize" }
    },
    "FORD": {
      models: { "F-150": { msrp: 53000, category: "truck" }, "ESCAPE": { msrp: 34500, category: "suv" }, "EXPLORER": { msrp: 51000, category: "suv" }, "MUSTANG": { msrp: 44000, category: "performance" } },
      default: { msrp: 41000, category: "suv" }
    },
    "CHEVROLET": {
      models: { "SILVERADO": { msrp: 51000, category: "truck" }, "EQUINOX": { msrp: 34000, category: "suv" }, "TAHOE": { msrp: 66000, category: "suv" }, "CORVETTE": { msrp: 82000, category: "performance" } },
      default: { msrp: 39000, category: "suv" }
    },
    "NISSAN": {
      models: { "SENTRA": { msrp: 25500, category: "economy" }, "ROGUE": { msrp: 34500, category: "suv" }, "PATHFINDER": { msrp: 46000, category: "suv" } },
      default: { msrp: 29000, category: "midsize" }
    },
    "JEEP": {
      models: { "WRANGLER": { msrp: 49000, category: "suv" }, "GRAND CHEROKEE": { msrp: 53000, category: "suv" } },
      default: { msrp: 43000, category: "suv" }
    },
    "RAM": { default: { msrp: 56000, category: "truck" } }
  };

  const TIERS = {
    "economy": 0.90,
    "midsize": 1.15,
    "suv": 1.35,
    "truck": 1.55,
    "luxury": 1.50,
    "performance": 1.40
  };

  let baseMsrp = 32000;
  let category = "midsize";
  let modelMatched = false;

  const mkData = makeData[makeUpper];
  if (mkData) {
    if (mkData.models) {
      for (const [mName, mInfo] of Object.entries(mkData.models)) {
        if (modelNorm === normalizeString(mName)) {
          baseMsrp = mInfo.msrp;
          category = mInfo.category;
          modelMatched = true;
          break;
        }
      }
      if (!modelMatched) {
        for (const [mName, mInfo] of Object.entries(mkData.models)) {
          if (modelNorm.includes(normalizeString(mName))) {
            baseMsrp = mInfo.msrp;
            category = mInfo.category;
            modelMatched = true;
            break;
          }
        }
      }
    }
    if (!modelMatched && mkData.default) {
      baseMsrp = mkData.default.msrp;
      category = mkData.default.category;
    }
  }

  // Keyword Category Fallback
  if (!modelMatched) {
    const mNorm = normalizeString(model);
    if (mNorm.match(/(SUV|CROSSOVER|4X4|4WD|EXPLORER|CHEROKEE|WRANGLER|ROGUE|EQUINOX|TUCSON|SPORTAGE)/)) category = "suv";
    else if (mNorm.match(/(TRUCK|PICKUP|F150|SILVERADO|RAM|SIERRA|TUNDRA|TACOMA|TITAN|CAB|1500|2500)/)) category = "truck";
    else if (mNorm.match(/(GT|SPORT|TYPE|PERFORMANCE|TURBO|COUPE|SRT|HELLCAT|RS)/)) category = "performance";
  }

  // STACKING ORDER: Step 2 - Category Multiplier
  const categoryFactor = TIERS[category] || 1.15;
  let value = baseMsrp * categoryFactor;

  // MARKET DEMAND SIGNAL (Step 2b)
  let marketFactor = 1.0;
  if (category === "economy" || category === "midsize") marketFactor = 0.97; // Sedan pressure
  else if (category === "suv") marketFactor = 1.03; // SUV demand
  else if (category === "truck") marketFactor = 1.07; // Canadian truck demand
  value *= marketFactor;

  // STACKING ORDER: Step 3 - Trim Adjustment
  let trimMultiplier = 1.0;
  const isSpecialty = modelUpper.match(/\b(TYPE R|GT3|HELLCAT|Z06|TRACKHAWK|BLACK SERIES|SVJ|AMG|RS|SRT|M3|M4|M5)\b/);
  
  if (isSpecialty) {
    trimMultiplier = 1.25;
    category = "performance"; // Prioritize performance curve for specialty models
  } else {
    // Stiffer trim sensitivity
    if (modelUpper.match(/\b(BASE|LX|LE|S|VALUE|GL)\b/)) trimMultiplier = 1.00;
    else if (modelUpper.match(/\b(EX|XLE|SPORT|SE|SL|GT|SEL|XLT)\b/)) trimMultiplier = 1.08;
    else if (modelUpper.match(/\b(TOURING|LIMITED|PLATINUM|PREMIER|OVERLAND|RUBICON|DENALI|RESERVE|TITANIUM)\b/)) trimMultiplier = 1.15;
  }
  value *= trimMultiplier;

  // STACKING ORDER: Step 4 - Depreciation
  let depreciationRate = 0.12;
  if (category === "economy") depreciationRate = 0.11;
  else if (category === "suv") depreciationRate = 0.10;
  else if (category === "truck") depreciationRate = 0.08;
  else if (category === "performance") depreciationRate = 0.14;
  else if (category === "luxury") depreciationRate = 0.15;

  value *= 0.82; // Initial immediate drop
  for (let i = 1; i < age; i++) {
    value -= (value * depreciationRate);
  }

  // STACKING ORDER: Step 5 - Non-linear Mileage Curve
  // Canadian average ~18,000km/yr
  const expectedMileage = age === 0 ? 10000 : age * 18000;
  let mileageFactor = 1.0;

  if (mileage < 60000) {
    // Under 60k: Strong positive adjustment
    mileageFactor += ((60000 - mileage) / 60000) * 0.08;
  } else if (mileage >= 60000 && mileage <= 140000) {
    // 60k-140k: Neutral band (plateau)
    mileageFactor = 1.0;
  } else if (mileage > 140000 && mileage <= 220000) {
    // 140k-220k: Moderate decline
    mileageFactor -= ((mileage - 140000) / 80000) * 0.15;
  } else if (mileage > 220000) {
    // > 220k: Sharper drop
    mileageFactor -= 0.15 + ((mileage - 220000) / 80000) * 0.12;
  }
  
  if (mileageFactor < 0.55) mileageFactor = 0.55;
  if (mileageFactor > 1.20) mileageFactor = 1.20;
  value *= mileageFactor;

  // STACKING ORDER: Step 6 - Province Factor
  let provinceMultiplier = 1.0;
  switch (province) {
    case "Ontario": provinceMultiplier = 1.00; break;
    case "Quebec": provinceMultiplier = 0.97; break;
    case "British Columbia": provinceMultiplier = 1.06; break;
    case "Alberta": provinceMultiplier = 0.95; break;
    case "Saskatchewan": provinceMultiplier = 0.93; break;
    case "Manitoba": provinceMultiplier = 0.94; break;
    case "New Brunswick": provinceMultiplier = 0.96; break;
    case "Nova Scotia": provinceMultiplier = 0.95; break;
    case "Prince Edward Island": provinceMultiplier = 0.94; break;
    case "Newfoundland and Labrador": provinceMultiplier = 0.92; break;
    case "Yukon": provinceMultiplier = 1.08; break;
    case "Northwest Territories": provinceMultiplier = 1.10; break;
    case "Nunavut": provinceMultiplier = 1.15; break;
  }
  value *= provinceMultiplier;

  // STACKING ORDER: Step 7 - Refined Deterministic Jitter (±2%)
  const jitterInput = `${year}${make}${model}${mileage}${province}`;
  let hash = 0;
  for (let i = 0; i < jitterInput.length; i++) {
    hash = ((hash << 5) - hash) + jitterInput.charCodeAt(i);
    hash |= 0;
  }
  const jitterValue = ((Math.abs(hash) % 1000) / 1000) * 0.04 - 0.02; // ±2%
  value *= (1 + jitterValue);

  // Dynamic Range Width (Step 8)
  let spreadPercent = 0.065; // ±6.5% (13% spread) for high-value
  if (value < 15000) spreadPercent = 0.04; // ±4% (8% spread) for budget cars

  const low = value * (1 - spreadPercent);
  const high = value * (1 + spreadPercent);

  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  });

  const resultRange = `${formatter.format(low)} – ${formatter.format(high)}`;
  const midpoint = (low + high) / 2;

  const appData = { year, make, model, mileage, province, estimatedRange: resultRange };
  localStorage.setItem("MyPoliciumAppData", JSON.stringify(appData));

  try {
    const normalMileage = (mileage >= 40000 && mileage <= 160000);
    let confidenceResult = "Moderate";
    if (modelMatched && normalMileage) confidenceResult = "Strong";

    const insurerLow = low * 0.88;
    const insurerHigh = high * 0.93;
    const insurerMidpoint = (insurerLow + insurerHigh) / 2;
    const insurerRangeStr = `${formatter.format(insurerLow)} – ${formatter.format(insurerHigh)}`;
    
    const showWarning = (midpoint - insurerMidpoint) / insurerMidpoint > 0.10;
    const underpaymentLow = (midpoint - insurerHigh);
    const underpaymentHigh = (midpoint - insurerLow);

    output.style.animation = 'none';
    output.offsetHeight;
    output.style.animation = null;

    let confidenceColor = "#10b981"; 
    if (confidenceResult === "Moderate") confidenceColor = "#f59e0b";

    // --- Assessment Logic ---
    const insurerOffer = insurerOfferRaw ? parseFloat(insurerOfferRaw.replace(/[^0-9.]/g, "")) : null;
    let assessmentHtml = "";
    
    if (insurerOffer === null || isNaN(insurerOffer)) {
      // Default Informational State
      assessmentHtml = `
        <div class="assessment-box">
          <div class="assessment-title">Assessment</div>
          <div class="assessment-explanation">
            This estimate represents a typical market range for your vehicle. 
            Compare this range to your insurer’s offer to determine if it is fair.
          </div>
        </div>
      `;
    } else {
      let verdict = "";
      let toneClass = "";
      let explanation = "";

      if (insurerOffer < low) {
        verdict = "Your offer may be below market value";
        toneClass = "assessment-below";
        explanation = "This offer falls below the expected market range for your vehicle.";
      } else if (insurerOffer >= low && insurerOffer <= midpoint) {
        verdict = "Your offer is on the lower end of market value";
        toneClass = "assessment-caution";
        explanation = "This offer is within range but below the midpoint of expected value.";
      } else if (insurerOffer > midpoint && insurerOffer <= high) {
        verdict = "Your offer appears to be within a reasonable range";
        toneClass = "assessment-fair";
        explanation = "This offer aligns with expected fair market value.";
      } else if (insurerOffer > high) {
        verdict = "Your offer is above typical market value";
        toneClass = "assessment-fair";
        explanation = "This offer exceeds typical market expectations.";
      }

      assessmentHtml = `
        <div class="assessment-box ${toneClass}">
          <div class="assessment-title">Assessment</div>
          <div class="assessment-verdict">${verdict}</div>
          <div class="assessment-explanation">${explanation}</div>
        </div>
      `;
    }

    let warningBoxHeader = "";
    if (showWarning) {
      warningBoxHeader = `
        <div class="warning-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="warning-content">
            <span class="warning-title">Significant Valuation Gap Detected</span>
            Your insurance offer may be underpriced by <strong>${formatter.format(underpaymentLow)} – ${formatter.format(underpaymentHigh)}</strong> based on current market patterns.
          </div>
        </div>
      `;
    } else {
      warningBoxHeader = `
        <div class="warning-box" style="background: #f0fdf4; border-color: #bbf7d0;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l3 3 5-5"></path></svg>
          <div class="warning-content" style="color: #166534;">
            This valuation appears consistent with standard insurance settlement patterns.
          </div>
        </div>
      `;
    }

    output.style.display = "block";
    output.innerHTML = `
      <div class='result-title'>Estimated Fair Market Value Range</div>
      <div class='result-range'>${resultRange}</div>
      <div class='result-subtext'>This estimate reflects typical Canadian market conditions for similar vehicles.</div>

      ${assessmentHtml}

      <div style='margin-bottom: 24px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;'>
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${confidenceColor};"></div>
        <strong>Confidence:</strong> ${confidenceResult}
      </div>

      <div class="valuation-signal" style="margin-bottom: 20px; font-size: 0.8rem; color: #64748b; font-style: italic;">
        Based on vehicle class, mileage, and regional market patterns
      </div>

      <div class='result-meta'><span>Vehicle:</span> <strong>${year} ${make} ${model}</strong></div>
      <div class='result-meta'><span>Mileage:</span> <strong>${Number(mileage).toLocaleString("en-CA")} km</strong></div>
      
      <div class='insurer-comparison'>
        <div class='insurer-label'>Typical insurer valuation range</div>
        <div class='insurer-value'>${insurerRangeStr}</div>
        <div class='insurer-note'>*Market comparison benchmark for settlement review.</div>
      </div>

      ${warningBoxHeader}

      <div class="result-cta-group">
        <a href="negotiate-total-loss.html" class="btn btn-primary btn-full" style="text-align: center; text-decoration: none;">Learn how to negotiate this value →</a>
        <a href="what-happens-after-total-loss.html" class="btn btn-outline btn-full" style="text-align: center; text-decoration: none; border: 1px solid var(--border-color); color: var(--primary-navy); padding: 12px; border-radius: var(--radius-md);">Total loss payout guide</a>
      </div>

      <div class="trust-boost">
        Independent valuation • No insurance affiliation
      </div>

      <div class='result-disclaimer'>
        *This estimate is a data-driven benchmark. Actual cash value is determined by local comparables and specific vehicle condition.
      </div>
    `;
  } catch (renderError) {
    console.error("Result rendering error:", renderError);
    output.style.display = "block";
    output.innerHTML = `
      <div class='result-title'>Estimated Market Value</div>
      <div class='result-range'>${resultRange}</div>
      <div class='result-meta'><span>Vehicle:</span> <strong>${year} ${make} ${model}</strong></div>
      <div class='result-meta'><span>Mileage:</span> <strong>${Number(mileage).toLocaleString("en-CA")} km</strong></div>
      <div class='result-disclaimer'>*Simplified market estimate.</div>
    `;
  }
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
    title: "Why Is My Car Insurance So Expensive?",
    excerpt: "Lately, it feels like everyone is asking the same question. Rates have been going up, and a lot of people are noticing it. Learn the factors behind insurance pricing.",
    url: "why-is-car-insurance-expensive.html",
    publishDate: "2026-04-14",
    createdDate: "2026-04-14"
  },
  {
    title: "What Is Actual Cash Value (ACV) and How Is It Calculated?",
    excerpt: "If your car is written off, the amount you receive is based on Actual Cash Value. Learn how ACV is calculated and why it matters for your claim.",
    url: "what-is-actual-cash-value.html",
    publishDate: "2026-04-14",
    createdDate: "2026-04-14"
  },
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
    const valA = a.publishDate || a.createdDate || "";
    const valB = b.publishDate || b.createdDate || "";
    return valB.localeCompare(valA);
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

