<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\User;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('customer/index', [
            'customers' => CustomerResource::collection(User::customer()->latest()->get()),
        ]);
    }

    public function store(CustomerRequest $request)
    {
        $validated = $request->validated();

        User::create([...$validated, 'password' => bcrypt('123456')]);

        return redirect()->back()->with('success', 'Client ajouté avec succès.');
    }

    public function update(CustomerRequest $request, User $customer)
    {
        $customer->update($request->validated());

        return redirect()->back()->with('success', 'Client modifié avec succès.');
    }

    public function destroy(User $customer)
    {
        if ($customer->orders->isNotEmpty()) {
            return redirect()->back()->with('warning', 'Merci de supprimer avant tous les commandes de ce client.');
        }

        $customer->delete();

        return redirect()->back()->with('success', 'Client supprimé avec succès.');
    }
}
