import React from 'react';
import { useTheme } from '@/context/theme-context';
import { Button } from './button';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            title={theme === 'dark' ? 'الوضع المضيء / Mode clair' : 'الوضع الليلي / Mode sombre'}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </Button>
    );
};