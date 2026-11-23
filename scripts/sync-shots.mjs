// Copies each demo's screenshots out of its own repo into public/shots/,
// resized for the web. Every demo shows four: the first is its tile on the
// home stage, and all four sit on its strip. Run it after a demo's
// screenshots change:
//
//   npm run shots
//
// Expects the demo repos to sit beside this folder, and uses `sips`, which
// ships with macOS. The resized copies are committed, so building and
// deploying the page needs neither.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const { projects } = JSON.parse(readFileSync(`${root}content.json`, "utf8"));
const WIDEST = 1400;

mkdirSync(`${root}public/shots`, { recursive: true });
for (const project of projects) {
  project.shots.forEach((shot, n) => {
    const from = `${root}../${project.folder}/docs/${shot}`;
    if (!existsSync(from)) {
      console.error(`Missing ${from}`);
      process.exitCode = 1;
      return;
    }
    const to = `${root}public/shots/${project.id}-${n + 1}.jpg`;
    // Phone screenshots are narrower than the limit and are left at their own size.
    const width = Number(/pixelWidth: (\d+)/.exec(execFileSync("sips", ["-g", "pixelWidth", from], { encoding: "utf8" }))[1]);
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "80", "--resampleWidth", String(Math.min(width, WIDEST)), from, "--out", to], { stdio: "ignore" });
    console.log(`${project.folder}/docs/${shot} -> public/shots/${project.id}-${n + 1}.jpg`);
  });
}
