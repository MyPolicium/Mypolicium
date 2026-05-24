document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded triggered');
  try {
    generateArticleSchema();
  } catch (e) { console.error('Error in schema:', e); }

  try {
    if (document.getElementById("featured-guides-container")) {
      renderArticles("featured-guides-container");
    }
  } catch (e) { console.error('Error in featured:', e); }

  try {
    if (document.getElementById("cornerstone-guides-container")) {
      const container = document.getElementById("cornerstone-guides-container");
      const pillars = typeof ARTICLES !== 'undefined' ? ARTICLES.filter(a => a.isPillar) : [];
      if (pillars.length > 0) {
        let pHtml = '<div class="featured-grid">';
        pillars.forEach(article => { pHtml += generateFeaturedCard(article, "Cornerstone Guide"); });
        pHtml += '</div>';
        container.innerHTML = pHtml;
      }
    }
  } catch (e) { console.error('Error in cornerstone:', e); }

  try {
    if (document.getElementById("latest-articles-container")) {
      renderArticles("latest-articles-container", 2);
    }
    if (document.getElementById("related-articles-container")) {
      renderRelatedArticles();
    }
  } catch (e) { console.error('Error in latest/related:', e); }

  try {
    // 1) Fill Year dropdown
    const yearSelect = document.getElementById("year");
    console.log('yearSelect found:', !!yearSelect);
    if (yearSelect) {
      const currentYear = new Date().getFullYear();
      for (let y = currentYear; y >= 1990; y--) {
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        yearSelect.appendChild(option);
      }
      console.log('Populated yearSelect with', yearSelect.children.length, 'options');
      // 2) Event Listeners
      yearSelect.addEventListener("change", () => loadMakes("year", "make", "model"));
    }

    const makeSelect = document.getElementById("make");
    if (makeSelect) {
      makeSelect.addEventListener("change", () => loadModels("year", "make", "model"));
    }
  } catch (e) { console.error('Error in dropdown init:', e); }

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

        const qsError = document.getElementById("qs-error");
        if (!year || !make || !model) {
          if (qsError) {
            qsError.textContent = "Please select Year, Make, and Model to continue.";
            qsError.style.display = "block";
          }
          return;
        }
        if (qsError) qsError.style.display = "none";

        const appData = { year, make, model, mileage, province };
        localStorage.setItem("MyPoliciumAppData", JSON.stringify(appData));
        window.location.href = 'calculator.html';
      });
    }
  }

  // 3) Setup FAQ accordions
  setupFAQ();
  generateFAQSchema();

  // 4) Auto load stored data
  if (document.getElementById("estimator")) {
    autoLoadSavedData();
  }
});

