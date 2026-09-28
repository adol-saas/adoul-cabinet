import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { TenantAdminLayout } from '@/layouts/tenant-admin-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    FileText,
    Edit2,
    Plus,
    Trash2,
    Upload,
    Sparkles,
    Scale,
    Search,
    Bold,
    Italic,
    Underline,
    AlignRight,
    AlignCenter,
    AlignLeft,
    AlignJustify,
    Eye,
    Check,
    Loader2,
    ShieldCheck,
    FileSpreadsheet,
    Copy,
    ChevronDown,
} from 'lucide-react';
import { DocumentTemplate } from '@/types';

interface TemplatesIndexProps {
    templates: any;
}

export default function TenantTemplatesIndex({ templates = [] }: TemplatesIndexProps) {
    const templateList: DocumentTemplate[] = Array.isArray(templates)
        ? templates
        : (templates && Array.isArray(templates.data) ? templates.data : []);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
    const [editorTab, setEditorTab] = useState<'editor' | 'preview'>('editor');
    const [isUploadingWord, setIsUploadingWord] = useState(false);
    const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
    const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);

    // Word formatting states for the editor
    const [fontFamily, setFontFamily] = useState<'amiri' | 'tajawal' | 'serif'>('amiri');
    const [fontSize, setFontSize] = useState<'14' | '16' | '18' | '20'>('16');
    const [textAlign, setTextAlign] = useState<'right' | 'center' | 'left' | 'justify'>('right');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const form = useForm({
        name_ar: '',
        name_fr: '',
        type: 'custom_act',
        content_ar: '',
        content_fr: '',
        content_ber: '',
        is_active: true,
    });

    const categories = [
        { id: 'all', label: 'كافة النماذج' },
        { id: 'marriage', label: 'الزواج والأسرة' },
        { id: 'property', label: 'العقارات والبيوعات' },
        { id: 'inheritance', label: 'التركات والوصايا' },
        { id: 'poa', label: 'الوكالات والإشهادات' },
        { id: 'custom', label: 'عقود مخصصة' },
    ];

    const placeholders = [
        { tag: '{{husband_name}}', label: 'اسم الزوج / الطرف الأول' },
        { tag: '{{husband_cin}}', label: 'رقم بطاقة الزوج' },
        { tag: '{{wife_name}}', label: 'اسم الزوجة / الطرف الثاني' },
        { tag: '{{wife_cin}}', label: 'رقم بطاقة الزوجة' },
        { tag: '{{client_name}}', label: 'الاسم الكامل للطرف الأول' },
        { tag: '{{cin}}', label: 'رقم البطاقة الوطنية CIN' },
        { tag: '{{seller_name}}', label: 'اسم البائع' },
        { tag: '{{buyer_name}}', label: 'اسم المشتري' },
        { tag: '{{property_name}}', label: 'تسمية العقار' },
        { tag: '{{sale_price}}', label: 'ثمن البيع' },
        { tag: '{{mahr_amount}}', label: 'مبلغ الصداق الإجمالي' },
        { tag: '{{mahr_paid}}', label: 'الصداق المعجل' },
        { tag: '{{mahr_deferred}}', label: 'الصداق المؤجل' },
        { tag: '{{witness1_name}}', label: 'اسم الشاهد الأول' },
        { tag: '{{witness2_name}}', label: 'اسم الشاهد الثاني' },
        { tag: '{{act_date}}', label: 'تاريخ الإبرام' },
        { tag: '{{court_name}}', label: 'المحكمة الابتدائية' },
        { tag: '{{adoul_1_name}}', label: 'العدل الأول' },
        { tag: '{{adoul_2_name}}', label: 'العدل الثاني' },
    ];

    const openCreate = () => {
        setEditingTemplate(null);
        setUploadSuccessMsg(null);
        setEditorTab('editor');
        form.setData({
            name_ar: '',
            name_fr: '',
            type: 'custom_act',
            content_ar: `الحمد لله وحده، والصلاة والسلام على مولانا رسول الله وآله وصحبه.\n\nحضر بمكتب التوثيق العدلي المذكور أعلاه، لدى العدلين المنتصبين للإشهاد الموقعين أسفله:\nالسيد(ة) {{client_name}} الحامل(ة) للبطاقة الوطنية للتعريف رقم {{cin}}.\n\nوبعد التأكد من كامل الرضا والأهلية المعتبرة شرعاً وقانوناً، صرح بما يلي:\n[... يرجى كتابة شروط وبنود المحرر العدلي هنا ...]`,
            content_fr: '',
            content_ber: '',
            is_active: true,
        });
        setEditorOpen(true);
    };

    const openEdit = (tpl: DocumentTemplate) => {
        setEditingTemplate(tpl);
        setUploadSuccessMsg(null);
        setEditorTab('editor');
        form.setData({
            name_ar: tpl.name_ar,
            name_fr: tpl.name_fr || '',
            type: tpl.type,
            content_ar: tpl.content_ar,
            content_fr: tpl.content_fr || '',
            content_ber: tpl.content_ber || '',
            is_active: tpl.is_active,
        });
        setEditorOpen(true);
    };

    const handleDelete = (tpl: DocumentTemplate) => {
        if (confirm(`هل أنت متأكد من حذف نموذج العقد [${tpl.name_ar}]؟ لا يمكن التراجع عن هذه العملية.`)) {
            router.delete(`/templates/${tpl.id}`, {
                preserveScroll: true,
            });
        }
    };

    // Insert text or placeholder at cursor position
    const insertAtCursor = (textToInsert: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            form.setData('content_ar', form.data.content_ar + ' ' + textToInsert);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = form.data.content_ar;
        const before = currentText.substring(0, start);
        const after = currentText.substring(end);
        const newText = before + textToInsert + after;

        form.setData('content_ar', newText);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + textToInsert.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 50);
    };

    // Handle Word Document Upload & Parsing
    const handleWordUpload = async (file: File) => {
        if (!file) return;

        setIsUploadingWord(true);
        setUploadSuccessMsg(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Get CSRF token from document
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const response = await fetch('/templates/parse-word', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Populate editor with parsed text from Word
                form.setData((prev) => ({
                    ...prev,
                    name_ar: prev.name_ar ? prev.name_ar : data.title || file.name.replace(/\.[^/.]+$/, ''),
                    content_ar: data.content,
                }));
                setUploadSuccessMsg(`تم استيراد نص النموذج بنجاح من ملف: [${file.name}]!`);
                if (!editorOpen) {
                    setEditorOpen(true);
                }
            } else {
                alert(data.message || 'فشل استيراد ملف الوورد. يرجى التأكد من أن الملف بصيغة docx صالحة.');
            }
        } catch (err) {
            console.error('Word upload error:', err);
            alert('حدث خطأ أثناء رفع ومعالجة ملف الوورد.');
        } finally {
            setIsUploadingWord(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTemplate) {
            form.put(`/templates/${editingTemplate.id}`, {
                onSuccess: () => setEditorOpen(false),
            });
        } else {
            form.post('/templates', {
                onSuccess: () => setEditorOpen(false),
            });
        }
    };

    // Filter templates
    const filteredTemplates = templateList.filter((tpl) => {
        const matchesSearch =
            tpl.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tpl.name_fr && tpl.name_fr.toLowerCase().includes(searchTerm.toLowerCase())) ||
            tpl.content_ar.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'marriage') return ['marriage', 'divorce', 'raj3a', 'thobout_zawjia'].includes(tpl.type);
        if (selectedCategory === 'property') return ['property_sale', 'property_promise', 'mortgage', 'mainlevee'].includes(tpl.type);
        if (selectedCategory === 'inheritance') return ['inheritance', 'will', 'tarakah_qisma'].includes(tpl.type);
        if (selectedCategory === 'poa') return ['poa', 'certificate', 'debt_recognition'].includes(tpl.type);
        if (selectedCategory === 'custom') return !['marriage', 'divorce', 'raj3a', 'property_sale', 'inheritance', 'will', 'poa'].includes(tpl.type);

        return true;
    });

    const wordCount = form.data.content_ar.trim() ? form.data.content_ar.trim().split(/\s+/).length : 0;
    const charCount = form.data.content_ar.length;

    return (
        <TenantAdminLayout title="قوالب ونماذج المحررات العدلية">
            <Head title="مكتبة نماذج العقود والمحررات — فضاء التوثيق العدلي" />

            {/* Hidden Word File Input for direct uploads */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".docx,.doc,.txt"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleWordUpload(file);
                }}
            />

            <div className="space-y-6">
                {/* Header with Title and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold font-tajawal text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <Scale className="h-5 w-5 text-emerald-600" />
                            <span>مكتبة نماذج العقود الشرعية والرسمية ({templates.length})</span>
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            نماذج معتمدة شرعياً وقانونياً قابلة للتخصيص، الإضافة، الحذف، والاستيراد المباشر من ملفات Word
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start">
                        {/* Import Word Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingWord}
                            className="gap-2 text-xs font-semibold border-blue-500/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50 cursor-pointer"
                        >
                            {isUploadingWord ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            ) : (
                                <Upload className="h-4 w-4 text-blue-600" />
                            )}
                            <span>استيراد من وورد (Word .docx)</span>
                        </Button>

                        {/* Add New Act Button */}
                        <Button
                            variant="emerald"
                            size="sm"
                            onClick={openCreate}
                            className="gap-2 text-xs font-bold shadow-xs cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            <span>إضافة نموذج عقد جديد</span>
                        </Button>
                    </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-stone-400" />
                        <Input
                            placeholder="بحث في أسماء أو نصوص النماذج..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedCategory(c.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                    selectedCategory === c.id
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Placeholders Guide Card */}
                <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                <span>المتغيرات الديناميكية للدمج التلقائي (انقر للنسخ أو أدرجها مباشرة في المحرر):</span>
                            </div>
                            {copiedPlaceholder && (
                                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    <span>تم نسخ {copiedPlaceholder}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {placeholders.map((ph) => (
                                <button
                                    key={ph.tag}
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(ph.tag);
                                        setCopiedPlaceholder(ph.tag);
                                        setTimeout(() => setCopiedPlaceholder(null), 2000);
                                    }}
                                    title={ph.label}
                                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                                >
                                    {ph.tag}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Templates Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.length === 0 ? (
                        <div className="col-span-full p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 text-stone-500 space-y-3">
                            <FileText className="h-10 w-10 mx-auto text-stone-400" />
                            <p className="text-sm font-semibold">لم يتم العثور على أي نموذج مطابق لبحثك.</p>
                            <Button variant="emerald" size="sm" onClick={openCreate} className="gap-2">
                                <Plus className="h-4 w-4" />
                                <span>إضافة نموذج جديد الآن</span>
                            </Button>
                        </div>
                    ) : (
                        filteredTemplates.map((tpl) => (
                            <Card key={tpl.id} className="flex flex-col justify-between hover:border-emerald-500 transition-all hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <Badge variant="emerald" className="text-[10px] font-mono">{tpl.type}</Badge>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-stone-400 font-mono">v{tpl.version}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(tpl)}
                                                className="text-stone-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
                                                title="حذف هذا النموذج"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-base font-bold font-tajawal text-stone-900 dark:text-stone-100 leading-snug">
                                        {tpl.name_ar}
                                    </CardTitle>
                                    {tpl.name_fr && (
                                        <div className="text-xs text-stone-400 font-sans">{tpl.name_fr}</div>
                                    )}

                                    <div className="mt-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 font-amiri text-xs text-stone-700 dark:text-stone-300 line-clamp-5 leading-relaxed border border-stone-200/60 dark:border-stone-800">
                                        {tpl.content_ar}
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                                    <span className="text-[10px] text-stone-400">
                                        {tpl.content_ar.split(/\s+/).length} كلمة
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEdit(tpl)}
                                        className="gap-1.5 text-xs font-semibold hover:border-emerald-600 cursor-pointer"
                                    >
                                        <Edit2 className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>تعديل الصيغة الشرعية</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Word-like Editor Modal */}
            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <DialogTitle className="font-tajawal text-base font-bold flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                    <span>
                                        {editingTemplate ? `تعديل نموذج: ${editingTemplate.name_ar}` : 'إضافة وتخصيص نموذج عقد عدلي جديد'}
                                    </span>
                                </DialogTitle>
                                <p className="text-[11px] text-stone-500 mt-0.5">
                                    محرر مستندات ذكي مع استيراد وورد مباشر وتنسيق النص الشرعي
                                </p>
                            </div>

                            {/* View Switcher & Word Import */}
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingWord}
                                    className="gap-1.5 text-xs font-semibold border-blue-500/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50"
                                >
                                    {isUploadingWord ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Upload className="h-3.5 w-3.5 text-blue-600" />
                                    )}
                                    <span>استيراد Word (.docx)</span>
                                </Button>

                                <div className="border border-stone-300 dark:border-stone-700 rounded-lg p-0.5 flex bg-white dark:bg-stone-800">
                                    <button
                                        type="button"
                                        onClick={() => setEditorTab('editor')}
                                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                            editorTab === 'editor'
                                                ? 'bg-emerald-600 text-white'
                                                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                                        }`}
                                    >
                                        محرر وورد
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditorTab('preview')}
                                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                            editorTab === 'preview'
                                                ? 'bg-emerald-600 text-white'
                                                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                                        }`}
                                    >
                                        معاينة A4
                                    </button>
                                </div>
                            </div>
                        </div>

                        {uploadSuccessMsg && (
                            <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 rounded text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span>{uploadSuccessMsg}</span>
                            </div>
                        )}
                    </DialogHeader>

                    <form onSubmit={submitForm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                        {/* Act Identification Fields */}
                        <div className="grid sm:grid-cols-3 gap-3 text-xs">
                            <div className="space-y-1 sm:col-span-2">
                                <Label>عنوان واسم النموذج بالعربية *</Label>
                                <Input
                                    value={form.data.name_ar}
                                    onChange={(e) => form.setData('name_ar', e.target.value)}
                                    placeholder="مثال: رسم عقد كراء تجاري مع الشروط الواقفة"
                                    required
                                />
                                {form.errors.name_ar && <p className="text-red-500 text-[11px]">{form.errors.name_ar}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label>معرف وصنف العقد *</Label>
                                <select
                                    value={form.data.type}
                                    onChange={(e) => form.setData('type', e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold"
                                    required
                                >
                                    <option value="custom_act">عقد مخصص (Custom Act)</option>
                                    <option value="marriage">عقد زواج شرعي</option>
                                    <option value="divorce">إشهاد طلاق وتفريق</option>
                                    <option value="property_sale">عقد بيع وتفويت عقاري</option>
                                    <option value="property_promise">وعد بالبيع العقاري</option>
                                    <option value="mortgage">رهن وتوثيق دين</option>
                                    <option value="mainlevee">رفع اليد عن رهن</option>
                                    <option value="inheritance">إراثة وحصر ورثة</option>
                                    <option value="will">وصية شرعية</option>
                                    <option value="donation">هبة صريحة مع الحوز</option>
                                    <option value="poa">وكالة قانونية خاصة</option>
                                    <option value="debt_recognition">اعتراف بدين وأداء</option>
                                    <option value="certificate">شهادة واستعفاء عدلي</option>
                                </select>
                            </div>
                        </div>

                        {/* Word-like Editor Box */}
                        {editorTab === 'editor' ? (
                            <div className="space-y-2 border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden shadow-xs">
                                {/* Word Toolbar */}
                                <div className="p-2 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex flex-wrap items-center gap-1.5 text-xs">
                                    {/* Font selector */}
                                    <select
                                        value={fontFamily}
                                        onChange={(e) => setFontFamily(e.target.value as any)}
                                        className="h-7 px-2 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-[11px]"
                                    >
                                        <option value="amiri">خط أميري مغربي (رسمي)</option>
                                        <option value="tajawal">خط تجوال عصري</option>
                                        <option value="serif">خط نسخي تقليدي</option>
                                    </select>

                                    {/* Font size */}
                                    <select
                                        value={fontSize}
                                        onChange={(e) => setFontSize(e.target.value as any)}
                                        className="h-7 px-2 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-[11px]"
                                    >
                                        <option value="14">14 نقطة</option>
                                        <option value="16">16 نقطة (قياسي)</option>
                                        <option value="18">18 نقطة (كبير)</option>
                                        <option value="20">20 نقطة (بارز)</option>
                                    </select>

                                    <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 mx-1" />

                                    {/* Formatting Toggles */}
                                    <button
                                        type="button"
                                        onClick={() => setIsBold(!isBold)}
                                        className={`p-1.5 rounded transition-colors cursor-pointer ${isBold ? 'bg-emerald-600 text-white' : 'hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                        title="عريض (Bold)"
                                    >
                                        <Bold className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsItalic(!isItalic)}
                                        className={`p-1.5 rounded transition-colors cursor-pointer ${isItalic ? 'bg-emerald-600 text-white' : 'hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                        title="مائل (Italic)"
                                    >
                                        <Italic className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsUnderline(!isUnderline)}
                                        className={`p-1.5 rounded transition-colors cursor-pointer ${isUnderline ? 'bg-emerald-600 text-white' : 'hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                        title="تسطير (Underline)"
                                    >
                                        <Underline className="h-3.5 w-3.5" />
                                    </button>

                                    <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 mx-1" />

                                    {/* Text Alignment */}
                                    <button
                                        type="button"
                                        onClick={() => setTextAlign('right')}
                                        className={`p-1.5 rounded transition-colors cursor-pointer ${textAlign === 'right' ? 'bg-emerald-600 text-white' : 'hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                        title="محاذاة لليمين"
                                    >
                                        <AlignRight className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTextAlign('center')}
                                        className={`p-1.5 rounded transition-colors cursor-pointer ${textAlign === 'center' ? 'bg-emerald-600 text-white' : 'hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                        title="توسيط"
                                    >
                                        <AlignCenter className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTextAlign('left')}
                                        className={`p-1.5 rounded transition-colors cursor-pointer ${textAlign === 'left' ? 'bg-emerald-600 text-white' : 'hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                        title="محاذاة لليسار"
                                    >
                                        <AlignLeft className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTextAlign('justify')}
                                        className={`p-1.5 rounded transition-colors cursor-pointer ${textAlign === 'justify' ? 'bg-emerald-600 text-white' : 'hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                        title="ضبط كامل (Justify)"
                                    >
                                        <AlignJustify className="h-3.5 w-3.5" />
                                    </button>

                                    <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 mx-1" />

                                    {/* Quick Clauses Dropdown */}
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                insertAtCursor(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        className="h-7 px-2 rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-[11px] text-amber-900 dark:text-amber-200 font-semibold"
                                    >
                                        <option value="">+ إدراج عبارة شرعية جاهزة...</option>
                                        <option value="الحمد لله وحده، والصلاة والسلام على مولانا رسول الله وآله وصحبه.">ديباجة الحمدلة الشرعية</option>
                                        <option value="حضر بمكتب التوثيق العدلي المذكور أعلاه، لدى العدلين المنتصبين للإشهاد الموقعين أسفله:">صيغة الحضور لدى العدلين</option>
                                        <option value="وبعد التعريف التام والتأكد من الرضا والأهلية المعتبرة شرعاً وقانوناً، خالية من أي عيب من عيوب الإرادة، صرح الطرفان بما يلي:">صيغة أهلية الأطراف والرضا</option>
                                        <option value="وبهذا يشهد العدلان الموقعان أسفله بعد تلاوة الرسم على الأطراف وتأكيد موافقتهم التامة.">صيغة تلاوة الرسم والإشهاد</option>
                                        <option value="وحرر في يوم {{act_date}} بمدينة {{court_name}}، والسلام.">تاريخ ومكان الإبرام</option>
                                    </select>
                                </div>

                                {/* Placeholder Tags Bar inside Editor */}
                                <div className="p-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-1.5 text-[10px]">
                                    <span className="font-bold text-stone-500 text-[11px] me-1">حقن متغير:</span>
                                    {placeholders.slice(0, 10).map((ph) => (
                                        <button
                                            key={ph.tag}
                                            type="button"
                                            onClick={() => insertAtCursor(ph.tag)}
                                            className="px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-emerald-500 hover:text-emerald-700 font-mono transition-colors cursor-pointer"
                                            title={ph.label}
                                        >
                                            {ph.tag}
                                        </button>
                                    ))}
                                </div>

                                {/* Textarea Styled as Legal Sheet */}
                                <textarea
                                    ref={textareaRef}
                                    rows={13}
                                    value={form.data.content_ar}
                                    onChange={(e) => form.setData('content_ar', e.target.value)}
                                    style={{
                                        fontSize: `${fontSize}px`,
                                        textAlign: textAlign,
                                        fontWeight: isBold ? 'bold' : 'normal',
                                        fontStyle: isItalic ? 'italic' : 'normal',
                                        textDecoration: isUnderline ? 'underline' : 'none',
                                    }}
                                    className={`w-full p-4 bg-white dark:bg-stone-900 leading-relaxed outline-none border-none resize-y ${
                                        fontFamily === 'amiri' ? 'font-amiri' : fontFamily === 'tajawal' ? 'font-tajawal' : 'font-serif'
                                    }`}
                                    placeholder="اكتب أو الصق نص العقد الشرعي هنا، أو استورده مباشرة من ملف Word..."
                                    required
                                />

                                {/* Editor Footer status */}
                                <div className="p-2 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px] text-stone-500 font-sans">
                                    <div className="flex items-center gap-4">
                                        <span>عدد الكلمات: <strong className="text-stone-800 dark:text-stone-200">{wordCount}</strong></span>
                                        <span>عدد الأحرف: <strong className="text-stone-800 dark:text-stone-200">{charCount}</strong></span>
                                    </div>
                                    <span className="text-[10px] text-stone-400">جاهز للتضمين والطباعة A4</span>
                                </div>
                            </div>
                        ) : (
                            /* A4 Sheet Preview Tab */
                            <div className="p-8 bg-stone-100 dark:bg-stone-950 rounded-xl flex justify-center">
                                <div className="w-full max-w-2xl bg-white text-stone-900 p-8 rounded-sm shadow-md border border-stone-300 space-y-6">
                                    {/* Moroccan Header */}
                                    <div className="flex items-start justify-between border-b-2 border-stone-900 pb-3 text-xs font-bold font-tajawal">
                                        <div className="text-center w-40 space-y-0.5">
                                            <div>المملكة المغربية</div>
                                            <div>وزارة العدل</div>
                                            <div className="text-[10px] text-stone-600">خطة العدالة — القانون 16.03</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-full border border-emerald-800 flex items-center justify-center text-emerald-800">
                                                <Scale className="h-5 w-5" />
                                            </div>
                                            <span className="text-[9px] uppercase tracking-wider font-bold mt-1">ROYAUME DU MAROC</span>
                                        </div>
                                        <div className="text-center w-40 space-y-0.5">
                                            <div>مكتب التوثيق العدلي</div>
                                            <div>قسم قضاء الأسرة والتوثيق</div>
                                        </div>
                                    </div>

                                    <div className="text-center font-bold text-base font-tajawal border-y border-stone-200 py-2">
                                        {form.data.name_ar || 'عنوان العقد الرسمي'}
                                    </div>

                                    {/* Document Body */}
                                    <div
                                        style={{
                                            fontSize: `${fontSize}px`,
                                            textAlign: textAlign,
                                            fontWeight: isBold ? 'bold' : 'normal',
                                            fontStyle: isItalic ? 'italic' : 'normal',
                                            textDecoration: isUnderline ? 'underline' : 'none',
                                        }}
                                        className={`leading-relaxed whitespace-pre-wrap ${
                                            fontFamily === 'amiri' ? 'font-amiri' : fontFamily === 'tajawal' ? 'font-tajawal' : 'font-serif'
                                        }`}
                                    >
                                        {form.data.content_ar}
                                    </div>

                                    {/* Seal & Signatures space */}
                                    <div className="pt-6 border-t border-stone-300 grid grid-cols-2 gap-4 text-xs font-tajawal text-center">
                                        <div>
                                            <div className="font-bold">توقيع وإشهاد العدل الأول</div>
                                            <div className="h-14 border border-dashed border-stone-300 rounded mt-1 flex items-center justify-center text-stone-400 text-[10px]">
                                                (توقيع العدل)
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">توقيع وإشهاد العدل الثاني الشريك</div>
                                            <div className="h-14 border border-dashed border-stone-300 rounded mt-1 flex items-center justify-center text-stone-400 text-[10px]">
                                                (خاتم المكتب الرسمي)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* French Title & Content (Collapsible) */}
                        <div className="border border-stone-200 dark:border-stone-800 rounded-lg p-3 space-y-2 bg-stone-50/50 dark:bg-stone-900/50">
                            <Label className="text-xs font-semibold flex items-center justify-between">
                                <span>ترجمة أو مرجع بالفرنسية (Version Française - اختياري)</span>
                            </Label>
                            <Input
                                value={form.data.name_fr}
                                onChange={(e) => form.setData('name_fr', e.target.value)}
                                placeholder="Titre de l'acte en français (ex: Acte de vente immobilière)"
                                className="text-xs"
                                dir="ltr"
                            />
                        </div>

                        <DialogFooter className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditorOpen(false)}
                                className="cursor-pointer"
                            >
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                variant="emerald"
                                disabled={form.processing}
                                className="gap-2 font-bold cursor-pointer"
                            >
                                <Check className="h-4 w-4" />
                                <span>{editingTemplate ? 'حفظ التعديلات على النموذج' : 'حفظ وإضافة النموذج الجديد'}</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </TenantAdminLayout>
    );
}
