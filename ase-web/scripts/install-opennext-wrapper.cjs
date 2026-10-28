"use strict";

const fs = require("fs");
const path = require("path");

const binDir = path.join(__dirname, "..", "node_modules", ".bin");
if (!fs.existsSync(binDir)) process.exit(0);

const wrapper = path.relative(binDir, path.join(__dirname, "opennext-cli.cjs")).replace(/\\/g, "/");
const unix = `#!/usr/bin/env node
require(${JSON.stringify(wrapper.startsWith(".") ? wrapper : `./${wrapper}`)});
`;
fs.writeFileSync(path.join(binDir, "opennextjs-cloudflare"), unix, { mode: 0o755 });
fs.writeFileSync(
  path.join(binDir, "opennextjs-cloudflare.cmd"),
  `@ECHO off\r\nnode "%~dp0\\${wrapper.replace(/\//g, "\\")}" %*\r\n`,
);
