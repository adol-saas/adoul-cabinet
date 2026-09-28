<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\User;
use Database\Seeders\TenantDatabaseSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Stancl\Tenancy\Events\TenancyBootstrapped;

class EnsureTenantMigrated
{
    public function handle(TenancyBootstrapped $event): void
    {
        $tenant = $event->tenancy->tenant;
        if (! $tenant) {
            return;
        }

        $tenantId = (string) $tenant->getTenantKey();

        try {
            // Check if essential tables exist in the tenant database
            if (! Schema::hasTable('dossiers') || ! Schema::hasTable('roles')) {
                Log::info("Tenant [{$tenantId}] is missing tables. Running automated migration...");

                Artisan::call('tenants:migrate', [
                    '--tenants' => [$tenantId],
                    '--force' => true,
                ]);

                // Run seeders for default templates, permissions, and roles
                $seeder = new TenantDatabaseSeeder;
                $seeder->run([
                    'tenant_id' => $tenantId,
                    'city' => $tenant->city ?? 'الرباط',
                    'city_fr' => $tenant->city_fr ?? 'Rabat',
                    'region' => $tenant->region ?? 'جهة الرباط سلا القنيطرة',
                    'office_name_ar' => $tenant->name ?? 'مكتب التوثيق العدلي',
                ]);

                // Ensure an owner user exists if users table is empty
                if (Schema::hasTable('users') && User::count() === 0) {
                    $owner = User::create([
                        'name' => 'الأستاذ العدل صاحب المكتب',
                        'email' => "owner@{$tenantId}.test",
                        'password' => Hash::make('password'),
                        'is_active' => true,
                        'job_title' => 'عدل موثق رئيسي - صاحب المكتب',
                    ]);

                    $role = Role::where('name', 'owner')->first();
                    if ($role) {
                        $owner->assignRole($role);
                    }
                }

                Log::info("Tenant [{$tenantId}] automated migration and seeding completed successfully.");
            }
        } catch (\Throwable $e) {
            Log::warning("Could not auto-migrate tenant [{$tenantId}]: ".$e->getMessage());
        }
    }
}
