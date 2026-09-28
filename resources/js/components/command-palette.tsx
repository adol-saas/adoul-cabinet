import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    Search,
    FolderKanban,
    Users,
    Calendar,
    FileCode,
    BarChart3,
    Settings,
    PlusCircle,
    UserPlus,
    CalendarPlus,
    Scale,
    ArrowRight,
    X,
    Sparkles,
    BookOpen,
    Calculator,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';

interface CommandItem {
    id: string;
    titleAr: string;
    titleFr: string;
    categoryAr: string;
    categoryFr: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    action?: () => void;
    shortcut?: string;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const { isRtl } = useLanguage();
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const commands: CommandItem[] = useMemo(() => [
        {
            id: 'act-new-dossier',
            titleAr: 'تحرير رسم عدلي جديد',
            titleFr: 'Rédiger un nouvel acte notarié',
            categoryAr: 'إجراءات سريعة',
            categoryFr: 'Actions Rapides',
            icon: PlusCircle,
            href: '/dossiers/create',
            shortcut: 'N',
        },
        {
            id: 'act-new-client',
            titleAr: 'إضافة موكل / متعاقد جديد',
            titleFr: 'Ajouter un nouveau client',
            categoryAr: 'إجراءات سريعة',
            categoryFr: 'Actions Rapides',
            icon: UserPlus,
            href: '/clients',
            shortcut: 'C',
        },
        {
            id: 'act-new-appointment',
            titleAr: 'جدولة موعد في الأجندة',
            titleFr: 'Programmer un rendez-vous',
            categoryAr: 'إجراءات سريعة',
            categoryFr: 'Actions Rapides',
            icon: CalendarPlus,
            href: '/appointments',
            shortcut: 'A',
        },
        {
            id: 'nav-dashboard',
            titleAr: 'لوحة قيادة المكتب',
            titleFr: 'Tableau de bord de l étude',
            categoryAr: 'التنقل في المنصة',
            categoryFr: 'Navigation',
            icon: Scale,
            href: '/dashboard',
        },
        {
            id: 'nav-dossiers',
            titleAr: 'سجل الرسوم والملفات العدلية',
            titleFr: 'Registre des actes et dossiers',
            categoryAr: 'التنقل في المنصة',
            categoryFr: 'Navigation',
            icon: FolderKanban,
            href: '/dossiers',
        },
        {
            id: 'nav-registers',
            titleAr: 'كناش التضمين ومذكرة الحفظ (سجلات المحكمة)',
            titleFr: 'Registres d inclusion et conservation',
            categoryAr: 'التنقل في المنصة',
            categoryFr: 'Navigation',
            icon: BookOpen,
            href: '/registers',
            shortcut: 'R',
        },
        {
            id: 'tool-inheritance',
            titleAr: 'حاسبة المواريث والفرائض (مدونة الأسرة المغربية)',
            titleFr: 'Calculateur de successions et Faraid',
            categoryAr: 'أدوات شرعية وحسابية',
            categoryFr: 'Outils Pratiques',
            icon: Calculator,
            href: '/inheritance-calculator',
            shortcut: 'I',
        },
        {
            id: 'nav-clients',
            titleAr: 'قاعدة بيانات المتعاقدين (CRM)',
            titleFr: 'Base de données des clients',
            categoryAr: 'التنقل في المنصة',
            categoryFr: 'Navigation',
            icon: Users,
            href: '/clients',
        },
        {
            id: 'nav-appointments',
            titleAr: 'الأجندة والمواعيد العدلية',
            titleFr: 'Agenda et audiences',
            categoryAr: 'التنقل في المنصة',
            categoryFr: 'Navigation',
            icon: Calendar,
            href: '/appointments',
        },
        {
            id: 'nav-templates',
            titleAr: 'نماذج وصيغ العقود الرسمية',
            titleFr: 'Modèles d actes officiels',
            categoryAr: 'التنقل في المنصة',
            categoryFr: 'Navigation',
            icon: FileCode,
            href: '/templates',
        },
        {
            id: 'nav-reports',
            titleAr: 'التقارير المالية واستخلاص الأتعاب',
            titleFr: 'Rapports financiers et honoraires',
            categoryAr: 'التنقل في المنصة',
            categoryFr: 'Navigation',
            icon: BarChart3,
            href: '/reports',
        },
        {
            id: 'nav-settings',
            titleAr: 'إعدادات المكتب وباقة الاشتراك',
            titleFr: 'Paramètres et abonnement',
            categoryAr: 'التنقل في المنصة',
            categoryFr: 'Navigation',
            icon: Settings,
            href: '/settings',
        },
    ], []);

    const filtered = useMemo(() => {
        if (!search.trim()) return commands;
        const q = search.toLowerCase();
        return commands.filter(c =>
            c.titleAr.toLowerCase().includes(q) ||
            c.titleFr.toLowerCase().includes(q) ||
            c.categoryAr.toLowerCase().includes(q) ||
            c.categoryFr.toLowerCase().includes(q)
        );
    }, [commands, search]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = filtered[selectedIndex];
                if (item) {
                    executeItem(item);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filtered, selectedIndex, onClose]);

    const executeItem = (item: CommandItem) => {
        onClose();
        if (item.action) {
            item.action();
        } else if (item.href) {
            router.visit(item.href);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[80vh] transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 gap-3">
                    <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <input
                        type="text"
                        autoFocus
                        placeholder={
                            isRtl
                                ? 'اكتب أمرًا أو ابحث في المنصة... (مثل: رسم، موكل، تقرير)'
                                : 'Rechercher ou exécuter une action... (ex: acte, client, rdv)'
                        }
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent border-0 outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm"
                    />
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="overflow-y-auto p-2 space-y-1">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-xs text-stone-500">
                            لا توجد نتائج مطابقة لـ &quot;{search}&quot;
                        </div>
                    ) : (
                        filtered.map((item, idx) => {
                            const isSelected = idx === selectedIndex;
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => executeItem(item)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                                        isSelected
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-lg ${
                                                isSelected
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium font-tajawal leading-tight">
                                                {isRtl ? item.titleAr : item.titleFr}
                                            </div>
                                            <div className="text-[11px] text-stone-400 mt-0.5">
                                                {isRtl ? item.categoryAr : item.categoryFr}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.shortcut && (
                                            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700 font-mono">
                                                {item.shortcut}
                                            </span>
                                        )}
                                        <ArrowRight
                                            className={`h-4 w-4 transition-transform ${
                                                isSelected ? 'text-emerald-600 translate-x-0.5' : 'text-stone-300'
                                            }`}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="px-4 py-2.5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/50 flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-3">
                        <span><kbd className="font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px]">↑↓</kbd> للتنقل</span>
                        <span><kbd className="font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px]">Enter</kbd> للاختيار</span>
                        <span><kbd className="font-mono bg-stone-200 dark:bg-stone-800 px-1 py-0.5 rounded text-[10px]">Esc</kbd> للإغلاق</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span>Adoul Command Palette</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
