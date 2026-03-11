"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dirs = [
  path.join(root, "node_modules", ".prisma", "client"),
  path.join(root, "apps", "api", "node_modules", ".prisma", "client"),
];

for (const dir of dirs) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.warn("[prisma-pre-generate] Removed:", dir);
    }
  } catch (e) {
    console.warn("[prisma-pre-generate] Cleanup warning:", e.message);
  }
}
process.exit(0);
