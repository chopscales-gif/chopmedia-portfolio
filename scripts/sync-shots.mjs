// Copies each demo's customer-facing screenshot out of its own repo into
// public/shots/, resized for the web. The page shows the top of each at 16:10. Run it after a demo's screenshot changes:
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

mkdirSync(`${root}public/shots`, { recursive: true });
for (const project of projects) {
  const from = `${root}../${project.folder}/docs/${project.shot}`;
  if (!existsSync(from)) {
    console.error(`Missing ${from}`);
    process.exitCode = 1;
    continue;
  }
  const to = `${root}public/shots/${project.id}.jpg`;
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", "--resampleWidth", "1600", from, "--out", to], { stdio: "ignore" });
  console.log(`${project.folder}/docs/${project.shot} -> public/shots/${project.id}.jpg`);
}