async function autoLoadSavedData() {
  const savedData = localStorage.getItem("MyPoliciumAppData");
  if (!savedData) return;
  try {
    const data = JSON.parse(savedData);
    
    // Guarded selectors
    const mileageEl = document.getElementById("mileage");
    const provinceEl = document.getElementById("province");
    const yearEl = document.getElementById("year");
    const makeEl = document.getElementById("make");
    const modelEl = document.getElementById("model");

    if (mileageEl && data.mileage) mileageEl.value = data.mileage;
    if (provinceEl && data.province) provinceEl.value = data.province;
    
    if (yearEl && data.year) {
      yearEl.value = data.year;
      // Triggers makes but we wait for it
      await loadMakes("year", "make", "model");
      
      if (makeEl && data.make) {
        makeEl.value = data.make;
        // Triggers models and we wait for it
        await loadModels("year", "make", "model");
        
        if (modelEl && data.model) {
          modelEl.value = data.model;
        }
      }
    }
  } catch (e) {
    console.warn("Could not parse saved calculator data:", e);
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

// Request tracker to prevent stale async responses from overwriting the UI
let modelRequestTracker = {};

  // Removed handleLeadSubmission

function loadMakes(yearId = "year", makeId = "make", modelId = "model") {
  const makeSelect = document.getElementById(makeId);
  const modelSelect = document.getElementById(modelId);
  
  if (!makeSelect) return Promise.resolve();

  // Reset Model dropdown immediately to ensure consistency
  if (modelSelect) {
    modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';
  }

  const currentValue = makeSelect.value;
  makeSelect.innerHTML = '<option value="" disabled selected>Select Make</option>';

  APPROVED_MAKES.forEach(make => {
    const option = document.createElement("option");
    option.value = make;
    option.textContent = make;
    makeSelect.appendChild(option);
  });

  // Restore value if it exists in the new list (though usually year change means we want user to re-pick make/model)
  if (currentValue && APPROVED_MAKES.includes(currentValue)) {
    makeSelect.value = currentValue;
  }

  return Promise.resolve();
}

function loadModels(yearId = "year", makeId = "make", modelId = "model") {
  const modelSelect = document.getElementById(modelId);
  const yearEl = document.getElementById(yearId);
  const makeEl = document.getElementById(makeId);

  if (!modelSelect || !yearEl || !makeEl) return Promise.resolve();

  // Reset to loading state immediately (Constraint #4)
  modelSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';

  const year = yearEl.value;
  const make = makeEl.value;

  if (!year || !make) {
    modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';
    return Promise.resolve();
  }

  // Request tracking to prevent race conditions (Constraint #4)
  const requestId = Date.now();
  modelRequestTracker[modelId] = requestId;

  const apiMake = MAKE_API_MAPPING[make] || make;
  const makeEncoded = encodeURIComponent(apiMake);

  return fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${makeEncoded}/modelyear/${year}?format=json`)
    .then(res => res.json())
    .then(data => {
      // Abort if a newer request has been started (Constraint #4)
      if (modelRequestTracker[modelId] !== requestId) return;

      modelSelect.innerHTML = '<option value="" disabled selected>Select Model</option>';

      if (!data.Results || data.Results.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No models for this year/make";
        option.disabled = true;
        option.selected = true;
        modelSelect.appendChild(option);
        return;
      }

      const sortedModels = data.Results.sort((a, b) => {
        const nameA = (a.Model_Name || "").trim().toUpperCase();
        const nameB = (b.Model_Name || "").trim().toUpperCase();
        return nameA.localeCompare(nameB);
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
    })
    .catch(err => {
      if (modelRequestTracker[modelId] === requestId) {
        console.error("Model fetch error:", err);
        modelSelect.innerHTML = '<option value="" disabled selected>Error loading models</option>';
      }
    });
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
          const yearSelect = document.getElementById("year");
          if (yearSelect) {
            yearSelect.value = year;
            loadMakes("year", "make", "model").then(() => {
              if (make) {
                const makeSelect = document.getElementById("make");
                if (makeSelect) {
                  const options = Array.from(makeSelect.options);
                  const matchingOption = options.find(opt => opt.value.trim().toUpperCase() === make.trim().toUpperCase());
                  if (matchingOption) {
                    makeSelect.value = matchingOption.value;
                    loadModels("year", "make", "model").then(() => {
                      if (model) {
                        const modelSelect = document.getElementById("model");
                        if (modelSelect) {
                          const modOptions = Array.from(modelSelect.options);
                          const modMatch = modOptions.find(opt => opt.value.trim().toUpperCase() === model.trim().toUpperCase() || opt.value.trim().toUpperCase().includes(model.trim().toUpperCase()));
                          if (modMatch) {
                            modelSelect.value = modMatch.value;
                          }
                        }
                      }
                    });
                  }
                }
              }
            });
          }
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
  const yearEl = document.getElementById("year");
  const makeEl = document.getElementById("make");
  const modelEl = document.getElementById("model");
  const mileageEl = document.getElementById("mileage");
  const provinceEl = document.getElementById("province");
  const offerEl = document.getElementById("insurer-offer");
  const output = document.getElementById("output");

  if (!output) return;

  // Gather values with null safety
  const yearRaw = yearEl ? yearEl.value : "";
  const makeRaw = makeEl ? makeEl.value : "";
  const modelRaw = modelEl ? modelEl.value : "";
  const mileageRaw = mileageEl ? mileageEl.value : "";
  const provinceRaw = provinceEl ? provinceEl.value : "";
  const insurerOfferRaw = offerEl ? offerEl.value : "";

  // Validation Logic (Constraint #5)
  const isMileageEmpty = !mileageRaw || mileageRaw.trim() === "";
  const isLoading = modelRaw === "Loading...";
  const isNoModel = modelRaw === "" || modelRaw === "No models for this year/make" || modelRaw === "Error loading models";

  if (!yearRaw || !makeRaw || isNoModel || isMileageEmpty || isLoading) {
    output.style.display = "block";
    
    let message = "Please fill in all required fields.";
    if (isLoading) message = "Please wait for vehicle models to load.";
    else if (isNoModel) message = "Please select a valid vehicle model.";
    else if (isMileageEmpty) message = "Please provide the vehicle mileage.";

    output.innerHTML = `<div class='result-note' style='color:#b91c1c; background:#fef2f2; padding:12px; border:1px solid #fecaca; border-radius:6px;'>${message}</div>`;
    return;
  }

  // Normalization for calculation
  const year = yearRaw.trim();
  const make = makeRaw.trim();
  const model = modelRaw.trim();
  const mileage = parseInt(mileageRaw.trim());
  const province = provinceRaw.trim();

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
      <div class='result-title' style='color: #b91c1c;'>Professional Appraisal Recommended</div>
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

  // STACKING ORDER: Step 6b - Condition Adjustment
  let conditionMultiplier = 1.0;
  let conditionNet = 0;
  let conditionText = "Condition adjustment: neutral";
  let hasConditionInput = false;
  let isRebuilt = false;

  const condExterior = document.getElementById("cond-exterior");
  const condInterior = document.getElementById("cond-interior");
  const condSeats = document.getElementById("cond-seats");
  const condTires = document.getElementById("cond-tires");
  const condMechanical = document.getElementById("cond-mechanical");
  const condAccident = document.getElementById("cond-accident");

  if (condExterior && condInterior && condSeats && condTires && condMechanical && condAccident) {
    hasConditionInput = true;
    const vExt = parseFloat(condExterior.value) || 0;
    const vInt = parseFloat(condInterior.value) || 0;
    const vSeat = parseFloat(condSeats.value) || 0;
    const vTire = parseFloat(condTires.value) || 0;
    const vMech = parseFloat(condMechanical.value) || 0;
    
    isRebuilt = condAccident.value === "rebuilt_salvage";
    const vAcc = isRebuilt ? -0.35 : (parseFloat(condAccident.value) || 0);
    
    let totalConditionAdj = vExt + vInt + vSeat + vTire + vMech + vAcc;
    
    // Apply caps
    if (isRebuilt) {
      if (totalConditionAdj < -0.35) totalConditionAdj = -0.35;
    } else {
      if (totalConditionAdj < -0.18) totalConditionAdj = -0.18;
    }
    if (totalConditionAdj > 0.03) totalConditionAdj = 0.03;
    
    conditionNet = totalConditionAdj;
    conditionMultiplier = 1 + conditionNet;
    value *= conditionMultiplier;
    
    if (isRebuilt) {
      conditionText = `Condition adjustment: ${Math.round(conditionNet * 100)}% based on rebuilt/salvage history.`;
    } else if (conditionNet < 0) {
      conditionText = `Condition adjustment: ${Math.round(conditionNet * 100)}% based on reported wear`;
    } else if (conditionNet > 0) {
      conditionText = `Condition adjustment: +${Math.round(conditionNet * 100)}% based on reported condition`;
    }
  }

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

      // --- Assessment & Next Step Logic ---
      const insurerOffer = insurerOfferRaw ? parseFloat(insurerOfferRaw.replace(/[^0-9.]/g, "")) : null;
      let assessmentHtml = "";
      let nextStepHtml = "";
      
      if (insurerOffer === null || isNaN(insurerOffer)) {
        // CASE 5: No Offer Provided
        assessmentHtml = `
          <div class="assessment-box">
            <div class="assessment-title">Assessment</div>
            <div class="assessment-explanation">
              This estimate represents a typical market range for your vehicle. 
              Compare this range to your insurer’s offer to determine if it is fair.
            </div>
          </div>
        `;
        nextStepHtml = `
          <div class="next-step-box">
            <div class="next-step-title">Compare your offer</div>
            <div class="next-step-body">Enter your insurer’s offer above to see how it compares to the market range.</div>
            <a href="article-total-loss.html" class="next-step-cta">Learn how settlements work</a>
          </div>
        `;
      } else {
        const p = Math.abs(((insurerOffer - midpoint) / midpoint) * 100);
        const varianceRange = `Approximately ${Math.max(0, Math.floor(p - 2))}–${Math.ceil(p + 2)}%`;
        
        let verdict = "";
        let toneClass = "";
        let explanation = "";
        let nsTitle = "";
        let nsBody = "";
        let nsCtaText = "";
        let nsCtaLink = "";
  
        if (insurerOffer < low) {
          // CASE 1: Offer < Low (BELOW MARKET)
          verdict = "Offer appears below the estimated market range";
          toneClass = "assessment-below";
          explanation = `This offer is ${varianceRange} below expected market value for your vehicle.`;
          nsTitle = "Review Comparables Carefully";
          nsBody = "Your insurer’s offer appears to fall below the expected market range. You may wish to compare additional market listings before making a decision.";
          nsCtaText = "How to Negotiate Your Total Loss";
          nsCtaLink = "negotiate-total-loss.html";
        } else if (insurerOffer >= low && insurerOffer <= midpoint) {
          // CASE 2: Low <= Offer <= Midpoint (CAUTION)
          verdict = "Offer appears on the lower end of market value";
          toneClass = "assessment-caution";
          explanation = `This offer is within range but ${varianceRange} below the typical market average.`;
          nsTitle = "Review carefully";
          nsBody = "This offer is within the estimated range but falls below the typical average. It may be helpful to verify the comparables used.";
          nsCtaText = "What to Check Before Accepting";
          nsCtaLink = "article-total-loss.html";
        } else if (insurerOffer > midpoint && insurerOffer <= high) {
          // CASE 3: Midpoint < Offer <= High (FAIR)
          verdict = "Offer appears to be within a reasonable range";
          toneClass = "assessment-fair";
          explanation = `This offer aligns with expected fair market value (within ${varianceRange}).`;
          nsTitle = "This aligns with market data";
          nsBody = "Your offer falls within expected market value. Before accepting, ensure there are no missing features or condition adjustments.";
          nsCtaText = "Final Checklist Before Accepting";
          nsCtaLink = "article-total-loss.html";
        } else if (insurerOffer > high) {
          // CASE 4: Offer > High (STRONG)
          verdict = "Offer above typical market data";
          toneClass = "assessment-fair";
          explanation = `This offer exceeds typical market expectations by ${varianceRange}.`;
          nsTitle = "Strong offer";
          nsBody = "Your insurer’s offer appears to be above typical market value. This is generally a strong outcome.";
          nsCtaText = "What Happens After You Accept";
          nsCtaLink = "what-happens-after-total-loss.html";
        }
  
        assessmentHtml = `
          <div class="assessment-box ${toneClass}">
            <div class="assessment-title">Assessment</div>
            <div class="assessment-verdict">${verdict}</div>
            <div class="assessment-explanation">${explanation}</div>
          </div>
        `;
        nextStepHtml = `
          <div class="next-step-box">
            <div class="next-step-title">${nsTitle}</div>
            <div class="next-step-body">${nsBody}</div>
            <a href="${nsCtaLink}" class="next-step-cta">${nsCtaText}</a>
          </div>
        `;
      }

    let warningBoxHeader = "";
    if (showWarning) {
      warningBoxHeader = `
        <div class="warning-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="warning-content">
            <span class="warning-title">Valuation Gap Detected</span>
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

    const googleSearchQuery = encodeURIComponent(`${year} ${make} ${model} for sale ${province} used car`);
    const googleSearchUrl = `https://www.google.ca/search?q=${googleSearchQuery}`;
    
    const comparableFinderHtml = `
      <div class="comparable-finder-box" style="margin-top: 24px; margin-bottom: 24px; padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background-color: #f8fafc;">
        <h4 style="margin-top: 0; margin-bottom: 6px; font-size: 1rem; color: var(--primary-navy);">Research Comparable Vehicles</h4>
        <p style="font-size: 0.85rem; color: var(--text-dark); margin-bottom: 16px; line-height: 1.4;">
          Sanity-check this educational estimate by manually reviewing similar local listings. Look for matching year, make, model, trim, mileage, and condition.
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          <a href="${googleSearchUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="text-align: left; background-color: white; padding: 10px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; border: 1px solid #cbd5e1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Search Google for ${year} ${make} ${model}
          </a>
          <a href="https://www.autotrader.ca/" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="text-align: left; background-color: white; padding: 10px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; border: 1px solid #cbd5e1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Search AutoTrader Canada
          </a>
          <a href="https://www.kijijiautos.ca/" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="text-align: left; background-color: white; padding: 10px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; border: 1px solid #cbd5e1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Search Kijiji Autos
          </a>
        </div>

        <div style="background-color: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px; border-radius: 0 4px 4px 0; color: #92400e; font-size: 0.8rem; line-height: 1.4;">
          <strong>Caution:</strong> Dealer asking prices are not always selling prices. An unusually high listing does not automatically represent the vehicle's market value.
        </div>
      </div>
    `;

    const finalHtml = `
      <div class='result-title'>Estimated Fair Market Value Range</div>
      <div class='result-range'>${resultRange}</div>
      <div class='result-subtext'>This estimate reflects typical Canadian market conditions for similar vehicles.</div>

      ${assessmentHtml}
      ${nextStepHtml}

      <div style='margin-bottom: 24px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;'>
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${confidenceColor};"></div>
        <strong>Confidence:</strong> ${confidenceResult}
      </div>

      <div class="valuation-signal" style="margin-bottom: 20px; font-size: 0.8rem; color: #64748b; font-style: italic;">
        Based on vehicle class, mileage, and regional market patterns
      </div>

      <div class='result-meta'><span>Vehicle:</span> <strong>${year} ${make} ${model}</strong></div>
      <div class='result-meta'><span>Mileage:</span> <strong>${Number(mileage).toLocaleString("en-CA")} km</strong></div>
      ${hasConditionInput ? `
      <div class='result-meta' style="margin-top: 8px;">
        <span style="font-weight: 500; color: var(--text-dark);">${conditionText}</span>
        <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 4px; line-height: 1.4;">
          Condition inputs are self-reported and meant only to make the educational estimate more realistic. Actual valuations may weigh condition differently.
        </div>
      </div>
      ` : ''}
      ${isRebuilt ? `
      <div class='result-note' style="margin-top: 8px; font-size: 0.85rem; color: #b91c1c; background: #fef2f2; padding: 10px; border-radius: 6px; border: 1px solid #fecaca;">
        Rebuilt or salvage history can materially affect market value, and this estimate may be less reliable for branded vehicles.
      </div>
      ` : ''}
      
      <div class='insurer-comparison' style="margin-top: 20px;">
        <div class='insurer-label'>Typical insurer valuation range</div>
        <div class='insurer-value'>${insurerRangeStr}</div>
        <div class='insurer-note'>*Market comparison benchmark for settlement review.</div>
      </div>

      ${warningBoxHeader}
      
      ${comparableFinderHtml}

      <div class="result-cta-group">
        <a href="negotiate-total-loss.html" class="btn btn-primary btn-full" style="text-align: center; text-decoration: none;">Learn how to negotiate this value →</a>
        <a href="what-happens-after-total-loss.html" class="btn btn-outline btn-full" style="text-align: center; text-decoration: none; border: 1px solid var(--border-color); color: var(--primary-navy); padding: 12px; border-radius: var(--radius-md);">Total loss payout guide</a>
      </div>

      <div class="trust-boost">
        Independent Educational Benchmark • No insurance affiliation
      </div>

      <div class='result-disclaimer'>
        *This estimate is a data-driven benchmark. Please note that this is an educational estimate. Actual cash value is determined by local comparables and specific vehicle condition. Each insurance company may have its own process and valuation method for calculating the actual cash value for your vehicle.
      </div>
    `;
    
    // Simulate Processing State
    const estimateBtn = document.getElementById("estimate-btn");
    if (estimateBtn) {
      estimateBtn.disabled = true;
      estimateBtn.style.opacity = '0.7';
      estimateBtn.textContent = "Analyzing market conditions...";
    }
    
    output.style.display = "block";
    output.innerHTML = `<div class="loading-state-container">
      <div class="loading-shimmer-pulse"></div>
      <p style="color: var(--text-muted); font-size: 1rem; font-weight: 500;">Cross-referencing regional market data...</p>
    </div>`;
    
    setTimeout(() => {
      output.innerHTML = finalHtml;
      if (estimateBtn) {
        estimateBtn.disabled = false;
        estimateBtn.style.opacity = '1';
        estimateBtn.textContent = "Calculate Fair Market Value";
      }
    }, 600);

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
 * Generates JSON-LD FAQPage schema dynamically from visible .faq-item elements
 * Prevents duplicate schema injection if one already exists.
 */
function generateFAQSchema() {
  // Check if FAQ schema already exists to prevent duplicates
  const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
  for (let script of existingSchemas) {
    try {
      const json = JSON.parse(script.innerHTML);
      if (json['@type'] === 'FAQPage') {
        return; // Schema already exists
      }
    } catch (e) {
      // Ignore parsing errors of other schemas
    }
  }

  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  const mainEntity = [];

  faqItems.forEach(item => {
    const questionEl = item.querySelector('.faq-question span:first-child');
    const answerEl = item.querySelector('.faq-answer');

    if (questionEl && answerEl) {
      // Clean up answer text: remove excessive whitespace and HTML tags if necessary, 
      // but schema supports some HTML. We will use innerHTML and strip scripts/buttons if any,
      // or just plain text to be safe. Plain text is usually safer for pure JSON-LD, 
      // but Google supports basic HTML (a, p, ul) in FAQ schema. 
      // Let's just use textContent to ensure clean, non-breaking JSON.
      const question = questionEl.textContent.trim();
      const answer = answerEl.textContent.trim().replace(/\s+/g, ' ');

      if (question && answer) {
        mainEntity.push({
          "@type": "Question",
          "name": question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": answer
          }
        });
      }
    }
  });

  if (mainEntity.length > 0) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mainEntity
    };

    const script = document.createElement('script');
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }
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
    title: "Ontario Total Loss Settlement Checklist: What to Review Before You Accept",
    excerpt: "Received a total loss offer in Ontario? Use this practical checklist to review your settlement, verify comparables, and avoid common valuation errors before accepting.",
    url: "ontario-total-loss-settlement-checklist.html",
    publishDate: "2026-05-23",
    createdDate: "2026-05-23",
    category: "Total Loss & Vehicle Value",
    featured: false,
    tags: ["total-loss", "acv", "claims-process"]
  },
  {
    title: "What Is Subrogation in Car Insurance Claims?",
    excerpt: "Learn what subrogation means in car insurance, how insurers recover costs from at-fault drivers, and how you might get your deductible back.",
    url: "what-is-subrogation-insurance.html",
    publishDate: "2026-05-01",
    createdDate: "2026-05-01",
    category: "Claims Process",
    featured: false,
    tags: ["claims-process"]
  },
  {
    title: "How to Read an Auto Insurance Repair Estimate",
    excerpt: "Confused by your auto repair estimate? Learn how to decode OEM vs aftermarket parts, labour times, paint blending, and why supplements happen during claims.",
    url: "how-to-read-auto-insurance-repair-estimate.html",
    publishDate: "2026-05-01",
    createdDate: "2026-05-01",
    category: "Repair & Body Shop Process",
    featured: false,
    tags: ["repair-process"]
  },
  {
    title: "How Long Does an Insurance Company Have to Settle a Claim?",
    excerpt: "Waiting on a car insurance payout? Learn how long insurers have to settle a claim, what causes repair delays, and how the total loss timeline works.",
    url: "how-long-to-settle-insurance-claim.html",
    publishDate: "2026-05-01",
    createdDate: "2026-05-01",
    category: "Claims Process",
    featured: true,
    tags: ["claims-process"]
  },
  {
    title: "At-Fault vs. Not-At-Fault Accidents: How They Affect Insurance Rates",
    excerpt: "Learn the difference between at-fault and not-at-fault accidents and how insurance companies determine if a claim will increase your premium.",
    url: "at-fault-vs-not-at-fault-insurance.html",
    publishDate: "2026-05-09",
    createdDate: "2026-05-09",
    category: "Insurance Pricing & Premiums",
    featured: false,
    tags: ["dcpd","fault"]
  },
  {
    title: "Should I File an Insurance Claim for a Minor Accident?",
    excerpt: "Deciding whether to file an insurance claim for a minor scrape or fender bender? Learn the hidden costs, risks, and factors to consider before calling your insurer.",
    url: "should-i-file-claim-minor-accident.html",
    publishDate: "2026-05-01",
    createdDate: "2026-05-01",
    category: "Accident Scenarios",
    featured: false,
    tags: ["claims-process"]
  },
  {
    title: "How to Lower Your Car Insurance Premium Legally",
    excerpt: "Learn practical, legitimate ways to lower your car insurance premium without resorting to gimmicks or sacrificing essential coverage.",
    url: "how-to-lower-car-insurance-premium.html",
    publishDate: "2026-05-01",
    createdDate: "2026-05-01",
    category: "Insurance Pricing & Premiums",
    featured: true,
    tags: ["pricing"]
  },
  {
    title: "Why Is My Car Insurance So Expensive?",
    excerpt: "Learn exactly how insurance companies calculate your auto insurance premium and the hidden factors that make car insurance so expensive.",
    url: "why-is-car-insurance-expensive.html",
    publishDate: "2026-05-01",
    createdDate: "2026-05-01",
    category: "Insurance Pricing & Premiums",
    featured: false,
    tags: ["pricing"]
  },
  {
    title: "How Do Speeding Tickets Affect Car Insurance Rates?",
    excerpt: "Learn exactly how speeding tickets and other driving convictions affect your car insurance premium and how insurers evaluate driving risk.",
    url: "how-do-speeding-tickets-affect-insurance.html",
    publishDate: "2026-05-01",
    createdDate: "2026-05-01",
    category: "Insurance Pricing & Premiums",
    featured: false,
    tags: ["pricing"]
  },
  {
    title: "What Is a Salvage Title and Can You Keep Your Total Loss Vehicle?",
    excerpt: "Learn what a salvage title is, how owner-retained salvage buybacks work, and whether keeping your totaled car makes financial sense.",
    url: "salvage-title-keep-total-loss-vehicle.html",
    publishDate: "2026-05-08",
    createdDate: "2026-05-08",
    category: "Total Loss & Vehicle Value",
    featured: false,
    tags: ["total-loss"]
  },
  {
    title: "What Happens If I Disagree With My Total Loss Valuation?",
    excerpt: "Learn what happens if you disagree with your insurance company's total loss settlement offer and how to review the valuation process.",
    url: "dispute-total-loss-value.html",
    publishDate: "2026-05-04",
    createdDate: "2026-05-04",
    category: "Total Loss & Vehicle Value",
    featured: false,
    tags: ["total-loss","acv"]
  },
  {
    title: "How to Find Comparables for a Total Loss Vehicle",
    excerpt: "Learn how insurance companies use comparable vehicles to determine your car's actual cash value after a total loss.",
    url: "how-to-find-comparables-total-loss.html",
    publishDate: "2026-05-02",
    createdDate: "2026-05-02",
    category: "Total Loss & Vehicle Value",
    featured: false,
    tags: ["total-loss","acv"]
  },
  {
    title: "What Happens If You Get Into an Accident in the USA as a Canadian?",
    excerpt: "Learn how Canadian auto insurance works if you get into an accident in the USA, including liability, rentals, and total loss complications.",
    url: "accident-in-usa-as-canadian.html",
    publishDate: "2026-05-01",
    createdDate: "2026-05-01",
    category: "Cross-Border & Travel",
    featured: false,
    tags: ["insurance-basics"]
  },
  {
    title: "What Is OPCF 20 Loss of Use Coverage?",
    excerpt: "Learn what OPCF 20 Loss of Use coverage is, how rental reimbursement works during an insurance claim, and what happens if your rental limit runs out.",
    url: "opcf-20-loss-of-use-coverage.html",
    publishDate: "2026-04-30",
    createdDate: "2026-04-30",
    category: "Ontario Auto Insurance",
    featured: false,
    tags: ["rental-coverage","coverage-basics"]
  },
  {
    title: "What Is Direct Compensation Property Damage (DCPD)?",
    excerpt: "Learn what Direct Compensation Property Damage (DCPD) is, how Ontario's no-fault insurance system works, and who actually pays for your car repairs.",
    url: "dcpd-coverage.html",
    publishDate: "2026-04-15",
    createdDate: "2026-04-15",
    category: "Ontario Auto Insurance",
    featured: false,
    tags: ["dcpd"]
  },
  {
    title: "How Do Car Insurance Deductibles Work?",
    excerpt: "Learn how car insurance deductibles work, how they affect your premium, and how to choose the right deductible for your vehicle.",
    url: "how-do-car-insurance-deductibles-work.html",
    publishDate: "2026-04-14",
    createdDate: "2026-04-14",
    category: "Coverage Basics",
    featured: false,
    tags: ["deductibles"]
  },
  {
    title: "What Is GAP Insurance and Do You Need It?",
    excerpt: "Learn what GAP insurance is, how it covers the difference between your car loan and actual cash value, and if you actually need it.",
    url: "gap-insurance.html",
    publishDate: "2026-04-18",
    createdDate: "2026-04-18",
    category: "Coverage Basics",
    featured: false,
    tags: ["gap-insurance"]
  },
  {
    title: "Comprehensive vs. Collision Insurance: What\'s the Difference?",
    excerpt: "Learn the difference between comprehensive and collision auto insurance, what each coverage protects, and how to decide if you still need them.",
    url: "comprehensive-vs-collision-insurance.html",
    publishDate: "2026-04-20",
    createdDate: "2026-04-20",
    category: "Coverage Basics",
    featured: false,
    tags: ["coverage-basics"]
  },
  {
    title: "What Happens If Someone Else Drives My Car and Crashes?",
    excerpt: "Learn what happens if a friend or family member crashes your car, how permissive use works, and whose insurance pays for the damage.",
    url: "someone-else-driving-my-car-accident.html",
    publishDate: "2026-04-22",
    createdDate: "2026-04-22",
    category: "Accident Scenarios",
    featured: false,
    tags: ["insurance-basics"]
  },
  {
    title: "What To Do If You're Hit By an Uninsured Driver",
    excerpt: "Learn what happens if you're hit by an uninsured driver, how uninsured motorist coverage works, and how to handle the insurance claim process.",
    url: "hit-by-uninsured-driver.html",
    publishDate: "2026-04-24",
    createdDate: "2026-04-24",
    category: "Accident Scenarios",
    featured: false,
    tags: ["uninsured-driver"]
  },
  {
    title: "Rear-End Collisions: Who Is At Fault?",
    excerpt: "Learn who is at fault in a rear-end collision, how your insurance handles the claim, and what happens when multiple cars are involved in a pileup.",
    url: "rear-end-collisions-who-is-at-fault.html",
    publishDate: "2026-04-26",
    createdDate: "2026-04-26",
    category: "Accident Scenarios",
    featured: false,
    tags: ["fault","coverage-basics"]
  },
  {
    title: "What Happens If Someone Hits Your Parked Car?",
    excerpt: "Discover what happens if someone hits your parked car, how insurance handles hit-and-runs, and if your rates will go up after a parking lot accident.",
    url: "what-happens-if-someone-hits-your-parked-car.html",
    publishDate: "2026-04-28",
    createdDate: "2026-04-28",
    category: "Accident Scenarios",
    featured: false,
    tags: ["dcpd"]
  },
  {
    title: "What Is Actual Cash Value (ACV) and How Is It Calculated?",
    excerpt: "If your car is written off, the amount you receive is based on Actual Cash Value. Learn how ACV is calculated and why it matters for your claim.",
    url: "what-is-actual-cash-value.html",
    publishDate: "2026-04-02",
    createdDate: "2026-04-02",
    category: "Total Loss & Vehicle Value",
    featured: true,
    tags: ["acv"]
  },
  {
    title: "What Is OPCF 43 Depreciation Waiver and Is It Worth It?",
    excerpt: "If you have a newer vehicle, there\'s a good chance you\'ve heard about OPCF 43, also known as a depreciation waiver. But what exactly is it, and is it actually worth having?",
    url: "article-opcf-43.html",
    publishDate: "2026-04-12",
    createdDate: "2026-04-12",
    category: "Ontario Auto Insurance",
    featured: false,
    tags: ["coverage-basics"]
  },
  {
    title: "What Happens After Your Car Is Declared a Total Loss?",
    excerpt: "If your car has been written off, you are probably wondering what actually happens next. Learn about the valuation process, salvage branding, and what happens to your vehicle after the claim.",
    url: "what-happens-after-total-loss.html",
    publishDate: "2026-04-10",
    createdDate: "2026-04-10",
    category: "Total Loss & Vehicle Value",
    featured: false,
    tags: ["total-loss"]
  },
  {
    title: "Can You Negotiate a Total Loss Settlement?",
    excerpt: "One of the first things you\'ll look at is the settlement amount and think, \"this feels low.\" Learn how to approach the negotiation process with real market evidence.",
    url: "negotiate-total-loss.html",
    publishDate: "2026-04-08",
    createdDate: "2026-04-08",
    category: "Total Loss & Vehicle Value",
    featured: true,
    tags: ["total-loss","claims-process"]
  },
  {
    title: "How Much Will Insurance Pay for Your Car After a Total Loss?",
    excerpt: "If your car has been written off after an accident, the first thing on your mind is probably: \"How much am I actually getting back?\" Explore our full breakdown of Actual Cash Value and how the payout process works.",
    url: "article-total-loss.html",
    publishDate: "2026-04-05",
    createdDate: "2026-04-05",
    category: "Total Loss & Vehicle Value",
    featured: false,
    tags: ["total-loss"]
  },
  {
    title: "ACV vs Replacement Cost: What Drivers Need to Know",
    excerpt: "Learn the difference between actual cash value (ACV) and replacement cost, and why your auto insurance settlement is generally based on ACV after a total loss.",
    url: "acv-vs-replacement-cost.html",
    publishDate: "2026-05-08",
    createdDate: "2026-05-08",
    category: "Total Loss & Vehicle Value",
    featured: false,
    tags: ["acv", "total-loss"]
  }
];

