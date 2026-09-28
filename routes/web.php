<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Tenant\AppointmentController;
use App\Http\Controllers\Tenant\BlotterController;
use App\Http\Controllers\Tenant\ClientController;
use App\Http\Controllers\Tenant\ConventionController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\DocumentTemplateController;
use App\Http\Controllers\Tenant\DossierController;
use App\Http\Controllers\Tenant\ExportController;
use App\Http\Controllers\Tenant\InheritanceCalculatorController;
use App\Http\Controllers\Tenant\OfficeSettingController;
use App\Http\Controllers\Tenant\PublicOfficeController;
use App\Http\Controllers\Tenant\RegisterController;
use App\Http\Controllers\Tenant\ReportController;
use App\Http\Controllers\Tenant\TeamController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Cabinet Adoul Standalone)
|--------------------------------------------------------------------------
*/

// Public Office Portal & Citizen Requests
Route::get('/', [PublicOfficeController::class, 'show'])->name('home');
Route::get('/portal', [PublicOfficeController::class, 'show'])->name('portal');
Route::get('/office/{tenant?}', [PublicOfficeController::class, 'show'])->name('office');

Route::post('/appointment-request', [PublicOfficeController::class, 'requestAppointment'])->name('appointment.request');
Route::post('/copy-request', [PublicOfficeController::class, 'requestCopy'])->name('copy.request');
Route::post('/track-dossier', [PublicOfficeController::class, 'trackDossier'])->name('dossier.track');

// Document & Act Verification via QR
Route::get('/verify/{reference}', [VerificationController::class, 'show'])->name('verify');

// Authentication
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Cabinet Workspace (Protected)
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // CRM Clients
    Route::resource('clients', ClientController::class);

    // Legal Dossiers & Acts
    Route::resource('dossiers', DossierController::class);
    Route::post('/dossiers/{dossier}/status', [DossierController::class, 'updateStatus'])->name('dossiers.status');
    Route::get('/dossiers/{dossier}/print', [ExportController::class, 'printDossier'])->name('dossiers.print');
    Route::get('/dossiers/{dossier}/fee-statement', [ExportController::class, 'feeStatement'])->name('dossiers.fee-statement');

    // Digital Registers & Conservation Memorandum (كناش التضمين ومذكرة الحفظ)
    Route::get('/registers', [RegisterController::class, 'index'])->name('registers.index');
    Route::post('/registers/{dossier}/inclusion', [RegisterController::class, 'updateInclusion'])->name('registers.inclusion');
    Route::get('/blotter', [BlotterController::class, 'index'])->name('blotter.index');

    // Islamic Inheritance Calculator
    Route::get('/inheritance-calculator', [InheritanceCalculatorController::class, 'index'])->name('inheritance.calculator');

    // Appointments & Agenda
    Route::get('/appointments', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::put('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.status');
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');

    // Document Templates
    Route::get('/templates', [DocumentTemplateController::class, 'index'])->name('templates.index');
    Route::post('/templates', [DocumentTemplateController::class, 'store'])->name('templates.store');
    Route::put('/templates/{template}', [DocumentTemplateController::class, 'update'])->name('templates.update');
    Route::delete('/templates/{template}', [DocumentTemplateController::class, 'destroy'])->name('templates.destroy');
    Route::post('/templates/parse-word', [DocumentTemplateController::class, 'parseWord'])->name('templates.parse-word');

    // Official Conventions & Circulars
    Route::get('/conventions', [ConventionController::class, 'index'])->name('conventions.index');
    Route::post('/conventions', [ConventionController::class, 'store'])->name('conventions.store');
    Route::delete('/conventions/{convention}', [ConventionController::class, 'destroy'])->name('conventions.destroy');

    // Team & Roles
    Route::get('/team', [TeamController::class, 'index'])->name('team.index');
    Route::post('/team', [TeamController::class, 'store'])->name('team.store');
    Route::put('/team/{user}', [TeamController::class, 'update'])->name('team.update');
    Route::put('/team/{user}/password', [TeamController::class, 'updatePassword'])->name('team.password');
    Route::delete('/team/{user}', [TeamController::class, 'destroy'])->name('team.destroy');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // Office Settings & Branding
    Route::get('/settings', [OfficeSettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [OfficeSettingController::class, 'update'])->name('settings.update');

    // Data Exports
    Route::get('/exports/clients', [ExportController::class, 'exportClientsCsv'])->name('exports.clients');
    Route::get('/exports/dossiers', [ExportController::class, 'exportDossiersCsv'])->name('exports.dossiers');
    Route::get('/exports/clients/pdf', [ExportController::class, 'exportClientsPdf'])->name('exports.clients.pdf');
    Route::get('/exports/dossiers/pdf', [ExportController::class, 'exportDossiersPdf'])->name('exports.dossiers.pdf');
});

// Named Aliases for Smooth Compatibility
Route::as('tenant.')->middleware('auth')->group(function () {
    Route::get('/cabinet/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/cabinet/dossiers', [DossierController::class, 'index'])->name('dossiers.index');
    Route::get('/cabinet/dossiers/{dossier}', [DossierController::class, 'show'])->name('dossiers.show');
    Route::get('/cabinet/dossiers/{dossier}/print', [ExportController::class, 'printDossier'])->name('dossiers.print');
    Route::get('/cabinet/dossiers/{dossier}/fee-statement', [ExportController::class, 'feeStatement'])->name('dossiers.fee-statement');
    Route::get('/cabinet/registers', [RegisterController::class, 'index'])->name('registers.index');
    Route::get('/cabinet/blotter', [BlotterController::class, 'index'])->name('blotter.index');
    Route::get('/cabinet/inheritance-calculator', [InheritanceCalculatorController::class, 'index'])->name('inheritance.calculator');
    Route::get('/cabinet/clients', [ClientController::class, 'index'])->name('clients.index');
    Route::get('/cabinet/appointments', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::get('/cabinet/templates', [DocumentTemplateController::class, 'index'])->name('templates.index');
    Route::get('/cabinet/conventions', [ConventionController::class, 'index'])->name('conventions.index');
    Route::get('/cabinet/team', [TeamController::class, 'index'])->name('team.index');
    Route::get('/cabinet/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/cabinet/settings', [OfficeSettingController::class, 'index'])->name('settings.index');
});
