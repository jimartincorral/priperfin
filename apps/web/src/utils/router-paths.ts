export function getAppBasePath(baseURI: string): string {
  const pathname = new URL(baseURI).pathname;

  if (!pathname.includes('/api/hassio_ingress/')) {
    return '/';
  }

  if (pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function getAppPath(pathname: string, baseURI: string): string {
  const basePath = getAppBasePath(baseURI);
  const normalizedPathname = pathname || '/';

  if (basePath === '/') {
    return normalizedPathname;
  }

  const basePathWithoutTrailingSlash = basePath.slice(0, -1);
  if (
    normalizedPathname === basePath ||
    normalizedPathname === basePathWithoutTrailingSlash
  ) {
    return '/';
  }

  if (normalizedPathname.startsWith(basePath)) {
    const relativePath = normalizedPathname.slice(basePath.length);
    return relativePath ? `/${relativePath.replace(/^\/+/, '')}` : '/';
  }

  return normalizedPathname;
}

/**
 * Returns the URL the router can match, or null when the current one already is.
 *
 * The router only renders paths under the `<base href>`, and silently renders
 * nothing for anything else, which leaves an empty screen beside the nav. Two
 * shapes reach it from Home Assistant:
 * - Repeated slashes. The panel opens `/api/hassio_ingress/<token>/` followed by
 *   the add-on's `ingress_entry`, so an entry of "/" opened `…/<token>//`.
 * - The Ingress root without its trailing slash.
 */
export function getCanonicalAppUrl(
  currentUrl: string,
  baseURI: string,
): string | null {
  const url = new URL(currentUrl);
  const basePath = getAppBasePath(baseURI);

  let pathname = url.pathname.replace(/\/{2,}/g, '/');
  if (basePath !== '/' && pathname === basePath.slice(0, -1)) {
    pathname = basePath;
  }

  if (pathname === url.pathname) {
    return null;
  }

  url.pathname = pathname;
  return url.toString();
}
