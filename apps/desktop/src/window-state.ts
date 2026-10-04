import { BrowserWindow, Rectangle, screen } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SAVE_DEBOUNCE_MS = 400;
const MIN_WIDTH = 940;
const MIN_HEIGHT = 640;

interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized?: boolean;
}

const DEFAULT_STATE: WindowState = { width: 1280, height: 860 };

function stateFile(userData: string): string {
  return path.join(userData, 'window-state.json');
}

function intersectsAnyDisplay(bounds: WindowState): boolean {
  if (bounds.x === undefined || bounds.y === undefined) return true;
  const rect: Rectangle = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
  return screen.getAllDisplays().some(({ workArea }) =>
    rect.x < workArea.x + workArea.width &&
    rect.x + rect.width > workArea.x &&
    rect.y < workArea.y + workArea.height &&
    rect.y + rect.height > workArea.y,
  );
}

/**
 * Restore the previous window geometry, discarding bounds that would place the
 * window off-screen (for example after a monitor is unplugged).
 */
export function loadWindowState(userData: string): WindowState {
  try {
    const saved = JSON.parse(fs.readFileSync(stateFile(userData), 'utf8')) as WindowState;
    const sane =
      Number.isFinite(saved.width) &&
      Number.isFinite(saved.height) &&
      saved.width >= MIN_WIDTH &&
      saved.height >= MIN_HEIGHT;
    if (sane && intersectsAnyDisplay(saved)) return saved;
  } catch {
    // No saved state, or it was unreadable.
  }
  return { ...DEFAULT_STATE };
}

export function trackWindow(window: BrowserWindow, userData: string): void {
  let timer: NodeJS.Timeout | undefined;

  const persist = () => {
    try {
      const isMaximized = window.isMaximized();
      // Normal bounds, so un-maximising restores somewhere sensible.
      const bounds = window.getNormalBounds();
      const state: WindowState = { ...bounds, isMaximized };
      fs.writeFileSync(stateFile(userData), JSON.stringify(state, null, 2), 'utf8');
    } catch {
      // Losing window geometry is not worth interrupting the user over.
    }
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(persist, SAVE_DEBOUNCE_MS);
  };

  window.on('resize', schedule);
  window.on('move', schedule);
  window.on('maximize', schedule);
  window.on('unmaximize', schedule);
  window.once('close', () => {
    clearTimeout(timer);
    persist();
  });
}

export { MIN_WIDTH, MIN_HEIGHT };
