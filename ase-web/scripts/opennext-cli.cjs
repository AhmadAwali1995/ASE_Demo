"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const cli = path.join(
  __dirname,
  "..",
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "index.js",
);
const args = process.argv.slice(2);
const command = args[0];
if (
  (command === "build" || command === "deploy" || command === "preview") &&
  !args.includes("--dangerouslyUseUnsupportedNextVersion")
) {
  args.push("--dangerouslyUseUnsupportedNextVersion");
}

const result = spawnSync(process.execPath, [cli, ...args], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
