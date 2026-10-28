"use strict";

const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "..",
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "commands",
  "build.js",
);
if (!fs.existsSync(file)) process.exit(0);

const src = fs.readFileSync(file, "utf8");
const next = src.replace(
  /option\("dangerouslyUseUnsupportedNextVersion",\s*\{\s*type:\s*"boolean",\s*default:\s*false/,
  'option("dangerouslyUseUnsupportedNextVersion", { type: "boolean", default: true',
);
if (next === src) process.exit(0);
fs.writeFileSync(file, next);
