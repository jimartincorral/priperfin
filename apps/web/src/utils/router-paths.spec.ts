import { describe, expect, it } from 'vitest';
import { getAppBasePath, getAppPath, getCanonicalAppUrl } from './router-paths';
describe('router-paths', () => {
  describe('getAppBasePath', () => {
    it('keeps the root path unchanged', () => {
      expect(getAppBasePath('http://localhost:3000/')).toBe('/');
    });
    it('normalizes ingress paths with a trailing slash', () => {
      expect(
        getAppBasePath(
          'http://homeassistant.local/api/hassio_ingress/token-123/',
        ),
      ).toBe('/api/hassio_ingress/token-123/');
    });
  });
  describe('getAppPath', () => {
    const ingressBase =
      'http://homeassistant.local/api/hassio_ingress/token-123/';
    it('maps the ingress root without a trailing slash to the app root', () => {
      expect(getAppPath('/api/hassio_ingress/token-123', ingressBase)).toBe('/');
    });
    it('maps the ingress root with a trailing slash to the app root', () => {
      expect(getAppPath('/api/hassio_ingress/token-123/', ingressBase)).toBe('/');
    });
    it('strips the ingress prefix from nested routes', () => {
      expect(getAppPath('/api/hassio_ingress/token-123/goals', ingressBase)).toBe(
        '/goals',
      );
    });
    it('returns standalone paths unchanged', () => {
      expect(getAppPath('/reports', 'http://localhost:3000/')).toBe('/reports');
    });
  });
  describe('getCanonicalAppUrl', () => {
    const ingressBase =
      'http://homeassistant.local/api/hassio_ingress/token-123/';
    it('adds the missing trailing slash at the ingress root', () => {
      expect(
        getCanonicalAppUrl(
          'http://homeassistant.local/api/hassio_ingress/token-123?view=month',
          ingressBase,
        ),
      ).toBe(
        'http://homeassistant.local/api/hassio_ingress/token-123/?view=month',
      );
    });
    it('does not rewrite nested routes', () => {
      expect(
        getCanonicalAppUrl(
          'http://homeassistant.local/api/hassio_ingress/token-123/goals',
          ingressBase,
        ),
      ).toBeNull();
    });
    it('does not rewrite the canonical ingress root', () => {
      expect(
        getCanonicalAppUrl(
          'http://homeassistant.local/api/hassio_ingress/token-123/',
          ingressBase,
        ),
      ).toBeNull();
    });
    // Home Assistant opens `/api/hassio_ingress/<token>/` + `ingress_entry`;
    // with an entry of "/" that is `…/<token>//`, which the router left blank.
    it('collapses the double slash Home Assistant opens the panel with', () => {
      expect(
        getCanonicalAppUrl(
          'http://homeassistant.local/api/hassio_ingress/token-123//',
          ingressBase,
        ),
      ).toBe('http://homeassistant.local/api/hassio_ingress/token-123/');
    });
    it('collapses repeated slashes and keeps the query and hash', () => {
      expect(
        getCanonicalAppUrl(
          'http://homeassistant.local/api/hassio_ingress/token-123///reports?mode=year#top',
          ingressBase,
        ),
      ).toBe(
        'http://homeassistant.local/api/hassio_ingress/token-123/reports?mode=year#top',
      );
    });
    it('collapses repeated slashes outside ingress', () => {
      expect(
        getCanonicalAppUrl('http://localhost:3000//reports', 'http://localhost:3000/'),
      ).toBe('http://localhost:3000/reports');
      expect(
        getCanonicalAppUrl('http://localhost:3000/', 'http://localhost:3000/'),
      ).toBeNull();
    });
  });
});
