<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production') || str_starts_with((string) config('app.url'), 'https://') || (app()->has('request') && request()->isSecure())) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // ──────────────────────────────────────────────────────────────────────
        // Tenant-aware route model bindings
        //
        // Laravel's default implicit model binding resolves {dossier}, {client}
        // etc. at the moment the router resolves the route — BEFORE the
        // InitializeTenancy middleware switches the DB connection.  This causes
        // the query to hit the central DB ("adouldb") instead of the tenant DB,
        // producing: "Table 'adouldb.dossiers' doesn't exist".
        //
        // The fix: explicit bindings that only run the query after tenancy has
        // been booted (the callback runs inside the controller action, which is
        // already after all middleware).  We use `findOrFail` so 404 behaviour
        // is preserved.
        // ──────────────────────────────────────────────────────────────────────
        Route::bind('dossier', function (string $value) {
            return Dossier::findOrFail($value);
        });

        Route::bind('client', function (string $value) {
            return Client::findOrFail($value);
        });

        Route::bind('appointment', function (string $value) {
            return Appointment::findOrFail($value);
        });

        Route::bind('template', function (string $value) {
            return DocumentTemplate::findOrFail($value);
        });

        Route::bind('user', function (string $value) {
            return User::findOrFail($value);
        });
    }
}
