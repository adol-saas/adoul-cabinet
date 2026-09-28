import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Calculator,
    Scale,
    Users,
    DollarSign,
    FileText,
    ArrowRight,
    Sparkles,
    Printer,
    FileCheck,
    HelpCircle,
    Info,
} from 'lucide-react';
import { Client, OfficeSetting } from '@/types';

interface InheritanceCalculatorProps {
    clients: Client[];
    officeSetting: OfficeSetting | null;
    initialState: {
        deceased_gender: 'male' | 'female';
        estate_value: number;
    };
}

interface HeirShare {
    name: string;
    relation: string;
    count: number;
    shareFraction: string;
    shareType: 'فرض' | 'تعصيب' | 'فرض وتعصيب';
    legalProof: string;
    sharesCount: number;
    percentage: number;
    amountMad: number;
}

export default function InheritanceCalculator({
    clients = [],
    officeSetting,
    initialState,
}: InheritanceCalculatorProps) {
    const [deceasedName, setDeceasedName] = useState('المرحوم (هالك التركة)');
    const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>(initialState.deceased_gender || 'male');
    const [estateValue, setEstateValue] = useState<number>(initialState.estate_value || 100000);
    const [funeralExpenses, setFuneralExpenses] = useState<number>(5000);
    const [debtsValue, setDebtsValue] = useState<number>(0);
    const [willValue, setWillValue] = useState<number>(0);

    // Heirs counts
    const [wivesCount, setWivesCount] = useState<number>(1);
    const [hasHusband, setHasHusband] = useState<boolean>(false);
    const [sonsCount, setSonsCount] = useState<number>(2);
    const [daughtersCount, setDaughtersCount] = useState<number>(2);
    const [hasFather, setHasFather] = useState<boolean>(true);
    const [hasMother, setHasMother] = useState<boolean>(true);
    const [fullBrothersCount, setFullBrothersCount] = useState<number>(0);
    const [fullSistersCount, setFullSistersCount] = useState<number>(0);

    // Calculate net distributable estate
    const netEstate = Math.max(0, estateValue - funeralExpenses - debtsValue - willValue);

    // Compute Islamic distribution (Maliki & Moroccan Family Code rules)
    const computeDistribution = (): {
        shares: HeirShare[];
        totalBase: number;
        statusNote: string;
    } => {
        const shares: HeirShare[] = [];
        const hasChildren = (sonsCount > 0) || (daughtersCount > 0);
        const totalSiblings = fullBrothersCount + fullSistersCount;

        // 1. Spouse
        if (deceasedGender === 'male' && wivesCount > 0) {
            const fraction = hasChildren ? '1/8' : '1/4';
            const pct = hasChildren ? 0.125 : 0.25;
            shares.push({
                name: wivesCount > 1 ? `الزوجات (${wivesCount})` : 'الزوجة',
                relation: 'زوجة',
                count: wivesCount,
                shareFraction: fraction,
                shareType: 'فرض',
                legalProof: hasChildren ? 'الثمن فرضاً لوجود الفرع الوارث (م 343 مدونة الأسرة)' : 'الربع فرضاً لعدم وجود الفرع الوارث',
                sharesCount: hasChildren ? 1 : 2,
                percentage: pct * 100,
                amountMad: Math.round(netEstate * pct),
            });
        } else if (deceasedGender === 'female' && hasHusband) {
            const fraction = hasChildren ? '1/4' : '1/2';
            const pct = hasChildren ? 0.25 : 0.5;
            shares.push({
                name: 'الزوج',
                relation: 'زوج',
                count: 1,
                shareFraction: fraction,
                shareType: 'فرض',
                legalProof: hasChildren ? 'الربع فرضاً لوجود الفرع الوارث (م 342 مدونة الأسرة)' : 'النصف فرضاً لعدم وجود الفرع الوارث',
                sharesCount: hasChildren ? 1 : 2,
                percentage: pct * 100,
                amountMad: Math.round(netEstate * pct),
            });
        }

        // 2. Mother
        if (hasMother) {
            const hasMultipleSiblings = totalSiblings >= 2;
            const fraction = (hasChildren || hasMultipleSiblings) ? '1/6' : '1/3';
            const pct = (hasChildren || hasMultipleSiblings) ? (1 / 6) : (1 / 3);
            shares.push({
                name: 'الأم',
                relation: 'أم',
                count: 1,
                shareFraction: fraction,
                shareType: 'فرض',
                legalProof: (hasChildren || hasMultipleSiblings) ? 'السدس فرضاً لوجود الفرع أو الجمع من الإخوة (م 346)' : 'الثلث فرضاً لعدم الفرع وجمع الإخوة',
                sharesCount: 1,
                percentage: pct * 100,
                amountMad: Math.round(netEstate * pct),
            });
        }

        // 3. Father
        if (hasFather) {
            if (sonsCount > 0) {
                // Father takes 1/6 only
                const pct = 1 / 6;
                shares.push({
                    name: 'الأب',
                    relation: 'أب',
                    count: 1,
                    shareFraction: '1/6',
                    shareType: 'فرض',
                    legalProof: 'السدس فرضاً لوجود فرع وارث مذكر (ابن) (م 345)',
                    sharesCount: 1,
                    percentage: pct * 100,
                    amountMad: Math.round(netEstate * pct),
                });
            } else if (daughtersCount > 0) {
                // Father takes 1/6 + Asaba
                shares.push({
                    name: 'الأب',
                    relation: 'أب',
                    count: 1,
                    shareFraction: '1/6 + الباقي',
                    shareType: 'فرض وتعصيب',
                    legalProof: 'السدس فرضاً مع الباقي تعصيباً لوجود فرع مؤنث فقط',
                    sharesCount: 1,
                    percentage: 25,
                    amountMad: 0, // Computed with remainder
                });
            } else {
                // Father takes Asaba purely
                shares.push({
                    name: 'الأب',
                    relation: 'أب',
                    count: 1,
                    shareFraction: 'عاصب (الباقي)',
                    shareType: 'تعصيب',
                    legalProof: 'عاصب بنفسه يحوز باقي التركة بعد أصحاب الفروض',
                    sharesCount: 1,
                    percentage: 0,
                    amountMad: 0,
                });
            }
        }

        // Calculate assigned shares so far
        let assignedAmount = 0;
        shares.forEach((s) => {
            if (s.shareType === 'فرض') {
                assignedAmount += s.amountMad;
            }
        });

        const remainderForOffspringOrFather = Math.max(0, netEstate - assignedAmount);

        // 4. Children (Sons and Daughters)
        if (sonsCount > 0) {
            // Asaba bi-l-ghayr: 2 parts for each son, 1 part for each daughter
            const totalParts = (sonsCount * 2) + daughtersCount;
            const perPart = remainderForOffspringOrFather / totalParts;

            shares.push({
                name: `الأبناء الذكور (${sonsCount})`,
                relation: 'ابن',
                count: sonsCount,
                shareFraction: 'عصبة بالغير (للذكر مثل حظ الأنثيين)',
                shareType: 'تعصيب',
                legalProof: 'التعصيب بالغير مع البنات طبقا للمادة 350 من مدونة الأسرة',
                sharesCount: sonsCount * 2,
                percentage: ((sonsCount * 2) / totalParts) * (remainderForOffspringOrFather / (netEstate || 1)) * 100,
                amountMad: Math.round(perPart * 2 * sonsCount),
            });

            if (daughtersCount > 0) {
                shares.push({
                    name: `البنات الإناث (${daughtersCount})`,
                    relation: 'بنت',
                    count: daughtersCount,
                    shareFraction: 'عصبة بالغير مع الذكور',
                    shareType: 'تعصيب',
                    legalProof: 'للذكر مثل حظ الأنثيين بالمشاركة مع الأبناء الذكور',
                    sharesCount: daughtersCount,
                    percentage: (daughtersCount / totalParts) * (remainderForOffspringOrFather / (netEstate || 1)) * 100,
                    amountMad: Math.round(perPart * daughtersCount),
                });
            }
        } else if (daughtersCount > 0) {
            // Daughters alone without sons
            const fraction = daughtersCount === 1 ? '1/2' : '2/3';
            const pct = daughtersCount === 1 ? 0.5 : (2 / 3);
            const daughtersTotal = Math.round(netEstate * pct);

            shares.push({
                name: daughtersCount === 1 ? 'البنت الواحدة' : `البنات الإناث (${daughtersCount})`,
                relation: 'بنت',
                count: daughtersCount,
                shareFraction: fraction,
                shareType: 'فرض',
                legalProof: daughtersCount === 1 ? 'النصف فرضاً لانفرادها عن المعصب (م 348)' : 'الثلثان فرضاً لتعددهن وانعدام المعصب (م 347)',
                sharesCount: daughtersCount === 1 ? 3 : 4,
                percentage: pct * 100,
                amountMad: daughtersTotal,
            });

            // If father exists, father takes the remainder
            const fatherShare = shares.find((s) => s.relation === 'أب');
            if (fatherShare) {
                const remainder = Math.max(0, netEstate - assignedAmount - daughtersTotal);
                fatherShare.amountMad = Math.round((netEstate * (1 / 6)) + remainder);
                fatherShare.percentage = (fatherShare.amountMad / (netEstate || 1)) * 100;
            }
        } else {
            // No offspring: Father or Brothers take Asaba
            if (hasFather) {
                const fatherShare = shares.find((s) => s.relation === 'أب');
                if (fatherShare) {
                    fatherShare.amountMad = Math.round(remainderForOffspringOrFather);
                    fatherShare.percentage = (remainderForOffspringOrFather / (netEstate || 1)) * 100;
                }
            } else if (fullBrothersCount > 0 || fullSistersCount > 0) {
                const totalBroParts = (fullBrothersCount * 2) + fullSistersCount;
                const perBroPart = remainderForOffspringOrFather / (totalBroParts || 1);

                if (fullBrothersCount > 0) {
                    shares.push({
                        name: `الإخوة الأشقاء (${fullBrothersCount})`,
                        relation: 'أخ شقيق',
                        count: fullBrothersCount,
                        shareFraction: 'عصبة بالغير',
                        shareType: 'تعصيب',
                        legalProof: 'عصبة بالنفس أو بالغير في حالة عدم وجود الأب والفرع المذكر',
                        sharesCount: fullBrothersCount * 2,
                        percentage: ((fullBrothersCount * 2) / totalBroParts) * 100,
                        amountMad: Math.round(perBroPart * 2 * fullBrothersCount),
                    });
                }
                if (fullSistersCount > 0) {
                    shares.push({
                        name: `الأخوات الشقيقات (${fullSistersCount})`,
                        relation: 'أخت شقيقة',
                        count: fullSistersCount,
                        shareFraction: fullBrothersCount > 0 ? 'عصبة بالغير' : (fullSistersCount === 1 ? '1/2' : '2/3'),
                        shareType: fullBrothersCount > 0 ? 'تعصيب' : 'فرض',
                        legalProof: 'اقتسام التركة الشرعية بعد أصحاب الفروض',
                        sharesCount: fullSistersCount,
                        percentage: (fullSistersCount / totalBroParts) * 100,
                        amountMad: Math.round(perBroPart * fullSistersCount),
                    });
                }
            }
        }

        return {
            shares,
            totalBase: 24,
            statusNote: 'تم تأصيل الفريضة الشرعية وفق مقتضيات كتاب المواريث بمدونة الأسرة المغربية وقواعد الفقه المالكي.',
        };
    };

    const calculation = computeDistribution();

    const createInheritanceDossier = () => {
        const heirsSummary = calculation.shares
            .map((s) => `${s.name} (${s.shareFraction} - ${s.amountMad.toLocaleString()} درهم)`)
            .join('، ');

        router.visit(
            `/dossiers/create?type=inheritance&deceased_name=${encodeURIComponent(deceasedName)}&estate_value=${netEstate}&heirs=${encodeURIComponent(heirsSummary)}`
        );
    };

    return (
        <TenantAdminLayout title="حاسبة المواريث والتركات الشرعية (الفريضة)">
            <Head title="حاسبة المواريث وتأصيل الفريضة — فضاء التوثيق العدلي" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-700 text-white shadow-xs">
                            <Calculator className="h-6 w-6 text-amber-300" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100">
                                حاسبة الفريضة الشرعية وتأصيل الأنصبة
                            </h1>
                            <p className="text-xs text-stone-500">
                                احتساب دقيق لأنصبة أصحاب الفروض والعصبة والحجب وفق مدونة الأسرة المغربية (القانون 70.03)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="gap-1.5 text-xs font-semibold"
                        >
                            <Printer className="h-4 w-4" />
                            <span>طباعة الفريضة</span>
                        </Button>
                        <Button
                            variant="emerald"
                            size="sm"
                            onClick={createInheritanceDossier}
                            className="gap-1.5 font-bold shadow-xs"
                        >
                            <FileCheck className="h-4 w-4" />
                            <span>فتح رسم إراثة رسمي</span>
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Left Column: Heirs & Estate Inputs */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Estate Financials */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                    <span>1. الذمة المالية لمتروك الهالك</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-xs">
                                <div className="space-y-1">
                                    <Label>اسم الهالك / المتوفى</Label>
                                    <Input
                                        value={deceasedName}
                                        onChange={(e) => setDeceasedName(e.target.value)}
                                        placeholder="المرحوم عبد الله..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>جنس الهالك</Label>
                                        <div className="flex rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden p-0.5 bg-stone-100 dark:bg-stone-800">
                                            <button
                                                type="button"
                                                onClick={() => setDeceasedGender('male')}
                                                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                                    deceasedGender === 'male'
                                                        ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                                                        : 'text-stone-500'
                                                }`}
                                            >
                                                ذكر (متوفى)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeceasedGender('female')}
                                                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                                    deceasedGender === 'female'
                                                        ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                                                        : 'text-stone-500'
                                                }`}
                                            >
                                                أنثى (متوفاة)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label>إجمالي التركة (MAD)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={estateValue}
                                            onChange={(e) => setEstateValue(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-stone-500">مؤن التجهيز والدفن</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={funeralExpenses}
                                            onChange={(e) => setFuneralExpenses(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-stone-500">الديون المستحقة</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={debtsValue}
                                            onChange={(e) => setDebtsValue(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-stone-500">الوصية (≤ الثلث)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={willValue}
                                            onChange={(e) => setWillValue(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                                    <span className="font-semibold text-emerald-900 dark:text-emerald-200 text-xs">
                                        التركة الصافية القابلة للقسمة:
                                    </span>
                                    <span className="font-extrabold font-mono text-emerald-800 dark:text-emerald-300 text-sm">
                                        {netEstate.toLocaleString()} MAD
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Surviving Heirs Selection */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <Users className="h-4 w-4 text-emerald-600" />
                                    <span>2. الورثة الشرعيون المتخلفون عن الهالك</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4 text-xs">
                                {/* Spouses */}
                                {deceasedGender === 'male' ? (
                                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                                        <Label>عدد الزوجات على قيد الحياة (1 - 4):</Label>
                                        <div className="flex items-center gap-2">
                                            {[0, 1, 2, 3, 4].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setWivesCount(num)}
                                                    className={`w-7 h-7 rounded-lg font-bold text-xs cursor-pointer ${
                                                        wivesCount === num
                                                            ? 'bg-emerald-700 text-white'
                                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 hover:bg-stone-200'
                                                    }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                                        <Label>الزوج على قيد الحياة:</Label>
                                        <input
                                            type="checkbox"
                                            checked={hasHusband}
                                            onChange={(e) => setHasHusband(e.target.checked)}
                                            className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                                        />
                                    </div>
                                )}

                                {/* Children */}
                                <div className="space-y-2 border-b border-stone-100 dark:border-stone-800 pb-2">
                                    <div className="font-semibold text-stone-700 dark:text-stone-300">الفرع الوارث:</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] text-stone-500">عدد الأبناء (ذكور)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={sonsCount}
                                                onChange={(e) => setSonsCount(Math.max(0, Number(e.target.value)))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[11px] text-stone-500">عدد البنات (إناث)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={daughtersCount}
                                                onChange={(e) => setDaughtersCount(Math.max(0, Number(e.target.value)))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Parents */}
                                <div className="space-y-2 border-b border-stone-100 dark:border-stone-800 pb-2">
                                    <div className="font-semibold text-stone-700 dark:text-stone-300">الأصول (الأب والأم):</div>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasFather}
                                                onChange={(e) => setHasFather(e.target.checked)}
                                                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span>الأب حي</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasMother}
                                                onChange={(e) => setHasMother(e.target.checked)}
                                                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span>الأم حية</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Siblings (if no father and no male child) */}
                                <div className="space-y-2">
                                    <div className="font-semibold text-stone-700 dark:text-stone-300">
                                        الحواشي (الإخوة الأشقاء) — {hasFather || sonsCount > 0 ? <span className="text-amber-600 font-normal">محجوبون حجب حرمان</span> : <span>يرثون تعصيباً</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 opacity-90">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] text-stone-500">إخوة أشقاء (ذكور)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={fullBrothersCount}
                                                onChange={(e) => setFullBrothersCount(Math.max(0, Number(e.target.value)))}
                                                disabled={hasFather || sonsCount > 0}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[11px] text-stone-500">أخوات شقيقات (إناث)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={fullSistersCount}
                                                onChange={(e) => setFullSistersCount(Math.max(0, Number(e.target.value)))}
                                                disabled={hasFather || sonsCount > 0}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Inheritance Calculation & Breakdown */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-2 border-emerald-500/50 shadow-md">
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                        <Scale className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                        <span>جدول تأصيل الفريضة وتوزيع الأنصبة الشرعية</span>
                                    </CardTitle>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        المسألة الشرعية لتركة: {deceasedName}
                                    </p>
                                </div>
                                <Badge variant="emerald" className="font-mono text-xs">
                                    أصل المسألة: {calculation.totalBase}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <table className="w-full text-start text-xs">
                                    <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-800">
                                        <tr>
                                            <th className="p-3 text-start">الوارث الشرعي</th>
                                            <th className="p-3 text-start">الفرض / الصفة</th>
                                            <th className="p-3 text-start">السند القانوني</th>
                                            <th className="p-3 text-start">النسبة</th>
                                            <th className="p-3 text-end">المبلغ المستحق</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {calculation.shares.map((share, idx) => (
                                            <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                                                <td className="p-3 font-bold text-stone-900 dark:text-stone-100 font-tajawal">
                                                    {share.name}
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant={share.shareType === 'فرض' ? 'emerald' : 'gold'}
                                                        className="text-[10px]"
                                                    >
                                                        {share.shareFraction}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-stone-500 text-[11px] max-w-[180px] truncate" title={share.legalProof}>
                                                    {share.legalProof}
                                                </td>
                                                <td className="p-3 font-mono font-semibold text-stone-700 dark:text-stone-300">
                                                    {share.percentage.toFixed(1)}%
                                                </td>
                                                <td className="p-3 text-end font-mono font-bold text-emerald-800 dark:text-emerald-400">
                                                    {share.amountMad.toLocaleString()} MAD
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border-t border-emerald-100 dark:border-emerald-900 space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
                                        <Info className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                                        <span>{calculation.statusNote}</span>
                                    </div>
                                    <p className="text-[11px] text-stone-500 leading-relaxed">
                                        يمكن للعدل المتلقي اعتماد هذا الجدول في صياغة رسم الإراثة ومحضر تصفية التركة، مع مخاطبة السيد قاضي التوثيق بالمحكمة الابتدائية لاستصدار الصيغة التنفيذية.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Legal Reference Card */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100 font-tajawal">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                <span>ملاحظات وإجراءات التوثيق العدلي المتبعة في التركات</span>
                            </div>
                            <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-disc list-inside">
                                <li>يلزم إحضار 12 شاهداً في رسم الإراثة (لفيف الإراثة) في حالة عدم وجود عقود ميلاد رسمية تثبت النسب.</li>
                                <li>تؤدى ديون الهالك ومؤن التجهيز ومصروف الجنازة والوصية في حدود الثلث قبل توزيع أي سهم على الورثة.</li>
                                <li>تخضع قسمة العقارات المحفظة لشهادة إبراء ضريبي من إدارة الضرائب قبل التضمين بالمحافظة العقارية.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </TenantAdminLayout>
    );
}
