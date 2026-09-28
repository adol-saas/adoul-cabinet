import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './context/language-context';
import { ThemeProvider } from './context/theme-context';

const appName = import.meta.env.VITE_APP_NAME || 'Cabinet Adoul';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        if (pages[`./pages/${name}.tsx`]) {
            return resolvePageComponent(`./pages/${name}.tsx`, pages);
        }
        const altName = name.startsWith('tenant/') ? name.replace(/^tenant\//, '') : `tenant/${name}`;
        if (pages[`./pages/${altName}.tsx`]) {
            return resolvePageComponent(`./pages/${altName}.tsx`, pages);
        }
        return resolvePageComponent(`./pages/${name}.tsx`, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <LanguageProvider>
                    <App {...props} />
                </LanguageProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#0d5f47',
    },
});