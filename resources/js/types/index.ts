export type Locale = 'ar' | 'fr' | 'ber' | 'en';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    job_title?: string;
    is_super_admin: boolean;
    roles: string[];
    permissions: string[];
}

export interface PlanFeatures {
    max_users: number;
    max_dossiers: number;
    module_appointments: boolean;
    module_marriage: boolean;
    module_pdf_export: boolean;
    module_sms_notify: boolean;
    module_all_docs: boolean;
    module_team_roles: boolean;
    module_multilang: boolean;
    module_reports_export: boolean;
    module_api_access: boolean;
    custom_domain_allowed: boolean;
    [key: string]: any;
}

export interface Plan {
    id: string;
    name_ar: string;
    name_fr: string;
    name_ber?: string;
    name_en?: string;
    slug: string;
    price_monthly: number | string;
    price_yearly: number | string;
    is_popular: boolean;
    description_ar?: string;
    description_fr?: string;
    features_config: PlanFeatures;
}

export interface TenantInfo {
    id: string;
    name: string;
    city: string;
    phone?: string;
    email?: string;
    public_url?: string;
    plan?: {
        id: string;
        name_ar: string;
        name_fr: string;
        is_popular: boolean;
        features: PlanFeatures;
    };
}

export interface SharedProps {
    auth: {
        user: User | null;
    };
    tenant: TenantInfo | null;
    flash: {
        success?: string | null;
        error?: string | null;
    };
    csrf_token?: string;
    open_messages_count?: number;
    ziggy?: any;
    [key: string]: any;
}

export interface Client {
    id: number;
    cin: string;
    name_ar: string;
    name_fr: string;
    name_ber?: string;
    birth_date?: string;
    birth_city?: string;
    address?: string;
    phone?: string;
    email?: string;
    gender: 'male' | 'female';
    marital_status: 'single' | 'married' | 'divorced' | 'widowed';
    notes?: string;
    created_at: string;
    dossiers_count?: number;
    dossiers?: Dossier[];
}

export type DossierType =
    | 'marriage'
    | 'divorce'
    | 'revocation'
    | 'property_sale'
    | 'property_gift'
    | 'property_pledge'
    | 'poa'
    | 'will'
    | 'certificate'
    | 'other';

export type DossierStatus = 'draft' | 'pending_qadi' | 'signed' | 'archived' | 'cancelled';

export interface Dossier {
    id: number;
    reference: string;
    type: DossierType;
    status: DossierStatus;
    client_id: number;
    client2_id?: number | null;
    adoul_id?: number | null;
    amount_due: number | string;
    amount_paid: number | string;
    notes_ar?: string;
    notes_fr?: string;
    act_date?: string;
    signing_date?: string;
    qadi_validation_date?: string;
    qadi_reference?: string;
    details?: Record<string, any>;
    documents?: string[];
    created_at: string;
    client?: Client;
    client2?: Client;
    adoul?: User;
    act_logs?: ActLog[];
}

export interface Appointment {
    id: number;
    client_id?: number | null;
    dossier_id?: number | null;
    client_name?: string;
    client_phone?: string;
    client_email?: string;
    type: string;
    scheduled_at: string;
    duration_minutes: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    reminder_sent: boolean;
    is_citizen_request: boolean;
    client?: Client;
    dossier?: Dossier;
}

export interface DocumentTemplate {
    id: number;
    type: string;
    name_ar: string;
    name_fr: string;
    content_ar: string;
    content_fr: string;
    content_ber?: string;
    variables?: string[];
    is_active: boolean;
    version: number;
}

export interface ActLog {
    id: number;
    dossier_id: number;
    user_id?: number | null;
    action: string;
    details?: Record<string, any>;
    created_at: string;
    user?: User;
}

export interface OfficeSetting {
    id: number;
    office_name_ar: string;
    office_name_fr: string;
    city: string;
    region?: string;
    phone?: string;
    email?: string;
    address?: string;
    qadi_name?: string;
    stamp_image_path?: string;
    logo_path?: string;
    hero_image_path?: string;
    tagline_ar?: string;
    tagline_fr?: string;
    bio_ar?: string;
    bio_fr?: string;
    theme_color?: 'emerald' | 'blue' | 'amber' | 'ruby' | 'slate';
    footer_text_ar?: string;
    footer_text_fr?: string;
    whatsapp_number?: string;
    color_primary: string;
    working_hours?: Record<string, any>;
}

export interface BlogPost {
    id: number;
    title_ar: string;
    title_fr: string;
    slug: string;
    excerpt_ar?: string;
    excerpt_fr?: string;
    content_ar: string;
    content_fr: string;
    category: string;
    author_name: string;
    cover_image?: string;
    is_published: boolean;
    published_at?: string;
    created_at: string;
}

export interface Convention {
    id: number;
    title_ar: string;
    title_fr: string;
    description_ar?: string;
    description_fr?: string;
    file_path: string;
    category: string;
    reference_number?: string;
    issued_date?: string;
}

export interface SupportTicket {
    id: number;
    tenant_id?: string | null;
    user_name: string;
    user_email: string;
    phone?: string | null;
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    message: string;
    admin_reply?: string | null;
    replied_at?: string | null;
    created_at: string;
    updated_at: string;
    tenant?: TenantInfo | null;
}