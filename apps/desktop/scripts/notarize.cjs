/**
 * Notarization hook for macOS. Inert until Apple credentials are present.
 *
 * To enable: set APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD and APPLE_TEAM_ID, and
 * in electron-builder.yml set mac.identity to a real Developer ID and
 * mac.hardenedRuntime to true (notarization requires hardened runtime).
 *
 * Note that every nested Mach-O binary must be signed too: better_sqlite3.node,
 * bcrypt_lib.node and the Prisma schema engine all live under Resources/server.
 * Verify with `codesign --verify --deep --strict` before the first submission.
 */
exports.default = async function notarizeApp(context) {
  if (context.electronPlatformName !== 'darwin') return;

  const { APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID } = process.env;
  if (!APPLE_ID || !APPLE_APP_SPECIFIC_PASSWORD || !APPLE_TEAM_ID) {
    console.log('[notarize] Apple credentials not set — skipping (unsigned build).');
    return;
  }

  const { notarize } = require('@electron/notarize');
  const appName = context.packager.appInfo.productFilename;

  console.log(`[notarize] Submitting ${appName}.app to Apple`);
  await notarize({
    appBundleId: 'org.priperfin.desktop',
    appPath: `${context.appOutDir}/${appName}.app`,
    appleId: APPLE_ID,
    appleIdPassword: APPLE_APP_SPECIFIC_PASSWORD,
    teamId: APPLE_TEAM_ID,
  });
  console.log('[notarize] Done');
};
