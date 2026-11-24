# Service Line Kitchen Enterprise website

Marketing website for Service Line Kitchen Enterprise, a commercial kitchen equipment repair company serving restaurants in Westchester County and the Bronx.

It's a plain HTML, CSS and JavaScript site with no frameworks, build step or dependencies.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: hero, equipment, repair-or-replace example, how it works, service area, repair request form |
| `equipment.html` | Equipment we repair: ovens and ranges, fryers, commercial dishwashers, other equipment |
| `service-area.html` | Service area: Westchester County and the Bronx, plus FAQ |
| `process.html` | Our process: the four repair steps and what the written recommendation includes |
| `404.html` | Page not found |

## Files

```
├── index.html, equipment.html, service-area.html, process.html, 404.html
├── styles.css            All styles (mobile-first, breakpoints at 640px and 960px)
├── script.js             Mobile menu, sticky mobile button, form checks and submission
├── images/               Photos in WebP at 640, 1024 and 1536 px wide, plus share-card.jpg
├── favicon.svg           Browser tab icon
├── apple-touch-icon.png  Phone home-screen icon
├── sitemap.xml           Page list for search engines
└── robots.txt            Search engine instructions
```

## Viewing the site locally

Open `index.html` in a browser, or run a local server from this folder:

```
python -m http.server 8000
```

Then go to http://localhost:8000.

## Before launch

- [ ] **Connect the repair request form.** The form is a demo right now. It checks entries but sends nothing, and it tells visitors that. See "Connecting the form" below.
- [ ] **Replace the stand-in domain.** `https://www.example.com` appears in `sitemap.xml`, `robots.txt`, the `og:image` tag on each page, and the structured data in `index.html`. Use find-and-replace to swap in the real address.
- [ ] **Add canonical tags** (`<link rel="canonical" href="...">`) to each page once the domain is known.
- [ ] **Add a phone number** if the business wants calls. Add it to the structured data in `index.html` as well.
- [ ] **Confirm the privacy note** under the form ("Your callback number is used only to contact you about this repair request.") matches how the business uses phone numbers.

## Connecting the form

In `script.js`, set `SUBMIT_ENDPOINT` to the address of a form service (for example Formspree) or your own server:

```js
var SUBMIT_ENDPOINT = "https://formspree.io/f/your-form-id";
```

The form sends these fields as JSON: `business`, `zip`, `equipment`, `problem`, `phone`. It also sends `website`, an empty hidden field that catches spam bots. The endpoint must return a 2xx status on success.

Once it's set, the demo notice disappears and visitors see: "Thank you. Dispatch will call to confirm availability and next steps."

Never put a secret key or password in `script.js`. Anyone can read it.

## Images

Each photo comes in three widths (`-640`, `-1024`, `-1536`), and the browser picks the right one through `srcset`. To replace a photo, start from a 3:2 image and make the three sizes, for example with ffmpeg:

```
ffmpeg -i new-photo.jpg -vf "scale=640:-2" -c:v libwebp -q:v 80 images/new-photo-640.webp
```

Repeat with `1024` and `1536`.

The current photos are AI-generated stand-ins. Replace them with real photos of the team and its work when available.

## Content rules

To keep the site accurate, don't add any of these unless they are true and can be backed up:

- Testimonials, ratings, certifications, guarantees or business history
- 24/7, same-day or emergency service, or response and arrival times
- Pricing (the figures on the home page are labeled as an example)
- Street addresses, a service radius, or other locations

Describe the service area as "Serving Westchester County and the Bronx".

## Publishing on GitHub Pages

In the repository on GitHub, go to **Settings → Pages**, choose **Deploy from a branch**, and pick the `main` branch and the `/ (root)` folder. GitHub Pages uses `404.html` automatically for missing pages.
