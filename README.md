# ChopMedia portfolio

One page that links ChopMedia's six working software demos, with who each is for and what to click first.

> **Demo projects.** Everything linked from this page is a demonstration build by ChopMedia, not client work. Every firm, person, document and message in the demos is invented. Where a demo shows AI, the AI's answers were recorded ahead of time and are replayed. Nothing is sent to anyone.

**Live page:** https://chopmedia.vercel.app

## The demos

| | For | What it shows | Links |
| --- | --- | --- | --- |
| 1 | A law firm | Chat intake, a conflict check, an engagement letter and e-signature | [Live demo](https://law-firm-front-office.vercel.app), [code](https://github.com/chopscales-gif/law-firm-front-office) |
| 2 | A therapy practice | Online booking, reminders, and a waitlist that fills cancelled appointments. Designed with HIPAA in mind; not HIPAA compliant or certified | [Live demo](https://therapy-practice-scheduler.vercel.app), [code](https://github.com/chopscales-gif/therapy-practice-scheduler) |
| 3 | An accounting office | Invoices, receipts and W-9s read by AI (recorded readings), checked by arithmetic, reviewed with source highlights, exported | [Live demo](https://chopmedia-document-ai.vercel.app), [code](https://github.com/chopscales-gif/document-ai-extractor) |
| 4 | A government contractor | Solicitations read by AI (recorded readings), matched to a company profile by written rules, with sourced bid checklists and addenda shown before and after | [Live demo](https://government-bid-tracker.vercel.app), [code](https://github.com/chopscales-gif/government-bid-tracker) |
| 5 | A home service company | Customer messages read by AI (recorded readings), written rules for who to send, a proposed reshuffle when a job runs long, and customer and technician screens | [Live demo](https://service-request-dispatch.vercel.app), [code](https://github.com/chopscales-gif/service-request-dispatch) |
| 6 | A city transportation office | Scooter and bike operators' feeds checked, permit rules judged with the evidence kept, and invoices worked out from trip records. Simulated data, fictional operators, not used by any city | Not hosted yet, [code and screenshots](https://github.com/chopscales-gif/micromobility-monitor) |

## Rules every demo follows

- Labelled as a demo in its README and in the app itself.
- Obviously fictional sample data. No real client names, logos or data.
- No invented metrics, testimonials or case studies.
- Runs locally with a few commands and no paid keys. Third-party services are mocked.
- AI features use recorded or rule-based responses, not live model calls.
- The legal demo's assistant does not give legal advice. The therapy demo is designed with HIPAA in mind and does not claim to be compliant or certified.

## What this page is not

- It is not a list of clients or finished client projects.
- It has no pricing, contact form, tracking or analytics.

## How it is built

A static page with no dependencies. Node builds one HTML file from one content file.

```
content.json            every word about the six demos, and their links
build.mjs               turns content.json into dist/index.html
build.test.mjs          checks the content, links, notices and screenshots
public/
  styles.css
  app.js                draws the tiles, the three views and each demo's strip
  shots/                four screenshots per demo, customer-facing one first
scripts/
  sync-shots.mjs        copies those screenshots from the demo repos
```

Decisions worth knowing about:

- **One file to edit.** A demo's pitch, steps and links live in `content.json` and nowhere else, so the page is hard to leave out of step with itself.
- **Screenshots come from the demos' own repos.** `npm run shots` copies and resizes them, so the page shows what each README shows.
- **Three views of the same six tiles.** A ring, a list and a slider, hand-written with no animation library. Each demo opens into a strip of its screenshots, and has its own link (for example `#law-firm`).
- **It still works with scripts off.** The built HTML carries a plain list of every demo with its notice, limits and links.
- **The demo notice is tested.** A test fails if the page stops saying these are demonstrations before the first demo, or drops the legal and HIPAA limits.

## Run it locally

Needs Node.js 20 or newer. There is nothing to install.

```bash
npm run build       # writes dist/index.html
npm test
```

Open `dist/index.html` in a browser.

`npm run shots` refreshes the screenshots. It expects the six demo repos to be checked out beside this folder and uses `sips`, which ships with macOS.

---

Built by ChopMedia. Contact Hayden Huelskamp at chopscales@gmail.com, or on [LinkedIn](https://www.linkedin.com/in/hayden-huelskamp-547a86302/).
