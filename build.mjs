// Builds the page: content.json and public/ in, dist/ out. No dependencies.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// The page is drawn by public/app.js from this data. "<" is written as an escape so no text can close the tag.
const data = (content) => JSON.stringify(content).replace(/</g, "\\u003c");

// The same projects as plain text and links, for a browser with scripts turned off.
function plain(p, i) {
  return `
        <article id="${escape(p.id)}">
          <p>${i + 1}. For ${escape(p.for)}</p>
          <h2>${escape(p.name)}</h2>
          <p>${escape(p.pitch)}</p>
          <p>${escape(p.note)}</p>
          <p>${p.demo ? `<a href="${escape(p.demo)}">${p.live ? "Open the site" : "Open the demo"}</a> ` : ""}${p.code ? `<a href="${escape(p.code)}">${p.demo ? "See the code" : "See the code and screenshots"}</a>` : ""}</p>
          <img src="shots/${escape(p.id)}-1.jpg" alt="${escape(p.alt)}" loading="lazy">
        </article>`;
}

export function render({ site, projects }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>${escape(site.title)}</title>
    <meta name="description" content="${escape(site.description)}">
    <meta property="og:title" content="${escape(site.title)}">
    <meta property="og:description" content="${escape(site.description)}">
    <meta property="og:type" content="website">
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700;800&display=swap">
    <link rel="stylesheet" href="styles.css">
    <noscript><style>html, body { height: auto; overflow: auto; } #app { display: none; }</style></noscript>
  </head>
  <body>
    <div id="app" class="booting">
      <header class="head">
        <a class="brand" href="#" id="brand">Hayden Huelskamp</a>
        <nav class="nav" aria-label="Site">
          <button id="modeRing" class="mode only-home is-on">Showcase</button>
          <button id="modeList" class="mode only-home">List</button>
          <button id="modeSlider" class="mode only-home">Slider</button>
          <button id="back" class="only-case strong">← All demos</button>
          <button id="contactBtn" class="strong only-phone">Contact</button>
          <button id="whatBtn" class="strong gap" data-go="about">What I do</button>
          <button id="menuBtn" class="strong" aria-expanded="false" aria-controls="menu">Menu</button>
        </nav>
      </header>
      <p class="case-hint" id="caseHint">Scroll up for the previous demo</p>
    
      <div class="menu" id="menu" aria-hidden="true">
        <button class="x" id="menuX" aria-label="Close menu"></button>
        <button class="lk" data-go="home">Demos</button>
        <button class="lk" data-go="about">What I do</button>
        <button class="lk" data-go="built">How they are built</button>
        <button class="lk" data-go="contact">Contact</button>
        <a href="${escape(site.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
        <a href="${escape(site.github)}" target="_blank" rel="noopener">GitHub</a>
        <p class="where">Utah / USA<br><span id="clock">&nbsp;</span></p>
      </div>
    
      <main class="stage" id="stage">
        <h1 class="vh">${escape(site.title)}</h1>
        <p class="intro" id="intro"><strong>Working software you can click through.</strong> Six demonstration builds, not client work, each made for one kind of office, and one live site of my own. Every firm, person and record in the demos is invented.</p>
        <ol class="names" id="names"></ol>
        <p class="meta m1" id="m1"><span></span></p><p class="meta m2" id="m2"><span></span></p><p class="meta m3" id="m3"><span></span></p>
        <p class="slabel" aria-hidden="true"><span id="sIdx"></span><span id="sName"></span></p>
        <div class="frame" id="frame"><div class="ring" id="ring"></div><div class="mark-open" aria-hidden="true"><b>Open demo</b></div></div>
        <p class="caption" id="caption" aria-live="polite"></p>
        <p class="count" id="count"><span></span></p>
        <p class="foot-note"><span id="hint">© 2026 Hayden Huelskamp. Demonstration builds</span></p>
      </main>
    
      <section class="sheet case" id="case" aria-label="Demo details"><div class="track" id="track"></div><p class="pct" id="pct">0%</p><div class="pull" id="pull"></div></section>
    
      <section class="sheet page" id="about" aria-label="What I do">
        <p class="kick">What I do</p>
        <h2 class="lead xl">Every office has a way of working that is entirely its own. <em>Inimitable, even.</em> Most software asks you to give it up. I build the kind that fits it.</h2>
        <p class="prose in">I'm Hayden Huelskamp, a software engineer in Utah. I sit with the people who do the work and find the hours that disappear into retyping, chasing and double-checking. Then I build the software that gives those hours back. Sometimes that is a full application. Sometimes it is a quiet connection between two tools you already pay for. Often it is both.</p>
        <div class="sec"><p class="idx">01</p><h3 class="sec-h">What I build</h3>
          <div class="trio">
            <div><h4>Software made for you</h4><p>Client portals, booking, intake, staff screens, dispatch boards. Shaped around how your people actually work, not how a product team somewhere imagined they might.</p></div>
            <div><h4>Connections between what you already use</h4><p>Your practice software, your accounting, your inbox, your forms. Linked so a detail entered once arrives everywhere it is needed, and nobody types it twice.</p></div>
            <div><h4>AI that reads, with a person in charge</h4><p>Invoices, messages, applications and contracts read in seconds, every figure checked by arithmetic and rules, and anything uncertain held for a person. The AI does the reading. Your people make the calls.</p></div>
            <div><h4>AI that never leaves the building</h4><p>Models and workflows that run on your own machines, behind your own walls. Client files, records and questions are never sent to anyone else's servers, and the work gets done all the same. For offices where discretion is not a preference but a duty.</p></div>
          </div></div>
        <div class="sec"><p class="idx">02</p><h3 class="sec-h">Who it's for</h3>
          <p class="trades">Law firms. Therapy practices. Accounting offices. Contractors. Service companies. City departments. <span>And the offices in between.</span></p>
          <p class="say-big in">The trade changes; the problem rarely does: skilled people spending their days on work beneath their skill. You are the maven of your field. My work is to clear away everything that keeps you from it.</p></div>
        <div class="sec"><p class="idx">03</p><h3 class="sec-h">How I work</h3>
          <ol class="ways4">
            <li><h4>I start from the seat.</h4><p>Before I design a screen, I ask who sits in front of it, what they need to know, and when.</p></li>
            <li><h4>I show the working.</h4><p>Every number can be traced back to where it came from. Software that cannot explain itself does not deserve your trust.</p></li>
            <li><h4>Small and finished beats large and almost.</h4><p>You see working software early and often, not a slide deck.</p></li>
            <li><h4>I'm honest about the edges.</h4><p>What a tool does not do is said as plainly as what it does. Every demo on this site is built the same way.</p></li>
          </ol></div>
        <div class="sec"><p class="idx">04</p><h3 class="sec-h">Start here</h3>
          <div class="close in"><p class="say-big">If something in your office is still done by hand, write and tell me about it. The best projects tend to begin with "we've always done it this way."</p>
          <div class="btns-row"><a class="btn solid" href="mailto:${escape(site.email)}">Write to me</a><button class="btn" data-go="home">See the demos</button></div></div></div>
        <div class="work"><h3>Explore the demos</h3><div class="grid" data-grid></div></div>
        <div data-foot="about"></div>
      </section>
    
      <section class="sheet page" id="built" aria-label="How these demos are built">
        <h2 class="lead">Every demo here is a demonstration build, not client work. They are made so you can click through them safely, and each one says plainly what is real and what is not.</h2>
        <div class="cols in">
          <div><h3>The data is invented</h3><p>Every firm, client, document and message was made up for the demo. There are no real client names, logos or records anywhere in them.</p></div>
          <div><h3>The AI is a recording</h3><p>Where a demo shows AI reading something, the answers were recorded ahead of time and are replayed. Each demo says which parts are recorded and which run live.</p></div>
          <div><h3>Nothing is sent</h3><p>No email, text message or letter leaves a demo. Where one would be sent, it goes to an outbox on the screen so you can read it.</p></div>
          <div><h3>You get your own copy</h3><p>In the hosted demos, each visitor works on a private copy of the sample data, so you can change anything. A reset button puts it back.</p></div>
          <div><h3>No numbers to quote</h3><p>There are no usage figures, testimonials or case studies here, because these are demonstrations. The code for every one is public.</p></div>
        </div>
        <div class="row rule"><h3>What each demo does not do</h3><ul id="limits"></ul></div>
        <div data-foot="built"></div>
      </section>
    
      <section class="sheet page" id="contact" aria-label="Contact">
        <h2 class="title">Get in touch.</h2>
        <div class="touch">
          <div><h3>Email</h3><p><a href="mailto:${escape(site.email)}">${escape(site.email)}</a></p><h3>Based in</h3><p>Utah, USA<br><span id="clock2"></span></p></div>
          <div><h3>Elsewhere</h3><p><a href="${escape(site.linkedin)}" target="_blank" rel="noopener">LinkedIn</a><br><a href="${escape(site.github)}" target="_blank" rel="noopener">GitHub</a></p></div>
          <div class="mosaic" data-mosaic></div>
          <div class="btns"><a class="btn" href="${escape(site.github)}" target="_blank" rel="noopener">See the code</a><a class="btn solid" href="mailto:${escape(site.email)}">Write an email</a></div>
        </div>
        <div data-foot="contact"></div>
      </section>
    
      <div class="talk" id="talk" role="button" tabindex="0" aria-expanded="false">
        <span class="lab">Want one for your office?</span><span class="mark"></span>
        <button class="x" id="talkX" aria-label="Close"></button>
        <div class="in">
          <h2>Want something like this for your office?</h2>
          <p>Write and tell me what your office still does by hand. There is no form and no tracking on this page, only an address.</p>
          <a class="mail" href="mailto:${escape(site.email)}">${escape(site.email)}</a>
          <div class="acts"><button id="copy">Copy address</button><a href="${escape(site.linkedin)}" target="_blank" rel="noopener">LinkedIn</a><a href="${escape(site.github)}" target="_blank" rel="noopener">GitHub</a></div>
        </div>
      </div>
      <a class="demo-cta" id="cta" href="#" target="_blank" rel="noopener">Open the demo</a>
      <a class="cta-alt only-case" id="ctaAlt" href="#" target="_blank" rel="noopener">See the code</a>
    </div>

    <noscript>
      <div class="plain">
        <p><strong>Hayden Huelskamp.</strong> Working software you can click through. Six demonstration builds, not client work, each made for one kind of office, and one live site of my own. Every firm, person and record in the demos is invented.</p>
        <p>${projects.map((p) => `<a href="#${escape(p.id)}">${escape(p.name)}</a>`).join(" · ")}</p>${projects.map(plain).join("")}
        <p>Write to <a href="mailto:${escape(site.email)}">${escape(site.email)}</a>. <a href="${escape(site.linkedin)}">LinkedIn</a> · <a href="${escape(site.github)}">GitHub</a></p>
      </div>
    </noscript>

    <script type="application/json" id="data">${data({ site, projects })}</script>
    <script src="app.js"></script>
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
