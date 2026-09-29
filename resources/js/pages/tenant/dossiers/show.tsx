import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderKanban,
    Scale,
    Printer,
    CheckCircle2,
    Clock,
    User,
    Users,
    DollarSign,
    ShieldCheck,
    History,
    ArrowRight,
    Edit2,
    Trash2,
    ExternalLink,
    AlertTriangle,
    Building2,
    FileCheck,
    Receipt,
    Calendar,
    FileText,
    Upload,
    FileUp,
    File,
    Download,
    Eye,
    Sparkles,
    UserCheck,
    PenTool,
    Paperclip,
    Check,
    ChevronRight,
    Sliders,
    Settings2,
    ArrowUp,
    ArrowDown,
    Plus,
    RotateCcw,
    Ban,
    Zap,
    CheckCircle,
} from 'lucide-react';
import { Dossier, OfficeSetting, DossierDocument } from '@/types';

interface UserItem {
    id: number;
    name: string;
    job_title?: string;
}

interface DossierShowProps {
    dossier: Dossier;
    officeSetting: OfficeSetting | null;
    template: any;
    adoulUsers: UserItem[];
    verifyUrl: string;
    workflowTemplates?: Record<string, any[]>;
}

// Category labels and badges for uploaded documents
const DOCUMENT_CATEGORIES: Record<string, { label_ar: string; label_fr: string; color: string }> = {
    cin: { label_ar: 'بطاقة التعريف الوطنية (CIN)', label_fr: "Carte d'identité nationale", color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    birth_cert: { label_ar: 'عقد الازدياد / نسخة كاملة', label_fr: 'Acte de naissance', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    property_title: { label_ar: 'شهادة الملكية / صك عقاري', label_fr: 'Titre foncier / Certificat de propriété', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    quitus_fiscal: { label_ar: 'إبراء ضريبي / DGI', label_fr: 'Quitus fiscal', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    court_order: { label_ar: 'إذن قضائي / حكم المحكمة', label_fr: 'Autorisation judiciaire', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
    draft_scan: { label_ar: 'مسودة الرسم الموقعة سرياً', label_fr: 'Minute / Brouillard signé', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
    signed_minute: { label_ar: 'أصل العقد الرسمي الموقع', label_fr: 'Acte officiel signé', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    qadi_homologation: { label_ar: 'نسخة الخطاب والتضمين', label_fr: 'Khitab et Tadmin homologué', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    other: { label_ar: 'وثيقة ثبوتية أخرى', label_fr: 'Autre justificatif', color: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300' },
};

// Required document checklists by dossier type
const REQUIRED_DOCS_BY_TYPE: Record<string, Array<{ key: string; name_ar: string; category: string }>> = {
    marriage: [
        { key: 'cin_husband', name_ar: 'بطاقة التعريف الوطنية للزوج', category: 'cin' },
        { key: 'cin_wife', name_ar: 'بطاقة التعريف الوطنية للزوجة', category: 'cin' },
        { key: 'birth_husband', name_ar: 'نسخة كاملة من رسم ولادة الزوج', category: 'birth_cert' },
        { key: 'birth_wife', name_ar: 'نسخة كاملة من رسم ولادة الزوجة', category: 'birth_cert' },
        { key: 'medical_cert', name_ar: 'الشهادة الطبية للزواج لكلا الطرفين', category: 'other' },
        { key: 'celibacy_cert', name_ar: 'شهادة العزوبة أو الإذن بالتعدد من قاضي الأسرة', category: 'court_order' },
    ],
    property_sale: [
        { key: 'cin_seller', name_ar: 'بطاقة التعريف الوطنية للبائع', category: 'cin' },
        { key: 'cin_buyer', name_ar: 'بطاقة التعريف الوطنية للمشتري', category: 'cin' },
        { key: 'property_cert', name_ar: 'شهادة الملكية العقارية المحينة من المحافظة', category: 'property_title' },
        { key: 'quitus_tax', name_ar: 'شهادة الإبراء الضريبي من قباضة الضرائب', category: 'quitus_fiscal' },
        { key: 'building_permit', name_ar: 'رخصة البناء أو رخصة السكن / المطابقة', category: 'other' },
    ],
    mulkiya_lafif: [
        { key: 'cin_owner', name_ar: 'بطاقة التعريف الوطنية لطالب رسم الملكية', category: 'cin' },
        { key: 'lafif_list', name_ar: 'لائحة وتوقيعات شهود اللفيف الاثنا عشر (12)', category: 'other' },
        { key: 'admin_cert', name_ar: 'شهادة إدارية تثبت عدم الصبغة الجماعية أو الأحباس', category: 'other' },
        { key: 'boundary_plan', name_ar: 'تصميم طبوغرافي وتحديد معالم العقار المحدود', category: 'property_title' },
    ],
    inheritance: [
        { key: 'death_cert', name_ar: 'رسم أو شهادة وفاة الهالك', category: 'birth_cert' },
        { key: 'heirs_cin', name_ar: 'بطاقات التعريف الوطنية لكافة الورثة المستحقين', category: 'cin' },
        { key: 'estate_inventory', name_ar: 'لائحة عناصر التركة والمخلف والديون والوصايا', category: 'other' },
    ],
    divorce: [
        { key: 'court_auth', name_ar: 'إذن المحكمة بالإشهاد على الطلاق أو الاتفاق', category: 'court_order' },
        { key: 'marriage_contract', name_ar: 'نسخة عقد الزواج الأصلي', category: 'signed_minute' },
        { key: 'cin_parties', name_ar: 'بطاقات التعريف الوطنية لكلا الزوجين', category: 'cin' },
    ],
    poa: [
        { key: 'cin_principal', name_ar: 'بطاقة التعريف الوطنية للموكل', category: 'cin' },
        { key: 'cin_agent', name_ar: 'بطاقة التعريف الوطنية للوكيل المفوض', category: 'cin' },
    ],
};

export default function TenantDossierShow({
    dossier,
    officeSetting,
    template,
    adoulUsers = [],
    verifyUrl,
}: DossierShowProps) {
    const details = (dossier.details || {}) as any;
    const dgiStatus = (dossier as any).dgi_status || {};
    const workflow = (dossier as any).workflow_progress || {
        steps: [],
        completed_count: 0,
        total_steps: 7,
        percentage: 0,
        current_step_key: 'intake',
    };

    const documentsList: DossierDocument[] = Array.isArray(dossier.documents) ? dossier.documents : [];

    const lafifList: any[] = Array.isArray(details.lafif_witnesses) && details.lafif_witnesses.length > 0
        ? details.lafif_witnesses
        : Array.from({ length: 12 }, (_, i) => ({
            num: i + 1,
            name: `الشاهد رقم ${i + 1}`,
            cin: '',
            age: '',
            profession: '',
            address: '',
            bias_free: true,
            testimony: 'يشهد بالملك والحيازة والتصرف المعتبر شرعاً',
        }));

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<'workflow' | 'documents' | 'parties_circuit' | 'lafif' | 'history'>('workflow');

    // Modals state
    const [circuitModalOpen, setCircuitModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [stepModalOpen, setStepModalOpen] = useState(false);
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState<any>(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [lafifModalOpen, setLafifModalOpen] = useState(false);

    // Workflow Configuration States
    const [editableSteps, setEditableSteps] = useState<any[]>(workflow.steps || []);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(
        ['marriage', 'divorce', 'raj3a', 'thobout_zawjia', 'hadana_nafaka'].includes(dossier.type)
            ? 'family'
            : (['property_sale', 'donation', 'tarakah_qisma'].includes(dossier.type)
                ? 'property'
                : (['mulkiya_lafif', 'lafif_property'].includes(dossier.type)
                    ? 'lafif'
                    : (['inheritance', 'will'].includes(dossier.type) ? 'inheritance' : 'general')))
    );
    const [newStepTitle, setNewStepTitle] = useState('');
    const [newStepDesc, setNewStepDesc] = useState('');

    // Form for workflow step update
    const stepForm = useForm({
        step_key: '',
        is_completed: true,
        is_skipped: false,
        notes: '',
        reference: '',
        completed_at: new Date().toISOString().split('T')[0],
    });

    // Form for file upload
    const uploadForm = useForm<{
        file: File | null;
        name: string;
        category: string;
        notes: string;
    }>({
        file: null,
        name: '',
        category: 'cin',
        notes: '',
    });

    // Form for financial amounts and text notes
    const editForm = useForm({
        amount_due: dossier.amount_due,
        amount_paid: dossier.amount_paid,
        notes_ar: dossier.notes_ar || '',
        notes_fr: dossier.notes_fr || '',
    });

    // Form for judicial circuit and DGI/ANCFCC
    const circuitForm = useForm({
        court_name: details.court_name || `المحكمة الابتدائية ب${officeSetting?.city || 'الرباط'} - قسم قضاء الأسرة`,
        deposit_date: details.deposit_date || '',
        deposit_receipt: details.deposit_receipt || '',
        tadmine_number: details.tadmine_number || '',
        kunnash_number: details.kunnash_number || '',
        page_number: details.page_number || '',
        qadi_reference: dossier.qadi_reference || '',
        qadi_validation_date: dossier.qadi_validation_date ? String(dossier.qadi_validation_date).split('T')[0] : '',
        dgi_number: details.dgi_number || '',
        dgi_date: details.dgi_date || '',
        dgi_amount: details.dgi_amount || '',
        ancfcc_title_number: details.ancfcc_title_number || '',
        ancfcc_deposit_number: details.ancfcc_deposit_number || '',
    });

    // Form for 12-witnesses Lafif
    const lafifForm = useForm({
        witnesses: lafifList,
    });

    const openStepModal = (step: any) => {
        setSelectedStep(step);
        stepForm.setData({
            step_key: step.key,
            is_completed: Boolean(step.is_completed),
            is_skipped: Boolean(step.is_skipped),
            notes: step.notes || '',
            reference: step.reference || '',
            completed_at: step.completed_at ? step.completed_at.split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setStepModalOpen(true);
    };

    const openConfigModal = () => {
        setEditableSteps([...(workflow.steps || [])]);
        setConfigModalOpen(true);
    };

    const handleQuickAdvance = () => {
        router.post(`/dossiers/${dossier.id}/workflow-advance`, {}, {
            preserveScroll: true,
        });
    };

    const handleToggleStep = (step: any) => {
        router.post(`/dossiers/${dossier.id}/workflow-step`, {
            step_key: step.key,
            is_completed: !step.is_completed,
            is_skipped: false,
            completed_at: !step.is_completed ? new Date().toISOString().split('T')[0] : null,
            notes: step.notes || '',
            reference: step.reference || '',
        }, {
            preserveScroll: true,
        });
    };

    const handleSkipStep = (step: any) => {
        router.post(`/dossiers/${dossier.id}/workflow-step`, {
            step_key: step.key,
            is_completed: false,
            is_skipped: !step.is_skipped,
            notes: 'تم استثناء هذه المرحلة لعدم انطباقها على هذا الملف العدلي',
        }, {
            preserveScroll: true,
        });
    };

    const moveStepUp = (index: number) => {
        if (index === 0) return;
        const copy = [...editableSteps];
        const temp = copy[index - 1];
        copy[index - 1] = copy[index];
        copy[index] = temp;
        copy.forEach((s, i) => s.order = i + 1);
        setEditableSteps(copy);
    };

    const moveStepDown = (index: number) => {
        if (index === editableSteps.length - 1) return;
        const copy = [...editableSteps];
        const temp = copy[index + 1];
        copy[index + 1] = copy[index];
        copy[index] = temp;
        copy.forEach((s, i) => s.order = i + 1);
        setEditableSteps(copy);
    };

    const toggleStepEnabled = (index: number) => {
        const copy = [...editableSteps];
        copy[index].is_enabled = copy[index].is_enabled !== false ? false : true;
        setEditableSteps(copy);
    };

    const removeStepFromConfig = (index: number) => {
        const copy = editableSteps.filter((_, i) => i !== index);
        copy.forEach((s, i) => s.order = i + 1);
        setEditableSteps(copy);
    };

    const addCustomStepToConfig = () => {
        if (!newStepTitle.trim()) return;
        const newStep = {
            key: `custom_${Date.now()}`,
            order: editableSteps.length + 1,
            title_ar: newStepTitle.trim(),
            title_fr: 'Étape personnalisée',
            desc_ar: newStepDesc.trim() || 'إجراء عدلي مخصص من قبل عدل المكتب',
            icon: 'Clock',
            is_enabled: true,
            is_completed: false,
        };
        setEditableSteps([...editableSteps, newStep]);
        setNewStepTitle('');
        setNewStepDesc('');
    };

    const saveWorkflowConfiguration = () => {
        router.post(`/dossiers/${dossier.id}/configure-workflow`, {
            action: 'save_steps',
            steps: editableSteps,
        }, {
            onSuccess: () => setConfigModalOpen(false),
        });
    };

    const applyOfficialTemplate = (templateKey: string) => {
        if (confirm('هل أنت متأكد من إعادة ضبط مراحل هذا الملف وفق المسار النموذجي المختار؟')) {
            router.post(`/dossiers/${dossier.id}/configure-workflow`, {
                action: 'reset_template',
                template_type: templateKey,
            }, {
                onSuccess: () => setConfigModalOpen(false),
            });
        }
    };

    const submitStep = (e: React.FormEvent) => {
        e.preventDefault();
        stepForm.post(`/dossiers/${dossier.id}/workflow-step`, {
            onSuccess: () => setStepModalOpen(false),
        });
    };

    const handleFileUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(`/dossiers/${dossier.id}/documents`, {
            forceFormData: true,
            onSuccess: () => {
                uploadForm.reset();
                setUploadModalOpen(false);
            },
        });
    };

    const handleDeleteDoc = (docId: string, docName: string) => {
        if (confirm(`هل أنت متأكد من حذف الوثيقة [${docName}] نهائياً؟`)) {
            router.delete(`/dossiers/${dossier.id}/documents/${docId}`);
        }
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/dossiers/${dossier.id}`, {
            onSuccess: () => setEditModalOpen(false),
        });
    };

    const submitCircuit = (e: React.FormEvent) => {
        e.preventDefault();
        circuitForm.post(`/dossiers/${dossier.id}/circuit`, {
            onSuccess: () => setCircuitModalOpen(false),
        });
    };

    const submitLafif = (e: React.FormEvent) => {
        e.preventDefault();
        lafifForm.post(`/dossiers/${dossier.id}/lafif`, {
            onSuccess: () => setLafifModalOpen(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`تحذير: هل أنت متأكد من حذف الملف [${dossier.reference}] نهائياً؟`)) {
            router.delete(`/dossiers/${dossier.id}`);
        }
    };

    const actTypeLabels: Record<string, string> = {
        marriage: 'عقد زواج شرعي',
        divorce: 'إشهاد طلاق أو خلع',
        raj3a: 'رسم الرجعة بعد الطلاق الرجعي',
        thobout_zawjia: 'رسم ثبوت الزوجية',
        hadana_nafaka: 'إشهاد الحضانة والنفقة',
        property_sale: 'معاملة ورسم بيع عقاري',
        mulkiya_lafif: 'رسم استمرار الملكية باللفيف (12 شاهداً)',
        lafif_property: 'رسم استمرار الملكية باللفيف (12 شاهداً)',
        inheritance: 'رسم إراثة وفريضة شرعية',
        tarakah_qisma: 'رسم قسمة التركة وتصفية المتروك',
        donation: 'عقد هبة وصدقة مع المعاينة',
        will: 'رسم وصية شرعية',
        poa: 'وكالة رسمية خاصة / عامة',
        conversion_islam: 'شهادة اعتناق الإسلام',
        certificate: 'إشهاد واستعفاء عدلي',
    };

    const isLafifAct = dossier.type === 'mulkiya_lafif' || dossier.type === 'lafif_property' || Boolean(details.lafif_witnesses);
    const requiredDocs = REQUIRED_DOCS_BY_TYPE[dossier.type] || [
        { key: 'cin_party1', name_ar: 'بطاقة التعريف الوطنية للطرف الأول', category: 'cin' },
        { key: 'justif', name_ar: 'الوثائق الثبوتية الأساسية للمعاملة', category: 'other' },
    ];

    // Helper to check if a category has an uploaded file
    const hasCategoryDoc = (category: string) => {
        return documentsList.some(doc => doc.category === category);
    };

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <TenantAdminLayout title={`الملف العدلي: ${dossier.reference}`}>
            <Head title={`الملف: ${dossier.reference} — Adoul Cabinet`} />

            <div className="space-y-6 font-tajawal">
                {/* Header with Title and Actions */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs"
                >
                    <div className="flex items-center gap-3">
                        <Link href="/dossiers">
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold rounded-xl">
                                <ArrowRight className="h-4 w-4" />
                                <span>سجل الملفات</span>
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">
                                    {actTypeLabels[dossier.type] || dossier.type}
                                </h2>
                                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
                                    {dossier.reference}
                                </span>
                                <Badge variant="emerald" className="text-xs">
                                    {dossier.status === 'signed' ? 'موقع شرعاً' : dossier.status === 'pending_qadi' ? 'قيد الخطاب القضائي' : dossier.status === 'archived' ? 'مكتمل ومؤرشف' : 'قيد الإنجاز'}
                                </Badge>
                            </div>
                            <p className="text-xs text-stone-500 mt-1 flex items-center gap-2 flex-wrap">
                                <span>تاريخ الإشهاد: {dossier.act_date ? String(dossier.act_date) : 'مسجل بالمكتب'}</span>
                                <span>•</span>
                                <span>العدل الأول: {dossier.adoul?.name || officeSetting?.adoul_name || 'عدل موثق'}</span>
                                {details.second_adoul_name && (
                                    <>
                                        <span>•</span>
                                        <span>العدل الشريك: {details.second_adoul_name}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                        <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => setUploadModalOpen(true)}
                            className="gap-1.5 font-bold shadow-xs rounded-xl"
                        >
                            <FileUp className="h-4 w-4" />
                            <span>إرفاق وثيقة للملف</span>
                        </Button>

                        <Link href={`/dossiers/${dossier.id}/print`}>
                            <Button variant="outline" size="sm" className="gap-1.5 font-bold rounded-xl text-xs">
                                <Printer className="h-4 w-4 text-emerald-700" />
                                <span>طباعة العقد مع QR</span>
                            </Button>
                        </Link>

                        {isLafifAct && (
                            <Link href={`/dossiers/${dossier.id}/print-lafif`}>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold rounded-xl border-amber-600/40 text-amber-700 hover:bg-amber-50">
                                    <Users className="h-4 w-4 text-amber-600" />
                                    <span>محضر اللفيف (12)</span>
                                </Button>
                            </Link>
                        )}

                        <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)} className="gap-1.5 text-xs rounded-xl">
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>الأتعاب</span>
                        </Button>

                        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>

                {/* DGI 30-Day Warning Banner */}
                {dgiStatus.is_registered ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                <FileCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                                    تم التسجيل بإدارة الضرائب بنجاح (SIMPL-Adoul)
                                </div>
                                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                                    رقم الوصل: {dgiStatus.dgi_number} • تاريخ التسجيل: {dgiStatus.dgi_date || 'مسجل'} • واجب التسجيل: {dgiStatus.dgi_amount || 0} درهم
                                </div>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setCircuitModalOpen(true)} className="text-xs font-bold rounded-xl">
                            تحديث مراجع الضرائب
                        </Button>
                    </div>
                ) : (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                        dgiStatus.is_overdue
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                            : (dgiStatus.days_remaining <= 7
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                                : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200')
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${
                                dgiStatus.is_overdue ? 'bg-red-100 text-red-700' : (dgiStatus.days_remaining <= 7 ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700')
                            }`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-sm flex items-center gap-2">
                                    <span>أجل التسجيل الجبائي لدى إدارة الضرائب (المادة 128 من المدونة العامة للضرائب)</span>
                                    <Badge variant={dgiStatus.badge_variant}>{dgiStatus.status_label}</Badge>
                                </div>
                                <div className="text-xs mt-0.5 opacity-80">
                                    {dgiStatus.is_overdue
                                        ? 'انقضى الأجل القانوني المحدد في 30 يوماً من تاريخ التلقي، المعاملة معرضة لذعيرة التأخير القانونية بنسبة 15%.'
                                        : `الأجل الأقصى القانوني للتسجيل دون ذعائر هو: ${dgiStatus.deadline_date || 'خلال 30 يوماً'} (متبقي ${dgiStatus.days_remaining} يوماً).`
                                    }
                                </div>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            variant={dgiStatus.is_overdue ? 'destructive' : 'emerald'}
                            onClick={() => setCircuitModalOpen(true)}
                            className="font-bold text-xs shrink-0 rounded-xl"
                        >
                            تسجيل وصل DGI الآن
                        </Button>
                    </div>
                )}

                {/* Workflow Progress Hero Banner (Interactive Pipeline) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-[#073d2f] to-stone-900 text-white shadow-md border border-emerald-800/40"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="space-y-1">
                            <div className="flex items-center flex-wrap gap-2 text-xs font-bold text-amber-300">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                <span>مسار وتتبع مراحل إنجاز المعاملة العدلية (Workflow Tracker)</span>
                                {workflow.is_customized && (
                                    <Badge variant="outline" className="text-[10px] bg-amber-400/20 text-amber-200 border-amber-300/40">
                                        مسار مخصص للملف
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-lg font-black text-white flex items-center gap-3">
                                <span>تقدم الملف: {workflow.completed_count} من أصل {workflow.total_steps} مراحل مكتملة</span>
                            </h3>
                            <p className="text-xs text-emerald-200/80">
                                انقر على أي مرحلة للتأشير عليها أو تعديل مراجعها، أو استخدم زر ضبط المراحل لتعديل وترتيب مسار العمل
                            </p>

                            <div className="flex items-center flex-wrap gap-2 pt-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={openConfigModal}
                                    className="text-xs font-bold rounded-xl gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20"
                                >
                                    <Sliders className="h-3.5 w-3.5 text-amber-300" />
                                    <span>⚙️ ضبط وتخصيص مراحل العمل</span>
                                </Button>

                                {workflow.current_step_key && (
                                    <Button
                                        size="sm"
                                        onClick={handleQuickAdvance}
                                        className="text-xs font-bold rounded-xl gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-sm"
                                    >
                                        <Zap className="h-3.5 w-3.5" />
                                        <span>إنجاز المرحلة الحالية ⚡</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                            <div className="text-end">
                                <span className="text-2xl font-black font-mono text-amber-300">
                                    {workflow.percentage}%
                                </span>
                                <span className="block text-[10px] text-emerald-200">النسبة الإجمالية</span>
                            </div>
                            <div className="w-16 h-16 rounded-full border-4 border-amber-400/30 flex items-center justify-center p-1 bg-emerald-900/60 shadow-inner">
                                <Scale className="h-7 w-7 text-amber-400" />
                            </div>
                        </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-emerald-950/80 rounded-full h-3.5 overflow-hidden p-0.5 border border-emerald-700/50 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${workflow.percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-300 shadow-sm"
                        />
                    </div>

                    {/* Step Cards Horizontal Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-5">
                        {workflow.steps.map((st: any, idx: number) => {
                            const isCurrent = st.is_current;
                            const isDone = st.is_completed;
                            const isSkipped = st.is_skipped;

                            return (
                                <motion.div
                                    key={st.key}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => openStepModal(st)}
                                    className={`p-3 rounded-xl border text-start cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between min-h-[90px] ${
                                        isSkipped
                                            ? 'bg-stone-900/60 border-stone-700/60 text-stone-400 opacity-60'
                                            : isDone
                                                ? 'bg-emerald-800/50 border-emerald-400/60 text-white shadow-xs'
                                                : isCurrent
                                                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-2 ring-amber-400/30'
                                                    : 'bg-white/5 border-white/10 text-stone-300 hover:border-white/30'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                                            <span className="font-mono text-[10px] opacity-75">المرحلة {idx + 1}</span>
                                            {isSkipped ? (
                                                <span className="w-4 h-4 rounded-full bg-stone-700 text-stone-300 flex items-center justify-center text-[10px]">✕</span>
                                            ) : isDone ? (
                                                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
                                            ) : isCurrent ? (
                                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                            ) : (
                                                <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] flex items-center justify-center">{idx + 1}</span>
                                            )}
                                        </div>
                                        <div className={`font-bold text-xs line-clamp-2 leading-snug ${isSkipped ? 'line-through text-stone-400' : ''}`}>
                                            {st.title_ar}
                                        </div>
                                    </div>

                                    <div className="text-[10px] pt-1.5 border-t border-white/10 flex items-center justify-between">
                                        <span className={
                                            isSkipped 
                                                ? 'text-stone-400 font-semibold' 
                                                : (isDone ? 'text-emerald-300 font-bold' : (isCurrent ? 'text-amber-300 font-bold' : 'text-stone-400'))
                                        }>
                                            {isSkipped ? 'معفاة / غير مطلوبة' : (isDone ? 'مكتملة' : (isCurrent ? 'المرحلة الحالية' : 'في الانتظار'))}
                                        </span>
                                        <ChevronRight className="h-3 w-3 opacity-60 rtl:rotate-180" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Modern Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto text-xs font-bold">
                    <button
                        onClick={() => setActiveTab('workflow')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'workflow'
                                ? 'bg-emerald-800 text-white shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                    >
                        <FolderKanban className="h-4 w-4" />
                        <span>مسار وتتبع الإجراءات</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'documents'
                                ? 'bg-emerald-800 text-white shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                    >
                        <Paperclip className="h-4 w-4" />
                        <span>ملفات ووثائق المعاملة ({documentsList.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('parties_circuit')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'parties_circuit'
                                ? 'bg-emerald-800 text-white shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                    >
                        <Building2 className="h-4 w-4" />
                        <span>الأطراف والمسار القضائي والجبائي</span>
                    </button>

                    {isLafifAct && (
                        <button
                            onClick={() => setActiveTab('lafif')}
                            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'lafif'
                                    ? 'bg-emerald-800 text-white shadow-xs'
                                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            <span>شهادة اللفيف (12 شاهداً)</span>
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'history'
                                ? 'bg-emerald-800 text-white shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                    >
                        <History className="h-4 w-4" />
                        <span>سجل التدقيق والمطابقة ({dossier.act_logs?.length || 0})</span>
                    </button>
                </div>

                {/* Tab 1: Workflow Steps Detailed View */}
                {activeTab === 'workflow' && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid lg:grid-cols-12 gap-6 items-start"
                    >
                        {/* 8 Cols: Detailed Step List with Actions */}
                        <div className="lg:col-span-8 space-y-4">
                            <Card>
                                <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between flex-wrap gap-2">
                                    <div>
                                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
                                            <Scale className="h-4 w-4 text-emerald-700" />
                                            <span>تفاصيل ومسار مراحل المعاملة العدلية</span>
                                        </CardTitle>
                                        <p className="text-xs text-stone-400 mt-0.5">
                                            تتبع دقيق وتخصيص لكل محطة في إنجاز العقد وتوثيقه لدى القضاء وإدارة الضرائب
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={openConfigModal}
                                            className="text-xs font-bold rounded-xl gap-1.5 border-emerald-600/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50"
                                        >
                                            <Sliders className="h-3.5 w-3.5" />
                                            <span>تخصيص وترتيب المراحل</span>
                                        </Button>
                                        <Badge variant="gold" className="text-xs">
                                            المرحلة النشطة: {workflow.current_step_key || 'مكتمل'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    {workflow.steps.map((st: any, idx: number) => {
                                        return (
                                            <div
                                                key={st.key}
                                                className={`p-4 rounded-2xl border transition-all ${
                                                    st.is_skipped
                                                        ? 'bg-stone-100/50 dark:bg-stone-900/50 border-stone-300 dark:border-stone-800 opacity-60'
                                                        : st.is_completed
                                                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                                            : st.is_current
                                                                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-400 shadow-sm'
                                                                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2.5 rounded-xl shrink-0 ${
                                                            st.is_skipped
                                                                ? 'bg-stone-300 dark:bg-stone-800 text-stone-500'
                                                                : st.is_completed
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : st.is_current
                                                                        ? 'bg-amber-500 text-white'
                                                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                                                        }`}>
                                                            {st.is_skipped ? <Ban className="h-5 w-5" /> : (st.is_completed ? <Check className="h-5 w-5" /> : <Clock className="h-5 w-5" />)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs font-bold text-stone-400">
                                                                    0{idx + 1}.
                                                                </span>
                                                                <h4 className={`font-extrabold text-sm text-stone-900 dark:text-stone-100 ${st.is_skipped ? 'line-through text-stone-400' : ''}`}>
                                                                    {st.title_ar}
                                                                </h4>
                                                                <span className="text-[11px] text-stone-400">
                                                                    ({st.title_fr})
                                                                </span>
                                                                {st.is_skipped && (
                                                                    <Badge variant="outline" className="text-[10px] text-stone-500">معفاة / غير مطلوبة</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-stone-500 mt-0.5">
                                                                {st.desc_ar}
                                                            </p>

                                                            {(st.completed_at || st.reference || st.notes) && (
                                                                <div className="mt-2 text-[11px] p-2 rounded-lg bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-0.5">
                                                                    {st.completed_at && (
                                                                        <div className="text-stone-600 dark:text-stone-300">
                                                                            📅 تاريخ الإنجاز: <span className="font-mono font-bold">{st.completed_at.split('T')[0]}</span>
                                                                        </div>
                                                                    )}
                                                                    {st.reference && (
                                                                        <div className="text-emerald-700 dark:text-emerald-400">
                                                                            🔖 المرجع / الوصل: <span className="font-mono font-bold">{st.reference}</span>
                                                                        </div>
                                                                    )}
                                                                    {st.notes && (
                                                                        <div className="text-stone-500 italic">
                                                                            📝 ملاحظات: {st.notes}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center flex-wrap gap-1.5 self-end sm:self-center">
                                                        {st.is_completed ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleToggleStep(st)}
                                                                className="text-xs rounded-xl text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                                                                title="إعادة فتح هذه المرحلة"
                                                            >
                                                                <RotateCcw className="h-3 w-3 ms-1" />
                                                                <span>إعادة فتح</span>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="emerald"
                                                                onClick={() => handleToggleStep(st)}
                                                                className="text-xs font-bold rounded-xl gap-1 shadow-xs"
                                                                title="تأشير المرحلة كمكتملة مباشرة"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                                <span>✓ إنهاء سريع</span>
                                                            </Button>
                                                        )}

                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => openStepModal(st)}
                                                            className="text-xs rounded-xl"
                                                        >
                                                            <span>التفاصيل والوصل</span>
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleSkipStep(st)}
                                                            className={`text-xs rounded-xl ${st.is_skipped ? 'text-amber-600 font-bold' : 'text-stone-400 hover:text-stone-600'}`}
                                                            title="استثناء هذه المرحلة من الملف"
                                                        >
                                                            {st.is_skipped ? 'إلغاء الإعفاء' : 'إعفاء'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>

                        {/* 4 Cols: Quick Overview & Next Step */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Summary Card */}
                            <Card className="border-2 border-emerald-600/30">
                                <CardHeader className="bg-emerald-900 text-white p-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-amber-400" />
                                        <CardTitle className="text-sm font-bold text-white">
                                            ملخص وضعية الملف
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3 text-xs">
                                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                        <span className="text-stone-500">المرجع العدلي:</span>
                                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{dossier.reference}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                        <span className="text-stone-500">نوع الإشهاد:</span>
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{actTypeLabels[dossier.type] || dossier.type}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                        <span className="text-stone-500">الوثائق المرفقة:</span>
                                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{documentsList.length} وثيقة</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                        <span className="text-stone-500">تسجيل إدارة الضرائب:</span>
                                        <span className={`font-bold ${dgiStatus.is_registered ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {dgiStatus.is_registered ? 'مسجل ✓' : 'في الانتظار'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-stone-500">تأشيرة قاضي التوثيق:</span>
                                        <span className={`font-bold ${dossier.qadi_reference ? 'text-emerald-600' : 'text-stone-400'}`}>
                                            {dossier.qadi_reference ? 'خوطب به ✓' : 'قيد الإيداع'}
                                        </span>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="emerald"
                                        onClick={() => setActiveTab('documents')}
                                        className="w-full mt-2 font-bold text-xs rounded-xl"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                        <span>عرض وتدبير الوثائق المرفقة</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* QR Code Verification Widget */}
                            <Card className="text-center overflow-hidden border border-stone-200 dark:border-stone-800">
                                <div className="bg-stone-50 dark:bg-stone-800/80 p-3 border-b border-stone-200 dark:border-stone-700">
                                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        <span>رمز التحقق الرقمي الرسمي (QR)</span>
                                    </span>
                                </div>
                                <CardContent className="p-4 space-y-3">
                                    <div className="p-2.5 bg-white rounded-xl shadow-xs border border-stone-200 inline-block mx-auto">
                                        <QRCodeSVG value={verifyUrl} size={110} level="H" />
                                    </div>
                                    <div className="text-[10px] font-mono text-stone-400 break-all px-2" dir="ltr">
                                        {verifyUrl}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* Tab 2: Document Attachments & File Registration */}
                {activeTab === 'documents' && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Required Documents Checklist Card */}
                        <Card className="border border-stone-200 dark:border-stone-800">
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
                                        <FileCheck className="h-4 w-4 text-emerald-700" />
                                        <span>دليل الوثائق الإلزامية المطلوبة لمعاملة: {actTypeLabels[dossier.type] || dossier.type}</span>
                                    </CardTitle>
                                    <p className="text-xs text-stone-400 mt-0.5">
                                        تحقق تلقائي من توفر المستندات الثبوتية القانونية لضمان سلامة الإشهاد
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="emerald"
                                    onClick={() => setUploadModalOpen(true)}
                                    className="gap-1.5 text-xs font-bold rounded-xl"
                                >
                                    <FileUp className="h-4 w-4" />
                                    <span>تسجيل وثيقة جديدة</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                    {requiredDocs.map((req) => {
                                        const isAttached = hasCategoryDoc(req.category);
                                        return (
                                            <div
                                                key={req.key}
                                                className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                                                    isAttached
                                                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                                                        : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 opacity-90'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg shrink-0 ${
                                                    isAttached ? 'bg-emerald-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-400'
                                                }`}>
                                                    {isAttached ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs">
                                                        {req.name_ar}
                                                    </span>
                                                    <span className={`text-[10px] font-semibold mt-0.5 inline-block ${
                                                        isAttached ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                                    }`}>
                                                        {isAttached ? 'تم إرفاقها وتسجيلها بالملف ✓' : 'في انتظار إدلاء الأطراف بها'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Uploaded Documents List */}
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-emerald-700" />
                                    <CardTitle className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                        سجل الوثائق والمستندات المرفقة بالملف ({documentsList.length})
                                    </CardTitle>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setUploadModalOpen(true)}
                                    className="gap-1.5 text-xs font-bold rounded-xl"
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    <span>رفع وثيقة إضافية</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4">
                                {documentsList.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                                        <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3 text-stone-400">
                                            <FileUp className="h-6 w-6" />
                                        </div>
                                        <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                                            لا توجد وثائق مرفقة بهذا الملف حتى الآن
                                        </h4>
                                        <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                                            يمكنك تسجيل ورفع صور بطاقات التعريف، عقود الازدياد، شهادات الملكية، أو مسودة الرسم الموقع.
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="emerald"
                                            onClick={() => setUploadModalOpen(true)}
                                            className="mt-4 gap-1.5 text-xs font-bold rounded-xl"
                                        >
                                            <Upload className="h-4 w-4" />
                                            <span>إرفاق أول وثيقة الآن</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {documentsList.map((doc) => {
                                            const catInfo = DOCUMENT_CATEGORIES[doc.category] || DOCUMENT_CATEGORIES.other;
                                            return (
                                                <div
                                                    key={doc.id}
                                                    className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between gap-2 mb-2">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catInfo.color}`}>
                                                                {catInfo.label_ar}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-stone-400 uppercase">
                                                                {doc.extension || 'FILE'}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-start gap-2.5">
                                                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 shrink-0">
                                                                <File className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate" title={doc.name}>
                                                                    {doc.name}
                                                                </h5>
                                                                <p className="text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                                                                    {formatBytes(doc.size)} • {doc.uploaded_at ? doc.uploaded_at.split('T')[0] : 'مسجل'}
                                                                </p>
                                                                {doc.notes && (
                                                                    <p className="text-[10px] text-stone-500 mt-1 italic line-clamp-1">
                                                                        {doc.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                                                        <a
                                                            href={doc.path}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            <span>معاينة</span>
                                                        </a>

                                                        <div className="flex items-center gap-1">
                                                            <a
                                                                href={doc.path}
                                                                download={doc.name}
                                                                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                                                                title="تحميل"
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteDoc(doc.id, doc.name)}
                                                                className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                                                title="حذف"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Tab 3: Parties, Court & Financial Details */}
                {activeTab === 'parties_circuit' && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid lg:grid-cols-12 gap-6 items-start"
                    >
                        {/* Parties & Court Card */}
                        <div className="lg:col-span-8 space-y-6">
                            <Card>
                                <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                                    <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                        <User className="h-4 w-4 text-emerald-600" />
                                        <span>أطراف الرسم العدلي (المتعاقدون)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 grid sm:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                        <span className="text-[10px] text-stone-400 font-semibold block mb-1">الطرف الأول (المشهود له / البائع / الزوج):</span>
                                        <Link href={`/clients/${dossier.client?.id}`} className="font-bold text-stone-900 dark:text-stone-100 font-tajawal text-sm hover:underline block">
                                            {dossier.client?.name_ar || dossier.client?.name}
                                        </Link>
                                        <div className="font-mono text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
                                            CIN: {dossier.client?.cin}
                                        </div>
                                        <div className="text-stone-500 mt-1">{dossier.client?.phone || 'بدون هاتف'}</div>
                                        <div className="text-stone-500 text-[11px] mt-0.5">{dossier.client?.address}</div>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                        <span className="text-[10px] text-stone-400 font-semibold block mb-1">الطرف الثاني (المشتري / الزوجة / الوكيل):</span>
                                        {dossier.client2 ? (
                                            <>
                                                <Link href={`/clients/${dossier.client2?.id}`} className="font-bold text-stone-900 dark:text-stone-100 font-tajawal text-sm hover:underline block">
                                                    {dossier.client2?.name_ar || dossier.client2?.name}
                                                </Link>
                                                <div className="font-mono text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
                                                    CIN: {dossier.client2?.cin}
                                                </div>
                                                <div className="text-stone-500 mt-1">{dossier.client2?.phone || 'بدون هاتف'}</div>
                                                <div className="text-stone-500 text-[11px] mt-0.5">{dossier.client2?.address}</div>
                                            </>
                                        ) : (
                                            <div className="text-stone-400 italic py-4 text-center">
                                                معاملة بإشهاد طرف واحد (أو شهادة لفيف)
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Court, Qadi & Dual Adoul Info Card */}
                            <Card>
                                <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-amber-600" />
                                        <span>المسار القضائي وتأشير قاضي التوثيق (الخطاب والتضمين)</span>
                                    </CardTitle>
                                    <Button size="sm" variant="outline" onClick={() => setCircuitModalOpen(true)} className="h-7 text-xs rounded-xl">
                                        تعديل المراجع
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 grid sm:grid-cols-3 gap-4 text-xs">
                                    <div>
                                        <span className="text-stone-400 block mb-1">المحكمة الابتدائية:</span>
                                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                                            {details.court_name || `ابتدائية ${officeSetting?.city || 'الرباط'}`}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block mb-1">صيغة ورقم الخطاب القضائي:</span>
                                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                            {dossier.qadi_reference || 'قيد الإيداع والدراسة'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block mb-1">تاريخ التأشيرة والخطاب:</span>
                                        <span className="font-mono text-stone-700 dark:text-stone-300">
                                            {dossier.qadi_validation_date ? String(dossier.qadi_validation_date).split('T')[0] : 'في انتظار التأشير'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block mb-1">رقم التضمين بالمحكمة:</span>
                                        <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                                            {details.tadmine_number ? `عدد: ${details.tadmine_number}` : '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block mb-1">رقم الكناش والصحيفة:</span>
                                        <span className="font-mono text-stone-700 dark:text-stone-300">
                                            {details.kunnash_number ? `كناش ${details.kunnash_number} ص ${details.page_number || '—'}` : '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400 block mb-1">وصل إيداع كتابة الضبط:</span>
                                        <span className="font-mono text-stone-700 dark:text-stone-300">
                                            {details.deposit_receipt || '—'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Financials Column */}
                        <div className="lg:col-span-4 space-y-4">
                            <Card>
                                <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-emerald-600" />
                                        <span>الأتعاب والواجبات المستخلصة</span>
                                    </CardTitle>
                                    <Link href={`/dossiers/${dossier.id}/fee-statement`}>
                                        <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-emerald-700 rounded-xl">
                                            بيان الحساب
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3 text-xs">
                                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                        <span className="text-stone-500">المبلغ الإجمالي المستحق:</span>
                                        <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">{dossier.amount_due} MAD</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                                        <span className="text-stone-500">المؤدى والمقبوض:</span>
                                        <span className="font-bold text-emerald-600 font-mono">{dossier.amount_paid} MAD</span>
                                    </div>
                                    <div className="flex justify-between py-1 font-bold">
                                        <span className="text-stone-500">الباقي في ذمة الموكل:</span>
                                        <span className={`font-mono ${Number(dossier.amount_due) > Number(dossier.amount_paid) ? 'text-amber-600' : 'text-stone-400'}`}>
                                            {Number(dossier.amount_due) - Number(dossier.amount_paid)} MAD
                                        </span>
                                    </div>

                                    <Button size="sm" variant="outline" onClick={() => setEditModalOpen(true)} className="w-full mt-2 text-xs font-bold rounded-xl">
                                        تحيين المبالغ والأتعاب
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* Tab 4: Lafif 12-Witnesses */}
                {activeTab === 'lafif' && isLafifAct && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <Users className="h-4 w-4 text-amber-600" />
                                    <span>شهادة اللفيف الشرعي (اثنا عشر شاهداً - 12)</span>
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setLafifModalOpen(true)} className="h-7 text-xs font-bold rounded-xl">
                                        تعديل بيانات الـ 12 شاهداً
                                    </Button>
                                    <Link href={`/dossiers/${dossier.id}/print-lafif`}>
                                        <Button size="sm" variant="emerald" className="h-7 text-xs gap-1 font-bold rounded-xl">
                                            <Printer className="h-3 w-3" />
                                            <span>طباعة المحضر</span>
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                                    {lafifList.slice(0, 12).map((w, idx) => (
                                        <div key={idx} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
                                            <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                                                <span>شاهد رقم {w.num || idx + 1}</span>
                                                <span className="text-emerald-700 font-bold">سالم شرعاً</span>
                                            </div>
                                            <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                                                {w.name}
                                            </div>
                                            <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                                                CIN: {w.cin || '—'}
                                            </div>
                                            <div className="text-[10px] text-stone-400 truncate mt-0.5">
                                                {w.profession || 'فلاح / تاجر'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Tab 5: Audit Trail */}
                {activeTab === 'history' && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
                                <CardTitle className="text-sm font-bold font-tajawal flex items-center gap-2">
                                    <History className="h-4 w-4 text-emerald-600" />
                                    <span>سجل التتبع والمطابقة غير القابل للتعديل (Audit Trail)</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {dossier.act_logs?.length === 0 ? (
                                    <p className="text-xs text-stone-400 text-center py-4">لا توجد سجلات تتبع إضافية.</p>
                                ) : (
                                    dossier.act_logs?.map((log) => (
                                        <div key={log.id} className="flex items-start gap-3 text-xs border-s-2 border-emerald-600 ps-3 py-1.5">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-stone-800 dark:text-stone-200">{log.action}</span>
                                                    <span className="text-[10px] text-stone-400">
                                                        {new Date(log.created_at).toLocaleString('ar-MA')}
                                                    </span>
                                                </div>
                                                <p className="text-stone-500 mt-0.5">{log.details?.note || 'عملية مسجلة'}</p>
                                            </div>
                                            <span className="text-[10px] text-stone-400">{log.user?.name}</span>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Workflow Step Update Modal */}
            <Dialog open={stepModalOpen} onOpenChange={setStepModalOpen}>
                <DialogContent className="max-w-lg font-tajawal">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Scale className="h-5 w-5 text-emerald-600" />
                            <span>تحديث مرحلة: {selectedStep?.title_ar}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitStep} className="space-y-4 text-xs font-tajawal">
                        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border space-y-3">
                            <Label className="font-bold text-xs">وضعية إنجاز المرحلة</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                    stepForm.data.is_completed && !stepForm.data.is_skipped
                                        ? 'bg-emerald-100/70 border-emerald-500 text-emerald-950 font-bold dark:bg-emerald-950 dark:text-emerald-200'
                                        : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800'
                                }`}>
                                    <input
                                        type="radio"
                                        name="step_state"
                                        checked={stepForm.data.is_completed && !stepForm.data.is_skipped}
                                        onChange={() => {
                                            stepForm.setData({
                                                ...stepForm.data,
                                                is_completed: true,
                                                is_skipped: false,
                                            });
                                        }}
                                        className="text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>مرحلة مكتملة بنجاح ✓</span>
                                </label>

                                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                    !stepForm.data.is_completed && !stepForm.data.is_skipped
                                        ? 'bg-amber-100/70 border-amber-500 text-amber-950 font-bold dark:bg-amber-950 dark:text-amber-200'
                                        : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800'
                                }`}>
                                    <input
                                        type="radio"
                                        name="step_state"
                                        checked={!stepForm.data.is_completed && !stepForm.data.is_skipped}
                                        onChange={() => {
                                            stepForm.setData({
                                                ...stepForm.data,
                                                is_completed: false,
                                                is_skipped: false,
                                            });
                                        }}
                                        className="text-amber-600 focus:ring-amber-500"
                                    />
                                    <span>قيد المعالجة (غير مكتملة)</span>
                                </label>
                            </div>

                            <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                stepForm.data.is_skipped
                                    ? 'bg-stone-200 border-stone-500 text-stone-900 font-bold dark:bg-stone-800 dark:text-stone-200'
                                    : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800'
                            }`}>
                                <input
                                    type="checkbox"
                                    checked={stepForm.data.is_skipped}
                                    onChange={(e) => {
                                        stepForm.setData({
                                            ...stepForm.data,
                                            is_skipped: e.target.checked,
                                            is_completed: false,
                                        });
                                    }}
                                    className="text-stone-600 focus:ring-stone-500 rounded"
                                />
                                <span>معفاة / غير مطلوبة لهذا الملف (استثناء من حساب نسبة التقدم)</span>
                            </label>
                        </div>

                        <div className="space-y-1.5">
                            <Label>تاريخ إنجاز المرحلة</Label>
                            <Input
                                type="date"
                                value={stepForm.data.completed_at}
                                onChange={(e) => stepForm.setData('completed_at', e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>الرقم المرجعي أو رقم الوصل (إن وجد)</Label>
                            <Input
                                value={stepForm.data.reference}
                                onChange={(e) => stepForm.setData('reference', e.target.value)}
                                placeholder="مثال: رقم الإيداع، وصل SIMPL، أو عدد التضمين..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>ملاحظات العدل أو الكاتب حول هذه المرحلة</Label>
                            <textarea
                                value={stepForm.data.notes}
                                onChange={(e) => stepForm.setData('notes', e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-2.5 text-xs focus:ring-2 focus:ring-emerald-600"
                                placeholder="تفاصيل إضافية أو مراجع تم التحقق منها..."
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setStepModalOpen(false)} className="rounded-xl">
                                إلغاء
                            </Button>
                            <Button type="submit" variant="emerald" disabled={stepForm.processing} className="rounded-xl font-bold">
                                {stepForm.processing ? 'جاري الحفظ...' : 'حفظ حالة المرحلة'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Workflow Configuration & Reordering Modal */}
            <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-tajawal">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Sliders className="h-5 w-5 text-emerald-600" />
                                <span>ضبط وتخصيص مراحل العمل التوثيقي (Workflow Customizer)</span>
                            </span>
                            <Badge variant="outline" className="text-xs">
                                نوع الملف: {actTypeLabels[dossier.type] || dossier.type}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 text-xs font-tajawal">
                        {/* Section 1: Choose Official Template */}
                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    <span>المسارات النموذجية المعتمدة طبقاً للقانون 16.03:</span>
                                </div>
                                <span className="text-[11px] text-stone-400">اختر نموذجاً لاستعادة خطواته الرسمية</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                {[
                                    { key: 'family', label: 'عقود الأسرة والزواج', desc: '7 مراحل - قاضي الأسرة والحالة المدنية' },
                                    { key: 'property', label: 'المعاملات العقارية', desc: '8 مراحل - DGI والمحافظة العقارية' },
                                    { key: 'lafif', label: 'شهادة اللفيف (12)', desc: '7 مراحل - سماع الشهود والخطاب' },
                                    { key: 'inheritance', label: 'التركات والفريضة', desc: '6 مراحل - الفريضة الشرعية والتضمين' },
                                    { key: 'general', label: 'الوكالات والإشهادات', desc: '7 مراحل عامة' },
                                ].map((t) => (
                                    <div
                                        key={t.key}
                                        onClick={() => setSelectedTemplateKey(t.key)}
                                        className={`p-2.5 rounded-xl border cursor-pointer transition-all text-center flex flex-col justify-between ${
                                            selectedTemplateKey === t.key
                                                ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-600 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                                                : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-emerald-400'
                                        }`}
                                    >
                                        <div className="text-xs">{t.label}</div>
                                        <div className="text-[10px] text-stone-400 mt-1">{t.desc}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => applyOfficialTemplate(selectedTemplateKey)}
                                    className="gap-1.5 text-xs rounded-xl font-bold border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>تطبيق مسار [{selectedTemplateKey}] النموذجي لهذا الملف</span>
                                </Button>
                            </div>
                        </div>

                        {/* Section 2: Current Steps Reordering & Editing */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="font-bold text-stone-900 dark:text-stone-100">
                                    قائمة المراحل الحالية للملف ({editableSteps.length} مرحلة):
                                </div>
                                <span className="text-[11px] text-stone-400">
                                    استخدم أزرار الأسهم لتغيير الترتيب، أو قم بتعطيل/تعديل أي مرحلة
                                </span>
                            </div>

                            <div className="space-y-2 max-h-[350px] overflow-y-auto pe-1">
                                {editableSteps.map((st, idx) => (
                                    <div
                                        key={st.key || idx}
                                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                            st.is_enabled === false
                                                ? 'bg-stone-100/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-50'
                                                : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 shadow-xs'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <input
                                                    type="text"
                                                    value={st.title_ar}
                                                    onChange={(e) => {
                                                        const copy = [...editableSteps];
                                                        copy[idx].title_ar = e.target.value;
                                                        setEditableSteps(copy);
                                                    }}
                                                    className="w-full bg-transparent font-bold text-xs focus:ring-1 focus:ring-emerald-500 rounded p-1 border-b border-transparent focus:border-stone-300"
                                                />
                                                <input
                                                    type="text"
                                                    value={st.desc_ar || ''}
                                                    onChange={(e) => {
                                                        const copy = [...editableSteps];
                                                        copy[idx].desc_ar = e.target.value;
                                                        setEditableSteps(copy);
                                                    }}
                                                    placeholder="وصف الإجراء أو ملاحظات توجيهية..."
                                                    className="w-full bg-transparent text-[11px] text-stone-500 focus:ring-1 focus:ring-emerald-500 rounded p-0.5 border-b border-transparent focus:border-stone-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                disabled={idx === 0}
                                                onClick={() => moveStepUp(idx)}
                                                className="p-1 h-7 w-7 text-stone-500 hover:text-emerald-700"
                                                title="تحريك لأعلى"
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                disabled={idx === editableSteps.length - 1}
                                                onClick={() => moveStepDown(idx)}
                                                className="p-1 h-7 w-7 text-stone-500 hover:text-emerald-700"
                                                title="تحريك لأسفل"
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => toggleStepEnabled(idx)}
                                                className={`text-[10px] h-7 px-2 rounded-lg font-bold ${
                                                    st.is_enabled === false
                                                        ? 'bg-stone-200 text-stone-600'
                                                        : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                }`}
                                            >
                                                {st.is_enabled === false ? 'معطلة' : 'مفعلة'}
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeStepFromConfig(idx)}
                                                className="p-1 h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                title="حذف المرحلة من المسار"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Add New Custom Step */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                            <div className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                                <Plus className="h-4 w-4" />
                                <span>إضافة مرحلة جديدة مخصصة لهذا الملف</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <Input
                                        value={newStepTitle}
                                        onChange={(e) => setNewStepTitle(e.target.value)}
                                        placeholder="عنوان المرحلة (مثال: طلب رخصة الزواج للأجنبي / معاينة العقار)..."
                                        className="h-8 text-xs bg-white dark:bg-stone-900"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={newStepDesc}
                                        onChange={(e) => setNewStepDesc(e.target.value)}
                                        placeholder="وصف توجيهي مقتضب للمرحلة..."
                                        className="h-8 text-xs bg-white dark:bg-stone-900"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="emerald"
                                    onClick={addCustomStepToConfig}
                                    disabled={!newStepTitle.trim()}
                                    className="gap-1.5 text-xs rounded-xl font-bold h-8"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>إضافة المرحلة إلى المسار</span>
                                </Button>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setConfigModalOpen(false)} className="rounded-xl">
                                إلغاء
                            </Button>
                            <Button
                                type="button"
                                variant="emerald"
                                onClick={saveWorkflowConfiguration}
                                className="rounded-xl font-bold shadow-xs"
                            >
                                حفظ واعتماد مسار المراحل
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Document Upload Modal */}
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                <DialogContent className="max-w-lg font-tajawal">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <FileUp className="h-5 w-5 text-emerald-600" />
                            <span>تسجيل وإرفاق وثيقة بالملف العدلي</span>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleFileUpload} className="space-y-4 text-xs font-tajawal">
                        <div className="space-y-1.5">
                            <Label>ملف الوثيقة (PDF أو صورة أو Word) *</Label>
                            <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-5 text-center hover:border-emerald-500 transition-colors bg-stone-50/50 dark:bg-stone-900/50">
                                <Upload className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        uploadForm.setData('file', file);
                                        if (file && !uploadForm.data.name) {
                                            uploadForm.setData('name', file.name.replace(/\.[^/.]+$/, ''));
                                        }
                                    }}
                                    className="text-xs text-stone-600 dark:text-stone-400 file:me-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                                />
                                <p className="text-[10px] text-stone-400 mt-2">
                                    الحد الأقصى للملف: 20MB. الصيغ المدعومة: PDF, JPG, PNG, DOCX
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>عنوان / اسم الوثيقة *</Label>
                            <Input
                                value={uploadForm.data.name}
                                onChange={(e) => uploadForm.setData('name', e.target.value)}
                                placeholder="مثال: بطاقة التعريف الوطنية - الزوج"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>نوع وتصنيف الوثيقة *</Label>
                            <select
                                value={uploadForm.data.category}
                                onChange={(e) => uploadForm.setData('category', e.target.value)}
                                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 font-tajawal"
                            >
                                {Object.entries(DOCUMENT_CATEGORIES).map(([catKey, cat]) => (
                                    <option key={catKey} value={catKey}>
                                        {cat.label_ar} ({cat.label_fr})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>ملاحظات أو تعليق حول الوثيقة (اختياري)</Label>
                            <Input
                                value={uploadForm.data.notes}
                                onChange={(e) => uploadForm.setData('notes', e.target.value)}
                                placeholder="مثال: نسخة مطابقة للأصل مؤشر عليها..."
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)} className="rounded-xl">
                                إلغاء
                            </Button>
                            <Button type="submit" variant="emerald" disabled={uploadForm.processing} className="rounded-xl font-bold">
                                {uploadForm.processing ? 'جاري رفع الوثيقة...' : 'تأكيد وحفظ الوثيقة'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Circuit & Qadi & Tax Dialog */}
            <Dialog open={circuitModalOpen} onOpenChange={setCircuitModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-tajawal">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base">
                            المسار القضائي، الخطاب، والتسجيل الجبائي والعقاري
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitCircuit} className="space-y-4 text-xs font-tajawal">
                        {/* Section 1: Court & Qadi */}
                        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border space-y-3">
                            <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                1. قضاء التوثيق وقسم قضاء الأسرة
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label>المحكمة المختصة</Label>
                                    <Input
                                        value={circuitForm.data.court_name}
                                        onChange={(e) => circuitForm.setData('court_name', e.target.value)}
                                        placeholder="ابتدائية الرباط"
                                    />
                                </div>
                                <div>
                                    <Label>وصل إيداع كتابة الضبط</Label>
                                    <Input
                                        value={circuitForm.data.deposit_receipt}
                                        onChange={(e) => circuitForm.setData('deposit_receipt', e.target.value)}
                                        placeholder="رقم وتاريخ وصل الإيداع"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label>رقم التضمين (سجل التضمين)</Label>
                                    <Input
                                        value={circuitForm.data.tadmine_number}
                                        onChange={(e) => circuitForm.setData('tadmine_number', e.target.value)}
                                        placeholder="مثال: 450"
                                    />
                                </div>
                                <div>
                                    <Label>رقم الكناش / السجل</Label>
                                    <Input
                                        value={circuitForm.data.kunnash_number}
                                        onChange={(e) => circuitForm.setData('kunnash_number', e.target.value)}
                                        placeholder="مثال: 12"
                                    />
                                </div>
                                <div>
                                    <Label>رقم الصحيفة</Label>
                                    <Input
                                        value={circuitForm.data.page_number}
                                        onChange={(e) => circuitForm.setData('page_number', e.target.value)}
                                        placeholder="مثال: 88"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label>صيغة ورقم الخطاب القضائي</Label>
                                    <Input
                                        value={circuitForm.data.qadi_reference}
                                        onChange={(e) => circuitForm.setData('qadi_reference', e.target.value)}
                                        placeholder="خوطب به طبقاً للقانون تحت عدد..."
                                    />
                                </div>
                                <div>
                                    <Label>تاريخ تأشيرة الخطاب</Label>
                                    <Input
                                        type="date"
                                        value={circuitForm.data.qadi_validation_date}
                                        onChange={(e) => circuitForm.setData('qadi_validation_date', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: DGI Taxes */}
                        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                            <div className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                                2. إدارة الضرائب (SIMPL-Adoul) — أجل 30 يوماً
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label>رقم التسجيل الجبائي (DGI)</Label>
                                    <Input
                                        value={circuitForm.data.dgi_number}
                                        onChange={(e) => circuitForm.setData('dgi_number', e.target.value)}
                                        placeholder="SIMPL-2026-XXXX"
                                    />
                                </div>
                                <div>
                                    <Label>تاريخ الأداء والتسجيل</Label>
                                    <Input
                                        type="date"
                                        value={circuitForm.data.dgi_date}
                                        onChange={(e) => circuitForm.setData('dgi_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>واجب التسجيل المؤدى (MAD)</Label>
                                    <Input
                                        type="number"
                                        value={circuitForm.data.dgi_amount}
                                        onChange={(e) => circuitForm.setData('dgi_amount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: ANCFCC Land Registry */}
                        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3">
                            <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                                3. الوكالة الوطنية للمحافظة العقارية والمسح العقاري (ANCFCC)
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label>رقم الرسم العقاري / الصك</Label>
                                    <Input
                                        value={circuitForm.data.ancfcc_title_number}
                                        onChange={(e) => circuitForm.setData('ancfcc_title_number', e.target.value)}
                                        placeholder="مثال: T/145892/03"
                                    />
                                </div>
                                <div>
                                    <Label>رقم وتاريخ إيداع التقييد</Label>
                                    <Input
                                        value={circuitForm.data.ancfcc_deposit_number}
                                        onChange={(e) => circuitForm.setData('ancfcc_deposit_number', e.target.value)}
                                        placeholder="DEP-2026-XXXX"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setCircuitModalOpen(false)} className="rounded-xl">
                                إلغاء
                            </Button>
                            <Button type="submit" variant="emerald" disabled={circuitForm.processing} className="rounded-xl font-bold">
                                {circuitForm.processing ? 'جاري الحفظ...' : 'حفظ وتحديث مراجع المسار'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Financial Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-md font-tajawal">
                    <DialogHeader>
                        <DialogTitle className="font-bold text-base">تعديل الأتعاب والمستحقات</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitEdit} className="space-y-4 text-xs font-tajawal">
                        <div className="space-y-1.5">
                            <Label>المبلغ الإجمالي المستحق (MAD)</Label>
                            <Input
                                type="number"
                                value={editForm.data.amount_due}
                                onChange={(e) => editForm.setData('amount_due', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>المبلغ المؤدى والمقبوض (MAD)</Label>
                            <Input
                                type="number"
                                value={editForm.data.amount_paid}
                                onChange={(e) => editForm.setData('amount_paid', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>ملاحظات إضافية بالعربية</Label>
                            <textarea
                                value={editForm.data.notes_ar}
                                onChange={(e) => editForm.setData('notes_ar', e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-2.5 text-xs focus:ring-2 focus:ring-emerald-600"
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="rounded-xl">
                                إلغاء
                            </Button>
                            <Button type="submit" variant="emerald" disabled={editForm.processing} className="rounded-xl font-bold">
                                حفظ التعديلات
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Lafif 12-Witnesses Modal */}
            <Dialog open={lafifModalOpen} onOpenChange={setLafifModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-tajawal">
                    <DialogHeader>
                        <DialogTitle className="font-tajawal text-base">
                            بيانات شهود اللفيف الشرعي الاثنا عشر (12 شاهداً)
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitLafif} className="space-y-4 text-xs font-tajawal">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {lafifForm.data.witnesses.slice(0, 12).map((w: any, index: number) => (
                                <div key={index} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-2">
                                    <div className="font-bold text-emerald-800 dark:text-emerald-300 text-xs flex justify-between">
                                        <span>الشاهد رقم {w.num || index + 1}</span>
                                        <span className="text-[10px] text-stone-400">سالم من القوادح</span>
                                    </div>

                                    <div>
                                        <Label className="text-[11px]">الاسم الكامل</Label>
                                        <Input
                                            value={w.name}
                                            onChange={(e) => {
                                                const updated = [...lafifForm.data.witnesses];
                                                updated[index].name = e.target.value;
                                                lafifForm.setData('witnesses', updated);
                                            }}
                                            placeholder="الاسم الكامل للشاهد"
                                            className="h-8 text-xs"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-[11px]">رقم البطاقة الوطنية</Label>
                                            <Input
                                                value={w.cin}
                                                onChange={(e) => {
                                                    const updated = [...lafifForm.data.witnesses];
                                                    updated[index].cin = e.target.value;
                                                    lafifForm.setData('witnesses', updated);
                                                }}
                                                placeholder="CIN"
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[11px]">المهنة</Label>
                                            <Input
                                                value={w.profession}
                                                onChange={(e) => {
                                                    const updated = [...lafifForm.data.witnesses];
                                                    updated[index].profession = e.target.value;
                                                    lafifForm.setData('witnesses', updated);
                                                }}
                                                placeholder="المهنة"
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-[11px]">محل السكنى</Label>
                                        <Input
                                            value={w.address}
                                            onChange={(e) => {
                                                const updated = [...lafifForm.data.witnesses];
                                                updated[index].address = e.target.value;
                                                lafifForm.setData('witnesses', updated);
                                            }}
                                            placeholder="عنوان الإقامة"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setLafifModalOpen(false)} className="rounded-xl">
                                إلغاء
                            </Button>
                            <Button type="submit" variant="emerald" disabled={lafifForm.processing} className="rounded-xl font-bold">
                                {lafifForm.processing ? 'جاري الاعتماد...' : 'اعتماد وحفظ الـ 12 شاهداً'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </TenantAdminLayout>
    );
}
