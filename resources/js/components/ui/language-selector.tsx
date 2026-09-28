import React from 'react';
import { useLanguage } from '@/context/language-context';
import { Globe } from 'lucide-react';
import { Locale } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';

const languages: { code: Locale; name: string; native: string; flag: string }[] = [
    { code: 'ar', name: 'Arabic', native: 'العربية (المغرب)', flag: '🇲🇦' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { code: 'ber', name: 'Amazigh', native: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'ⵣ' },
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
];

export const LanguageSelector: React.FC<{ variant?: 'ghost' | 'outline' }> = ({ variant = 'ghost' }) => {
    const { locale, setLocale } = useLanguage();
    const current = languages.find(l => l.code === locale) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size="sm" className="gap-2 text-xs font-semibold">
                    <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{current.native}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {languages.map(lang => (
                    <DropdownMenuItem
                        key={lang.code}
                        onSelect={() => setLocale(lang.code)}
                        onClick={() => setLocale(lang.code)}
                        className={`flex items-center justify-between cursor-pointer ${
                            locale === lang.code ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300' : ''
                        }`}
                    >
                        <span>{lang.native}</span>
                        <span className="text-xs text-stone-400">{lang.flag}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};