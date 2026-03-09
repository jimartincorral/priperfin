import { en } from './en';
import { es } from './es';

type Strings = typeof en;

export class I18nService extends EventTarget {
    private static instance: I18nService;
    private locale: 'en' | 'es' = 'en';
    private strings: Strings = en;

    private constructor() {
        super();
        const saved = localStorage.getItem('priperfin_lang');
        if (saved && (saved === 'en' || saved === 'es')) {
            this.setLocale(saved);
            return;
        }

        this.setLocale(this.getBrowserLocale());
    }

    private getBrowserLocale(): 'en' | 'es' {
        const browserLocales = navigator.languages?.length
            ? navigator.languages
            : [navigator.language];

        for (const locale of browserLocales) {
            if (locale?.toLowerCase().startsWith('es')) {
                return 'es';
            }
        }

        return 'en';
    }

    static getInstance() {
        if (!I18nService.instance) {
            I18nService.instance = new I18nService();
        }
        return I18nService.instance;
    }

    setLocale(lang: 'en' | 'es') {
        this.locale = lang;
        this.strings = lang === 'es' ? es : en;
        localStorage.setItem('priperfin_lang', lang);
        this.dispatchEvent(new Event('lang-change'));
    }

    getLocale() {
        return this.locale;
    }

    // Supports dot notation: t('nav.expenses')
    t(key: string): string {
        const keys = key.split('.');
        let current: any = this.strings;

        for (const k of keys) {
            if (current[k] === undefined) {
                console.warn(`Translation missing for key: ${key}`);
                return key;
            }
            current = current[k];
        }

        return current;
    }
}

export const i18n = I18nService.getInstance();
