import { describe, it, expect, beforeEach, vi } from 'vitest';
import { I18nService } from './i18n';

describe('I18nService', () => {
  let i18n: I18nService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset the singleton by accessing constructor via any
    // Since I18nService uses singleton, we need to access it fresh
    // We'll test through the static getInstance method
    (I18nService as any).instance = undefined;
    i18n = I18nService.getInstance();
  });

  // ============================================
  // Singleton Pattern Tests
  // ============================================
  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = I18nService.getInstance();
      const instance2 = I18nService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  // ============================================
  // Locale Management Tests
  // ============================================
  describe('setLocale', () => {
    it('should update locale and save to localStorage', () => {
      i18n.setLocale('es');

      expect(i18n.getLocale()).toBe('es');
      expect(localStorage.getItem('priperfin_lang')).toBe('es');
    });

    it('should switch back to English', () => {
      i18n.setLocale('es');
      i18n.setLocale('en');

      expect(i18n.getLocale()).toBe('en');
    });

    it('should dispatch lang-change event on locale change', () => {
      const listener = vi.fn();
      i18n.addEventListener('lang-change', listener);

      i18n.setLocale('es');

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('getLocale', () => {
    it('should return current locale', () => {
      expect(i18n.getLocale()).toBe('en'); // Default
    });
  });

  describe('initialization', () => {
    it('should initialize with saved locale from localStorage', () => {
      localStorage.setItem('priperfin_lang', 'es');

      // Reset singleton to force reinitialization
      (I18nService as any).instance = undefined;
      const newI18n = I18nService.getInstance();

      expect(newI18n.getLocale()).toBe('es');
    });

    it('should default to English if no saved locale', () => {
      // localStorage is empty (cleared in beforeEach)
      expect(i18n.getLocale()).toBe('en');
    });

    it('should ignore invalid saved locale', () => {
      localStorage.setItem('priperfin_lang', 'invalid');

      // Reset singleton
      (I18nService as any).instance = undefined;
      const newI18n = I18nService.getInstance();

      expect(newI18n.getLocale()).toBe('en');
    });
  });

  // ============================================
  // Translation Tests
  // ============================================
  describe('t (translation)', () => {
    it('should return translation for valid key', () => {
      const result = i18n.t('common.save');

      expect(result).toBe('Save');
    });

    it('should support dot notation for nested keys', () => {
      expect(i18n.t('nav.expenses')).toBe('Expenses');
      expect(i18n.t('nav.reports')).toBe('Reports');
      expect(i18n.t('nav.goals')).toBe('Goals');
      expect(i18n.t('nav.settings')).toBe('Settings');
    });

    it('should return key for missing translation', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = i18n.t('nonexistent.key');

      expect(result).toBe('nonexistent.key');
      expect(consoleWarn).toHaveBeenCalledWith(
        'Translation missing for key: nonexistent.key',
      );

      consoleWarn.mockRestore();
    });

    it('should return key if partial path is missing', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = i18n.t('common.nonexistent');

      expect(result).toBe('common.nonexistent');

      consoleWarn.mockRestore();
    });

    it('should switch translations when locale changes', () => {
      expect(i18n.t('common.save')).toBe('Save');

      i18n.setLocale('es');

      expect(i18n.t('common.save')).toBe('Guardar');
    });

    it('should handle deeply nested keys', () => {
      // Test with a known nested key from en.ts
      const result = i18n.t('common.loading');
      expect(result).toBe('Loading...');
    });
  });

  // ============================================
  // EventTarget Tests
  // ============================================
  describe('event handling', () => {
    it('should allow adding event listeners', () => {
      const listener = vi.fn();
      i18n.addEventListener('lang-change', listener);

      i18n.setLocale('es');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should allow removing event listeners', () => {
      const listener = vi.fn();
      i18n.addEventListener('lang-change', listener);
      i18n.removeEventListener('lang-change', listener);

      i18n.setLocale('es');

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      i18n.addEventListener('lang-change', listener1);
      i18n.addEventListener('lang-change', listener2);

      i18n.setLocale('es');

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});
