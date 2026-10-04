/**
 * electron-builder afterPack hook: give the macOS app a complete ad-hoc signature.
 *
 * PriPerFin ships unsigned by choice (no Apple Developer ID). electron-builder
 * does not ad-hoc sign on its own: with `mac.identity: null` it logs "skipped
 * macOS code signing" and leaves the bundle as is. Packaging has already
 * modified the Electron bundle by then, so its original signature is broken,
 * and macOS reports a quarantined app with a broken signature as "damaged" —
 * with no "Open Anyway" button. A complete ad-hoc seal turns that into the
 * ordinary "could not verify" block, which users can get past in System
 * Settings → Privacy & Security.
 *
 * Runs in afterPack, before electron-builder's own signing step and before the
 * DMG is assembled. If a Developer ID is ever configured, this hook steps aside
 * and electron-builder signs normally.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function codesign(args) {
  execFileSync('codesign', args, { stdio: 'inherit' });
}

// Thin Mach-O magics (32/64-bit, both byte orders), and the fat/universal magic.
const THIN_MAGICS = new Set([0xfeedface, 0xfeedfacf, 0xcefaedfe, 0xcffaedfe]);
const FAT_MAGICS = new Set([0xcafebabe, 0xbebafeca]);

// The server tree is mostly node_modules, so check magic bytes in-process rather
// than spawning `file` tens of thousands of times. The fat magic is shared with
// Java class files, so only that case is confirmed with `file`.
function isMachO(file) {
  const fd = fs.openSync(file, 'r');
  const header = Buffer.alloc(4);
  let bytesRead;
  try {
    bytesRead = fs.readSync(fd, header, 0, 4, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (bytesRead < 4) return false;

  const magic = header.readUInt32BE(0);
  if (THIN_MAGICS.has(magic)) return true;
  if (!FAT_MAGICS.has(magic)) return false;
  return execFileSync('file', ['-b', file], { encoding: 'utf8' }).includes('Mach-O');
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

exports.default = async function adhocSign(context) {
  if (context.electronPlatformName !== 'darwin') return;

  if (process.env.CSC_LINK || process.env.CSC_NAME) {
    console.log('[adhoc-sign] Developer ID configured — leaving signing to electron-builder.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);
  const serverDir = path.join(appPath, 'Contents', 'Resources', 'server');

  // Inside-out: nested native code first, because the outer seal hashes it.
  // These live in extraResources, which `codesign --deep` does not treat as
  // code: better_sqlite3.node, bcrypt_lib.node and the Prisma schema engine.
  let nested = 0;
  if (fs.existsSync(serverDir)) {
    for (const file of walk(serverDir)) {
      if (!isMachO(file)) continue;
      codesign(['--force', '--sign', '-', file]);
      nested++;
    }
  }
  console.log(`[adhoc-sign] Ad-hoc signed ${nested} nested Mach-O file(s) under Resources/server`);

  codesign(['--force', '--deep', '--sign', '-', appPath]);
  console.log(`[adhoc-sign] Ad-hoc sealed ${appPath}`);
};
