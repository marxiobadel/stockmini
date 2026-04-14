<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Http\Resources\StockResource;
use App\Http\Resources\SupplierResource;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Stock::with('product');

        if ($request->filled('search')) {
            $query->whereHas('product', function ($q) use ($request) {
                $q->whereAny(['name', 'description'], 'like', '%' . $request->string('search') . '%');
            });
        }

        $query->orderBy('created_at', 'desc');

        $perPage = $request->integer('per_page', 10);
        $stocks = $query->paginate($perPage)->withQueryString();

        return Inertia::render('stocks/index', [
            'stocks' => StockResource::collection($stocks),
            'products' => fn() => ProductResource::collection(Product::oldest('name')->get()),
            'suppliers' => fn() => SupplierResource::collection(Supplier::oldest('name')->get()),
            'filters' => $request->only(['search', 'page', 'sort', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'quantity_in_stock' => 'required|integer',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
        ]);

        Stock::create($validated);

        return back()->with('success', 'Stock ajouté avec succès.');
    }

    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'quantity_in_stock' => 'required|integer',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
        ]);

        $stock->update($validated);

        return back()->with('success', 'Stock modifié avec succès.');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                Stock::destroy($ids);
            }

            return back()->with('success', 'Stock(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }
}
