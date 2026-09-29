<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\OfficeSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OfficeSettingController extends Controller
{
    public function index(): Response
    {
        $setting = OfficeSetting::firstOrCreate(['id' => 1], [
            'office_name_ar' => 'مكتب الأستاذ - عدل محلف',
            'office_name_fr' => 'Etude Adoulaire',
            'city' => 'المملكة المغربية',
            'phone' => '',
            'email' => '',
            'color_primary' => '#0d5f47',
        ]);

        return Inertia::render('tenant/settings/index', [
            'setting' => $setting,
            'subscription' => null,
            'plans' => [],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'office_name_ar' => ['required', 'string', 'max:255'],
            'office_name_fr' => ['required', 'string', 'max:255'],
            'adoul_name' => ['nullable', 'string', 'max:255'],
            'second_adoul_name' => ['nullable', 'string', 'max:255'],
            'court_name' => ['nullable', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'qadi_name' => ['nullable', 'string', 'max:255'],
            'color_primary' => ['nullable', 'string', 'max:20'],
            'theme_color' => ['nullable', 'string', 'in:emerald,blue,amber,ruby,slate'],
            'tagline_ar' => ['nullable', 'string', 'max:255'],
            'tagline_fr' => ['nullable', 'string', 'max:255'],
            'bio_ar' => ['nullable', 'string', 'max:2000'],
            'bio_fr' => ['nullable', 'string', 'max:2000'],
            'footer_text_ar' => ['nullable', 'string', 'max:1000'],
            'footer_text_fr' => ['nullable', 'string', 'max:1000'],
            'working_hours' => ['nullable', 'array'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'stamp' => ['nullable', 'image', 'max:2048'],
            'hero_image' => ['nullable', 'image', 'max:4096'],
        ]);

        $setting = OfficeSetting::firstOrCreate(['id' => 1]);

        // Handle image uploads
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('offices/cabinet', 'public');
            $validated['logo_path'] = "/storage/{$path}";
        }
        if ($request->hasFile('stamp')) {
            $path = $request->file('stamp')->store('offices/cabinet', 'public');
            $validated['stamp_image_path'] = "/storage/{$path}";
        }
        if ($request->hasFile('hero_image')) {
            $path = $request->file('hero_image')->store('offices/cabinet', 'public');
            $validated['hero_image_path'] = "/storage/{$path}";
        }

        unset($validated['logo'], $validated['stamp'], $validated['hero_image']);

        $setting->update($validated);

        if (!empty($validated['adoul_name'])) {
            \App\Models\User::where('email', 'adoul@cabinet.ma')->update([
                'name' => $validated['adoul_name'],
            ]);
        }

        return back()->with('success', 'تم حفظ إعدادات المكتب وتخصيص البوابة بنجاح.');
    }
}
