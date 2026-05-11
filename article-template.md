# MyPolicium SEO Article Template & Guidelines

This template outlines the standard structure and editorial guidelines for all future MyPolicium educational articles.

## Editorial Guidelines

1. **Tone**: Human, conversational, and practical. Avoid robotic phrasing, excessive jargon, and generic AI-generated styles. Write as an experienced, calm, and objective insurance professional explaining concepts to a friend.
2. **SEO Optimization**: Do not keyword stuff. Use the target keyword naturally in the title, intro, and a few subheadings. Use related semantic keywords naturally throughout the text.
3. **Positioning**: Always frame information as educational and objective. 
4. **Risk/Liability**: Avoid giving direct legal or appraisal advice. Use low-liability language (e.g., "typically," "in most cases," "generally," "may affect").
5. **Internal Linking**: Link naturally to at least 3-5 other internal articles and the calculator whenever relevant. Anchor text should flow naturally in the sentence.

## Article Structure Template

### SEO Metadata
- **SEO Title**: [Target Keyword] | MyPolicium (Max 60 characters)
- **Meta Description**: [1-2 sentences summarizing the article and including the target keyword. Max 155 characters.]
- **Target Keyword**: [Primary Keyword]
- **Related Keywords**: [Secondary Keyword 1, Secondary Keyword 2, etc.]

### HTML Structure
*Refer to `article-template.html` for the exact code structure.*

#### 1. Title & Meta Info
- Main H1 Title (Engaging, includes keyword)
- Date Published (e.g., Published: May 15, 2026)

#### 2. Introduction
- Hook the reader by addressing their immediate problem or question.
- Briefly introduce the concept and why it matters.
- Include the target keyword naturally.

#### 3. Core Explanation (H2s & H3s)
- Break down the topic into easy-to-digest sections.
- Use bullet points where appropriate for scanability.
- Include a section detailing **Real-world claim nuances** (e.g., "Where People Make Mistakes" or "The Part Most People Miss"). This adds human experience and depth beyond standard definitions.

#### 4. Mid-Article CTA (Optional but recommended)
- A natural text link or small call-out pointing to the calculator as an educational tool to test what they've just learned.

#### 5. FAQ Section (H2)
- Include 3-4 Frequently Asked Questions related to the topic.
- Format using the established FAQ accordion HTML.

#### 6. Final Thoughts (H2)
- A brief, calming conclusion summarizing the main takeaway.
- Reiterate that being informed is the best strategy.

#### 7. Bottom CTA Block
- Primary button linking to `calculator.html`.
- Framing: "Start Your Educational Estimate" or "Review Your Vehicle Benchmark".
- Microcopy: "Takes 30 seconds • No signup required"

#### 8. Continue Your Research Loop
- Link to 2 closely related internal guides using the `.loop-grid` and `.feature-box` HTML structure.

#### 9. Footer Nav CTA
- Final push to the calculator with educational framing.
- Example: "Understand your vehicle's market value. Use our ACV estimator as a reference point to independently research your vehicle's value."

## Publishing Workflow Checklist (REQUIRED)

Because this site is SEO-focused, every new article must be registered in the central architecture to ensure discoverability. **An article is not fully published until all steps are complete.**

1. `[ ]` **Create the Article HTML**: Save the new article using the `article-template.html` structure (e.g., `new-article-slug.html`).
2. `[ ]` **Update Metadata**: Ensure the article has a unique `<title>` and `<meta name="description">`.
3. `[ ]` **Add Canonical & OG Tags**: Inject `<link rel="canonical" href="https://mypolicium.com/new-article-slug.html">` and standard Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type="article"`).
4. `[ ]` **Update Dynamic Rendering (`script.js`)**: Add the new article object to the top of the `ARTICLES` array. Ensure you include the correct `category`, `tags` (for related articles logic), and set `featured` appropriately.
5. `[ ]` **Update Sitemap (`sitemap.xml`)**: Add the new article's `<loc>` to the `sitemap.xml`.
6. `[ ]` **Update SEO Directory (`learn.html`)**: Manually add a plain HTML link to the article inside the `<ul id="seo-links-list">` at the bottom of `learn.html`.
7. `[ ]` **Verification**: Load the new article and verify that the dynamic "Related Articles" section renders correctly at the bottom without self-linking.
