<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class TeamController extends Controller
{
    public function index(): Response
    {
        $maxUsers = 999;

        $members = User::with(['roles', 'permissions'])->latest()->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'job_title' => $u->job_title,
                'role' => $u->roles->pluck('name')->first() ?? 'adoul',
                'permissions' => $u->getAllPermissions()->pluck('name')->toArray(),
                'is_active' => $u->is_active,
                'created_at' => $u->created_at ? $u->created_at->format('Y-m-d') : date('Y-m-d'),
            ];
        })->values();

        $roles = Role::where('guard_name', 'web')->get(['id', 'name']);

        return Inertia::render('tenant/team/index', [
            'members' => $members,
            'roles' => $roles,
            'maxUsers' => $maxUsers,
            'currentUsersCount' => $members->count(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'job_title' => ['nullable', 'string', 'max:100'],
            'role' => ['required', 'in:adoul,katib,muhafidh'],
            'password' => ['required', 'string', 'min:8'],
            'can_manage_clients' => ['nullable', 'boolean'],
            'can_manage_appointments' => ['nullable', 'boolean'],
            'can_draft_dossiers' => ['nullable', 'boolean'],
            'can_view_financials' => ['nullable', 'boolean'],
            'can_edit_settings' => ['nullable', 'boolean'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'job_title' => $validated['job_title'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        $role = Role::findByName($validated['role'], 'web');
        if ($role) {
            $user->assignRole($role);
        }

        // Apply granular permissions
        $perms = [];
        if ($request->boolean('can_manage_clients', true)) {
            $perms = array_merge($perms, ['clients.view', 'clients.create', 'clients.edit']);
        }
        if ($request->boolean('can_manage_appointments', true)) {
            $perms[] = 'appointments.manage';
        }
        if ($request->boolean('can_draft_dossiers', true)) {
            $perms = array_merge($perms, ['dossiers.view', 'dossiers.create', 'dossiers.edit']);
        }
        if ($request->boolean('can_view_financials', false)) {
            $perms = array_merge($perms, ['reports.view', 'reports.export']);
        }
        if ($request->boolean('can_edit_settings', false)) {
            $perms = array_merge($perms, ['team.manage', 'billing.manage', 'templates.manage']);
        }

        if (! empty($perms)) {
            $user->givePermissionTo($perms);
        }

        return back()->with('success', "تمت إضافة العضو [{$user->name}] وتعيين صلاحيات المكتب بنجاح.");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:30'],
            'job_title' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', 'in:owner,adoul,katib,muhafidh'],
            'password' => ['nullable', 'string', 'min:8'],
            'is_active' => ['nullable', 'boolean'],
            'can_manage_clients' => ['nullable', 'boolean'],
            'can_manage_appointments' => ['nullable', 'boolean'],
            'can_draft_dossiers' => ['nullable', 'boolean'],
            'can_view_financials' => ['nullable', 'boolean'],
            'can_edit_settings' => ['nullable', 'boolean'],
        ]);

        $updates = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'job_title' => $validated['job_title'] ?? null,
        ];

        if (isset($validated['is_active'])) {
            $updates['is_active'] = (bool) $validated['is_active'];
        }

        if (! empty($validated['password'])) {
            $updates['password'] = Hash::make($validated['password']);
        }

        $user->update($updates);

        $isOwner = rescue(fn () => $user->hasRole('owner'), false, false);
        if (! $isOwner && ! empty($validated['role'])) {
            $role = Role::findByName($validated['role'], 'web');
            if ($role) {
                $user->syncRoles([$role]);
            }
        }

        if (! $isOwner) {
            $perms = [];
            if ($request->boolean('can_manage_clients', true)) {
                $perms = array_merge($perms, ['clients.view', 'clients.create', 'clients.edit']);
            }
            if ($request->boolean('can_manage_appointments', true)) {
                $perms[] = 'appointments.manage';
            }
            if ($request->boolean('can_draft_dossiers', true)) {
                $perms = array_merge($perms, ['dossiers.view', 'dossiers.create', 'dossiers.edit']);
            }
            if ($request->boolean('can_view_financials', false)) {
                $perms = array_merge($perms, ['reports.view', 'reports.export']);
            }
            if ($request->boolean('can_edit_settings', false)) {
                $perms = array_merge($perms, ['team.manage', 'billing.manage', 'templates.manage']);
            }

            $user->syncPermissions($perms);
        }

        return back()->with('success', "تم تحديث بيانات العضو [{$user->name}] بنجاح.");
    }

    public function updatePassword(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', "تم تغيير وتحديث كلمة المرور للعضو [{$user->name}] بنجاح.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if (rescue(fn () => $user->hasRole('owner'), false, false)) {
            return back()->with('error', 'لا يمكن حذف حساب صاحب المكتب الرئيسي.');
        }

        if ($user->id === auth()->id()) {
            return back()->with('error', 'لا يمكنك حذف حسابك الشخصي الحالي.');
        }

        $name = $user->name;
        $user->delete();

        return back()->with('success', "تم حذف العضو [{$name}] من فريق المكتب.");
    }
}
