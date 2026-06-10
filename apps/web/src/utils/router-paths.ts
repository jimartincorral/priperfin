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

export function getCanonicalAppUrl(
  currentUrl: string,
  baseURI: string,
): string | null {
  const url = new URL(currentUrl);
  const basePath = getAppBasePath(baseURI);

  if (basePath === '/') {
    return null;
  }

  const basePathWithoutTrailingSlash = basePath.slice(0, -1);
  if (url.pathname !== basePathWithoutTrailingSlash) {
    return null;
  }

  url.pathname = basePath;
  return url.toString();
}
