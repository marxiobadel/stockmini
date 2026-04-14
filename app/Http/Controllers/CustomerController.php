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
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = User::query();

        if ($request->filled('search')) {
            $query->whereAny(['name', 'email', 'phone', 'address'], 'like', '%' . $request->string('search') . '%');
        }

        $allowed = ['name', 'email', 'created_at', 'updated_at'];
        if ($request->filled('sort')) {
            $sort = $request->string('sort');
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column = ltrim($sort, '-');
            if (in_array($column, $allowed)) {
                $query->orderBy($column, $direction);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->integer('per_page', 10);
        $categories = $query->paginate($perPage)->withQueryString();

        return Inertia::render("customers/index", [
            'customers' => CustomerResource::collection($categories)->response()->getData(true),
            'filters' => $request->only(['search', 'page', 'sort', 'per_page']),
        ]);
    }

    public function show(Request $request, User $customer)
    {
        $query = Order::withCount('products')
            ->with(['customer', 'products'])
            ->where('customer_id', '=', $customer->id);

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        $orders = $query->latest()->get();

        return Inertia::render('customers/show', [
            'customers' => CustomerResource::collection(User::latest()->get()),
            'products' => ProductResource::collection(Product::latest()->get()),
            'orders' => OrderResource::collection($orders),
            'customer' => new CustomerResource($customer),
            'filters' => $request->only(['from', 'to', 'preset']),
        ]);
    }

    public function store(CustomerRequest $request)
    {
        $validated = $request->validated();

        User::create([...$validated, 'password' => bcrypt('123456')]);

        return back()->with('success', 'Client ajouté avec succès.');
    }

    public function update(CustomerRequest $request, User $customer)
    {
        $customer->update($request->validated());

        return redirect()->back()->with('success', 'Client modifié avec succès.');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                User::destroy($ids);
            }

            return redirect()->back()->with('success', 'Client(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : ' . $e->getMessage());
        }
    }
}
