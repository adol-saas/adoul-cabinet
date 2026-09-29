<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\ActLog;
use App\Models\Dossier;
use App\Models\OfficeSetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile management page
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $office = OfficeSetting::first();

        $roles = $user->roles->pluck('name')->toArray();
        $permissions = $user->getAllPermissions()->pluck('name')->toArray();

        // User stats and activity
        $dossiersCount = Dossier::where('adoul_id', $user->id)->count();
        $recentLogs = ActLog::where('user_id', $user->id)
            ->with('dossier:id,reference,type,status')
            ->latest()
            ->take(12)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'note' => $log->payload['note'] ?? $log->action,
                    'dossier_reference' => $log->dossier?->reference ?? null,
                    'dossier_id' => $log->dossier_id,
                    'created_at' => $log->created_at ? $log->created_at->diffForHumans() : '',
                    'date_formatted' => $log->created_at ? $log->created_at->format('Y-m-d H:i') : '',
                ];
            });

        return Inertia::render('tenant/profile/index', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'cin' => $user->cin ?? '',
                'job_title' => $user->job_title ?? '',
                'license_number' => $user->license_number ?? '',
                'bio' => $user->bio ?? '',
                'avatar_path' => $user->avatar_path,
                'signature_path' => $user->signature_path,
                'is_active' => $user->is_active,
                'roles' => $roles,
                'permissions' => $permissions,
                'created_at' => $user->created_at ? $user->created_at->format('Y-m-d') : date('Y-m-d'),
            ],
            'stats' => [
                'dossiers_count' => $dossiersCount,
                'recent_logs_count' => $recentLogs->count(),
            ],
            'recentLogs' => $recentLogs,
            'office' => $office,
        ]);
    }

    /**
     * Update user profile information and upload files
     */
    public function update(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'cin' => ['nullable', 'string', 'max:30'],
            'job_title' => ['nullable', 'string', 'max:100'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'signature' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;
        $user->cin = $validated['cin'] ?? null;
        $user->job_title = $validated['job_title'] ?? null;
        $user->license_number = $validated['license_number'] ?? null;
        $user->bio = $validated['bio'] ?? null;

        // Avatar upload
        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                $oldPath = str_replace('/storage/', '', $user->avatar_path);
                Storage::disk('public')->delete($oldPath);
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_path = Storage::url($avatarPath);
        }

        // Official Signature upload
        if ($request->hasFile('signature')) {
            if ($user->signature_path) {
                $oldSig = str_replace('/storage/', '', $user->signature_path);
                Storage::disk('public')->delete($oldSig);
            }
            $sigPath = $request->file('signature')->store('signatures', 'public');
            $user->signature_path = Storage::url($sigPath);
        }

        $user->save();

        // Also if user is the main adoul (owner), keep OfficeSetting synchronized with adoul name
        if ($user->hasRole('owner') || $user->hasRole('adoul')) {
            $setting = OfficeSetting::first();
            if ($setting) {
                $setting->update([
                    'adoul_name' => $user->name,
                    'phone' => $user->phone ?: $setting->phone,
                ]);
            }
        }

        return back()->with('success', 'تم تحديث بيانات الملف الشخصي بنجاح.');
    }

    /**
     * Change user account password
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'كلمة المرور الحالية غير صحيحة. يرجى التحقق وإعادة المحاولة.',
            ]);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return back()->with('success', 'تم تغيير كلمة المرور بنجاح. يرجى تذكرها لعمليات تسجيل الدخول القادمة.');
    }

    /**
     * Delete user avatar image
     */
    public function deleteAvatar(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->avatar_path) {
            $oldPath = str_replace('/storage/', '', $user->avatar_path);
            Storage::disk('public')->delete($oldPath);
            $user->avatar_path = null;
            $user->save();
        }

        return back()->with('success', 'تم حذف الصورة الشخصية بنجاح.');
    }

    /**
     * Delete user signature specimen image
     */
    public function deleteSignature(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->signature_path) {
            $oldSig = str_replace('/storage/', '', $user->signature_path);
            Storage::disk('public')->delete($oldSig);
            $user->signature_path = null;
            $user->save();
        }

        return back()->with('success', 'تم حذف نموذج التوقيع بنجاح.');
    }
}
