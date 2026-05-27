import fs from "node:fs";

const files = [
  "docs/multi-agent/README.md",
  "docs/multi-agent/spec.md",
  "docs/multi-agent/decision-log.md",
];

for (const file of files) {
  console.log(`\n===== ${file} =====\n`);
  console.log(fs.readFileSync(file, "utf8"));
}
