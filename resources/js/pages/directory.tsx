import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useLanguage } from '@/context/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Scale, Search, MapPin, Phone, Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

interface OfficeItem {
    id: string;
    name: string;
    city: string;
    phone: string;
    email: string;
    public_url?: string;
    domain?: string;
    plan_name: string;
    specialties: string[];
}

interface DirectoryProps {
    offices: OfficeItem[];
    cities: string[];
    filters: { q?: string; city?: string };
}

export default function Directory({ offices = [], cities = [], filters = {} }: DirectoryProps) {
    const { t, isRtl } = useLanguage();
    const [search, setSearch] = useState(filters.q || '');
    const [selectedCity, setSelectedCity] = useState(filters.city || 'all');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/directory', { q: search, city: selectedCity }, { preserveState: true });
    };

    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
            <Head title="دليل مكاتب العدول بالمملكة المغربية — Adoul" />

            <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-800 text-white">
                            <Scale className="h-5 w-5 text-amber-400" />
                        </div>
                        <span className="font-bold text-lg font-tajawal text-emerald-950 dark:text-emerald-300">Adoul</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <LanguageSelector />
                        <ThemeToggle />
                        <Link href="/login"><Button variant="outline" size="sm">{t('login')}</Button></Link>
                        <Link href="/register"><Button variant="gold" size="sm">{t('register_office')}</Button></Link>
                    </div>
                </div>
            </header>

            <section className="bg-emerald-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-4">
                        <ShieldCheck className="h-4 w-4" />
                        <span>الدليل الإلكتروني الرسمي للتوثيق العدلي</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold font-tajawal">دليل السادة العدول المعتمدين بالمغرب</h1>
                    <p className="mt-3 text-emerald-100 text-sm max-w-xl mx-auto">
                        ابحث عن أقرب مكتب عدول بدائرتك القضائية، واطلع على التخصصات واحجز موعداً إلكترونياً مؤكداً.
                    </p>

                    <form onSubmit={handleFilter} className="mt-8 flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-white dark:bg-stone-900 shadow-xl border border-emerald-700/50">
                        <div className="flex-1 relative">
                            <Search className="absolute start-3 top-3 h-4 w-4 text-stone-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث باسم العدل، المدينة، أو الهاتف..."
                                className="ps-9 text-stone-900 dark:text-stone-100 h-10"
                            />
                        </div>

                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="h-10 px-3 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        >
                            <option value="all">كافة المدن والدوائر</option>
                            {cities.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <Button type="submit" variant="emerald" className="h-10 px-6 font-bold">
                            <span>تصفية البحث</span>
                        </Button>
                    </form>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                <div className="mb-6 text-sm text-stone-600 dark:text-stone-400">
                    تم العثور على <strong className="text-emerald-700 dark:text-emerald-400">{offices.length}</strong> مكتب عدول معتمد
                </div>

                {offices.length === 0 ? (
                    <Card className="p-12 text-center max-w-lg mx-auto">
                        <Scale className="h-12 w-12 text-stone-400 mx-auto mb-3" />
                        <CardTitle className="text-lg">لم يتم العثور على مكاتب تطابق بحثك</CardTitle>
                    </Card>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offices.map((office) => (
                            <Card key={office.id} className="flex flex-col justify-between hover:shadow-lg transition-all border-stone-200 dark:border-stone-800 hover:border-emerald-600">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-lg font-bold font-tajawal text-emerald-900 dark:text-emerald-300">
                                                {office.name}
                                            </CardTitle>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                                    <span>{office.city} — المملكة المغربية</span>
                                                </div>
                                                {office.domain && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono border border-emerald-200 dark:border-emerald-800/60" dir="ltr">
                                                        {office.domain}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant="emerald" className="text-[10px] shrink-0">{office.plan_name}</Badge>
                                    </div>

                                    <div className="mt-4 space-y-1.5 text-xs text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-3">
                                        <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-amber-600" /><span dir="ltr">{office.phone}</span></div>
                                        <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-amber-600" /><span className="truncate">{office.email}</span></div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="text-[11px] font-semibold text-stone-500 mb-2">الخدمات المعتمدة:</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {office.specialties.map((spec, i) => (
                                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                                                    <CheckCircle className="h-2.5 w-2.5 text-emerald-600" />
                                                    <span>{spec}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                    <a href={office.public_url || `/office/${office.id}`} target="_blank" rel="noreferrer" className="w-full">
                                        <Button variant="outline" className="w-full text-xs font-semibold gap-2 border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                                            <span>زيارة صفحة المكتب وحجز موعد</span>
                                            <Arrow className="h-3.5 w-3.5" />
                                        </Button>
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-stone-900 text-stone-400 py-6 text-xs text-center border-t border-stone-800">
                <p>© {new Date().getFullYear()} Adoul — الدليل الرقمي المعتمد لمكاتب العدول بالمغرب.</p>
            </footer>
        </div>
    );
}
