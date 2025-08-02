<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Unity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnityController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/product', [
            'unities' => Unity::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:unities,name'
        ]);

        Unity::create($validated);

        return redirect()->back()->with('success', 'Unité ajoutée avec succès.');
    }

    public function destroy(Unity $unity)
    {
        if ($unity->products->isNotEmpty()) {
            return redirect()->back()
                ->with('status', 'error')
                ->with('message', 'Merci de supprimer avant tous les produits ayant cette unité.');
        }

        $unity->delete();

        return redirect()->back()
            ->with('status', 'success')
            ->with('message', 'Unité supprimée avec succès.');
    }
}
