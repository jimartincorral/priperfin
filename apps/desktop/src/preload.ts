import { contextBridge } from 'electron';

/**
 * The renderer is an ordinary browser pointed at the local server; the web app
 * derives its API base URL from window.location and needs nothing from here.
 * Expose only inert identification, so the attack surface stays at zero.
 */
contextBridge.exposeInMainWorld('priperfinDesktop', {
  isDesktop: true,
  platform: process.platform,
  version: process.env.PRIPERFIN_VERSION ?? '',
});
