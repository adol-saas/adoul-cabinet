<?php

use App\Models\ActLog;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\Tenant;
use App\Models\User;

beforeEach(function () {
    $this->tenant = Tenant::with('domains')->first();
    $this->domain = $this->tenant->domains->first()?->domain ?? 'rabat-adoul.adol.test';
    tenancy()->initialize($this->tenant);
    $this->user = User::where('email', 'owner@rabat-adoul.test')->first() ?? User::first();
});

afterEach(function () {
    if (tenancy()->initialized) {
        tenancy()->end();
    }
});

test('tenant user can access dashboard and client index', function () {
    $response = $this->actingAs($this->user)->get("http://{$this->domain}/dashboard");
    $response->assertStatus(200);

    $clientResponse = $this->actingAs($this->user)->get("http://{$this->domain}/clients");
    $clientResponse->assertStatus(200);
});

test('tenant can create a new client with Moroccan CIN validation', function () {
    $clientData = [
        'cin' => 'XA'.rand(10000, 99999),
        'name_ar' => 'محمد العلمي',
        'name_fr' => 'Mohammed El Alami',
        'gender' => 'male',
        'marital_status' => 'married',
        'phone' => '+212612345678',
        'email' => 'client'.rand(100, 999).'@test.ma',
        'address' => 'Avenue Mohammed V, Rabat',
    ];

    $response = $this->actingAs($this->user)->post("http://{$this->domain}/clients", $clientData);
    $response->assertSessionHasNoErrors();

    expect(Client::where('cin', $clientData['cin'])->exists())->toBeTrue();
});

test('tenant can create a dossier with contracting parties and generates audit log', function () {
    $client = Client::first();
    expect($client)->not->toBeNull();

    $dossierData = [
        'type' => 'marriage',
        'client_id' => $client->id,
        'amount_due' => 1500,
        'amount_paid' => 1500,
        'act_date' => now()->toDateString(),
        'notes_ar' => 'عقد زواج شرعي موثق',
        'details' => [
            'sadaq_amount' => 50000,
            'sadaq_paid' => 30000,
            'sadaq_deferred' => 20000,
        ],
    ];

    $response = $this->actingAs($this->user)->post("http://{$this->domain}/dossiers", $dossierData);
    $response->assertSessionHasNoErrors();

    $dossier = Dossier::latest('id')->first();
    expect($dossier)->not->toBeNull();
    expect($dossier->type)->toBe('marriage');

    // Verify audit trail entry created
    $log = ActLog::where('dossier_id', $dossier->id)->latest('id')->first();
    expect($log)->not->toBeNull();
});

test('tenant can transition dossier status and access print view', function () {
    $client = Client::first();
    $dossier = Dossier::create([
        'reference' => 'DOS-TEST-'.rand(1000, 9999),
        'national_reference' => 'NAT-TEST-'.rand(1000, 9999),
        'client_id' => $client->id,
        'type' => 'property_sale',
        'status' => 'draft',
        'adoul_id' => $this->user->id,
        'act_date' => now()->toDateString(),
        'amount_due' => 2000,
        'amount_paid' => 2000,
    ]);

    $response = $this->actingAs($this->user)->post("http://{$this->domain}/dossiers/{$dossier->id}/status", [
        'status' => 'pending_qadi',
        'note' => 'Sent to Court of First Instance Qadi for homologation',
        'qadi_reference' => 'QADI-TEST-2026-99',
    ]);
    $response->assertSessionHasNoErrors();

    $dossier->refresh();
    expect($dossier->status)->toBe('pending_qadi');

    // Test print view
    $printResponse = $this->actingAs($this->user)->get("http://{$this->domain}/dossiers/{$dossier->id}/print");
    $printResponse->assertStatus(200);
});

test('tenant can access official inclusion registers page', function () {
    $response = $this->actingAs($this->user)->get("http://{$this->domain}/registers");
    $response->assertStatus(200);
});

test('tenant can access islamic inheritance calculator page', function () {
    $response = $this->actingAs($this->user)->get("http://{$this->domain}/inheritance-calculator");
    $response->assertStatus(200);
});

