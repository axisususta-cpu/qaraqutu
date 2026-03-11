"use strict";
const fs = require("fs");
const path = require("path");

const nextDir = path.join(__dirname, "..", ".next");
const nextDevDir = path.join(__dirname, "..", ".next-dev");
for (const dir of [nextDir, nextDevDir]) {
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch (_) {}
}
process.exit(0);
