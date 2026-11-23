import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { render } from "./build.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const content = JSON.parse(readFileSync(`${root}content.json`, "utf8"));
const html = render(content);
const script = readFileSync(`${root}public/app.js`, "utf8");
// What a browser with scripts off is given, and what the script draws from.
const plain = html.slice(html.indexOf('<div class="plain">'), html.indexOf("</noscript>", html.indexOf('<div class="plain">')));
const data = JSON.parse(/<script type="application\/json" id="data">(.*)<\/script>/.exec(html)[1]);

test("every project has what a tile and its strip need", () => {
  assert.equal(content.projects.length, 6);
  for (const project of content.projects) {
    for (const field of ["id", "folder", "color", "on", "for", "cat", "kind", "name", "pitch", "note", "alt", "code"]) {
      assert.ok(project[field], `${project.id} is missing ${field}`);
    }
    assert.equal(project.try.length, 3, `${project.id} should have three things to try`);
    assert.equal(project.shots.length, 4, `${project.id} should have four screenshots`);
    // A demo with no hosted copy has to say so.
    if (project.demo) assert.match(project.demo, /^https:\/\/[a-z0-9-]+\.vercel\.app(\/[a-z0-9-]+)?$/);
    else assert.match(project.note, /^Not hosted yet/);
    assert.equal(project.code, `https://github.com/chopscales-gif/${project.folder}`);
  }
  assert.equal(new Set(content.projects.map((project) => project.id)).size, 6);
});

test("every project has its screenshots", () => {
  for (const project of content.projects) {
    assert.ok(existsSync(`${root}public/shots/${project.id}-thumb.jpg`), `public/shots/${project.id}-thumb.jpg is missing; see the README`);
    for (const n of [1, 2, 3, 4]) {
      assert.ok(existsSync(`${root}public/shots/${project.id}-${n}.jpg`), `public/shots/${project.id}-${n}.jpg is missing; run npm run shots`);
    }
  }
});

test("the script is handed every word and link in content.json", () => {
  assert.deepEqual(data, content);
});

test("with scripts off, the page still links every demo and its code, and every jump link lands", () => {
  for (const project of content.projects) {
    if (project.demo) assert.ok(plain.includes(`href="${project.demo}"`));
    assert.ok(plain.includes(`href="${project.code}"`));
    assert.ok(plain.includes(`href="#${project.id}"`));
    assert.ok(plain.includes(`id="${project.id}"`));
  }
});

test("the page says these are demos before it shows one", () => {
  // On the stage the notice is in the opening words, above where the tiles are drawn.
  const notice = html.indexOf("demonstration builds, not client work");
  assert.ok(notice > 0);
  assert.ok(notice < html.indexOf('id="ring"'));
  // With scripts off it comes before the first demo.
  const plainNotice = plain.indexOf("demonstration builds, not client work");
  assert.ok(plainNotice > 0);
  assert.ok(plainNotice < plain.indexOf("<article"));
});

test("the health and legal demos carry their limits", () => {
  for (const where of [plain, JSON.stringify(data)]) {
    assert.match(where, /not HIPAA compliant or certified/);
    assert.match(where, /does not give legal advice/);
  }
  // The script lists every demo's note on the "How they are built" page and on its strip.
  assert.match(script, /\$\("limits"\)\.innerHTML = P\.map\(\(p\) => `<li><b>\$\{esc\(p\.name\)\}\.<\/b> \$\{esc\(p\.note\)\}<\/li>`\)/);
  assert.match(script, /<p class="note">\$\{esc\(p\.note\)\}<\/p>/);
});

test("the page carries Hayden's name and not the old studio name", () => {
  assert.match(html, /Hayden Huelskamp/);
  assert.ok(!/ChopMedia/.test(html.replace(/https?:\/\/[^"\s<]+/g, "")));
});

test("text from content.json is escaped", () => {
  const sample = structuredClone(content);
  sample.projects[0].name = "<script>alert(1)</script>";
  sample.projects[0].note = "</script><img src=x>";
  const out = render(sample);
  assert.ok(!out.includes("<script>alert(1)</script>"));
  assert.ok(!out.includes("</script><img"));
  // The script escapes every piece of text it writes into the page.
  assert.ok(!/\$\{(p|next)\.(name|for|pitch|note|alt|cat|kind|code|id|color|on|tryTitle)\b[^}]*\}/.test(script.replace(/\$\{esc\([^}]*\}/g, "")));
});