test('tenant can record and update court inclusion metadata for a dossier', function () {
    $client = Client::first();
    $dossier = Dossier::create([
        'reference' => 'DOS-INC-'.rand(1000, 9999),
        'client_id' => $client->id,
        'type' => 'marriage',
        'status' => 'pending_qadi',
        'adoul_id' => $this->user->id,
        'act_date' => now()->toDateString(),
        'amount_due' => 1500,
        'amount_paid' => 1500,
    ]);

    $inclusionData = [
        'inclusion_number' => 'INC-'.rand(100, 999),
        'inclusion_book' => '42-ب',
        'inclusion_page' => '118',
        'inclusion_year' => '2026',
        'qadi_reference' => 'QADI-RABAT-'.rand(1000, 9999),
        'qadi_validation_date' => now()->toDateString(),
        'registration_receipt' => 'REC-TAX-8899',
    ];

    $response = $this->actingAs($this->user)->post("http://{$this->domain}/registers/{$dossier->id}/inclusion", $inclusionData);
    $response->assertSessionHasNoErrors();

    $dossier->refresh();
    expect($dossier->details['inclusion_number'])->toBe($inclusionData['inclusion_number']);
    expect($dossier->details['inclusion_book'])->toBe('42-ب');
    expect($dossier->details['inclusion_page'])->toBe('118');
    expect($dossier->status)->toBe('signed');
    expect($dossier->qadi_reference)->toBe($inclusionData['qadi_reference']);

    // Verify audit log
    $log = ActLog::where('dossier_id', $dossier->id)->latest('id')->first();
    expect($log)->not->toBeNull();
    expect($log->action)->toBe('updated_inclusion');
});

test('tenant can create dossier with mulkiya lafif and inheritance act types', function () {
    $client = Client::first();

    // Mulkiya Lafif
    $lafifData = [
        'type' => 'mulkiya_lafif',
        'client_id' => $client->id,
        'amount_due' => 1900,
        'amount_paid' => 1900,
        'act_date' => now()->toDateString(),
        'notes_ar' => 'رسم ملكية واستمرار بلفيف 12 شاهداً',
        'details' => [
            'lafif_location' => 'تمارة - الهرهورة',
            'lafif_area' => '250 م²',
            'lafif_years' => '15 سنة حوز هادئ علني',
        ],
    ];

    $response = $this->actingAs($this->user)->post("http://{$this->domain}/dossiers", $lafifData);
    $response->assertSessionHasNoErrors();

    $lafifDossier = Dossier::latest('id')->first();
    expect($lafifDossier->type)->toBe('mulkiya_lafif');

    // Inheritance
    $inheritanceData = [
        'type' => 'inheritance',
        'client_id' => $client->id,
        'amount_due' => 1700,
        'amount_paid' => 1700,
        'act_date' => now()->toDateString(),
        'notes_ar' => 'رسم إراثة وحصر ورثة شرعيين',
        'details' => [
            'deceased_name' => 'المرحوم الحاج بوشعيب',
            'heirs_summary' => 'زوجة، 3 أبناء و 2 بنات',
        ],
    ];

    $response2 = $this->actingAs($this->user)->post("http://{$this->domain}/dossiers", $inheritanceData);
    $response2->assertSessionHasNoErrors();

    $inheritanceDossier = Dossier::latest('id')->first();
    expect($inheritanceDossier->type)->toBe('inheritance');
});

test('tenant can access blotter and see statutory KPIs', function () {
    $response = $this->actingAs($this->user)->get("http://{$this->domain}/blotter");
    $response->assertStatus(200);
});

test('tenant can access official fee statement for a dossier', function () {
    $dossier = Dossier::first();
    expect($dossier)->not->toBeNull();

    $response = $this->actingAs($this->user)->get("http://{$this->domain}/dossiers/{$dossier->id}/fee-statement");
    $response->assertStatus(200);
});

test('citizen can submit copy request for an old act', function () {
    $copyData = [
        'applicant_name' => 'فاطمة الزهراء الإدريسي',
        'applicant_cin' => 'AB123456',
        'applicant_phone' => '+33612345678',
        'applicant_email' => 'fatima@paris.fr',
        'act_type' => 'marriage',
        'act_year' => '2010',
        'parties_names' => 'أحمد الإدريسي وخديجة بناني',
        'delivery_mode' => 'postal_mre',
        'country_city' => 'France - Paris',
        'notes' => 'مستعجل لتقديمها لدى القنصلية المغربية بباريس',
    ];

    $response = $this->post("http://{$this->domain}/copy-request", $copyData);
    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
});

test('citizen can track dossier progress and judicial stages', function () {
    $dossier = Dossier::first();
    expect($dossier)->not->toBeNull();

    $response = $this->postJson("http://{$this->domain}/track-dossier", [
        'reference' => $dossier->reference,
    ]);

    $response->assertStatus(200);
    $response->assertJson([
        'success' => true,
        'dossier' => [
            'reference' => $dossier->reference,
        ],
    ]);
});

