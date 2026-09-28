<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OfficeSetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AuthController extends Controller
{
    public function showLogin(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect('/dashboard');
        }

        $office = OfficeSetting::first();

        return Inertia::render('tenant/auth/login', [
            'tenant' => [
                'id' => 'cabinet',
                'name' => $office->office_name_ar ?? 'مكتب الأستاذ - عدل محلف',
                'city' => $office->city ?? 'المملكة المغربية',
            ],
            'office' => $office,
        ]);
    }

    public function login(Request $request): SymfonyResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();
            $user = Auth::user();

            return redirect()->intended('/dashboard')
                ->with('success', "مرحباً بك {$user->name} في فضاء إدارة المكتب.");
        }

        return back()->withErrors([
            'email' => 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد الإلكتروني وكلمة المرور.',
        ])->onlyInput('email');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('success', 'تم تسجيل الخروج بنجاح.');
    }
}
