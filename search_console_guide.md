# MyPolicium Search Console & Indexation Guide

This guide details the steps required to properly configure Google Search Console (GSC) for MyPolicium, submit your sitemap, request initial indexation, and monitor early performance.

## 1. Domain Property Setup

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property**.
3. Select the **Domain** property type (do not use URL prefix).
4. Enter `mypolicium.com`.
5. Follow the instructions to add a TXT record to your DNS provider to verify ownership.
6. Once verified, this property will automatically capture data for `http`, `https`, `www`, and non-`www` variations (though we have explicitly canonicalized the site to `https://mypolicium.com`).

## 2. Sitemap Submission

1. Once the property is verified, select it in the top left dropdown.
2. In the left-hand menu, navigate to **Indexing > Sitemaps**.
3. Under "Add a new sitemap", enter `sitemap.xml`.
4. Click **Submit**. 
5. Google will initially report "Success." The "Discovered URLs" count should populate with **33 URLs** over the next few hours or days.

## 3. Indexation Prioritization

To kickstart Google's crawl engine, manually request indexing for your most critical cornerstone pages using the **URL Inspection Tool** (search bar at the top of GSC).

**Immediate Priority (Request Indexing manually):**
1. `https://mypolicium.com/` (Homepage)
2. `https://mypolicium.com/calculator.html`
3. `https://mypolicium.com/learn.html`
4. `https://mypolicium.com/what-is-actual-cash-value.html`
5. `https://mypolicium.com/how-to-find-comparables-total-loss.html`
6. `https://mypolicium.com/dispute-total-loss-value.html`
7. `https://mypolicium.com/why-is-car-insurance-expensive.html`
8. `https://mypolicium.com/how-do-car-insurance-deductibles-work.html`
9. `https://mypolicium.com/dcpd-coverage.html`

*Note: For the remaining 20+ articles, allow the automated crawl bot to discover them via the sitemap and internal related-article links.*

## 4. Monitoring Priorities (First 30–60 Days)

Avoid making drastic structural changes while Google evaluates the new content architecture. Monitor the following:

### Crawl & Index Coverage
- **Location:** `Indexing > Pages`.
- **Goal:** Watch the "Indexed" count rise steadily toward 33.
- **Note:** Do not panic if pages are temporarily listed as "Discovered - currently not indexed" or "Crawled - currently not indexed". This is completely normal for a new site architecture.

### FAQ Rich Result Monitoring
- **Location:** `Enhancements > FAQ` (This tab will appear automatically once Google crawls a page with your FAQ schema).
- **Goal:** Ensure there are 0 "Invalid" items. Valid items mean your accordions are actively showing up directly in Google search results.

### Early SEO KPIs
- **Location:** `Performance > Search results`.
- **Metrics to Watch:**
  - **Impressions (Total)**: This is the most important early metric. It proves Google trusts your content enough to display it, even if it's on page 4 or 5 initially.
  - **Long-tail Queries**: Look for highly specific queries appearing in the "Queries" tab (e.g., "what happens if I dispute opcf 43 value"). This proves the topical clustering is working.
  - **Clicks**: Clicks will naturally lag behind impressions by 4-8 weeks as authority compounds.

## 5. Lightweight Analytics Recommendations
The goal is to keep MyPolicium fast, clean, and educational. 
- Avoid bloated tracking scripts like heatmaps (e.g., Hotjar) or heavy marketing pixels (Meta/TikTok).
- Use **Google Search Console** as your primary source of truth for SEO performance.
- Use a single, lightweight analytics tag (like your existing GA4 snippet `gtag.js`) strictly for measuring session duration and top-performing entry pages.
