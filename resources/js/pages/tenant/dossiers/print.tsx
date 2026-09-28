import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { offlineStorage } from '@/lib/offline-storage';
import {
    Scale,
    Printer,
    ArrowLeft,
    ShieldCheck,
    FileDown,
    Edit3,
    Eye,
    Save,
    Layout,
    Stamp,
    Sliders,
    Sparkles,
    Check,
    Copy,
    AlignRight,
    AlignCenter,
    AlignJustify,
    Type,
    Frame,
    WifiOff,
    CheckCircle2,
    RotateCcw,
} from 'lucide-react';
import { Dossier, OfficeSetting } from '@/types';

interface DossierPrintProps {
    dossier: Dossier;
    officeSetting: OfficeSetting | null;
    verifyUrl: string;
    actTextAr?: string;
    actTextFr?: string;
    availableVariables?: Record<string, string>;
}

export default function TenantDossierPrint({
    dossier,
    officeSetting,
    verifyUrl,
    actTextAr: initialActTextAr,
    actTextFr,
    availableVariables = {},
}: DossierPrintProps) {
    // Act Type Arabic Labels
    const actTypeLabels: Record<string, string> = {
        marriage: 'رسم عقد زواج شرعي مبارك',
        divorce: 'رسم إشهاد طلاق وتفريق شرعي',
        revocation: 'رسم إشهاد مراجعة زوجية',
        property_sale: 'رسم شراء وتفويت عقاري تام',
        property_gift: 'رسم هبة وصدقة عقارية لوجه الله',
        poa: 'رسم وكالة قانونية رسمية خاصة',
        will: 'رسم إراثة وحصر تركة وتحديد أنصبة شرعية',
        certificate: 'رسم إشهاد واستعفاء عدلي رسمي',
        commercial_lease: 'رسم عقد كراء عقاري وتجاري',
        mortgage: 'رسم رهن وتوثيق دين شرعي موثق',
        lafif_property: 'رسم لفيف الملكية بـ 12 شاهداً مع التزكية',
        business_sale: 'رسم بيع وتفويت أصل تجاري',
    };

    const titleAr = actTypeLabels[dossier.type] || 'رسم ومحرر عدلي رسمي معتمد';

    // Editable text state
    const defaultText = initialActTextAr || dossier.notes_ar || `الحمد لله وحده، حضر بمكتب التوثيق العدلي المذكور أعلاه، لدى العدلين الموقعين أسفله، المنتصبين للإشهاد بمقتضى القانون رقم 16.03 المنظم لخطة العدالة بالمملكة المغربية، كل من:
السيد(ة) ${dossier.client?.name_ar} الحامل(ة) للبطاقة الوطنية للتعريف رقم ${dossier.client?.cin}، وهو في كامل أهليته المعتبرة شرعاً وقانوناً.
${dossier.client2 ? `وبحضور الطرف الثاني السيد(ة) ${dossier.client2?.name_ar} الحامل(ة) للبطاقة الوطنية رقم ${dossier.client2?.cin}.` : ''}

وقد صرح الطرفان برضاهما التام واتفاقهما على إبرام هذا المحرر العدلي طبقاً للشروط والأحكام الشرعية والقانونية المنصوص عليها، وشهد على ذلك الشاهدان المذكوران بعد التعريف التام والتأكد من الرضا والأهلية خالية من العيوب، وصدر عن الأطراف الإشهاد التام.`;

    const [actContent, setActContent] = useState(defaultText);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showVariablesDrawer, setShowVariablesDrawer] = useState(false);
    const [copiedVar, setCopiedVar] = useState<string | null>(null);

    // Mobile Responsive Tab (Switch between Editor and A4 Preview on small screens)
    const [mobileTab, setMobileTab] = useState<'preview' | 'editor'>('preview');

    // Offline Auto-save & Local Draft Recovery State
    const [savedLocallyToast, setSavedLocallyToast] = useState(false);
    const [recoveredDraft, setRecoveredDraft] = useState<any | null>(null);

    // Visual Placement & Styling Controls
    const [logoPlacement, setLogoPlacement] = useState<'right' | 'center' | 'left' | 'none'>('center');
    const [stampPlacement, setStampPlacement] = useState<'bottom-right' | 'bottom-left' | 'watermark' | 'none'>('bottom-left');
    const [signaturesLayout, setSignaturesLayout] = useState<'side-by-side' | 'stacked'>('side-by-side');
    const [borderStyle, setBorderStyle] = useState<'guilloche' | 'double' | 'minimal' | 'none'>('guilloche');
    const [fontFamily, setFontFamily] = useState<'font-amiri' | 'font-tajawal' | 'font-serif'>('font-amiri');
    const [fontSize, setFontSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
    const [showQr, setShowQr] = useState(true);
    const [headerType, setHeaderType] = useState<'kingdom' | 'office-only'>('kingdom');

    const sheetRef = useRef<HTMLDivElement>(null);

    // 1. Check for previously unsynced local drafts on mount
    useEffect(() => {
        const localDraft = offlineStorage.getActDraft(dossier.id);
        if (localDraft && localDraft.content && localDraft.content.trim() !== defaultText.trim()) {
            setRecoveredDraft(localDraft);
        }
    }, [dossier.id]);

    // 2. Continuous local autosave to protect against power/network failure
    useEffect(() => {
        const timer = setTimeout(() => {
            offlineStorage.saveActDraft(
                dossier.id,
                actContent,
                { notes_ar: actContent },
                {
                    logoPlacement,
                    stampPlacement,
                    signaturesLayout,
                    borderStyle,
                    fontFamily,
                    fontSize,
                    showQr,
                    headerType,
                }
            );
        }, 1500);

        return () => clearTimeout(timer);
    }, [actContent, logoPlacement, stampPlacement, signaturesLayout, borderStyle, fontFamily, fontSize, showQr, headerType, dossier.id]);

    // Restore locally saved draft
    const handleRestoreDraft = () => {
        if (recoveredDraft) {
            setActContent(recoveredDraft.content);
            if (recoveredDraft.customStyles) {
                if (recoveredDraft.customStyles.logoPlacement) setLogoPlacement(recoveredDraft.customStyles.logoPlacement);
                if (recoveredDraft.customStyles.stampPlacement) setStampPlacement(recoveredDraft.customStyles.stampPlacement);
                if (recoveredDraft.customStyles.signaturesLayout) setSignaturesLayout(recoveredDraft.customStyles.signaturesLayout);
                if (recoveredDraft.customStyles.borderStyle) setBorderStyle(recoveredDraft.customStyles.borderStyle);
                if (recoveredDraft.customStyles.fontFamily) setFontFamily(recoveredDraft.customStyles.fontFamily);
                if (recoveredDraft.customStyles.fontSize) setFontSize(recoveredDraft.customStyles.fontSize);
            }
            setRecoveredDraft(null);
            setIsEditing(true);
        }
    };

    // Save edited act text back to dossier with Offline-first resilience
    const handleSaveAct = () => {
        setIsSaving(true);

        // If currently offline, save strictly locally and notify user
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            offlineStorage.saveActDraft(dossier.id, actContent);
            setIsSaving(false);
            setSavedLocallyToast(true);
            setTimeout(() => setSavedLocallyToast(false), 4000);
            return;
        }

        router.put(
            `/dossiers/${dossier.id}`,
            {
                amount_due: dossier.amount_due,
                amount_paid: dossier.amount_paid,
                notes_ar: actContent,
            },
            {
                onSuccess: () => {
                    offlineStorage.clearActDraft(dossier.id);
                    setSavedLocallyToast(true);
                    setTimeout(() => setSavedLocallyToast(false), 3000);
                },
                onError: () => {
                    // Fallback to local storage if network dropped during request
                    offlineStorage.saveActDraft(dossier.id, actContent);
                    setSavedLocallyToast(true);
                    setTimeout(() => setSavedLocallyToast(false), 4000);
                },
                onFinish: () => setIsSaving(false),
            }
        );
    };

    // Copy variable into clipboard or insert
    const handleCopyVar = (key: string, val: string) => {
        navigator.clipboard.writeText(val);
        setCopiedVar(key);
        setTimeout(() => setCopiedVar(null), 2000);
    };

    // Export to Native Microsoft Word (.doc)
    const handleExportWord = () => {
        const headerHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${titleAr} - ${dossier.reference}</title>
                <!--[if gte mso 9]>
                <xml>
                <w:WordDocument>
                    <w:View>Print</w:View>
                    <w:Zoom>100</w:Zoom>
                    <w:DoNotOptimizeForBrowser/>
                </w:WordDocument>
                </xml>
                <![endif]-->
                <style>
                    @page Section1 {
                        size: 210.0mm 297.0mm;
                        margin: 20.0mm 20.0mm 20.0mm 20.0mm;
                        mso-header-margin: 12.0mm;
                        mso-footer-margin: 12.0mm;
                        mso-paper-source: 0;
                    }
                    div.Section1 { page: Section1; }
                    body {
                        font-family: 'Amiri', 'Traditional Arabic', 'Times New Roman', serif;
                        font-size: 14pt;
                        line-height: 2.0;
                        direction: rtl;
                        text-align: justify;
                        color: #1a1a1a;
                    }
                    .header-table { width: 100%; border-bottom: 2pt solid #1a1a1a; margin-bottom: 20pt; }
                    .header-table td { font-size: 10pt; vertical-align: top; }
                    .title { font-size: 18pt; font-weight: bold; text-align: center; color: #0d5f47; margin: 15pt 0; text-decoration: underline; }
                    .basmala { text-align: center; font-size: 15pt; font-weight: bold; margin-bottom: 5pt; }
                    .salat { text-align: center; font-size: 11pt; color: #555; margin-bottom: 15pt; }
                    .act-body { margin: 20pt 0; text-align: justify; white-space: pre-line; }
                    .signatures-table { width: 100%; margin-top: 30pt; border-top: 1pt dashed #666; }
                    .signatures-table td { width: 50%; text-align: center; padding: 15pt; vertical-align: top; }
                    .qadi-box { border: 2pt solid #1a1a1a; padding: 10pt; margin-top: 25pt; background-color: #f9f9f9; font-size: 10pt; }
                </style>
            </head>
            <body>
                <div class="Section1">
                    <table class="header-table" dir="rtl">
                        <tr>
                            <td style="text-align: right; width: 35%;">
                                <strong>المملكة المغربية</strong><br/>
                                وزارة العدل<br/>
                                المحكمة الابتدائية ب${officeSetting?.city || 'المغرب'}<br/>
                                قسم قضاء الأسرة والتوثيق
                            </td>
                            <td style="text-align: center; width: 30%;">
                                <div style="font-size: 16pt; font-weight: bold;">⚖️</div>
                                <div style="font-size: 9pt; font-weight: bold;">ROYAUME DU MAROC</div>
                            </td>
                            <td style="text-align: left; width: 35%;">
                                <strong>${officeSetting?.office_name_ar || 'مكتب السادة العدول'}</strong><br/>
                                <span>${officeSetting?.office_name_fr || ''}</span><br/>
                                <span>الهاتف: ${officeSetting?.phone || ''}</span>
                            </td>
                        </tr>
                    </table>

                    <div class="basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                    <div class="salat">وَصَلَّى اللَّهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَآلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيمًا</div>

                    <div class="title">${titleAr}</div>
                    <div style="text-align: center; font-size: 10pt; margin-bottom: 15pt;">
                        الرقم المرجعي: <strong>${dossier.reference}</strong> &bull; تاريخ الإشهاد: <strong>${dossier.act_date || new Date().toISOString().split('T')[0]}</strong>
                    </div>

                    <div class="act-body">
                        ${actContent.replace(/\n/g, '<br/>')}
                    </div>

                    <table class="signatures-table" dir="rtl">
                        <tr>
                            <td>
                                <strong>توقيع وخاتم العدل الأول المتلقي</strong><br/><br/>
                                <em>الأستاذ: ${dossier.adoul?.name || 'عدل موثق'}</em><br/>
                                <small style="color: #666;">توقيع معتمد ومسجل</small>
                            </td>
                            <td>
                                <strong>توقيع وخاتم العدل الثاني الشريك</strong><br/><br/>
                                <em>الأستاذ: عدل موثق شريك بالإشهاد</em><br/>
                                <small style="color: #666;">توقيع معتمد ومسجل</small>
                            </td>
                        </tr>
                    </table>

                    <div class="qadi-box">
                        <strong>مخاطبة السيد قاضي التوثيق بالمحكمة الابتدائية:</strong><br/>
                        الحمد لله، خوطب على هذا الرسم العدلي وصح أصله بعد تضمينه بكناش الأملاك/الأسرة تحت عدد: <strong>${dossier.qadi_reference || 'قيد التضمين الرسمي'}</strong>، وأمر بتنفيذه والعمل به وفق أحكام القانون 16.03.
                    </div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff' + headerHtml], { type: 'application/msword;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dossier.reference}_${dossier.type}_رسم_عدلي.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Border Styles mapping
    const borderClasses: Record<string, string> = {
        guilloche: 'border-4 border-double border-amber-800/70 p-10 sm:p-14 shadow-2xl relative bg-white',
        double: 'border-2 border-stone-800 p-10 sm:p-14 shadow-xl bg-white',
        minimal: 'border border-stone-300 p-8 sm:p-12 shadow-md bg-white',
        none: 'border-none p-6 sm:p-10 shadow-none bg-white',
    };

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col items-center p-3 sm:p-8 print:p-0 print:bg-white print:text-black">
            <Head title={`استوديو وطباعة الرسم: ${dossier.reference} — Adoul`} />

            {/* Recovered Offline Draft Alert */}
            {recoveredDraft && (
                <div className="w-full max-w-5xl mb-4 p-4 rounded-2xl bg-amber-500 text-stone-950 font-medium flex flex-wrap items-center justify-between gap-3 shadow-md border border-amber-600 print:hidden animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs">
                        <WifiOff className="h-4 w-4 shrink-0 text-amber-950" />
                        <span>
                            <strong>مسودة غير متزامنة محفوظة محلياً:</strong> يوجد نسخة أحدث تم تحريرها وحفظها محلياً على جهازك في ({new Date(recoveredDraft.savedAt).toLocaleTimeString('ar-MA')}). هل ترغب في استعادتها؟
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="bg-white text-stone-900 border-none text-xs h-7" onClick={handleRestoreDraft}>
                            <RotateCcw className="h-3 w-3 me-1" />
                            <span>استعادة المسودة</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="text-amber-950 hover:bg-amber-600/30 text-xs h-7" onClick={() => setRecoveredDraft(null)}>
                            تجاهل
                        </Button>
                    </div>
                </div>
            )}

            {/* Local Save Toast */}
            {savedLocallyToast && (
                <div className="fixed bottom-6 start-6 z-50 p-3 rounded-xl bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xl border border-emerald-600 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>تم حفظ تعديلات الرسم بنجاح محلياً في جهازكم (Offline-safe).</span>
                </div>
            )}

            {/* Mobile Tab Switcher (Visible on small screens) */}
            <div className="w-full max-w-5xl mb-3 grid grid-cols-2 gap-2 md:hidden print:hidden">
                <button
                    type="button"
                    onClick={() => {
                        setMobileTab('editor');
                        setIsEditing(true);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                        mobileTab === 'editor'
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow'
                            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                    }`}
                >
                    ✍️ تعديل المحتوى (Word)
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setMobileTab('preview');
                        setIsEditing(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                        mobileTab === 'preview'
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow'
                            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                    }`}
                >
                    📄 معاينة الوثيقة A4
                </button>
            </div>

            {/* Non-printed Main Action Bar */}
            <div className="w-full max-w-5xl mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <div className="flex items-center gap-2">
                    <Link href={`/dossiers/${dossier.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                            <ArrowLeft className="h-4 w-4" />
                            <span>تفاصيل الملف</span>
                        </Button>
                    </Link>

                    <Button
                        variant={isEditing ? 'gold' : 'outline'}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="gap-1.5 text-xs font-semibold"
                    >
                        {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                        <span>{isEditing ? 'وضع المعاينة والطباعة' : 'تعديل النص (مثل Word)'}</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVariablesDrawer(!showVariablesDrawer)}
                        className="gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>متغيرات الملف ({Object.keys(availableVariables).length})</span>
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {isEditing && (
                        <Button
                            variant="emerald"
                            size="sm"
                            onClick={handleSaveAct}
                            disabled={isSaving}
                            className="gap-1.5 font-bold text-xs shadow-xs"
                        >
                            <Save className="h-3.5 w-3.5" />
                            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات في الملف'}</span>
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportWord}
                        className="gap-1.5 font-bold text-xs text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800 hover:bg-blue-50"
                        title="تحميل ملف Word كامل التنسيق والتصميم"
                    >
                        <FileDown className="h-4 w-4 text-blue-600" />
                        <span>تصدير كـ Word (.doc)</span>
                    </Button>

                    <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => window.print()}
                        className="gap-1.5 font-bold text-xs shadow-md"
                    >
                        <Printer className="h-4 w-4" />
                        <span>طباعة رسمية A4</span>
                    </Button>
                </div>
            </div>

            {/* Non-printed Visual Layout Ribbon & Controls */}
            <div className="w-full max-w-5xl mb-6 print:hidden bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300 pb-2 border-b border-stone-200 dark:border-stone-800">
                    <Sliders className="h-4 w-4 text-emerald-600" />
                    <span>أدوات استوديو التحكم في تموضع الشعار، الخاتم، الإطار وتنسيق الخط:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Logo Placement */}
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-500 block">مكان الشعار/الميزان:</span>
                        <select
                            value={logoPlacement}
                            onChange={(e) => setLogoPlacement(e.target.value as any)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                        >
                            <option value="center">وسط الترويسة</option>
                            <option value="right">يمين الصفحة</option>
                            <option value="left">يسار الصفحة</option>
                            <option value="none">إخفاء الشعار</option>
                        </select>
                    </div>

                    {/* Stamp Placement */}
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-500 block">طابع وخاتم العدل:</span>
                        <select
                            value={stampPlacement}
                            onChange={(e) => setStampPlacement(e.target.value as any)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                        >
                            <option value="bottom-left">أسفل يسار (رسمي)</option>
                            <option value="bottom-right">أسفل يمين</option>
                            <option value="watermark">علامة مائية وسط</option>
                            <option value="none">بدون خاتم</option>
                        </select>
                    </div>

                    {/* Signatures Layout */}
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-500 block">إمضاء الشاهدين:</span>
                        <select
                            value={signaturesLayout}
                            onChange={(e) => setSignaturesLayout(e.target.value as any)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                        >
                            <option value="side-by-side">جنباً إلى جنب (أفقي)</option>
                            <option value="stacked">متتالية (عمودي)</option>
                        </select>
                    </div>

                    {/* Border Frame Style */}
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-500 block">نمط الإطار العدلي:</span>
                        <select
                            value={borderStyle}
                            onChange={(e) => setBorderStyle(e.target.value as any)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                        >
                            <option value="guilloche">إطار توثيقي مذهب</option>
                            <option value="double">إطار مزدوج كلاسيكي</option>
                            <option value="minimal">إطار خطي خفيف</option>
                            <option value="none">بدون إطار</option>
                        </select>
                    </div>

                    {/* Font Choice */}
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-500 block">نوع الخط العربي:</span>
                        <select
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value as any)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                        >
                            <option value="font-amiri">الخط الأميري (التقليدي)</option>
                            <option value="font-tajawal">خط تجوال المعاصر</option>
                            <option value="font-serif">خط النسخ التوثيقي</option>
                        </select>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-500 block">حجم الخط:</span>
                        <select
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value as any)}
                            className="w-full h-8 px-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                        >
                            <option value="text-sm">صغير (14pt)</option>
                            <option value="text-base">متوسط (16pt)</option>
                            <option value="text-lg">كبير (18pt)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Collapsible Dynamic Variables Drawer */}
            {showVariablesDrawer && (
                <div className="w-full max-w-5xl mb-6 print:hidden bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span>المتغيرات المستخرجة تلقائياً من بيانات الموكلين والعقد (انقر لنسخ القيمة):</span>
                        </span>
                        <span className="text-[10px] text-amber-700">تم تعويضها تلقائياً داخل متن الرسم</span>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-white dark:bg-stone-900 rounded-xl border border-amber-200 dark:border-amber-900/60">
                        {Object.entries(availableVariables).map(([key, val]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleCopyVar(key, val)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 text-[11px] text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
                                title={`القيمة: ${val}`}
                            >
                                <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">{key}</span>
                                <span className="text-stone-400">:</span>
                                <span className="max-w-[120px] truncate text-stone-600 dark:text-stone-300">{val}</span>
                                {copiedVar === key ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-stone-400" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Responsive Container for A4 Sheet */}
            <div className={`w-full flex justify-center overflow-x-auto pb-8 ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
                {/* Official Legal A4 Sheet */}
                <div
                    ref={sheetRef}
                    className={`w-full max-w-4xl text-stone-900 rounded-sm print:border-none print:shadow-none print:p-8 print:w-full min-w-[320px] ${borderClasses[borderStyle]}`}
                >
                {/* Watermark Stamp Overlay if selected */}
                {stampPlacement === 'watermark' && officeSetting?.stamp_image_path && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                        <img
                            src={officeSetting.stamp_image_path}
                            alt="طابع مائي"
                            className="w-96 h-96 object-contain"
                        />
                    </div>
                )}

                {/* Official Kingdom of Morocco Header */}
                <div
                    className={`flex items-start justify-between border-b-2 border-stone-800 pb-4 ${
                        logoPlacement === 'right' ? 'flex-row-reverse' : ''
                    }`}
                >
                    {/* Right Side Info */}
                    <div className="text-center w-52 space-y-0.5 text-xs font-bold font-tajawal">
                        <div>المملكة المغربية</div>
                        <div>وزارة العدل</div>
                        <div>محكمة الاستئناف</div>
                        <div>المحكمة الابتدائية ب{officeSetting?.city || 'المغرب'}</div>
                        <div>قسم قضاء الأسرة والتوثيق</div>
                    </div>

                    {/* Center: Emblem or Logo based on settings */}
                    {logoPlacement !== 'none' && (
                        <div className="flex flex-col items-center text-center">
                            {officeSetting?.logo_path ? (
                                <img
                                    src={officeSetting.logo_path}
                                    alt="شعار المكتب"
                                    className="h-16 w-16 object-contain mb-1"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full border-2 border-amber-600 flex items-center justify-center text-amber-700 mb-1">
                                    <Scale className="h-8 w-8" />
                                </div>
                            )}
                            <span className="text-[10px] font-bold tracking-widest uppercase">ROYAUME DU MAROC</span>
                            <span className="text-[9px] text-stone-500 font-tajawal">خطة العدالة — القانون 16.03</span>
                        </div>
                    )}

                    {/* Left Side Office Info */}
                    <div className="text-center w-52 space-y-0.5 text-xs font-tajawal">
                        <div className="font-bold text-emerald-950">{officeSetting?.office_name_ar || 'مكتب السادة العدول'}</div>
                        <div className="text-[11px] text-stone-600 font-sans">{officeSetting?.office_name_fr}</div>
                        <div className="text-[11px] font-mono mt-1" dir="ltr">{officeSetting?.phone}</div>
                        <div className="text-[10px] text-stone-500">{officeSetting?.address}</div>
                    </div>
                </div>

                {/* Basmala & Title */}
                <div className="text-center my-6 space-y-2">
                    <div className="font-amiri text-xl font-bold text-stone-800">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                    <div className="font-amiri text-xs text-stone-600">
                        وَصَلَّى اللَّهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَآلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيمًا
                    </div>
                    <h1 className="text-2xl font-bold font-tajawal text-emerald-950 pt-2 border-b-2 border-amber-500/40 inline-block px-8 pb-1">
                        {titleAr}
                    </h1>
                    <div className="flex justify-center items-center gap-4 text-xs font-mono text-stone-600 pt-1">
                        <span>الرقم المرجعي: <strong>{dossier.reference}</strong></span>
                        <span>&bull;</span>
                        <span>تاريخ الإشهاد: <strong>{dossier.act_date || new Date().toISOString().split('T')[0]}</strong></span>
                    </div>
                </div>

                {/* Legal Body Text: Either Inline Editable or Clean Printed */}
                <div className={`${fontFamily} ${fontSize} leading-loose text-justify my-8 px-2 text-stone-900`}>
                    {isEditing ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mb-2">
                                <span>أنت الآن في وضع التحرير المباشر (مثل Word). يمكنك تعديل أو إضافة أي فقرة:</span>
                                <span className="font-bold">المحتوى قابل للتعديل المباشر</span>
                            </div>
                            <textarea
                                value={actContent}
                                onChange={(e) => setActContent(e.target.value)}
                                rows={14}
                                className={`w-full p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/20 text-stone-900 leading-loose ${fontFamily} ${fontSize} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                            />
                        </div>
                    ) : (
                        <div className="whitespace-pre-line">
                            {actContent}
                        </div>
                    )}
                </div>

                {/* Double Notary Signature Section */}
                <div
                    className={`mt-10 pt-6 border-t border-stone-300 gap-8 text-center text-xs font-tajawal ${
                        signaturesLayout === 'side-by-side' ? 'grid grid-cols-2' : 'space-y-4'
                    }`}
                >
                    <div className="border border-dashed border-stone-400 p-4 rounded-sm min-h-[110px] flex flex-col justify-between relative bg-stone-50/50">
                        <div className="font-bold text-stone-800">توقيع وخاتم العدل الأول المتلقي</div>
                        <div className="text-stone-500 font-serif italic">الأستاذ(ة): {dossier.adoul?.name || 'عدل موثق'}</div>
                        <div className="text-[10px] text-stone-400">توقيع عدلي معتمد ومسجل</div>
                    </div>

                    <div className="border border-dashed border-stone-400 p-4 rounded-sm min-h-[110px] flex flex-col justify-between relative bg-stone-50/50">
                        <div className="font-bold text-stone-800">توقيع وخاتم العدل الثاني الشريك</div>
                        <div className="text-stone-500 font-serif italic">الأستاذ(ة): عدل موثق شريك بالإشهاد</div>
                        <div className="text-[10px] text-stone-400">توقيع عدلي معتمد ومسجل</div>
                    </div>
                </div>

                {/* Official Stamp Placement (bottom left or bottom right) */}
                {stampPlacement !== 'none' && stampPlacement !== 'watermark' && officeSetting?.stamp_image_path && (
                    <div
                        className={`mt-4 flex ${
                            stampPlacement === 'bottom-right' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div className="p-2 border border-stone-200 rounded-lg text-center inline-block">
                            <img
                                src={officeSetting.stamp_image_path}
                                alt="طابع المكتب الرسمي"
                                className="h-20 w-20 object-contain mx-auto"
                            />
                            <span className="text-[9px] text-stone-400 block mt-1 font-tajawal">خاتم وطابع المكتب المعتمد</span>
                        </div>
                    </div>
                )}

                {/* Qadi Validation Box & Official QR */}
                <div className="mt-8 p-4 rounded-sm border-2 border-stone-800 bg-stone-50 flex items-center justify-between gap-6 text-xs">
                    <div className="space-y-1.5 flex-1">
                        <div className="font-bold font-tajawal text-sm text-stone-900">
                            مخاطبة السيد قاضي التوثيق بالمحكمة الابتدائية المختصة:
                        </div>
                        <p className="text-[11px] text-stone-700 leading-relaxed font-amiri">
                            الحمد لله، خوطب على هذا الرسم العدلي وصح أصله بعد تضمينه بكناش الأملاك/الأسرة تحت عدد: <strong>{dossier.qadi_reference || 'قيد التضمين الرسمي'}</strong>، وأمر بتنفيذه والعمل به وفق أحكام القانون رقم 16.03.
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-stone-500 pt-1 font-mono">
                            <span>تاريخ المخاطبة: {dossier.qadi_validation_date || 'مسجل'}</span>
                            <span>&bull;</span>
                            <span>خاتم كتابة الضبط بقسم التوثيق بالمحكمة</span>
                        </div>
                    </div>

                    {showQr && (
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="p-1.5 bg-white border border-stone-300 shadow-xs">
                                <QRCodeSVG value={verifyUrl} size={85} level="H" />
                            </div>
                            <span className="text-[9px] font-mono text-stone-500">رمز التحقق الفوري</span>
                        </div>
                    )}
                </div>

                {/* Watermark Notice */}
                <div className="mt-6 pt-2 border-t border-stone-200 text-center text-[10px] text-stone-400 font-tajawal">
                    وثيقة عدلية رسمية محررة إلكترونياً ومسجلة في السجل الموحد — منصة Adoul التابعة لخطة العدالة بالمملكة المغربية.
                </div>
            </div>
            </div>
        </div>
    );
}
