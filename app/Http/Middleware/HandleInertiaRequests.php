<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\OfficeSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $office = rescue(fn () => OfficeSetting::first(), null, false);

        $roles = [];
        $permissions = [];
        if ($user) {
            $roles = rescue(function () use ($user) {
                return method_exists($user, 'roles') ? $user->roles->pluck('name')->toArray() : [];
            }, [], false) ?: [];

            $permissions = rescue(function () use ($user) {
                return method_exists($user, 'getAllPermissions') ? $user->getAllPermissions()->pluck('name')->toArray() : [];
            }, [], false) ?: [];
        }

        // All modules are unlocked in this dedicated standalone installation
        $allFeatures = [
            'max_users' => 999,
            'max_dossiers' => 999999,
            'module_appointments' => true,
            'module_marriage' => true,
            'module_pdf_export' => true,
            'module_sms_notify' => true,
            'module_all_docs' => true,
            'module_team_roles' => true,
            'module_multilang' => true,
            'module_reports_export' => true,
            'module_api_access' => true,
            'custom_domain_allowed' => true,
        ];

        $tenantAdapter = [
            'id' => 'cabinet',
            'name' => $office->office_name_ar ?? 'مكتب الأستاذ - عدل محلف',
            'city' => $office->city ?? 'المملكة المغربية',
            'phone' => $office->phone ?? '',
            'email' => $office->email ?? '',
            'public_url' => '/',
            'plan' => [
                'id' => 'dedicated',
                'name_ar' => 'نسخة خاصة ومثبتة بالمكتب',
                'name_fr' => 'Édition Cabinet Dédiée',
                'is_popular' => true,
                'features' => $allFeatures,
            ],
        ];

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'cin' => $user->cin,
                    'job_title' => $user->job_title,
                    'license_number' => $user->license_number,
                    'bio' => $user->bio,
                    'avatar_path' => $user->avatar_path,
                    'signature_path' => $user->signature_path,
                    'is_super_admin' => false,
                    'roles' => $roles,
                    'permissions' => $permissions,
                ] : null,
            ],
            'office' => $office,
            'tenant' => $tenantAdapter,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'csrf_token' => fn () => csrf_token(),
            'ziggy' => fn () => rescue(fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ], [
                'routes' => [],
                'location' => $request->url(),
            ], false),
        ]);
    }
}
