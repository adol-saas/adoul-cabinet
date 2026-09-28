import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useLanguage } from '@/context/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { FlashBanner } from '@/components/ui/flash-banner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ShieldCheck,
    Scale,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Clock,
    CheckCircle2,
    Send,
    ArrowLeft,
    ArrowRight,
    Sparkles,
    MessageCircle,
    Stamp,
    Building2,
    Award,
    FileText,
    Search,
    FileCheck2,
    Globe,
    AlertCircle,
    Loader2,
    Lock,
    LayoutDashboard,
} from 'lucide-react';
import { SharedProps } from '@/types';

interface OfficeService {
    type: string;
    title_ar: string;
    title_fr: string;
    desc_ar: string;
}

interface PublicProfileProps {
    tenant: {
        id: string;
        name: string;
        city: string;
        phone: string;
        email: string;
    };
    officeSetting: any;
    services: OfficeService[];
}

const THEME_STYLES: Record<string, {
    headerGradient: string;
    accentBtn: 'emerald' | 'gold' | 'default';
    badgeClass: string;
    cardBorder: string;
    textColor: string;
}> = {
    emerald: {
        headerGradient: 'from-emerald-950 via-emerald-900 to-emerald-800',
        accentBtn: 'emerald',
        badgeClass: 'bg-emerald-800/80 border-amber-400/40 text-amber-300',
        cardBorder: 'border-emerald-600/30',
        textColor: 'text-emerald-900 dark:text-emerald-300',
    },
    blue: {
        headerGradient: 'from-blue-950 via-blue-900 to-blue-800',
        accentBtn: 'default',
        badgeClass: 'bg-blue-800/80 border-blue-400/40 text-blue-200',
        cardBorder: 'border-blue-600/30',
        textColor: 'text-blue-900 dark:text-blue-300',
    },
    amber: {
        headerGradient: 'from-stone-950 via-amber-950 to-stone-900',
        accentBtn: 'gold',
        badgeClass: 'bg-amber-900/80 border-amber-400/40 text-amber-300',
        cardBorder: 'border-amber-600/30',
        textColor: 'text-amber-900 dark:text-amber-300',
    },
    ruby: {
        headerGradient: 'from-rose-950 via-rose-900 to-stone-900',
        accentBtn: 'default',
        badgeClass: 'bg-rose-900/80 border-rose-400/40 text-rose-200',
        cardBorder: 'border-rose-600/30',
        textColor: 'text-rose-900 dark:text-rose-300',
    },
    slate: {
        headerGradient: 'from-slate-950 via-slate-900 to-slate-800',
        accentBtn: 'default',
        badgeClass: 'bg-slate-800/80 border-slate-500/40 text-slate-200',
        cardBorder: 'border-slate-600/30',
        textColor: 'text-slate-900 dark:text-slate-300',
    },
};

