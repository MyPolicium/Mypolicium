document.addEventListener('DOMContentLoaded', () => {
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
});

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
                    if (modMatch) modelSelect.value = modMatch.value;
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

  // Basic depreciation logic
  let msrp = 30000;
  let value = msrp * 0.8;
  for (let i = 2; i <= age; i++) value -= value * 0.12;

  if (mileage > 200000) value *= 0.7;
  else if (mileage > 0 && mileage < 80000) value *= 1.1;

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

  // Re-trigger animation
  output.style.animation = 'none';
  output.offsetHeight; /* trigger reflow */
  output.style.animation = null;

  output.style.display = "block";
  output.innerHTML = `
    <div class='result-title'>Estimated Actual Cash Value</div>
    <div class='result-range'>${formatter.format(low)} – ${formatter.format(high)}</div>
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
