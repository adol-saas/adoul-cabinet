import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { SharedProps } from '@/types';
import { useLanguage } from '@/context/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { FlashBanner } from '@/components/ui/flash-banner';
import { OfflineStatusBanner } from '@/components/ui/offline-status-banner';
import { CommandPalette } from '@/components/command-palette';
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Calendar,
    FileCode,
    FileCheck,
    UserCheck,
    BarChart3,
    Settings,
    Lock,
    LogOut,
    Menu,
    X,
    Sparkles,
    ShieldCheck,
    ExternalLink,
    ChevronDown,
    Plus,
    Search,
    Bell,
    BookOpen,
    Calculator,
    User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const TenantAdminLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({
    children,
    title,
}) => {
    const { auth, tenant, flash } = usePage<SharedProps>().props;
    const { t, isRtl } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [lockedFeatureName, setLockedFeatureName] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const plan = tenant?.plan;
    const features = plan?.features || {
        module_appointments: true,
        module_marriage: true,
        module_pdf_export: false,
        module_sms_notify: false,
        module_all_docs: false,
        module_team_roles: false,
        module_multilang: false,
        module_reports_export: false,
        module_api_access: false,
    };

    const navItems = [
        {
            name: t('dashboard'),
            href: '/dashboard',
            icon: LayoutDashboard,
            requiredFeature: null,
        },
        {
            name: t('clients'),
            href: '/clients',
            icon: Users,
            requiredFeature: null,
        },
        {
            name: t('dossiers'),
            href: '/dossiers',
            icon: FolderKanban,
            requiredFeature: null,
        },
        {
            name: t('registers'),
            href: '/registers',
            icon: BookOpen,
            requiredFeature: null,
        },
        {
            name: 'مذكرة الحفظ (م. 24)',
            href: '/blotter',
            icon: BookOpen,
            requiredFeature: null,
        },
        {
            name: t('inheritance_calculator'),
            href: '/inheritance-calculator',
            icon: Calculator,
            requiredFeature: null,
        },
        {
            name: t('appointments'),
            href: '/appointments',
            icon: Calendar,
            requiredFeature: 'module_appointments',
        },
        {
            name: t('templates'),
            href: '/templates',
            icon: FileCode,
            requiredFeature: null,
        },
        {
            name: t('conventions'),
            href: '/conventions',
            icon: FileCheck,
            requiredFeature: null,
        },
        {
            name: t('team'),
            href: '/team',
            icon: UserCheck,
            requiredFeature: 'module_team_roles',
        },
        {
            name: t('reports'),
            href: '/reports',
            icon: BarChart3,
            requiredFeature: 'module_reports_export',
        },
        {
            name: 'الملف الشخصي',
            href: '/profile',
            icon: User,
            requiredFeature: null,
        },
        {
            name: t('settings'),
            href: '/settings',
            icon: Settings,
            requiredFeature: null,
        },
    ];

    const handleLockedClick = (e: React.MouseEvent, featureKey: string, navName: string) => {
        e.preventDefault();
        setLockedFeatureName(navName);
        setUpgradeModalOpen(true);
    };

    const currentRole = auth.user?.roles?.[0] || 'adoul';
    const roleColors: Record<string, string> = {
        owner: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300',
        adoul: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300',
        katib: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
        muhafidh: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-300',
    };

    const planBadgeColors: Record<string, string> = {
        maktab: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
        muhtaraf: 'bg-emerald-500 text-white font-bold shadow-xs',
        muassasa: 'bg-gradient-to-r from-amber-500 to-amber-700 text-white font-bold shadow-xs',
    };

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col md:flex-row">
            <FlashBanner flash={flash} />
            <OfflineStatusBanner />

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-3.5 bg-emerald-800 text-white shadow sticky top-0 z-30">
                <div className="flex items-center gap-2 font-bold text-sm truncate min-w-0">
                    <ShieldCheck className="h-5 w-5 text-amber-300 shrink-0" />
                    <span className="truncate">{tenant?.name || 'مكتب التوثيق العدلي'}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <LanguageSelector />
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-emerald-700 h-8 w-8">
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Backdrop Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 z-35 md:hidden backdrop-blur-xs transition-opacity"
                    aria-label="إغلاق القائمة"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 z-40 h-screen w-72 bg-emerald-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Office Brand & Plan Tag */}
                    <div className="p-5 border-b border-emerald-700/60">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-bold text-sm leading-snug truncate text-white">
                                    {tenant?.name || 'مكتب العدل'}
                                </h2>
                                <p className="text-xs text-emerald-200 truncate">{tenant?.city || 'المملكة المغربية'}</p>
                            </div>
                        </div>

                        {/* Subscription Tier Badge */}
                        <div className="mt-3.5 flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-700/40">
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[11px] px-2 py-0.5 rounded-full ${planBadgeColors[plan?.id || 'maktab'] || 'bg-stone-700'}`}>
                                    {plan?.name_ar || 'باقة المكتب'}
                                </span>
                            </div>
                            {plan?.id !== 'muassasa' && (
                                <button
                                    onClick={() => {
                                        setLockedFeatureName('الترقية لكافة المزايا');
                                        setUpgradeModalOpen(true);
                                    }}
                                    className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold cursor-pointer underline"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    <span>ترقية</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isLocked = item.requiredFeature ? !features[item.requiredFeature] : false;
                            const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));

                            if (isLocked) {
                                return (
                                    <button
                                        key={item.href}
                                        type="button"
                                        onClick={(e) => handleLockedClick(e, item.requiredFeature!, item.name)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-300/60 hover:bg-emerald-950/30 transition-colors cursor-pointer text-start"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-4.5 w-4.5 text-emerald-400/50" />
                                            <span>{item.name}</span>
                                        </div>
                                        <Lock className="h-3.5 w-3.5 text-amber-400" />
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-emerald-700 text-white font-semibold shadow-inner'
                                            : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-amber-300' : 'text-emerald-200'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Plan Quota Progress Meter */}
                    <div className="mx-3 mb-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/50 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-emerald-200 font-medium">سعة العقود الشهرية</span>
                            <span className="font-mono text-[11px] font-bold text-amber-300">
                                {plan?.max_dossiers && plan.max_dossiers < 99999 ? `باقة ${plan?.name_ar || ''}` : 'غير محدود'}
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-emerald-900/80 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full w-2/5" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-emerald-300/70">
                            <span>النظام نشط ومؤمّن</span>
                            <span className="font-semibold text-white">متوافق 16.03</span>
                        </div>
                    </div>

                    {/* User profile & session */}
                    <div className="p-4 border-t border-emerald-700/60 space-y-2">
                        <Link
                            href="/profile"
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-600/30 transition-all cursor-pointer group"
                            title="إدارة الملف الشخصي والحساب"
                        >
                            {auth.user?.avatar_path ? (
                                <img
                                    src={auth.user.avatar_path}
                                    alt={auth.user.name}
                                    className="h-9 w-9 rounded-full object-cover border-2 border-amber-400 shrink-0"
                                />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-emerald-700 group-hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                                    {auth.user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">{auth.user?.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-sm border font-medium ${roleColors[currentRole] || 'bg-stone-800 text-stone-300'}`}>
                                        {currentRole.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <div className="flex items-center justify-between pt-1">
                            <a
                                href={tenant?.public_url || '/'}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-emerald-200 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>صفحة المكتب العامة</span>
                            </a>

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>{t('logout')}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Viewport */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="hidden md:flex items-center justify-between px-8 py-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-2xs">
                    <div className="flex items-center gap-6">
                        <div>
                            <h2 className="text-lg font-bold font-tajawal text-stone-900 dark:text-stone-100">{title || t('dashboard')}</h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                {tenant?.name} — {tenant?.city}
                            </p>
                        </div>

                        {/* Search trigger button */}
                        <button
                            type="button"
                            onClick={() => setCommandPaletteOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                        >
                            <Search className="h-3.5 w-3.5 text-stone-400" />
                            <span>بحث سريع في الملفات...</span>
                            <kbd className="ms-2 px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 font-mono text-[10px] text-stone-600 dark:text-stone-300">
                                ⌘K
                            </kbd>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/dossiers/create">
                            <Button variant="emerald" size="sm" className="font-bold gap-1.5 shadow-sm">
                                <Plus className="h-4 w-4" />
                                <span>رسم جديد</span>
                            </Button>
                        </Link>

                        <button
                            type="button"
                            title="الإشعارات"
                            className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative cursor-pointer"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-stone-900" />
                        </button>

                        <LanguageSelector />
                        <ThemeToggle />

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
                                    {auth.user?.avatar_path ? (
                                        <img
                                            src={auth.user.avatar_path}
                                            alt={auth.user.name}
                                            className="h-7 w-7 rounded-full object-cover border border-amber-400 shrink-0"
                                        />
                                    ) : (
                                        <div className="h-7 w-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                                            {auth.user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">{auth.user?.name}</span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="p-2 border-b border-stone-100 dark:border-stone-800">
                                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{auth.user?.name}</p>
                                    <p className="text-[11px] text-stone-500 truncate">{auth.user?.email}</p>
                                    <div className="mt-1">
                                        <Badge variant="outline" className="text-[10px]">
                                            {auth.user?.job_title || currentRole}
                                        </Badge>
                                    </div>
                                </div>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="w-full cursor-pointer flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>الملف الشخصي والحساب</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="w-full cursor-pointer flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        <span>{t('settings')}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" method="post" as="button" className="w-full text-red-600 dark:text-red-400 cursor-pointer flex items-center gap-2">
                                        <LogOut className="h-4 w-4" />
                                        <span>{t('logout')}</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Body Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8 flex flex-col justify-between">
                    <div>{children}</div>

                    <footer className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-600 dark:text-stone-300">
                        <div>
                            <span>منظومة Adoul السحابية للتوثيق العدلي بالمغرب</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>تطوير وإشراف:</span>
                            <a
                                href="https://accesspoint.ma"
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                            >
                                AccessPoint IT — تارودانت
                            </a>
                        </div>
                    </footer>
                </main>

                {/* Mobile Bottom Navigation Bar (App-like ergonomics) */}
                <nav aria-label="التنقل السريع للهاتف" className="md:hidden sticky bottom-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-3 py-2 flex items-center justify-around shadow-lg">
                    <Link
                        href="/dashboard"
                        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                            currentPath === '/dashboard'
                                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>الرئيسية</span>
                    </Link>

                    <Link
                        href="/dossiers"
                        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                            currentPath.startsWith('/dossiers') && currentPath !== '/dossiers/create'
                                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                    >
                        <FolderKanban className="h-5 w-5" />
                        <span>العقود</span>
                    </Link>

                    {/* Floating Center Action Button */}
                    <Link
                        href="/dossiers/create"
                        className="flex flex-col items-center -mt-5"
                    >
                        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-stone-900 active:scale-95 transition-transform">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">رسم جديد</span>
                    </Link>

                    <Link
                        href="/clients"
                        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                            currentPath.startsWith('/clients')
                                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                    >
                        <Users className="h-5 w-5" />
                        <span>الموكلين</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="flex flex-col items-center gap-1 text-[10px] font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                    >
                        <Menu className="h-5 w-5" />
                        <span>المزيد</span>
                    </button>
                </nav>
            </div>

            {/* Upgrade Modal for Locked Features */}
            <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-center text-lg font-bold">
                            {t('feature_locked')} ({lockedFeatureName})
                        </DialogTitle>
                        <DialogDescription className="text-center text-stone-600 dark:text-stone-300 text-sm mt-2">
                            {t('feature_upgrade_notice')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                        <div className="font-semibold text-stone-800 dark:text-stone-200">
                            مزايا باقة المحترف (Plan Muhtaraf - 299 درهم/شهر):
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
                            <li>فريق عمل حتى 5 مستخدمين مع تحديد الأدوار (عدل، كاتب، محافظ)</li>
                            <li>كافة أنواع العقود والمحررات (عقارات، طلاق، وصايا، وكالات)</li>
                            <li>تصدير الوثائق بصيغة PDF الرسمية مع الختم والباركود QR</li>
                            <li>إشعارات للمتعاقدين عبر الرسائل والواتساب</li>
                            <li>تحرير الوثائق متعددة اللغات (عربية، فرنسية، أمازيغية)</li>
                        </ul>
                    </div>

                    <DialogFooter className="flex gap-2 sm:justify-between">
                        <Button variant="outline" onClick={() => setUpgradeModalOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Link href="/settings">
                            <Button variant="gold" onClick={() => setUpgradeModalOpen(false)}>
                                <Sparkles className="h-4 w-4 me-1.5" />
                                <span>{t('upgrade_plan')}</span>
                            </Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Global Command Palette (Ctrl+K) */}
            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
            />
        </div>
    );
};