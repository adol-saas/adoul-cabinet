import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, TranslationKey } from '@/i18n/translations';
import { Locale } from '@/types';

interface LanguageContextType {
    locale: Locale;
    language: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey, params?: Record<string, string | number>) => string;
    isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('adoulcloud_locale') as Locale;
            if (saved && ['ar', 'fr', 'ber', 'en'].includes(saved)) {
                return saved;
            }
        }
        return 'ar';
    });

    const isRtl = locale === 'ar';

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
            document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
            localStorage.setItem('adoulcloud_locale', locale);
        }
    }, [locale, isRtl]);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
    };

    const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
        const langData = translations[locale] || translations.ar;
        let val = (langData as Record<string, string>)[key] || (translations.ar as Record<string, string>)[key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
            });
        }
        return val;
    };

    return (
        <LanguageContext.Provider value={{ locale, language: locale, setLocale, t, isRtl }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};