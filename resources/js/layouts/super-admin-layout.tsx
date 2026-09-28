import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { SharedProps } from '@/types';
import { useLanguage } from '@/context/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { FlashBanner } from '@/components/ui/flash-banner';
import { OfflineStatusBanner } from '@/components/ui/offline-status-banner';
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    FileText,
    FileCheck,
    HelpCircle,
    LogOut,
    Menu,
    X,
    Shield,
    ExternalLink,
    Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SuperAdminLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({
    children,
    title,
}) => {
    const pageProps = usePage<SharedProps & { open_messages_count?: number }>().props;
    const { auth, flash } = pageProps;
    const openMessagesCount = pageProps.open_messages_count || 0;
    const { t, isRtl } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { name: 'لوحة القيادة المركزية', name_fr: 'Vue d’ensemble', href: '/super-admin', icon: LayoutDashboard },
        { name: 'مكاتب العدول المشتركة', name_fr: 'Études Adoulaires', href: '/super-admin/tenants', icon: Building2 },
        {
            name: 'رسائل التواصل (اتصل بنا)',
            name_fr: 'Messages de contact',
            href: '/super-admin/messages',
            icon: Mail,
            badge: openMessagesCount > 0 ? openMessagesCount : null,
        },
        { name: 'باقات وأسعار الاشتراك', name_fr: 'Plans & Forfaits', href: '/super-admin/plans', icon: CreditCard },
        { name: 'المدونة ومستجدات القوانين', name_fr: 'Actualités & Blog', href: '/super-admin/blog', icon: FileText },
        { name: 'الدوريات والاتفاقيات الرسمية', name_fr: 'Conventions & Circulaires', href: '/super-admin/conventions', icon: FileCheck },
        { name: 'تذاكر الدعم الفني', name_fr: 'Support & Tickets', href: '/super-admin/tickets', icon: HelpCircle },
    ];

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col md:flex-row">
            <FlashBanner flash={flash} />
            <OfflineStatusBanner />

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-3.5 bg-emerald-900 text-white shadow sticky top-0 z-30">
                <div className="flex items-center gap-2 font-bold text-base">
                    <Shield className="h-5 w-5 text-amber-400" />
                    <span>Adoul Admin</span>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
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
                className={`fixed md:sticky top-0 z-40 h-screen w-72 bg-emerald-950 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-6 border-b border-emerald-800/60 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
                            <Shield className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight tracking-wide">Adoul</h1>
                            <p className="text-xs text-emerald-300">منصة الإدارة المركزية (Super Admin)</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPath === item.href || (item.href !== '/super-admin' && currentPath.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-emerald-800 text-white font-semibold shadow-inner'
                                            : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-amber-400' : 'text-emerald-300'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.badge ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-emerald-950 shadow-sm">
                                            {item.badge}
                                        </span>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info & quick links */}
                    <div className="p-4 border-t border-emerald-800/60 space-y-3">
                        <div className="flex items-center justify-between text-xs text-emerald-300 px-1">
                            <span>مسؤول النظام المركزي</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">SUPER</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-900/40">
                            <div className="h-9 w-9 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-sm text-emerald-200">
                                {auth.user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{auth.user?.name}</p>
                                <p className="text-[11px] text-emerald-300 truncate">{auth.user?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <Link
                                href="/"
                                className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>البوابة العامة</span>
                            </Link>

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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-xs">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{title || 'الإدارة المركزية'}</h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400">إدارة مكاتب العدول، الاشتراكات والرقمنة الوطنية</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSelector />
                        <ThemeToggle />
                        <Link
                            href="/"
                            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-stone-700 dark:text-stone-300"
                        >
                            <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                            <span>عرض المنصة</span>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col justify-between">
                    <div>{children}</div>

                    <footer className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-600 dark:text-stone-300">
                        <div>
                            <span>منصة عدول المركزية — المملكة المغربية</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>تطوير وتأمين:</span>
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
            </div>
        </div>
    );
};