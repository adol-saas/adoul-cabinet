<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\OfficeSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CabinetWorkflowTest extends TestCase
{
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::where('email', 'adoul@cabinet.ma')->first() ?? User::factory()->create();
    }

    public function test_guest_can_access_public_office_portal(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_guest_can_access_login_page(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_adoul_can_access_dashboard(): void
    {
        $response = $this->actingAs($this->user)->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_adoul_can_access_dossiers_list(): void
    {
        $response = $this->actingAs($this->user)->get('/dossiers');
        $response->assertStatus(200);
    }

    public function test_adoul_can_view_dossier_details(): void
    {
        $dossier = Dossier::first();
        if (! $dossier) {
            $this->markTestSkipped('No dossier found');
        }

        $response = $this->actingAs($this->user)->get("/dossiers/{$dossier->id}");
        $response->assertStatus(200);
    }

    public function test_adoul_can_view_fee_statement(): void
    {
        $dossier = Dossier::first();
        if (! $dossier) {
            $this->markTestSkipped('No dossier found');
        }

        $response = $this->actingAs($this->user)->get("/dossiers/{$dossier->id}/fee-statement");
        $response->assertStatus(200);
    }

    public function test_adoul_can_access_blotter(): void
    {
        $response = $this->actingAs($this->user)->get('/blotter');
        $response->assertStatus(200);
    }

    public function test_adoul_can_access_registers(): void
    {
        $response = $this->actingAs($this->user)->get('/registers');
        $response->assertStatus(200);
    }

    public function test_adoul_can_access_inheritance_calculator(): void
    {
        $response = $this->actingAs($this->user)->get('/inheritance-calculator');
        $response->assertStatus(200);
    }

    public function test_public_can_verify_act_via_reference(): void
    {
        $dossier = Dossier::first();
        if (! $dossier) {
            $this->markTestSkipped('No dossier found');
        }

        $response = $this->get("/verify/{$dossier->reference}");
        $response->assertStatus(200);
    }

    public function test_adoul_can_update_lafif_witnesses(): void
    {
        $dossier = Dossier::where('type', 'mulkiya_lafif')->first() ?? Dossier::first();
        if (! $dossier) {
            $this->markTestSkipped('No dossier found');
        }

        $witnesses = [];
        for ($i = 1; $i <= 12; $i++) {
            $witnesses[] = [
                'num' => $i,
                'name' => "الشاهد العدل {$i}",
                'cin' => "AB{$i}0000",
                'age' => 50 + $i,
                'profession' => 'فلاح',
                'address' => 'الرباط',
                'bias_free' => true,
                'testimony' => 'يشهد بالملك والحيازة',
            ];
        }

        $response = $this->actingAs($this->user)->post("/dossiers/{$dossier->id}/lafif", [
            'witnesses' => $witnesses,
        ]);

        $response->assertRedirect();
        $dossier->refresh();
        $this->assertCount(12, $dossier->details['lafif_witnesses']);
    }

    public function test_adoul_can_print_lafif_sheet(): void
    {
        $dossier = Dossier::where('type', 'mulkiya_lafif')->first() ?? Dossier::first();
        if (! $dossier) {
            $this->markTestSkipped('No dossier found');
        }

        $response = $this->actingAs($this->user)->get("/dossiers/{$dossier->id}/print-lafif");
        $response->assertStatus(200);
    }

    public function test_adoul_can_login_with_credentials(): void
    {
        $response = $this->post('/login', [
            'email' => 'adoul@cabinet.ma',
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }

    public function test_secretaire_can_login_with_credentials(): void
    {
        $response = $this->post('/login', [
            'email' => 'secretaire@cabinet.ma',
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }

    public function test_adoul_can_access_settings_page(): void
    {
        $response = $this->actingAs($this->user)->get('/settings');
        $response->assertStatus(200);
    }

    public function test_adoul_can_update_office_and_personal_settings(): void
    {
        $response = $this->actingAs($this->user)->post('/settings', [
            'office_name_ar' => 'مكتب الأستاذ المجدد - عدل محلف',
            'office_name_fr' => 'Cabinet Notarial Al Moujaddad',
            'adoul_name' => 'الأستاذ الدكتور عبد الله العلمي',
            'second_adoul_name' => 'الأستاذة خديجة التازي',
            'court_name' => 'المحكمة الابتدائية بالدار البيضاء',
            'license_number' => 'رقم الاعتماد 2024/99',
            'city' => 'الدار البيضاء',
            'region' => 'جهة الدار البيضاء سطات',
            'phone' => '+212 522 112 233',
            'whatsapp_number' => '+212 661 998 877',
            'email' => 'contact@almoujaddad.ma',
            'address' => 'شارع أنفا، رقم 100، الدار البيضاء',
            'qadi_name' => 'السيد قاضي التوثيق بالمحكمة الابتدائية بالبيضاء',
            'theme_color' => 'emerald',
            'tagline_ar' => 'الدقة والأمانة التوثيقية',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('office_settings', [
            'adoul_name' => 'الأستاذ الدكتور عبد الله العلمي',
            'second_adoul_name' => 'الأستاذة خديجة التازي',
            'court_name' => 'المحكمة الابتدائية بالدار البيضاء',
            'city' => 'الدار البيضاء',
        ]);

        // Verify Adoul user name was synchronized
        $this->assertDatabaseHas('users', [
            'email' => 'adoul@cabinet.ma',
            'name' => 'الأستاذ الدكتور عبد الله العلمي',
        ]);
    }

    public function test_adoul_can_upload_and_delete_document(): void
    {
        Storage::fake('public');
        $dossier = Dossier::first();

        $file = UploadedFile::fake()->create('cin-mohammed.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->user)->post("/dossiers/{$dossier->id}/documents", [
            'file' => $file,
            'name' => 'بطاقة التعريف الوطنية - الزوج',
            'category' => 'cin',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $dossier->refresh();

        $this->assertNotEmpty($dossier->documents);
        $uploadedDoc = collect($dossier->documents)->last();
        $this->assertNotNull($uploadedDoc);
        $this->assertEquals('بطاقة التعريف الوطنية - الزوج', $uploadedDoc['name']);
        $this->assertEquals('cin', $uploadedDoc['category']);
        $relativePath = str_replace('/storage/', '', $uploadedDoc['path']);
        Storage::disk('public')->assertExists($relativePath);

        // Now test delete
        $deleteResponse = $this->actingAs($this->user)->delete("/dossiers/{$dossier->id}/documents/{$uploadedDoc['id']}");
        $deleteResponse->assertSessionHasNoErrors();
        $deleteResponse->assertRedirect();
        $dossier->refresh();

        $remainingDoc = collect($dossier->documents)->firstWhere('id', $uploadedDoc['id']);
        $this->assertNull($remainingDoc);
        Storage::disk('public')->assertMissing($relativePath);
    }

    public function test_adoul_can_update_workflow_step(): void
    {
        $dossier = Dossier::first();

        $response = $this->actingAs($this->user)->post("/dossiers/{$dossier->id}/workflow-step", [
            'step_key' => 'tax_dgi',
            'is_completed' => true,
            'reference' => 'DGI-QUITTANCE-889922',
            'completed_at' => '2026-09-29',
            'notes' => 'تم استخلاص واجبات التسجيل والتمبر بنجاح بالقباضة',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $dossier->refresh();

        $this->assertNotNull($dossier->workflow_progress);
        $step = collect($dossier->workflow_progress['steps'])->firstWhere('key', 'tax_dgi');
        $this->assertNotNull($step);
        $this->assertTrue($step['is_completed']);
        $this->assertEquals('DGI-QUITTANCE-889922', $step['reference']);
    }
}
