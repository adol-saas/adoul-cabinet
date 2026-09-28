import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    FolderKanban,
    Scale,
    Users,
    DollarSign,
    Calendar,
    ArrowRight,
    Lock,
    Sparkles,
    CheckCircle2,
    FileText,
    Calculator,
    UserCheck,
    AlertCircle,
    Edit3,
    ShieldCheck,
} from 'lucide-react';
import { Client, DocumentTemplate, User } from '@/types';

interface DossierCreateProps {
    clients: Client[];
    adoulUsers: User[];
    templates: DocumentTemplate[];
    initialType: string;
    canUseAllTypes: boolean;
}

export default function TenantDossierCreate({
    clients = [],
    adoulUsers = [],
    templates = [],
    initialType = 'marriage',
    canUseAllTypes = false,
}: DossierCreateProps) {
    const today = new Date().toISOString().split('T')[0];

    const form = useForm({
        type: initialType,
        client_id: '',
        client2_id: '',
        // Manual entry fields for Party 1
        party1_name_ar: '',
        party1_name_fr: '',
        party1_cin: '',
        party1_phone: '',
        party1_birth_date: '',
        party1_birth_city: '',
        party1_address: '',
        party1_gender: 'male',
        // Manual entry fields for Party 2
        party2_name_ar: '',
        party2_name_fr: '',
        party2_cin: '',
        party2_phone: '',
        party2_birth_date: '',
        party2_birth_city: '',
        party2_address: '',
        party2_gender: 'female',
        adoul_id: adoulUsers[0]?.id ? String(adoulUsers[0].id) : '',
        amount_due: 1500,
        amount_paid: 1500,
        act_date: today,
        notes_ar: '',
        notes_fr: '',
        details: {
            mahr_amount: '50000',
            mahr_paid: '25000',
            mahr_deferred: '25000',
            witness1_name: 'شاهد أول (كامل الأهلية)',
            witness2_name: 'شاهد ثانٍ (كامل الأهلية)',
            property_name: 'عقار سكني أو فلاحي',
            property_location: 'المدينة / الجماعة',
            property_boundaries: 'شمالاً، جنوباً، شرقاً، غرباً',
            sale_price: '400000',
            // Mulkiya Lafif (12 witnesses)
            lafif_location: 'المدينة / الجماعة / الدائرة',
            lafif_boundaries: 'شمالاً، جنوباً، شرقاً، غرباً',
            lafif_area: '120 م²',
            lafif_years: '10 سنوات فأكثر بدون منازع',
            // Inheritance
            deceased_name: '',
            date_of_death: '',
            place_of_death: '',
            heirs_summary: '',
            estate_estimated_value: '',
            // Conversion to Islam
            original_name: '',
            nationality: '',
            identity_number: '',
            chosen_islamic_name: '',
            // Donation / Sadaqa
            donation_asset: '',
            possession_date: today,
            donation_conditions: 'حوز تام ومعاينة شرعية نافذة',
            // Mortgage / Mainlevee
            creditor_name: '',
            debtor_name: '',
            loan_amount: '',
            property_title_number: '',
        },
    });

    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const actCategories = [
        {
            id: 'family',
            label: 'الأسرة والأحوال الشخصية',
            types: [
                { id: 'marriage', label: 'رسم عقد زواج شرعي', free: true },
                { id: 'divorce', label: 'إشهاد طلاق اتفاقي / خلع', free: false },
                { id: 'raj3a', label: 'رسم الرجعة الشرعية', free: false },
                { id: 'thobout_zawjia', label: 'رسم ثبوت الزوجية', free: false },
                { id: 'hadana_nafaka', label: 'اتفاق الحضانة والنفقة', free: false },
                { id: 'nasab_iqrar', label: 'إقرار بالنسب والبنوة', free: false },
            ],
        },
        {
            id: 'property',
            label: 'المعاملات العقارية والرهون',
            types: [
                { id: 'property_sale', label: 'عقد بيع عقار محفظ / غير محفظ', free: false },
                { id: 'property_promise', label: 'وعد بالبيع العقاري والعربون', free: false },
                { id: 'mortgage', label: 'رسم الرهن الحيازي / الرسمي', free: false },
                { id: 'mainlevee', label: 'رفع اليد عن الرهن العقاري', free: false },
            ],
        },
        {
            id: 'inheritance',
            label: 'التركات والمواريث والوصايا',
            types: [
                { id: 'inheritance', label: 'رسم الإراثة وحصر الورثة', free: false },
                { id: 'will', label: 'رسم وصية شرعية (≤ الثلث)', free: false },
                { id: 'tarakah_qisma', label: 'قسمة التركة الرضائية', free: false },
                { id: 'tarakah_ihsa', label: 'إحصاء متروك الهالك والديون', free: false },
            ],
        },
        {
            id: 'donations',
            label: 'التبرعات والأوقاف',
            types: [
                { id: 'donation', label: 'رسم الهبة الصريحة مع الحوز', free: false },
                { id: 'sadaqa', label: 'رسم الصدقة الجارية', free: false },
            ],
        },
        {
            id: 'certificates',
            label: 'الشهادات العرفية والوكالات',
            types: [
                { id: 'mulkiya_lafif', label: 'رسم الملكية والاستمرار (لفيف 12 شاهداً)', free: false },
                { id: 'conversion_islam', label: 'شهادة اعتناق ودخول الإسلام', free: false },
                { id: 'poa', label: 'وكالة قانونية عامة / خاصة', free: false },
                { id: 'debt_recognition', label: 'رسم اعتراف بدين وأداء', free: false },
            ],
        },
    ];

    const allActTypes = actCategories.flatMap((c) => c.types);
    const displayedActTypes = selectedCategory === 'all'
        ? allActTypes
        : (actCategories.find((c) => c.id === selectedCategory)?.types || []);

    const handleTypeSelect = (typeId: string, isFree: boolean) => {
        if (!isFree && !canUseAllTypes) {
            alert('تحرير هذا النوع من العقود يتطلب باقة المحترف (Plan Muhtaraf). يرجى ترقية باقة المكتب من قسم الإعدادات.');
            return;
        }
        form.setData('type', typeId);
    };

    const calculateFees = () => {
        let adoulTariff = 500;
        let registrationFee = 200;
        let courtStamp = 150;

        if (form.data.type === 'marriage') {
            const mahr = Number(form.data.details.mahr_amount) || 0;
            adoulTariff = mahr > 50000 ? 800 : 500;
            registrationFee = 200;
            courtStamp = 150;
        } else if (form.data.type === 'property_sale') {
            const price = Number(form.data.details.sale_price) || 0;
            adoulTariff = Math.max(1200, Math.round(price * 0.01));
            registrationFee = Math.round(price * 0.04);
            courtStamp = 250;
        } else if (form.data.type === 'mulkiya_lafif') {
            adoulTariff = 1500;
            registrationFee = 200;
            courtStamp = 200;
        } else if (form.data.type === 'inheritance' || form.data.type === 'tarakah_qisma' || form.data.type === 'will') {
            adoulTariff = 1000;
            registrationFee = 500;
            courtStamp = 200;
        } else if (form.data.type === 'mortgage' || form.data.type === 'mainlevee') {
            adoulTariff = 800;
            registrationFee = 500;
            courtStamp = 200;
        } else if (form.data.type === 'donation' || form.data.type === 'sadaqa') {
            adoulTariff = 1000;
            registrationFee = 300;
            courtStamp = 150;
        } else if (form.data.type === 'conversion_islam') {
            adoulTariff = 300;
            registrationFee = 50;
            courtStamp = 50;
        } else if (form.data.type === 'poa') {
            adoulTariff = 300;
            registrationFee = 200;
            courtStamp = 100;
        } else {
            adoulTariff = 500;
            registrationFee = 200;
            courtStamp = 150;
        }

        const total = adoulTariff + registrationFee + courtStamp;
        return { adoulTariff, registrationFee, courtStamp, total };
    };

    const estimatedFees = calculateFees();

    const applyEstimatedFees = () => {
        form.setData((prev) => ({
            ...prev,
            amount_due: estimatedFees.total,
            amount_paid: estimatedFees.total,
        }));
    };

    const handleSelectParty1 = (clientId: string) => {
        if (!clientId) {
            form.setData((prev) => ({
                ...prev,
                client_id: '',
            }));
            return;
        }
        const found = clients.find((c) => String(c.id) === String(clientId));
        if (found) {
            form.setData((prev) => ({
                ...prev,
                client_id: clientId,
                party1_name_ar: found.name_ar || prev.party1_name_ar,
                party1_name_fr: found.name_fr || prev.party1_name_fr,
                party1_cin: found.cin || prev.party1_cin,
                party1_phone: found.phone || prev.party1_phone,
                party1_birth_date: (found as any).birth_date ? String((found as any).birth_date).split('T')[0] : prev.party1_birth_date,
                party1_birth_city: (found as any).birth_city || prev.party1_birth_city,
                party1_address: (found as any).address || prev.party1_address,
                party1_gender: (found as any).gender || 'male',
            }));
        } else {
            form.setData('client_id', clientId);
        }
    };

    const handleSelectParty2 = (clientId: string) => {
        if (!clientId) {
            form.setData((prev) => ({
                ...prev,
                client2_id: '',
            }));
            return;
        }
        const found = clients.find((c) => String(c.id) === String(clientId));
        if (found) {
            form.setData((prev) => ({
                ...prev,
                client2_id: clientId,
                party2_name_ar: found.name_ar || prev.party2_name_ar,
                party2_name_fr: found.name_fr || prev.party2_name_fr,
                party2_cin: found.cin || prev.party2_cin,
                party2_phone: found.phone || prev.party2_phone,
                party2_birth_date: (found as any).birth_date ? String((found as any).birth_date).split('T')[0] : prev.party2_birth_date,
                party2_birth_city: (found as any).birth_city || prev.party2_birth_city,
                party2_address: (found as any).address || prev.party2_address,
                party2_gender: (found as any).gender || 'female',
            }));
        } else {
            form.setData('client2_id', clientId);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/dossiers');
    };

    return (
        <TenantAdminLayout title="تحرير عقد أو محرر عدلي جديد">
            <Head title="تحرير عقد جديد — فضاء التوثيق العدلي" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dossiers">
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                                <ArrowRight className="h-4 w-4" />
                                <span>العودة للكناش</span>
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                فتح ملف ورسم عدلي جديد
                            </h2>
                            <p className="text-xs text-stone-500">
                                تسجيل أطراف العقد، البيانات الشرعية، الرسوم والأتعاب المقررة
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Step 1: Act Type Selector */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                <Scale className="h-4 w-4 text-emerald-600" />
                                <span>1. تحديد صنف ونوع المحرر العدلي (18 رسماً معتمداً)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Category Filter Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 dark:border-stone-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                        selectedCategory === 'all'
                                            ? 'bg-emerald-700 text-white shadow-2xs'
                                            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    كافة الأصناف ({allActTypes.length})
                                </button>
                                {actCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                            selectedCategory === cat.id
                                                ? 'bg-emerald-700 text-white shadow-2xs'
                                                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                                        }`}
                                    >
                                        {cat.label} ({cat.types.length})
                                    </button>
                                ))}
                            </div>

                            {/* Act Types Grid */}
                            <div className="grid sm:grid-cols-3 gap-2.5">
                                {displayedActTypes.map((t) => {
                                    const isSelected = form.data.type === t.id;
                                    const isLocked = !t.free && !canUseAllTypes;
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => handleTypeSelect(t.id, t.free)}
                                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                                isSelected
                                                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
                                                    : isLocked
                                                    ? 'border-stone-200 dark:border-stone-800 opacity-60 bg-stone-50 dark:bg-stone-900'
                                                    : 'border-stone-200 dark:border-stone-800 hover:border-emerald-400 bg-white dark:bg-stone-900'
                                            }`}
                                        >
                                            <span className="font-bold text-xs font-tajawal">{t.label}</span>
                                            {isLocked ? (
                                                <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                            ) : isSelected ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 2: Contracting Parties */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <Users className="h-4 w-4 text-emerald-600" />
                                    <span>2. أطراف العقد والمتعاقدون (إدخال وتدقيق يدوي لمنع الأخطاء)</span>
                                </CardTitle>
                                <Badge variant="secondary" className="gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                    <ShieldCheck className="h-3 w-3" />
                                    <span>مطابقة رسمية مع البطاقة الوطنية (CNIE)</span>
                                </Badge>
                            </div>
                            <CardDescription className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 mt-2 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>
                                    <strong>إجراء احترازي:</strong> يمكنك كتابة وتعديل بيانات المتعاقدين يدوياً مباشرة أدناه لتفادي أي أخطاء إملائية أو مطبعية يرتكبها المواطن. يمكنك أيضاً الاختيار السريع لملء الحقول تلقائياً ثم تصحيحها.
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 text-xs">
                            {/* Party 1 Section */}
                            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                                    <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100 font-tajawal">
                                        <UserCheck className="h-4 w-4 text-emerald-600" />
                                        <span>الطرف الأول (الزوج / البائع / الموكل / المشهود له) *</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-stone-500">اختيار سريع من السجل:</span>
                                        <select
                                            value={form.data.client_id}
                                            onChange={(e) => handleSelectParty1(e.target.value)}
                                            className="h-8 px-2 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                                        >
                                            <option value="">-- أو اختر من المتعاقدين المسجلين --</option>
                                            {clients.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name_ar} ({c.cin})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label>الاسم الكامل بالعربية *</Label>
                                        <Input
                                            value={form.data.party1_name_ar}
                                            onChange={(e) => form.setData('party1_name_ar', e.target.value)}
                                            placeholder="مثال: محمد بن علي العلمي"
                                            required={!form.data.client_id}
                                        />
                                        {form.errors.party1_name_ar && <p className="text-red-500 text-[11px]">{form.errors.party1_name_ar}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label>رقم البطاقة الوطنية (CIN) *</Label>
                                        <Input
                                            value={form.data.party1_cin}
                                            onChange={(e) => form.setData('party1_cin', e.target.value.toUpperCase())}
                                            placeholder="مثال: AB123456"
                                            required={!form.data.client_id}
                                        />
                                        {form.errors.party1_cin && <p className="text-red-500 text-[11px]">{form.errors.party1_cin}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <Label>رقم الهاتف</Label>
                                        <Input
                                            value={form.data.party1_phone}
                                            onChange={(e) => form.setData('party1_phone', e.target.value)}
                                            placeholder="06XXXXXXXX"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <Label>الاسم باللاتينية (FR)</Label>
                                        <Input
                                            value={form.data.party1_name_fr}
                                            onChange={(e) => form.setData('party1_name_fr', e.target.value)}
                                            placeholder="Nom & Prénom"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>تاريخ الازدياد</Label>
                                        <Input
                                            type="date"
                                            value={form.data.party1_birth_date}
                                            onChange={(e) => form.setData('party1_birth_date', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>مكان الازدياد</Label>
                                        <Input
                                            value={form.data.party1_birth_city}
                                            onChange={(e) => form.setData('party1_birth_city', e.target.value)}
                                            placeholder="الرباط، فاس..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>الجنس</Label>
                                        <select
                                            value={form.data.party1_gender}
                                            onChange={(e) => form.setData('party1_gender', e.target.value as any)}
                                            className="w-full h-9 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                                        >
                                            <option value="male">ذكر (مواطن)</option>
                                            <option value="female">أنثى (مواطنة)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label>العنوان ومحل الإقامة الفعلي</Label>
                                    <Input
                                        value={form.data.party1_address}
                                        onChange={(e) => form.setData('party1_address', e.target.value)}
                                        placeholder="العنوان الكامل المثبت ببطاقة التعريف أو شهادة السكنى"
                                    />
                                </div>
                            </div>

                            {/* Party 2 Section */}
                            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                                    <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100 font-tajawal">
                                        <UserCheck className="h-4 w-4 text-blue-600" />
                                        <span>الطرف الثاني (الزوجة / المشتري / الوكيل... - اختياري حسب العقد)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-stone-500">اختيار سريع من السجل:</span>
                                        <select
                                            value={form.data.client2_id}
                                            onChange={(e) => handleSelectParty2(e.target.value)}
                                            className="h-8 px-2 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                                        >
                                            <option value="">-- أو اختر من المتعاقدين المسجلين --</option>
                                            {clients.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name_ar} ({c.cin})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label>الاسم الكامل بالعربية</Label>
                                        <Input
                                            value={form.data.party2_name_ar}
                                            onChange={(e) => form.setData('party2_name_ar', e.target.value)}
                                            placeholder="مثال: فاطمة الزهراء الإدريسي"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>رقم البطاقة الوطنية (CIN)</Label>
                                        <Input
                                            value={form.data.party2_cin}
                                            onChange={(e) => form.setData('party2_cin', e.target.value.toUpperCase())}
                                            placeholder="مثال: CD654321"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>رقم الهاتف</Label>
                                        <Input
                                            value={form.data.party2_phone}
                                            onChange={(e) => form.setData('party2_phone', e.target.value)}
                                            placeholder="06XXXXXXXX"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <Label>الاسم باللاتينية (FR)</Label>
                                        <Input
                                            value={form.data.party2_name_fr}
                                            onChange={(e) => form.setData('party2_name_fr', e.target.value)}
                                            placeholder="Nom & Prénom"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>تاريخ الازدياد</Label>
                                        <Input
                                            type="date"
                                            value={form.data.party2_birth_date}
                                            onChange={(e) => form.setData('party2_birth_date', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>مكان الازدياد</Label>
                                        <Input
                                            value={form.data.party2_birth_city}
                                            onChange={(e) => form.setData('party2_birth_city', e.target.value)}
                                            placeholder="الدار البيضاء، مراكش..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>الجنس</Label>
                                        <select
                                            value={form.data.party2_gender}
                                            onChange={(e) => form.setData('party2_gender', e.target.value as any)}
                                            className="w-full h-9 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                                        >
                                            <option value="female">أنثى (مواطنة)</option>
                                            <option value="male">ذكر (مواطن)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label>العنوان ومحل الإقامة</Label>
                                    <Input
                                        value={form.data.party2_address}
                                        onChange={(e) => form.setData('party2_address', e.target.value)}
                                        placeholder="العنوان الكامل المثبت ببطاقة التعريف"
                                    />
                                </div>
                            </div>

                            {/* Supervisor Adoul & Date */}
                            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200 dark:border-stone-800">
                                <div className="space-y-1.5">
                                    <Label>العدل المتلقي المشرف *</Label>
                                    <select
                                        value={form.data.adoul_id}
                                        onChange={(e) => form.setData('adoul_id', e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold"
                                    >
                                        {adoulUsers.map((u) => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.job_title || 'عدل موثق'})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label>تاريخ الإشهاد والإبرام *</Label>
                                    <Input
                                        type="date"
                                        value={form.data.act_date}
                                        onChange={(e) => form.setData('act_date', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 3: Act Specific Details */}
                    {form.data.type === 'marriage' && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold font-tajawal">
                                    3. بيانات الصداق والشهود (عقد الزواج)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label>مبلغ الصداق الإجمالي (درهم)</Label>
                                        <Input
                                            value={form.data.details.mahr_amount}
                                            onChange={(e) => form.setData('details', { ...form.data.details, mahr_amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>المقبوض حالاً (المعجل)</Label>
                                        <Input
                                            value={form.data.details.mahr_paid}
                                            onChange={(e) => form.setData('details', { ...form.data.details, mahr_paid: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>الباقي في الذمة (المؤجل)</Label>
                                        <Input
                                            value={form.data.details.mahr_deferred}
                                            onChange={(e) => form.setData('details', { ...form.data.details, mahr_deferred: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>اسم الشاهد الأول</Label>
                                        <Input
                                            value={form.data.details.witness1_name}
                                            onChange={(e) => form.setData('details', { ...form.data.details, witness1_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>اسم الشاهد الثاني</Label>
                                        <Input
                                            value={form.data.details.witness2_name}
                                            onChange={(e) => form.setData('details', { ...form.data.details, witness2_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {form.data.type === 'property_sale' && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold font-tajawal">
                                    3. بيانات العقار موضوع البيع
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>تسمية العقار أو نوعه</Label>
                                        <Input
                                            value={form.data.details.property_name}
                                            onChange={(e) => form.setData('details', { ...form.data.details, property_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>ثمن البيع الإجمالي (درهم)</Label>
                                        <Input
                                            value={form.data.details.sale_price}
                                            onChange={(e) => form.setData('details', { ...form.data.details, sale_price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>موقع العقار وحدوده الشرعية</Label>
                                    <Input
                                        value={form.data.details.property_boundaries}
                                        onChange={(e) => form.setData('details', { ...form.data.details, property_boundaries: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3 (Mulkiya Lafif): 12 Witnesses Certificate */}
                    {form.data.type === 'mulkiya_lafif' && (
                        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                        <Scale className="h-4 w-4 text-emerald-600" />
                                        <span>3. بيانات رسم الملكية والاستمرار (لفيف 12 شاهداً)</span>
                                    </CardTitle>
                                    <Badge variant="emerald" className="text-[10px]">
                                        المادة 18 من القانون 16.03
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    إثبات الملكية والتصرف الهادئ العلني غير المتنازع فيه لمدة لا تقل عن 10 سنوات
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label>الموقع والجماعة الترابية *</Label>
                                        <Input
                                            value={form.data.details.lafif_location}
                                            onChange={(e) => form.setData('details', { ...form.data.details, lafif_location: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>المساحة التقديرية أو الممسوحة *</Label>
                                        <Input
                                            value={form.data.details.lafif_area}
                                            onChange={(e) => form.setData('details', { ...form.data.details, lafif_area: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>مدة الحوز والاستمرار *</Label>
                                        <Input
                                            value={form.data.details.lafif_years}
                                            onChange={(e) => form.setData('details', { ...form.data.details, lafif_years: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>الحدود الشرعية الأربعة (شمالاً، جنوباً، شرقاً، غرباً) *</Label>
                                    <Input
                                        value={form.data.details.lafif_boundaries}
                                        onChange={(e) => form.setData('details', { ...form.data.details, lafif_boundaries: e.target.value })}
                                    />
                                </div>
                                <div className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                                    <div className="font-bold text-emerald-800 dark:text-emerald-300">
                                        تذكير شرعي وقانوني:
                                    </div>
                                    <p>
                                        يشترط لتلقي شهادة اللفيف إحضار اثني عشر (12) شاهداً من أهل العدالة والمعرفة بالمشهود فيه وبحدوده وتصرف طالبه، مع التحقق من هوياتهم الكاملة عند الإشهاد أمام العدلين المنتصبين للإشهاد.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3 (Inheritance & Estate): رسم الإراثة والتركات */}
                    {(form.data.type === 'inheritance' || form.data.type === 'tarakah_qisma' || form.data.type === 'tarakah_ihsa' || form.data.type === 'will') && (
                        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-amber-600" />
                                        <span>3. بيانات الهالك والورثة ومتروك التركة (مدونة الأسرة المغربية)</span>
                                    </CardTitle>
                                    <Link href="/inheritance-calculator">
                                        <Button type="button" variant="outline" size="sm" className="text-[10px] h-7 gap-1 border-amber-300 text-amber-800 dark:text-amber-300">
                                            <Calculator className="h-3 w-3" />
                                            <span>فتح حاسبة الفرائض</span>
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label>اسم الهالك(ة) الكامل كما في الحالة المدنية *</Label>
                                        <Input
                                            placeholder="المرحوم(ة) فلان بن فلان"
                                            value={form.data.details.deceased_name}
                                            onChange={(e) => form.setData('details', { ...form.data.details, deceased_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>تاريخ الوفاة المضمن برسم الوفاة *</Label>
                                        <Input
                                            type="date"
                                            value={form.data.details.date_of_death}
                                            onChange={(e) => form.setData('details', { ...form.data.details, date_of_death: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>مكان الوفاة *</Label>
                                        <Input
                                            placeholder="مستشفى أو مسكن بالمدينة..."
                                            value={form.data.details.place_of_death}
                                            onChange={(e) => form.setData('details', { ...form.data.details, place_of_death: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>حصر الورثة والمستحقين الشرعيين *</Label>
                                        <Input
                                            placeholder="زوجة، ابنان، وثلاث بنات محازين ومحيطين بالتركة..."
                                            value={form.data.details.heirs_summary}
                                            onChange={(e) => form.setData('details', { ...form.data.details, heirs_summary: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>القيمة التقديرية لمتروك التركة (MAD)</Label>
                                        <Input
                                            type="number"
                                            placeholder="صافي التركة بعد الديون والوصايا"
                                            value={form.data.details.estate_estimated_value}
                                            onChange={(e) => form.setData('details', { ...form.data.details, estate_estimated_value: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3 (Conversion to Islam): شهادة اعتناق ودخول الإسلام */}
                    {form.data.type === 'conversion_islam' && (
                        <Card className="border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-emerald-600" />
                                    <span>3. بيانات معتنق(ة) الإسلام والشهادة الشرعية</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    إثبات الشهادتين والبراءة من كل دين يخالف دين الإسلام أمام العدلين المتلقيين
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>الاسم الأصلي الكامل في جواز السفر *</Label>
                                        <Input
                                            placeholder="الاسم الكامل باللاتينية أو العربية"
                                            value={form.data.details.original_name}
                                            onChange={(e) => form.setData('details', { ...form.data.details, original_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>الجنسية الحالية *</Label>
                                        <Input
                                            placeholder="مثال: فرنسية، إسبانية، كندية..."
                                            value={form.data.details.nationality}
                                            onChange={(e) => form.setData('details', { ...form.data.details, nationality: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>رقم جواز السفر أو بطاقة الإقامة بالمغرب *</Label>
                                        <Input
                                            value={form.data.details.identity_number}
                                            onChange={(e) => form.setData('details', { ...form.data.details, identity_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>الاسم الإسلامي المختار بعد الدخول في الإسلام *</Label>
                                        <Input
                                            placeholder="مثال: يوسف، مريم، عبد الله..."
                                            value={form.data.details.chosen_islamic_name}
                                            onChange={(e) => form.setData('details', { ...form.data.details, chosen_islamic_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3 (Donation / Sadaqa): رسم الهبة والصدقة */}
                    {(form.data.type === 'donation' || form.data.type === 'sadaqa') && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-emerald-600" />
                                    <span>3. بيانات الموهوب وشرط الحوز التام والمعاينة</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>وصف المال الموهوب أو المتصدق به *</Label>
                                        <Input
                                            placeholder="شقة، قطعة أرضية، مبلغ مالي..."
                                            value={form.data.details.donation_asset}
                                            onChange={(e) => form.setData('details', { ...form.data.details, donation_asset: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>تاريخ المعاينة والحوز الفعلي المعتبر *</Label>
                                        <Input
                                            type="date"
                                            value={form.data.details.possession_date}
                                            onChange={(e) => form.setData('details', { ...form.data.details, possession_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>شروط الهبة وإسقاط التراجع *</Label>
                                    <Input
                                        value={form.data.details.donation_conditions}
                                        onChange={(e) => form.setData('details', { ...form.data.details, donation_conditions: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3 (Mortgage / Mainlevee): الرهون ورفع اليد */}
                    {(form.data.type === 'mortgage' || form.data.type === 'mainlevee') && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-emerald-600" />
                                    <span>3. بيانات الرهن العقاري والمديونية والرسم العقاري</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>الدائن المرتهن (المؤسسة البنكية أو الشخص) *</Label>
                                        <Input
                                            placeholder="البنك أو الدائن المرتهن"
                                            value={form.data.details.creditor_name}
                                            onChange={(e) => form.setData('details', { ...form.data.details, creditor_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>المدين الراهن *</Label>
                                        <Input
                                            placeholder="المدين صاحب العقار"
                                            value={form.data.details.debtor_name}
                                            onChange={(e) => form.setData('details', { ...form.data.details, debtor_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>مبلغ الدين المضمون بالرهن (MAD) *</Label>
                                        <Input
                                            placeholder="المبلغ الأصلي للدين"
                                            value={form.data.details.loan_amount}
                                            onChange={(e) => form.setData('details', { ...form.data.details, loan_amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>رقم الرسم العقاري موضوع الرهن أو رفعه (Titre Foncier) *</Label>
                                        <Input
                                            placeholder="مثال: 12345/01 بالوكالة الوطنية للمحافظة العقارية"
                                            value={form.data.details.property_title_number}
                                            onChange={(e) => form.setData('details', { ...form.data.details, property_title_number: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Fees and Financials */}
                    <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-emerald-600" />
                                <span>4. رسوم التسجيل وأتعاب المكتب العدلي</span>
                            </CardTitle>
                            <Badge variant="emerald" className="gap-1 text-[11px]">
                                <Scale className="h-3 w-3 text-amber-300" />
                                <span>التعريفة الرسمية للعدول</span>
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                            {/* Live Moroccan Legal Fee Calculator Widget */}
                            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                        <Calculator className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                        <span>الاحتساب التقديري للواجبات والرسوم الرسمية</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={applyEstimatedFees}
                                        className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer shadow-2xs"
                                    >
                                        تطبيق التقدير في المبالغ المستحقة ↓
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                                    <div className="p-2 rounded-lg bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800">
                                        <div className="text-stone-500">أتعاب التلقي العدلي:</div>
                                        <div className="font-bold text-stone-900 dark:text-stone-100 font-mono mt-0.5">
                                            {estimatedFees.adoulTariff} MAD
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800">
                                        <div className="text-stone-500">واجبات التسجيل والتمبر:</div>
                                        <div className="font-bold text-stone-900 dark:text-stone-100 font-mono mt-0.5">
                                            {estimatedFees.registrationFee} MAD
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800">
                                        <div className="text-stone-500">كتابة الضبط / المحكمة:</div>
                                        <div className="font-bold text-stone-900 dark:text-stone-100 font-mono mt-0.5">
                                            {estimatedFees.courtStamp} MAD
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700">
                                        <div className="text-emerald-800 dark:text-emerald-300 font-semibold">المجموع التقديري:</div>
                                        <div className="font-extrabold text-emerald-900 dark:text-emerald-100 font-mono mt-0.5">
                                            {estimatedFees.total} MAD
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>المبلغ الإجمالي المستحق (MAD) *</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={form.data.amount_due}
                                        onChange={(e) => form.setData('amount_due', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>المبلغ المؤدى والمسدد مسبقاً (MAD) *</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={form.data.amount_paid}
                                        onChange={(e) => form.setData('amount_paid', Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <Label>شروط وتفاصيل إضافية في نص العقد (عربي)</Label>
                                <textarea
                                    rows={3}
                                    value={form.data.notes_ar}
                                    onChange={(e) => form.setData('notes_ar', e.target.value)}
                                    placeholder="شروط خاصة، أرقام الرسوم العقارية، أو ملاحظات كتابة الضبط..."
                                    className="w-full rounded-md border border-stone-300 dark:border-stone-700 p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/dossiers">
                            <Button type="button" variant="outline">إلغاء</Button>
                        </Link>
                        <Button type="submit" variant="emerald" className="px-8 font-bold" disabled={form.processing}>
                            {form.processing ? 'جاري فتح وتوليد الرقم المرجعي...' : 'تأكيد فتح الملف وتوليد الرسم'}
                        </Button>
                    </div>
                </form>
            </div>
        </TenantAdminLayout>
    );
}
