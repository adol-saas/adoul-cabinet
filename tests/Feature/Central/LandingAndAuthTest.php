<?php

use App\Models\User;

test('central landing page renders successfully', function () {
    $response = $this->get('/');
    $response->assertStatus(200);
});

test('public adoul directory is accessible and searchable', function () {
    $response = $this->get('/directory');
    $response->assertStatus(200);

    $searchResponse = $this->get('/directory?city=Rabat');
    $searchResponse->assertStatus(200);
});

test('super admin can authenticate and access central dashboard', function () {
    $admin = User::where('email', 'admin@adoul.ma')->first() ?? User::where('email', 'admin@adoulcloud.ma')->first();

    expect($admin)->not->toBeNull();
    expect($admin->is_super_admin)->toBeTrue();

    $response = $this->actingAs($admin)->get('/super-admin');
    $response->assertStatus(200);
});

test('central verification endpoint returns verification page', function () {
    $response = $this->get('/verify/TEST-REF-001');
    $response->assertStatus(200);
});

test('visiting central office url redirects to dedicated tenant subdomain', function () {
    $response = $this->get('/office/casablanca-adoul');
    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('casa.adoul.test');
});

test('dedicated tenant subdomain renders public office profile', function () {
    $response = $this->withServerVariables(['HTTP_HOST' => 'casa.adoul.test'])->get('/');
    $response->assertStatus(200);
});

test('super admin login form redirects to /super-admin on same domain without cross-host redirect', function () {
    $response = $this->withServerVariables(['HTTP_HOST' => 'adoul.test'])
        ->post('/login', [
            'email' => 'admin@adoul.ma',
            'password' => 'password',
        ]);

    $response->assertRedirect('/super-admin');
    $this->assertAuthenticated();
});
