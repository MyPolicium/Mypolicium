const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM';

const faqsData = {
  "what-is-actual-cash-value.html": [
    {
      q: "Is Actual Cash Value the same as replacement cost?",
      a: "No. Replacement cost pays for a brand new vehicle, while Actual Cash Value pays what your specific vehicle was worth on the open market immediately before the accident, factoring in depreciation."
    },
    {
      q: "How do adjusters calculate depreciation for ACV?",
      a: "Adjusters typically use proprietary software that factors in your vehicle's age, mileage, trim level, and pre-existing wear and tear compared to similar vehicles currently for sale in your region."
    },
    {
      q: "Does recent maintenance increase my car's Actual Cash Value?",
      a: "Generally, standard maintenance like oil changes or new brakes does not significantly increase ACV because it is considered a basic expectation of ownership. However, major recent investments like a brand new engine or transmission might slightly adjust the valuation if you provide receipts."
    },
    {
      q: "Can I negotiate the ACV my insurance company offers?",
      a: "Yes. The initial ACV offer is based on the insurer's research, but if you can provide evidence of comparable vehicles selling for more in your local market, or receipts for recent major upgrades, you can often negotiate a higher settlement."
    }
  ],
  "how-to-find-comparables-total-loss.html": [
    {
      q: "How far away can a comparable vehicle be?",
      a: "Generally, adjusters look for comparable vehicles within a 50 to 100-kilometer radius of your postal code. If your vehicle is rare, they may expand the search radius provincially or nationally."
    },
    {
      q: "Do dealer asking prices represent true Actual Cash Value?",
      a: "Not exactly. Dealer asking prices often include retail markup and room for negotiation. Insurers typically apply a negotiation deduction to advertised dealer prices to reflect what the car would actually sell for."
    },
    {
      q: "Can I use private sales as comparables?",
      a: "While you can present private sales, insurers prefer dealership listings because they represent verifiable, structured market data. Private listings are often seen as less reliable due to unverified conditions and pricing."
    },
    {
      q: "What if I can't find any comparables for my older car?",
      a: "If exact comparables aren't available, insurers will look at similar models or use historical valuation guides. You can also hire an independent appraiser to determine the market value based on condition and historical data."
    }
  ],
  "dispute-total-loss-value.html": [
    {
      q: "How long do I have to accept a total loss settlement?",
      a: "While timelines vary by policy, you generally do not have to accept the first offer immediately. However, keeping the claim open may result in your insurer cutting off your rental vehicle coverage after a certain number of days."
    },
    {
      q: "Can I hire my own appraiser if I disagree with the value?",
      a: "Yes. Most policies include an \"Appraisal Clause\" that allows you to hire an independent appraiser if you and your insurer cannot agree on the actual cash value. The two appraisers will then attempt to reach a binding agreement."
    },
    {
      q: "Will complaining to a manager get me a higher payout?",
      a: "Not necessarily. Total loss payouts are based on market data, not emotional appeals. The most effective way to increase your settlement is to provide objective evidence, such as comparable vehicle listings or proof of major recent upgrades."
    },
    {
      q: "Do I still have to pay my deductible if I dispute the value?",
      a: "Yes, your deductible applies to the physical damage claim regardless of whether you dispute the final payout amount. It will simply be subtracted from the final agreed-upon actual cash value."
    }
  ],
  "why-is-car-insurance-expensive.html": [
    {
      q: "Why did my insurance go up if I haven't had any accidents?",
      a: "Insurance rates are influenced by regional trends. If your area experiences an increase in auto thefts, severe weather claims, or higher repair costs, insurers may raise base rates for all drivers in that postal code to cover the increased risk pool."
    },
    {
      q: "Does the color of my car affect my insurance premium?",
      a: "No. This is a common myth. Insurers do not ask for or use the color of your vehicle to calculate your premium. They focus on the make, model, year, and its statistical history of claims and theft."
    },
    {
      q: "Will my premium drop when my car gets older?",
      a: "Not always. While the actual cash value of your car decreases, the cost of liability coverage and medical benefits often continues to rise due to inflation. Additionally, older cars lack modern safety features, which can impact pricing."
    },
    {
      q: "Do parking tickets make my insurance more expensive?",
      a: "No. Parking tickets are municipal infractions and do not affect your driving record or insurance premium. However, moving violations like speeding or careless driving will typically cause your rates to increase."
    }
  ],
  "comprehensive-vs-collision-insurance.html": [
    {
      q: "Does comprehensive insurance cover hit-and-runs?",
      a: "No, hit-and-runs are typically covered under collision insurance (or uninsured motorist coverage in some regions) because they involve a collision with another vehicle, even if the other driver flees the scene."
    },
    {
      q: "Do I have to pay a deductible for a windshield repair?",
      a: "This depends on your policy. Windshield damage falls under comprehensive coverage, but many insurers will waive the deductible if the glass can be repaired rather than fully replaced."
    },
    {
      q: "Can I drop collision coverage but keep comprehensive?",
      a: "Yes. Many drivers of older vehicles choose to drop collision coverage to save money, but maintain comprehensive coverage because it is generally inexpensive and protects against unpredictable events like theft, fire, and weather damage."
    },
    {
      q: "Will a comprehensive claim increase my premium?",
      a: "Generally, comprehensive claims (like hail damage or theft) do not increase your premium because they are considered \"not-at-fault\" and out of your control. However, filing multiple comprehensive claims in a short period could lead an insurer to view you as a higher risk."
    }
  ],
  "should-i-file-claim-minor-accident.html": [
    {
      q: "How long do I have to decide if I want to file a claim?",
      a: "While policies require you to report accidents promptly, you generally have up to a year to officially file a claim for physical damage. However, waiting too long can complicate the investigation and make it harder to prove the damage is from that specific accident."
    },
    {
      q: "Will my rates go up if I file a not-at-fault claim?",
      a: "Typically, a single not-at-fault claim will not directly increase your premium. However, filing multiple not-at-fault claims can cause you to lose claims-free discounts, indirectly raising your overall cost."
    },
    {
      q: "Can I cancel a claim after I've reported it?",
      a: "Yes, you can often withdraw a claim if the insurer hasn't made any payouts. However, the accident will still remain on your insurance record as a reported incident with a $0 payout, which could impact future underwriting decisions."
    },
    {
      q: "Is a private cash settlement a good idea?",
      a: "Private settlements carry significant risk. If the other driver discovers hidden structural damage later or decides to report the accident to their insurer anyway, you could face out-of-pocket costs and potential policy complications for failing to report the incident."
    }
  ],
  "dcpd-coverage.html": [
    {
      q: "Does DCPD cover me if I am at fault for the accident?",
      a: "No. Direct Compensation Property Damage (DCPD) only covers the damage to your vehicle to the extent that you are not at fault. If you are 100% at fault, your collision coverage would apply instead."
    },
    {
      q: "Do I have to pay a deductible under DCPD?",
      a: "In Ontario, standard DCPD coverage usually has a $0 deductible, meaning your repairs are fully covered without out-of-pocket costs if you are not at fault. However, some drivers opt for a DCPD deductible to lower their premiums."
    },
    {
      q: "What happens if I am deemed 50% at fault?",
      a: "If fault is split 50/50, your DCPD coverage will pay for 50% of your vehicle's damage. The remaining 50% would fall under your collision coverage, and you would be responsible for 50% of your collision deductible."
    },
    {
      q: "Does DCPD apply if someone hits my car while it's parked?",
      a: "Yes, if your vehicle is legally parked and struck by another identified insured driver, you are considered 0% at fault, and the damage is typically covered under your DCPD without a deductible."
    }
  ],
  "accident-in-usa-as-canadian.html": [
    {
      q: "Will my Canadian car insurance cover a rental car in the USA?",
      a: "Yes, if your policy includes OPCF 27 (Liability for Damage to Non-Owned Automobiles), your coverage typically extends to rental vehicles in the US, allowing you to decline the rental company's expensive collision damage waiver."
    },
    {
      q: "What happens if my car is totaled in the US?",
      a: "The claims process is the same, but the logistics are complex. Your insurer typically determines the actual cash value based on Canadian market data, handles the settlement in Canadian dollars, and manages the cross-border salvage disposal of the wrecked vehicle."
    },
    {
      q: "How long does a cross-border insurance claim take?",
      a: "Cross-border claims often take significantly longer than domestic claims. Delays are common due to coordinating with foreign police departments, cross-border towing logistics, and currency exchange complications."
    },
    {
      q: "Do I need to buy extra medical coverage when driving to the US?",
      a: "While your Canadian auto insurance includes statutory accident benefits for injuries, US medical costs are notoriously high. It is highly recommended to purchase dedicated travel health insurance to supplement your auto policy when crossing the border."
    }
  ]
};

