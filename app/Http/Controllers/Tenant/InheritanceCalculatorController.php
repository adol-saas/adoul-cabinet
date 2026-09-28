<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\OfficeSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InheritanceCalculatorController extends Controller
{
    public function index(Request $request): Response
    {
        $clients = Client::orderBy('name_ar')->get(['id', 'cin', 'name_ar', 'name_fr', 'phone']);
        $officeSetting = OfficeSetting::first();

        return Inertia::render('tenant/inheritance-calculator', [
            'clients' => $clients,
            'officeSetting' => $officeSetting,
            'initialState' => [
                'deceased_gender' => $request->query('gender', 'male'),
                'estate_value' => (float) $request->query('estate', 100000),
            ],
        ]);
    }
}
