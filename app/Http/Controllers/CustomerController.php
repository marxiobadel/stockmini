<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('customer/index', [
            'customers' => CustomerResource::collection(User::customer()->latest()->get()),
        ]);
    }

    public function show(Request $request, User $customer) 
    {
        $query = Order::withCount('products')
                ->with('products')
                ->whereCustomerId($customer->id);

        if ($request->filled('from') && $request->filled('to')) {
            $query->whereBetween('created_at', [
                $request->from,
                $request->to
            ]);
        }

        $orders = $query->latest()->get();

        return Inertia::render('customer/show', [
            'customers' => CustomerResource::collection(User::latest()->get()),
            'products' => ProductResource::collection(Product::latest()->get()),
            'orders' => OrderResource::collection($orders),
            'customer' => new CustomerResource($customer),
            'filters' => $request->only('from', 'to'),
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
