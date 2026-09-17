'use strict';
const path = require('path');
const { signFile, resolveKey } = require('@bamboodeploy/cli');

const WIN_EXT = /\.(exe|msi)$/i;
const log = m => console.log(`  • bamboo: ${m}`);

function enabled() {
  if (process.env.BAMBOO_SKIP === '1') return false;
  if (!resolveKey()) { log('no API key (set BAMBOO_API_KEY or create .bamboorc), skipping signing'); return false; }
  return true;
}

const done = new Set();
async function sign(file) {
  const key = path.resolve(file);
  if (done.has(key)) { log(`already signed ${path.basename(file)}, skipping`); return; }
  await signFile(file, { log, timeout: +(process.env.BAMBOO_TIMEOUT || 900) });
  done.add(key);
}

// afterAllArtifactBuild: signs the final installers (NSIS Setup.exe, MSI, portable exe).
async function afterAllArtifactBuild(ctx) {
  if (!enabled()) return [];
  const targets = (ctx.artifactPaths || []).filter(p => WIN_EXT.test(p) && !/\.blockmap$/i.test(p));
  for (const f of targets) await sign(f);
  return [];
}

async function winSign(config) {
  if (!enabled()) return;
  const f = config.path;
  if (!WIN_EXT.test(f)) return;
  await sign(f);
}

module.exports = afterAllArtifactBuild;
module.exports.afterAllArtifactBuild = afterAllArtifactBuild;
module.exports.winSign = winSign;
module.exports.default = afterAllArtifactBuild;