function renderArticles(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

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
          <span class="read-more">Read the Full Article &rarr;</span>
        </div>
      </a>
    `;
    if (index < displayArticles.length - 1) {
      html += `<div style="margin-bottom: 32px;"></div>`;
    }
  });

  container.innerHTML = html;
}

// Learn Hub Logic
function initLearnHub() {
  const searchInput = document.getElementById('learn-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderLearnHubArticles(e.target.value, window.currentCategory || 'All');
    });
  }
}

function setPopularTopic(term) {
  const searchInput = document.getElementById('learn-search');
  if (searchInput) {
    searchInput.value = term;
    setCategoryFilter('All');
  }
}

function setCategoryFilter(category) {
  window.currentCategory = category;
  
  // Update UI chips
  document.querySelectorAll('.category-chip').forEach(chip => {
    if (chip.dataset.category === category) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  const searchInput = document.getElementById('learn-search');
  renderLearnHubArticles(searchInput ? searchInput.value : '', category);
}

function renderLearnHubArticles(searchTerm = '', activeCategory = 'All') {
  const cornerstoneContainer = document.getElementById('cornerstone-articles-container');
  const featuredContainer = document.getElementById('featured-articles-container');
  const categoryContainer = document.getElementById('categorized-articles-container');
  if (!categoryContainer) return;
  searchTerm = searchTerm.toLowerCase().trim();
  let filteredArticles = [...ARTICLES].sort((a, b) => {
    const valA = a.publishDate || a.createdDate || '';
    const valB = b.publishDate || b.createdDate || '';
    return valB.localeCompare(valA);
  });
  if (searchTerm) {
    filteredArticles = filteredArticles.filter(a => a.title.toLowerCase().includes(searchTerm) || a.excerpt.toLowerCase().includes(searchTerm));
  }
  if (activeCategory !== 'All') {
    filteredArticles = filteredArticles.filter(a => a.category === activeCategory);
  }
  if (searchTerm || activeCategory !== 'All') {
    if (featuredContainer && featuredContainer.parentElement) featuredContainer.parentElement.style.display = 'none';
    if (cornerstoneContainer && cornerstoneContainer.parentElement) cornerstoneContainer.parentElement.style.display = 'none';
    if (filteredArticles.length === 0) {
      categoryContainer.innerHTML = '<div class="empty-state"><h3>No articles found</h3><p>We couldn\'t find any articles matching your criteria.</p><button class="btn btn-outline" style="width:auto; margin-top:16px;" onclick="document.getElementById(\'learn-search\').value=\'\'; setCategoryFilter(\'All\');">Clear Filters</button></div>';
      return;
    }
    const groups = {};
    filteredArticles.forEach(article => { if (!groups[article.category]) groups[article.category] = []; groups[article.category].push(article); });
    let html = '';
    for (const [cat, arts] of Object.entries(groups)) {
      html += '<div class="category-section"><h2 class="category-header">' + cat + '</h2><div class="article-grid">';
      arts.forEach(article => { html += generateArticleCard(article); });
      html += '</div></div>';
    }
    categoryContainer.innerHTML = html;
  } else {
    if (featuredContainer && featuredContainer.parentElement) featuredContainer.parentElement.style.display = 'block';
    if (cornerstoneContainer && cornerstoneContainer.parentElement) cornerstoneContainer.parentElement.style.display = 'block';
    const pillars = filteredArticles.filter(a => a.isPillar);
    const featured = filteredArticles.filter(a => a.featured && !a.isPillar);
    const nonFeatured = filteredArticles.filter(a => !a.featured && !a.isPillar);
    if (cornerstoneContainer && pillars.length > 0) {
      let pHtml = '<div class="featured-grid">';
      pillars.forEach(article => { pHtml += generateFeaturedCard(article, "Cornerstone Guide"); });
      pHtml += '</div>';
      cornerstoneContainer.innerHTML = pHtml;
    } else if (cornerstoneContainer) { cornerstoneContainer.parentElement.style.display = 'none'; }
    if (featuredContainer && featured.length > 0) {
      let fHtml = '<div class="featured-grid">';
      featured.forEach(article => { fHtml += generateFeaturedCard(article, "Featured Guide"); });
      fHtml += '</div>';
      featuredContainer.innerHTML = fHtml;
    } else if (featuredContainer) { featuredContainer.innerHTML = ''; }
    const groups = {};
    nonFeatured.forEach(article => { if (!groups[article.category]) groups[article.category] = []; groups[article.category].push(article); });
    const categoryOrder = ["Total Loss & Vehicle Value", "Claims Process", "Ontario Auto Insurance", "Insurance Pricing & Premiums", "Coverage Basics", "Accident Scenarios", "Cross-Border & Travel", "Repair & Body Shop Process"];
    let html = '';
    categoryOrder.forEach(cat => {
      if (groups[cat] && groups[cat].length > 0) {
        html += '<div class="category-section"><h2 class="category-header">' + cat + '</h2><div class="article-grid">';
        groups[cat].forEach(article => { html += generateArticleCard(article); });
        html += '</div></div>';
      }
    });
    categoryContainer.innerHTML = html;
  }
}
function renderRelatedArticles() {
  const container = document.getElementById('related-articles-container');
  if (!container) return;

  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  const currentArticle = ARTICLES.find(a => a.url === currentFile);
  if (!currentArticle) return; 

  const currentTags = currentArticle.tags || [];
  const currentCat = currentArticle.category;

  let scoredArticles = [];
  ARTICLES.forEach(article => {
    if (article.url === currentFile) return;

    let score = 0;
    if (article.category === currentCat) score += 2;
    if (article.isPillar) score += 1.5; 

    const articleTags = article.tags || [];
    articleTags.forEach(tag => {
      if (currentTags.includes(tag)) score += 1;
    });

    if (score > 0) {
      scoredArticles.push({ article, score });
    }
  });

  scoredArticles.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return 0.5 - Math.random(); 
  });

  const topRecommendations = scoredArticles.slice(0, 3).map(sa => sa.article);

  if (topRecommendations.length < 3) {
    const fallbacks = [...ARTICLES].filter(a => a.url !== currentFile && !topRecommendations.includes(a));
    fallbacks.sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0));
    while (topRecommendations.length < 3 && fallbacks.length > 0) {
      topRecommendations.push(fallbacks.shift());
    }
  }

  let html = `
    <section class="related-content-section">
      <h3 class="related-content-title">Continue Your Research</h3>
      <div class="related-articles-grid">
  `;

  topRecommendations.forEach(article => {
    const readTime = Math.max(3, Math.ceil((article.excerpt || "").length / 30)) + ' min read';
    html += `
      <a href="${article.url}" class="related-article-card-link">
        <div class="related-article-card">
          <div class="related-meta">
            <span class="related-cat">${article.category || 'General'}</span>
            <span class="related-time">${readTime}</span>
          </div>
          <h4>${article.title}</h4>
          <p>${article.excerpt.substring(0, 90)}...</p>
        </div>
      </a>
    `;
  });

  html += `
      </div>
    </section>
  `;

  container.innerHTML = html;
}

function generateArticleCard(article) {
  const dateStr = article.publishDate ? `<span class="card-date">Updated: ${formatDate(article.publishDate)}</span>` : '';
  const readTime = Math.max(3, Math.ceil((article.excerpt || "").length / 30)) + ' min read';
  
  return `
    <a href="${article.url}" class="article-card-link">
      <div class="article-card">
        <div class="article-meta">
          <span class="meta-cat">${article.category || 'General'}</span>
          <span class="meta-time">${readTime}</span>
        </div>
        ${dateStr}
        <h4>${article.title}</h4>
        <p>${article.excerpt}</p>
        <span class="read-more">Read Guide &rarr;</span>
      </div>
    </a>
  `;
}

function generateFeaturedCard(article, badgeText = "Featured Guide") {
  const dateStr = article.publishDate ? `<span class="card-date">Updated: ${formatDate(article.publishDate)}</span>` : '';
  const readTime = Math.max(4, Math.ceil((article.excerpt || "").length / 25)) + ' min read';

  return `
    <a href="${article.url}" class="article-card-link featured-link">
      <div class="featured-article-card">
        <div class="featured-card-content">
          <div class="featured-header-row">
            <div class="featured-badge">' + badgeText + '</div>
            <div class="article-meta">
              <span class="meta-cat">${article.category || 'General'}</span>
              <span class="meta-time">${readTime}</span>
            </div>
          </div>
          ${dateStr}
          <h3>${article.title}</h3>
          <p>${article.excerpt}</p>
          <span class="read-more">Read Complete Guide &rarr;</span>
        </div>
      </div>
    </a>
  `;
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString + 'T00:00:00Z').toLocaleDateString('en-US', options);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('learn-search')) {
    initLearnHub();
    setCategoryFilter('All');
  }
});


function generateArticleSchema() {
  if (!document.querySelector('.article-content')) return;

  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  const article = typeof ARTICLES !== 'undefined' ? ARTICLES.find(a => a.url === currentFile) : null;
  if (!article) return;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "datePublished": article.publishDate || "2026-05-01",
    "dateModified": article.createdDate || article.publishDate || "2026-05-01",
    "url": `https://mypolicium.com/${article.url}`,
    "publisher": {
      "@type": "Organization",
      "name": "MyPolicium",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mypolicium.com/Logo1.jpg"
      }
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}
