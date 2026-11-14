// Builds the page: content.json and public/ in, dist/ out. No dependencies.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function project(p) {
  return `
      <article class="project" id="${escape(p.id)}">
        <div class="project-words">
          <p class="project-for">For ${escape(p.for)}</p>
          <h3>${escape(p.name)}</h3>
          <p class="project-pitch">${escape(p.pitch)}</p>
          <p class="project-try-title">Three things to try</p>
          <ol class="project-try">
            ${p.try.map((step) => `<li>${escape(step)}</li>`).join("\n            ")}
          </ol>
          <p class="project-note">${escape(p.note)}</p>
          <p class="project-links">
            <a class="button" href="${escape(p.demo)}">Open the demo<span class="visually-hidden">: ${escape(p.name)}</span></a>
            <a class="quiet" href="${escape(p.code)}">See the code<span class="visually-hidden">: ${escape(p.name)}</span></a>
          </p>
        </div>
        <a class="project-shot" href="${escape(p.demo)}" tabindex="-1" aria-hidden="true">
          <img src="shots/${escape(p.id)}.jpg" alt="${escape(p.alt)}" loading="lazy">
        </a>
      </article>`;
}

export function render({ site, projects }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escape(site.title)}</title>
    <meta name="description" content="${escape(site.description)}">
    <meta property="og:title" content="${escape(site.title)}">
    <meta property="og:description" content="${escape(site.description)}">
    <meta property="og:type" content="website">
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400..600&display=swap">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip" href="#demos">Skip to the demos</a>
    <header class="top">
      <p class="brand">ChopMedia</p>
      <a href="#contact">Contact</a>
    </header>

    <main>
      <section class="intro">
        <h1>Working software you can click through, built for</h1>
        <ul class="index">
          ${projects.map((p) => `<li><a href="#${escape(p.id)}">${escape(p.for)}</a></li>`).join("\n          ")}
        </ul>
        <p class="intro-notice"><strong>These are demonstration builds, not client work.</strong> Every firm, person and record in them is invented. Each one runs in your browser with nothing to install and no account to make.</p>
      </section>

      <section class="demos" id="demos" aria-labelledby="demos-title">
        <h2 class="visually-hidden" id="demos-title">The demos</h2>${projects.map(project).join("")}
      </section>

      <section class="how" aria-labelledby="how-title">
        <h2 id="how-title">How these demos are built</h2>
        <dl>
          <div>
            <dt>The data is invented</dt>
            <dd>Every firm, client, document and message was made up for the demo. There are no real client names, logos or records anywhere in them.</dd>
          </div>
          <div>
            <dt>The AI is a recording</dt>
            <dd>Where a demo shows AI reading something, the AI's answers were recorded ahead of time and are replayed. The demos do not call an AI model while you use them. Each one says which parts are recorded and which run live.</dd>
          </div>
          <div>
            <dt>Nothing is sent</dt>
            <dd>No email, text message or letter leaves a demo. Where one would be sent, it goes to an outbox on the screen so you can read it.</dd>
          </div>
          <div>
            <dt>You get your own copy</dt>
            <dd>Each visitor works on a private copy of the sample data, so you can change anything. A reset button puts it back.</dd>
          </div>
          <div>
            <dt>No numbers to quote</dt>
            <dd>There are no usage figures, testimonials or case studies here, because these are demonstrations. The code for every one is public.</dd>
          </div>
        </dl>
      </section>

      <section class="contact" id="contact" aria-labelledby="contact-title">
        <h2 id="contact-title">Want something like this for your office?</h2>
        <p>ChopMedia is Hayden Huelskamp, an engineer based in Utah. I build custom software and automations for small businesses and public agencies: intake, scheduling and reminders, documents and e-signature, and connections to the systems an office already uses.</p>
        <p class="contact-links">
          <a class="button" href="mailto:${escape(site.email)}">Email ${escape(site.email)}</a>
          <a class="quiet" href="${escape(site.linkedin)}">LinkedIn</a>
          <a class="quiet" href="${escape(site.github)}">GitHub</a>
        </p>
      </section>
    </main>

    <footer class="foot">
      <p>Built by ChopMedia. Everything linked from this page is a demonstration build with invented data.</p>
    </footer>
  </body>
</html>
`;
}

export function build() {
  const content = JSON.parse(readFileSync(`${root}content.json`, "utf8"));
  rmSync(`${root}dist`, { recursive: true, force: true });
  mkdirSync(`${root}dist`);
  cpSync(`${root}public`, `${root}dist`, { recursive: true });
  writeFileSync(`${root}dist/index.html`, render(content));
  return content;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { projects } = build();
  console.log(`Built dist/index.html with ${projects.length} projects.`);
}
