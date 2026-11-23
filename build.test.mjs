import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { render } from "./build.mjs";

const root = fileURLToPath(new URL(".", import.meta.url));
const content = JSON.parse(readFileSync(`${root}content.json`, "utf8"));
const html = render(content);

test("every project has what a card needs", () => {
  assert.equal(content.projects.length, 6);
  for (const project of content.projects) {
    for (const field of ["id", "folder", "shot", "for", "name", "pitch", "note", "alt", "code"]) {
      assert.ok(project[field], `${project.id} is missing ${field}`);
    }
    assert.equal(project.try.length, 3, `${project.id} should have three things to try`);
    // A demo with no hosted copy has to say so on its card.
    if (project.demo) assert.match(project.demo, /^https:\/\/[a-z0-9-]+\.vercel\.app$/);
    else assert.match(project.note, /^Not hosted yet/);
    assert.equal(project.code, `https://github.com/chopscales-gif/${project.folder}`);
  }
  assert.equal(new Set(content.projects.map((project) => project.id)).size, 6);
});

test("every project has its screenshot", () => {
  for (const project of content.projects) {
    assert.ok(existsSync(`${root}public/shots/${project.id}.jpg`), `public/shots/${project.id}.jpg is missing; run npm run shots`);
  }
});

test("the page links every demo and its code, and every jump link lands", () => {
  for (const project of content.projects) {
    if (project.demo) assert.ok(html.includes(`href="${project.demo}"`));
    assert.ok(html.includes(`href="${project.code}"`));
    assert.ok(html.includes(`href="#${project.id}"`));
    assert.ok(html.includes(`id="${project.id}"`));
  }
});

test("the page says these are demos before it shows one", () => {
  const notice = html.indexOf("demonstration builds, not client work");
  assert.ok(notice > 0);
  assert.ok(notice < html.indexOf('class="project"'));
});

test("the health and legal demos carry their limits", () => {
  assert.match(html, /not HIPAA compliant or certified/);
  assert.match(html, /does not give legal advice/);
});

test("text from content.json is escaped", () => {
  const sample = structuredClone(content);
  sample.projects[0].name = "<script>alert(1)</script>";
  assert.ok(!render(sample).includes("<script>alert(1)</script>"));
});