for (const [filename, faqs] of Object.entries(faqsData)) {
  const filePath = path.join(targetDir, filename);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let faqHtml = `
        <!-- Optional FAQ Section -->
        <section class="info-section">
          <h2>Frequently Asked Questions</h2>
`;
    
    faqs.forEach(faq => {
      faqHtml += `
          <div class="faq-item">
            <button class="faq-question">
              <span>${faq.q}</span>
              <span class="faq-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </span>
            </button>
            <div class="faq-answer">
              <p>${faq.a}</p>
            </div>
          </div>
`;
    });

    faqHtml += `        </section>\n\n        `;

    // Attempt to find existing FAQ block
    let startIdx = content.indexOf('<!-- Optional FAQ Section -->');
    if (startIdx === -1) startIdx = content.indexOf('<section class="info-section">\n          <h2>Frequently Asked Questions');
    
    const loopIndex = content.indexOf('<section class="article-loop-section">');

    if (startIdx !== -1 && loopIndex !== -1 && startIdx < loopIndex) {
      // Replace existing
      const newContent = content.substring(0, startIdx) + faqHtml + content.substring(loopIndex);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Replaced FAQs in ${filename}`);
    } else if (loopIndex !== -1) {
      // Inject before loop if no existing FAQ
      // let's look for <hr> right before it
      const hrIndex = content.lastIndexOf('<hr>', loopIndex);
      if (hrIndex !== -1 && hrIndex > loopIndex - 200) {
        faqHtml = '<hr>\n' + faqHtml;
        const newContent = content.substring(0, hrIndex) + faqHtml + content.substring(loopIndex);
        fs.writeFileSync(filePath, newContent, 'utf8');
      } else {
        const newContent = content.substring(0, loopIndex) + '<hr>\n' + faqHtml + content.substring(loopIndex);
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
      console.log(`Injected FAQs in ${filename}`);
    } else {
      console.log(`Could not find insertion point in ${filename}`);
    }
  } else {
    console.log(`File not found: ${filename}`);
  }
}