export default function PublicOfficeProfile({ tenant, officeSetting, services = [] }: PublicProfileProps) {
    const { t, isRtl } = useLanguage();
    const { flash, auth } = usePage<SharedProps>().props;

    const themeKey = officeSetting?.theme_color || 'emerald';
    const currentTheme = THEME_STYLES[themeKey] || THEME_STYLES.emerald;

    const today = new Date().toISOString().split('T')[0];

    const [activeTab, setActiveTab] = useState<'appointment' | 'copy' | 'track'>('appointment');

    // Appointment Form
    const apptForm = useForm({
        client_name: '',
        client_phone: '',
        client_email: '',
        type: 'marriage',
        preferred_date: today,
        notes: '',
    });

    const submitAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        const isCentralPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/office/');
        const url = isCentralPath ? `/office/${tenant.id}/appointment` : '/appointment-request';
        apptForm.post(url, {
            onSuccess: () => apptForm.reset(),
        });
    };

    // Copy / Extract Request Form (Citizens & MRE)
    const copyForm = useForm({
        applicant_name: '',
        applicant_cin: '',
        applicant_phone: '',
        applicant_email: '',
        act_type: 'marriage',
        act_year: '',
        parties_names: '',
        delivery_mode: 'pickup',
        country_city: '',
        notes: '',
    });

    const submitCopyRequest = (e: React.FormEvent) => {
        e.preventDefault();
        const isCentralPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/office/');
        const url = isCentralPath ? `/office/${tenant.id}/copy-request` : '/copy-request';
        copyForm.post(url, {
            onSuccess: () => copyForm.reset(),
        });
    };

    // Dossier Tracking State
    const [trackRef, setTrackRef] = useState('');
    const [trackCin, setTrackCin] = useState('');
    const [trackLoading, setTrackLoading] = useState(false);
    const [trackError, setTrackError] = useState<string | null>(null);
    const [trackResult, setTrackResult] = useState<any>(null);

    const handleTrackDossier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackRef.trim()) return;
        setTrackLoading(true);
        setTrackError(null);
        setTrackResult(null);

        try {
            const isCentralPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/office/');
            const trackUrl = isCentralPath ? `/office/${tenant.id}/track-dossier` : '/track-dossier';
            const res = await (window as any).axios.post(trackUrl, {
                reference: trackRef.trim(),
                cin: trackCin.trim(),
            });

            if (res.data?.success && res.data?.dossier) {
                setTrackResult(res.data.dossier);
            } else {
                setTrackError(res.data?.message || 'تعذر العثور على الملف.');
            }
        } catch (err: any) {
            setTrackError(
                err?.response?.data?.message ||
                'تعذر استرداد بيانات الملف. يرجى التحقق من الرقم المرجعي أو التواصل مع كتابة المكتب.'
            );
        } finally {
            setTrackLoading(false);
        }
    };

    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col selection:bg-emerald-500 selection:text-white">
            <Head title={`${officeSetting?.office_name_ar || tenant.name} — فضاء المواطن وحجز المواعيد العدلية`} />
            <FlashBanner flash={flash} />

            {/* Office Admin Preview Banner */}
            {auth?.user && (
                <div className="bg-emerald-950 text-emerald-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/80 sticky top-0 z-50 shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="font-bold text-amber-300 font-tajawal text-xs sm:text-sm">
                            أنت تعاين الآن البوابة العامة للمكتب كما تظهر لعموم المواطنين والموكلين
                        </span>
                    </div>
                    <a
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all shadow-xs cursor-pointer"
                    >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        <span>العودة إلى لوحة التحكم</span>
                    </a>
                </div>
            )}

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {officeSetting?.logo_path ? (
                            <img
                                src={officeSetting.logo_path}
                                alt={officeSetting?.office_name_ar || tenant.name}
                                className="h-11 w-11 object-contain rounded-xl border border-stone-200 dark:border-stone-800 p-1 bg-white"
                            />
                        ) : (
                            <div className="p-2.5 rounded-xl bg-emerald-800 text-white shadow-sm flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6 text-amber-300" />
                            </div>
                        )}
                        <div>
                            <span className="text-lg font-bold tracking-tight text-emerald-950 dark:text-emerald-300 font-tajawal block">
                                {officeSetting?.office_name_ar || tenant.name}
                            </span>
                            <span className="text-xs text-stone-500">
                                {officeSetting?.city || tenant.city} — المحكمة الابتدائية المختصة
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth?.user && (
                            <a
                                href="/dashboard"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                                <LayoutDashboard className="h-3.5 w-3.5" />
                                <span>لوحة التحكم</span>
                            </a>
                        )}
                        <LanguageSelector />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Office Hero Showcase with Custom Banner or Gradient */}
            <section
                className={`relative overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-white bg-gradient-to-b ${currentTheme.headerGradient}`}
                style={
                    officeSetting?.hero_image_path
                        ? {
                              backgroundImage: `linear-gradient(rgba(10, 30, 20, 0.85), rgba(10, 30, 20, 0.92)), url(${officeSetting.hero_image_path})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                          }
                        : undefined
                }
            >
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6 shadow-sm ${currentTheme.badgeClass}`}>
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        <span>مكتب عدول معتمد ومسجل في الهيئة الوطنية للعدول بالمغرب</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold font-tajawal tracking-tight">
                        {officeSetting?.office_name_ar || tenant.name}
                    </h1>

                    {officeSetting?.tagline_ar && (
                        <p className="mt-3 text-amber-300 font-semibold text-base sm:text-lg font-tajawal">
                            «{officeSetting.tagline_ar}»
                        </p>
                    )}

                    <p className="mt-4 text-emerald-100/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        {officeSetting?.bio_ar ||
                            'نستقبلكم لإبرام كافة الإشهادات والعقود الشرعية والمدنية، وتوثيق التصرفات العقارية والمالية طبقاً للقانون المغربي رقم 16.03 المنظم لخطة العدالة.'}
                    </p>

                    {/* Quick Contacts Bar */}
                    <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-emerald-200">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-amber-400" />
                            <span>{officeSetting?.address || 'شارع الحسن الثاني، عمارة التوثيق'} — {tenant.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-4 w-4 text-amber-400" />
                            <span dir="ltr">{officeSetting?.phone || tenant.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-amber-400" />
                            <span>الإثنين إلى الجمعة: 08:30 - 16:30</span>
                        </div>
                    </div>

                    {/* WhatsApp Action Button */}
                    {officeSetting?.whatsapp_number && (
                        <div className="mt-6">
                            <a
                                href={`https://wa.me/${officeSetting.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم ورحمة الله، أود الاستفسار حول إبرام عقد لدى مكتبكم الموقر.')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>تواصل فوري عبر الواتساب مع كتابة المكتب</span>
                            </a>
                        </div>
                    )}
                </div>
            </section>

            {/* Main Content: Services + Booking Form */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Services Column */}
                    <div className="lg:col-span-7 space-y-6">
                        <div>
                            <Badge variant="emerald" className="mb-2">الخدمات والمحررات العدلية</Badge>
                            <h2 className="text-2xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                اختصاصات وخدمات المكتب المعتمدة
                            </h2>
                            <p className="text-xs text-stone-500 mt-1">
                                جميع العقود تنجز بحضور شاهدي عدل ويتم تضمينها ومخاطبة قاضي التوثيق عليها بالمحكمة الابتدائية المختصة
                            </p>
                        </div>

                        <div className="space-y-4">
                            {services.map((svc) => (
                                <Card key={svc.type} className="hover:border-emerald-600 transition-all border-stone-200 dark:border-stone-800">
                                    <CardHeader className="p-4 sm:p-5">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className={`text-base font-bold font-tajawal ${currentTheme.textColor}`}>
                                                {svc.title_ar}
                                            </CardTitle>
                                            <span className="text-[11px] text-stone-400">{svc.title_fr}</span>
                                        </div>
                                        <CardDescription className="text-xs leading-relaxed text-stone-600 dark:text-stone-400 mt-2">
                                            {svc.desc_ar}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>

                        {/* Law Compliance & Official Stamp Box */}
                        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="font-bold flex items-center gap-1.5 text-sm">
                                    <Scale className="h-4 w-4 text-amber-600" />
                                    <span>المرجع القضائي والإشراف الرسمي:</span>
                                </div>
                                {officeSetting?.stamp_image_path && (
                                    <img
                                        src={officeSetting.stamp_image_path}
                                        alt="طابع المكتب"
                                        className="h-12 w-12 object-contain opacity-80"
                                    />
                                )}
                            </div>
                            <p className="leading-relaxed">
                                يخضع هذا المكتب لإشراف {officeSetting?.qadi_name || 'السيد قاضي التوثيق بالمحكمة الابتدائية المختصة'}، وتعتبر وثائقه رسمية ونافذة وقابلة للتنفيذ المباشر بمجرد مخاطبة القاضي عليها وفقاً للقانون 16.03.
                            </p>
                        </div>
                    </div>

                    {/* Interactive Citizen Suite Column */}
                    <div className="lg:col-span-5 sticky top-24">
                        <Card className={`border-2 shadow-xl bg-white dark:bg-stone-900 ${currentTheme.cardBorder}`}>
                            {/* Tab Switcher */}
                            <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-800/60 p-1.5 gap-1 text-xs font-semibold rounded-t-xl">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('appointment')}
                                    className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                        activeTab === 'appointment'
                                            ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                                    }`}
                                >
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>حجز موعد</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('copy')}
                                    className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
                                        activeTab === 'copy'
                                            ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                                    }`}
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>طلب نظير</span>
                                    <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-normal hidden sm:inline">MRE</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('track')}
                                    className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                        activeTab === 'track'
                                            ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                                    }`}
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    <span>تتبع ملف</span>
                                </button>
                            </div>

                            {/* TAB 1: APPOINTMENT */}
                            {activeTab === 'appointment' && (
                                <>
                                    <CardHeader className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="h-5 w-5 text-amber-300" />
                                            <CardTitle className="text-base font-bold font-tajawal text-white">
                                                طلب موعد استشارة أو إبرام عقد
                                            </CardTitle>
                                        </div>
                                        <CardDescription className="text-xs text-emerald-100/90">
                                            حدد التاريخ ونوع المحرر وسيقوم كاتب المكتب بالتواصل معكم لتأكيد الحضور
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-5">
                                        <form onSubmit={submitAppointment} className="space-y-3.5 text-xs">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="b-name">الاسم الكامل للمرتفق(ة) *</Label>
                                                <Input
                                                    id="b-name"
                                                    value={apptForm.data.client_name}
                                                    onChange={(e) => apptForm.setData('client_name', e.target.value)}
                                                    placeholder="محمد بن عبد الله"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="b-phone">رقم الهاتف للتواصل *</Label>
                                                    <Input
                                                        id="b-phone"
                                                        value={apptForm.data.client_phone}
                                                        onChange={(e) => apptForm.setData('client_phone', e.target.value)}
                                                        placeholder="06XXXXXXXX"
                                                        dir="ltr"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="b-email">البريد الإلكتروني</Label>
                                                    <Input
                                                        id="b-email"
                                                        type="email"
                                                        value={apptForm.data.client_email}
                                                        onChange={(e) => apptForm.setData('client_email', e.target.value)}
                                                        placeholder="client@mail.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="b-type">نوع الخدمة / العقد المطلوب *</Label>
                                                <select
                                                    id="b-type"
                                                    value={apptForm.data.type}
                                                    onChange={(e) => apptForm.setData('type', e.target.value)}
                                                    className="w-full h-10 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                                                    required
                                                >
                                                    <option value="marriage">توثيق عقد زواج شرعي</option>
                                                    <option value="property_sale">معاملة عقارية أو رسم بيع</option>
                                                    <option value="poa">وكالة رسمية خاصة أو عامة</option>
                                                    <option value="will">إراثة شرعية أو وصية</option>
                                                    <option value="divorce">إشهاد طلاق أو رجعة</option>
                                                    <option value="consultation">استشارة قانونية وتوثيقية</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="b-date">التاريخ المرغوب فيه للحضور للمكتب *</Label>
                                                <Input
                                                    id="b-date"
                                                    type="date"
                                                    min={today}
                                                    value={apptForm.data.preferred_date}
                                                    onChange={(e) => apptForm.setData('preferred_date', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="b-notes">ملاحظات إضافية أو تفاصيل العقد</Label>
                                                <textarea
                                                    id="b-notes"
                                                    rows={3}
                                                    value={apptForm.data.notes}
                                                    onChange={(e) => apptForm.setData('notes', e.target.value)}
                                                    placeholder="أذكر أية تفاصيل خاصة لتسهيل تحضير الملف مسبقاً..."
                                                    className="w-full rounded-md border border-stone-300 dark:border-stone-700 p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                variant="emerald"
                                                className="w-full py-2.5 font-bold shadow-sm"
                                                disabled={apptForm.processing}
                                            >
                                                <Send className="h-4 w-4 me-2" />
                                                <span>{apptForm.processing ? 'جاري إرسال الطلب...' : 'تأكيد إرسال طلب الموعد'}</span>
                                            </Button>

                                            <p className="text-[10px] text-stone-400 text-center">
                                                * الموعد يبقى مبدئياً حتى تأكيده هاتفياً من طرف كتابة المكتب.
                                            </p>
                                        </form>
                                    </CardContent>
                                </>
                            )}

                            {/* TAB 2: COPY / EXTRACT REQUEST (MRE FRIENDLY) */}
                            {activeTab === 'copy' && (
                                <>
                                    <CardHeader className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText className="h-5 w-5 text-amber-300" />
                                                <CardTitle className="text-base font-bold font-tajawal text-white">
                                                    طلب استخراج نظير أو نسخة رسمية
                                                </CardTitle>
                                            </div>
                                            <Badge variant="secondary" className="bg-amber-400 text-amber-950 font-bold text-[10px]">
                                                مواطنون & MRE
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-xs text-emerald-100/90">
                                            استخراج نسخ مطابقة للأصل من الرسوم القديمة مع إمكانية التوصيل لمغاربة العالم
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-5">
                                        <form onSubmit={submitCopyRequest} className="space-y-3.5 text-xs">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="c-name">الاسم الكامل للطالب(ة) *</Label>
                                                    <Input
                                                        id="c-name"
                                                        value={copyForm.data.applicant_name}
                                                        onChange={(e) => copyForm.setData('applicant_name', e.target.value)}
                                                        placeholder="محمد بن عبد الله"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="c-cin">رقم ب.ت.و أو جواز السفر *</Label>
                                                    <Input
                                                        id="c-cin"
                                                        value={copyForm.data.applicant_cin}
                                                        onChange={(e) => copyForm.setData('applicant_cin', e.target.value)}
                                                        placeholder="EE123456 / C123456"
                                                        dir="ltr"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="c-phone">رقم الهاتف (دولي أو مغربي) *</Label>
                                                    <Input
                                                        id="c-phone"
                                                        value={copyForm.data.applicant_phone}
                                                        onChange={(e) => copyForm.setData('applicant_phone', e.target.value)}
                                                        placeholder="+33 6... أو 06..."
                                                        dir="ltr"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="c-email">البريد الإلكتروني للإشعار</Label>
                                                    <Input
                                                        id="c-email"
                                                        type="email"
                                                        value={copyForm.data.applicant_email}
                                                        onChange={(e) => copyForm.setData('applicant_email', e.target.value)}
                                                        placeholder="email@domain.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="c-type">نوع المحرر المطلوب *</Label>
                                                    <select
                                                        id="c-type"
                                                        value={copyForm.data.act_type}
                                                        onChange={(e) => copyForm.setData('act_type', e.target.value)}
                                                        className="w-full h-10 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                                                        required
                                                    >
                                                        <option value="marriage">رسم عقد زواج</option>
                                                        <option value="property_sale">رسم شراء أو بيع عقاري</option>
                                                        <option value="will">رسم إراثة شرعية أو وصية</option>
                                                        <option value="poa">وكالة عدلية خاصة / عامة</option>
                                                        <option value="divorce">رسم طلاق أو رجعة</option>
                                                        <option value="other">رسم أو إشهاد عدلي آخر</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="c-year">سنة أو تاريخ الإبرام التقريبي</Label>
                                                    <Input
                                                        id="c-year"
                                                        value={copyForm.data.act_year}
                                                        onChange={(e) => copyForm.setData('act_year', e.target.value)}
                                                        placeholder="مثال: 2014 أو 1998"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-parties">أسماء أطراف العقد الأصليين *</Label>
                                                <Input
                                                    id="c-parties"
                                                    value={copyForm.data.parties_names}
                                                    onChange={(e) => copyForm.setData('parties_names', e.target.value)}
                                                    placeholder="مثال: الزوج أحمد والزوجة فاطمة، أو البائع والمشتري"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="c-delivery">طريقة الاستلام المفضلة *</Label>
                                                    <select
                                                        id="c-delivery"
                                                        value={copyForm.data.delivery_mode}
                                                        onChange={(e) => copyForm.setData('delivery_mode', e.target.value)}
                                                        className="w-full h-10 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                                                        required
                                                    >
                                                        <option value="pickup">سحب مباشر من مكتب العدل</option>
                                                        <option value="postal_mre">إرسالية بريدية دولية (MRE)</option>
                                                        <option value="email_scan">نسخة رقمية أولية عبر البريد</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="c-country">بلد ومدينة الإقامة الحالية</Label>
                                                    <Input
                                                        id="c-country"
                                                        value={copyForm.data.country_city}
                                                        onChange={(e) => copyForm.setData('country_city', e.target.value)}
                                                        placeholder="مثال: فرنسا - باريس / الدار البيضاء"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="c-notes">مراجع إضافية (أرقام مذكرة الحفظ أو الكناش)</Label>
                                                <textarea
                                                    id="c-notes"
                                                    rows={2}
                                                    value={copyForm.data.notes}
                                                    onChange={(e) => copyForm.setData('notes', e.target.value)}
                                                    placeholder="أية أرقام مرجعية قديمة تساعد في سرعة استخراج الوثيقة من الأرشيف..."
                                                    className="w-full rounded-md border border-stone-300 dark:border-stone-700 p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                variant="emerald"
                                                className="w-full py-2.5 font-bold shadow-sm"
                                                disabled={copyForm.processing}
                                            >
                                                <Send className="h-4 w-4 me-2" />
                                                <span>{copyForm.processing ? 'جاري إرسال الطلب...' : 'إرسال طلب استخراج النظير'}</span>
                                            </Button>

                                            <p className="text-[10px] text-stone-400 text-center">
                                                * يخضع تسليم النظير للتحقق من هوية الأطراف والصفة القانونية وفق مقتضيات خطة العدالة.
                                            </p>
                                        </form>
                                    </CardContent>
                                </>
                            )}

                            {/* TAB 3: LIVE DOSSIER TRACKING */}
                            {activeTab === 'track' && (
                                <>
                                    <CardHeader className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Search className="h-5 w-5 text-amber-300" />
                                            <CardTitle className="text-base font-bold font-tajawal text-white">
                                                تتبع مسار الملف ومخاطبة القاضي
                                            </CardTitle>
                                        </div>
                                        <CardDescription className="text-xs text-emerald-100/90">
                                            الاطلاع اللحظي على مراحل المعالجة وأداء الرسوم ومخاطبة قاضي التوثيق (الخطاب)
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-5 space-y-4 text-xs">
                                        {!trackResult ? (
                                            <form onSubmit={handleTrackDossier} className="space-y-3.5">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="t-ref">الرقم المرجعي للملف العدلي *</Label>
                                                    <Input
                                                        id="t-ref"
                                                        value={trackRef}
                                                        onChange={(e) => setTrackRef(e.target.value)}
                                                        placeholder="مثال: DOS-2026-XXXXX أو 00001"
                                                        dir="ltr"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="t-cin">رقم بطاقة التعريف الوطنية (لحماية الخصوصية)</Label>
                                                    <Input
                                                        id="t-cin"
                                                        value={trackCin}
                                                        onChange={(e) => setTrackCin(e.target.value)}
                                                        placeholder="رقم بطاقة أحد طرفي العقد (اختياري)"
                                                        dir="ltr"
                                                    />
                                                </div>

                                                {trackError && (
                                                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 flex items-start gap-2 text-xs">
                                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                        <span>{trackError}</span>
                                                    </div>
                                                )}

                                                <Button
                                                    type="submit"
                                                    variant="emerald"
                                                    className="w-full py-2.5 font-bold shadow-sm"
                                                    disabled={trackLoading}
                                                >
                                                    {trackLoading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                                            <span>جاري البحث وتتبع المسار...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Search className="h-4 w-4 me-2" />
                                                            <span>تتبع مسار المحرر</span>
                                                        </>
                                                    )}
                                                </Button>

                                                <p className="text-[10px] text-stone-400 text-center leading-relaxed">
                                                    يمكنكم إيجاد الرقم المرجعي في وصل الإيداع المسلم لكم من طرف كتابة المكتب أو عبر رسالة التأكيد.
                                                </p>
                                            </form>
                                        ) : (
                                            /* TRACKING RESULT VIEW */
                                            <div className="space-y-4">
                                                {/* Dossier Header Info */}
                                                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-xs font-bold text-emerald-950 dark:text-emerald-300">
                                                            {trackResult.reference}
                                                        </span>
                                                        <Badge variant="emerald" className="text-[10px]">
                                                            {trackResult.type_label}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-2 text-xs text-stone-600 dark:text-stone-300 space-y-0.5">
                                                        <p>
                                                            <span className="text-stone-400">الأطراف: </span>
                                                            <span className="font-medium">{trackResult.parties_masked}</span>
                                                        </p>
                                                        {trackResult.act_date && (
                                                            <p>
                                                                <span className="text-stone-400">تاريخ التحرير: </span>
                                                                <span>{trackResult.act_date}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Qadi Homologation Banner if Done */}
                                                {trackResult.qadi_reference && (
                                                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-center gap-2.5 text-xs">
                                                        <Stamp className="h-5 w-5 text-amber-600 shrink-0" />
                                                        <div>
                                                            <p className="font-bold">تم خطاب السيد قاضي التوثيق بالمحكمة</p>
                                                            <p className="text-[11px] text-amber-800 dark:text-amber-300">
                                                                رقم الخطاب: {trackResult.qadi_reference} {trackResult.qadi_validation_date ? `بتاريخ ${trackResult.qadi_validation_date}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 5-Step Pipeline */}
                                                <div className="space-y-3 pt-2">
                                                    <h4 className="font-bold text-stone-800 dark:text-stone-200 text-xs">
                                                        المسار القضائي والإجرائي للمحرر:
                                                    </h4>

                                                    <div className="space-y-3 relative before:absolute before:inset-0 before:left-auto before:right-3.5 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                                                        {trackResult.stages.map((stage: any) => {
                                                            const isCompleted = stage.state === 'completed';
                                                            const isCurrent = stage.state === 'current';

                                                            return (
                                                                <div key={stage.step} className="flex items-start gap-3 relative">
                                                                    <div
                                                                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold transition-all ${
                                                                            isCompleted
                                                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                                                : isCurrent
                                                                                ? 'bg-amber-500 text-white animate-pulse shadow-md ring-4 ring-amber-500/20'
                                                                                : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                                                                        }`}
                                                                    >
                                                                        {isCompleted ? (
                                                                            <CheckCircle2 className="h-4 w-4" />
                                                                        ) : (
                                                                            stage.step
                                                                        )}
                                                                    </div>

                                                                    <div className="flex-1 min-w-0 bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800">
                                                                        <div className="flex items-center justify-between">
                                                                            <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100 font-tajawal">
                                                                                {stage.name_ar}
                                                                            </h5>
                                                                            <span
                                                                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                                                    isCompleted
                                                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                                                        : isCurrent
                                                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                                        : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                                                                                }`}
                                                                            >
                                                                                {isCompleted ? 'مكتمل' : isCurrent ? 'قيد المعالجة' : 'في الانتظار'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                                                                            {stage.desc_ar}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setTrackResult(null);
                                                        setTrackRef('');
                                                        setTrackCin('');
                                                    }}
                                                    className="w-full text-xs mt-2"
                                                >
                                                    البحث عن ملف آخر
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-stone-900 text-stone-400 py-8 text-xs border-t border-stone-800 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
                    {officeSetting?.footer_text_ar && (
                        <p className="text-stone-300 text-xs max-w-2xl mx-auto mb-3 font-tajawal leading-relaxed">
                            {officeSetting.footer_text_ar}
                        </p>
                    )}
                    <p>© {new Date().getFullYear()} {officeSetting?.office_name_ar || tenant.name} — فضاء المواعيد والخدمات العدلية بالمملكة المغربية.</p>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-stone-500 text-[11px] pt-1">
                        <span>نظام التوثيق الرقمي مُستضاف بأمان وسرية تامة عبر منصة <Link href="/" className="text-emerald-400 hover:underline">Adoul</Link></span>
                        <span>•</span>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 text-stone-400 hover:text-amber-400 transition-colors font-medium"
                        >
                            <Lock className="h-3 w-3" />
                            <span>فضاء العدل وكتابة المكتب (Back-Office)</span>
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
